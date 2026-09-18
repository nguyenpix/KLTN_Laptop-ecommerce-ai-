import os
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import pandas as pd
import torch
import torch.nn.functional as F
from bson import ObjectId

from app.core.config import settings
from app.core.database import get_database
from app.models.two_tower import TwoTower

logger = logging.getLogger("ai-service.rec_service")

class RecommendationEngine:
    """
    Pure Pre-trained Model Inference Engine for Laptop Recommendations.
    - Uses pre-trained Two-Tower PyTorch Model (User Tower & Item Tower).
    - No runtime training. No complex manual ad-hoc calculations.
    - Pure model forward pass: Input (User ID / Item ID) -> Model -> Output (Scores & Rankings).
    """

    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model: Optional[TwoTower] = None
        self.content_tensor: Optional[torch.Tensor] = None
        self.item_sim_matrix: Optional[np.ndarray] = None
        
        self.item_id_list: List[str] = []
        self.item_id_to_idx: Dict[str, int] = {}
        self.user_id_list: List[str] = []
        self.user_id_to_idx: Dict[str, int] = {}
        self.product_catalog: Dict[str, Dict[str, Any]] = {}
        
        self.n_users: int = 59
        self.n_items: int = 196
        self.content_dim: int = 400
        self.cold_user_idx: int = 58
        self.is_ready: bool = False

    def initialize(self):
        """
        Load pre-trained model weights, content vectors, ID mappings, and catalog.
        Pure loading & inference setup - NO training performed.
        """
        logger.info("⚡ Loading pre-trained Recommendation Model...")
        try:
            weights_dir = settings.WEIGHTS_DIR
            mappings_path = weights_dir / "id_mappings.json"
            content_vecs_path = weights_dir / "content_vectors.npy"
            weights_path = weights_dir / "two_tower_weights.pt"

            if not mappings_path.exists() or not content_vecs_path.exists() or not weights_path.exists():
                logger.error(f"Missing pre-trained model files in {weights_dir}")
                return

            # 1. Load ID mappings
            with open(mappings_path, "r", encoding="utf-8") as f:
                mappings = json.load(f)

            self.item_id_list = mappings.get("item_id_list", [])
            self.user_id_list = mappings.get("user_id_list", [])
            self.item_id_to_idx = {pid: i for i, pid in enumerate(self.item_id_list)}
            self.user_id_to_idx = {uid: i for i, uid in enumerate(self.user_id_list)}
            self.n_items = len(self.item_id_list)
            self.content_dim = mappings.get("content_dim", 400)

            # 2. Load pre-computed item content vectors
            content_vectors = np.load(content_vecs_path)
            self.content_tensor = torch.tensor(content_vectors, dtype=torch.float32).to(self.device)

            # 3. Load pre-trained Two-Tower PyTorch model
            state_dict = torch.load(weights_path, map_location=self.device)
            # Model trained with 59 user embeddings (0..57 for known users, 58 for cold-start user)
            trained_n_users = state_dict["user_tower.0.weight"].shape[0]
            self.n_users = trained_n_users
            self.cold_user_idx = trained_n_users - 1

            self.model = TwoTower(
                n_users=self.n_users,
                content_dim=self.content_dim,
                emb_dim=32
            ).to(self.device)
            self.model.load_state_dict(state_dict)
            self.model.eval()

            # Pre-compute Item Tower embeddings for instant item-to-item similarity
            with torch.no_grad():
                item_embs = F.normalize(self.model.item_embed(self.content_tensor), dim=1)
                self.item_sim_matrix = (item_embs @ item_embs.T).cpu().numpy()

            # 4. Load product catalog metadata (from MongoDB Atlas or dataset fallback)
            self._load_product_catalog()
            self.products = list(self.product_catalog.values())

            self.is_ready = True
            logger.info(
                f"✅ Pre-trained TwoTower Model loaded successfully! "
                f"Items: {self.n_items}, Users: {len(self.user_id_list)}, Device: {self.device}"
            )

        except Exception as e:
            logger.error(f"Failed to initialize Recommendation Engine: {e}", exc_info=True)

    def _load_product_catalog(self):
        """
        Loads product metadata into memory so recommendations return complete product cards.
        Tries MongoDB first; if empty or offline, falls back to item_features.csv.
        """
        self.product_catalog = {}

        # 1. Try MongoDB Atlas
        try:
            db = get_database()
            mongo_products = list(db.products.find({}, {
                "_id": 1, "id": 1, "name": 1, "title": 1, "price": 1,
                "images": 1, "brand": 1, "brand_id": 1, "category": 1, "category_id": 1,
                "specifications": 1
            }))
            if mongo_products:
                brands_map = {str(b["_id"]): b.get("name", "") for b in db.brands.find({})}
                for p in mongo_products:
                    str_id = str(p["_id"])
                    b_id = str(p.get("brand_id", ""))
                    brand_name = p.get("brand") or brands_map.get(b_id, "")
                    self.product_catalog[str_id] = {
                        "product_id": str_id,
                        "productId": str_id,
                        "id": p.get("id", 0),
                        "name": p.get("name") or p.get("title") or "Laptop",
                        "title": p.get("title") or p.get("name") or "Laptop",
                        "price": float(p.get("price", 0)),
                        "brand": brand_name,
                        "category": p.get("category") or "Laptop",
                        "images": p.get("images", {}),
                        "image": p.get("images", {}).get("mainImg", {}).get("url", "/placeholder.jpg") if isinstance(p.get("images"), dict) else "/placeholder.jpg",
                        "specifications": p.get("specifications", {})
                    }
        except Exception as e:
            logger.warning(f"Could not load products from MongoDB: {e}")

        # 2. Fallback / Complete with item_features.csv
        csv_candidates = [
            Path(__file__).resolve().parent.parent.parent.parent / "recommender" / "datasets" / "item_features.csv",
            Path(__file__).resolve().parent.parent / "weights" / "item_features.csv",
        ]
        for csv_path in csv_candidates:
            if csv_path.exists():
                try:
                    df = pd.read_csv(csv_path)
                    for _, row in df.iterrows():
                        str_id = str(row["product_id"])
                        if str_id not in self.product_catalog:
                            self.product_catalog[str_id] = {
                                "product_id": str_id,
                                "productId": str_id,
                                "id": int(row.get("id", 0)) if pd.notna(row.get("id")) else 0,
                                "name": str(row.get("name", "Laptop")),
                                "title": str(row.get("name", "Laptop")),
                                "price": float(row.get("price", 0)),
                                "brand": str(row.get("brand", "Laptop")),
                                "category": str(row.get("category", "Laptop")),
                                "images": {
                                    "mainImg": {"url": "/placeholder.jpg", "alt_text": str(row.get("name", "Laptop"))},
                                    "sliderImg": []
                                },
                                "image": "/placeholder.jpg",
                                "specifications": {
                                    "cpu": str(row.get("cpu", "")),
                                    "gpu": str(row.get("gpu", "")),
                                    "ram": str(row.get("ram", "")),
                                    "storage": str(row.get("storage_capacity", "")),
                                    "display": str(row.get("display", ""))
                                }
                            }
                    logger.info(f"Loaded {len(self.product_catalog)} product records into catalog.")
                    break
                except Exception as ex:
                    logger.warning(f"Error loading {csv_path}: {ex}")

    def recommend_for_user(
        self,
        user_id: Optional[str] = None,
        limit: int = 10,
        exclude_interacted: bool = True,
        max_per_brand: int = 3
    ) -> Tuple[List[Dict[str, Any]], bool, str]:
        """
        Pure Pre-trained Model Inference:
        Input: user_id
        Process: Feed into pre-trained TwoTower model -> compute scores for all items
        Output: Top-K items ranked by the trained model
        """
        if not self.is_ready or self.model is None or self.content_tensor is None:
            return [], True, "model_not_ready"

        # 1. Map user_id to user index in the model
        is_cold_start = False
        if user_id and user_id in self.user_id_to_idx:
            u_idx = self.user_id_to_idx[user_id]
            algorithm = "two_tower_personalized"
        else:
            u_idx = self.cold_user_idx  # index 58: pre-trained general/cold-start user representation
            is_cold_start = True
            algorithm = "two_tower_cold_start"

        # 2. Pure Model Forward Pass
        u_tensor = torch.full((self.n_items,), u_idx, dtype=torch.long, device=self.device)
        with torch.no_grad():
            raw_scores = self.model(u_tensor, self.content_tensor).cpu().numpy()

        # 3. Sort item indices by model score descending
        ranked_indices = np.argsort(-raw_scores)

        # Min-max scale for display matching percentage
        s_min, s_max = raw_scores.min(), raw_scores.max()
        norm_scores = (raw_scores - s_min) / (s_max - s_min + 1e-9)

        # 4. Filter with Brand Diversity (max_per_brand limit)
        recommended_products = []
        brand_count: Dict[str, int] = {}

        for idx in ranked_indices:
            if len(recommended_products) >= limit:
                break

            pid = self.item_id_list[idx]
            product_info = self.product_catalog.get(pid, {
                "product_id": pid,
                "productId": pid,
                "name": f"Laptop {pid}",
                "title": f"Laptop {pid}",
                "price": 0.0,
                "brand": "Other",
                "category": "Laptop",
                "images": {"mainImg": {"url": "/placeholder.jpg"}},
                "image": "/placeholder.jpg",
                "specifications": {}
            })

            brand = product_info.get("brand", "Other")
            if brand_count.get(brand, 0) >= max_per_brand:
                continue

            brand_count[brand] = brand_count.get(brand, 0) + 1

            rec_item = dict(product_info)
            rec_item["score"] = float(raw_scores[idx])
            rec_item["final_score"] = float(norm_scores[idx])
            rec_item["algorithm"] = algorithm
            rec_item["reason"] = f"Gợi ý phù hợp từ mô hình AI ({round(float(norm_scores[idx]) * 100)}% Match)"

            recommended_products.append(rec_item)

        return recommended_products, is_cold_start, algorithm

    def recommend_similar_items(self, product_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Pure Item Tower Latent Space Similarity:
        Input: product_id
        Process: Dot product of Item Tower normalized embeddings
        Output: Top-K most similar laptops by hardware features in the model space
        """
        if not self.is_ready or self.item_sim_matrix is None or product_id not in self.item_id_to_idx:
            return []

        idx = self.item_id_to_idx[product_id]
        sim_scores = self.item_sim_matrix[idx].copy()
        sim_scores[idx] = -1.0  # Exclude target item itself

        top_indices = np.argsort(-sim_scores)[:limit]
        results = []

        for i in top_indices:
            pid = self.item_id_list[i]
            product_info = self.product_catalog.get(pid, {
                "product_id": pid,
                "productId": pid,
                "name": f"Laptop {pid}",
                "title": f"Laptop {pid}",
                "price": 0.0,
                "brand": "Other",
                "category": "Laptop",
                "images": {"mainImg": {"url": "/placeholder.jpg"}},
                "image": "/placeholder.jpg",
                "specifications": {}
            })

            item = dict(product_info)
            item["similarity_score"] = float(sim_scores[i])
            item["score"] = float(sim_scores[i])
            results.append(item)

        return results

rec_engine = RecommendationEngine()
