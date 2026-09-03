import os
import re
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
import torch
from bson import ObjectId

from app.core.config import settings
from app.core.database import get_database
from app.models.two_tower import TwoTower

logger = logging.getLogger("ai-service.rec_service")

class RecommendationEngine:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model: Optional[TwoTower] = None
        self.products: List[Dict[str, Any]] = []
        self.items_df: Optional[pd.DataFrame] = None
        self.content_vectors: Optional[np.ndarray] = None
        self.content_sim_matrix: Optional[np.ndarray] = None
        self.item_id_list: List[str] = []
        self.item_id_to_idx: Dict[str, int] = {}
        self.user_id_list: List[str] = []
        self.user_id_to_idx: Dict[str, int] = {}
        self.R_matrix: Optional[np.ndarray] = None
        self.is_ready = False

    # -------------------------------------------------------------
    # FEATURE EXTRACTION UTILITIES (matching Kaggle notebook & MongoDB)
    # -------------------------------------------------------------
    @staticmethod
    def parse_ram_gb(s: Any) -> float:
        if not s or not isinstance(s, str):
            return 8.0
        m = re.search(r'(\d+)\s*GB', s.upper())
        return float(m.group(1)) if m else 8.0

    @staticmethod
    def parse_storage_gb(s: Any) -> float:
        if not s or not isinstance(s, str):
            return 512.0
        s_up = s.upper()
        m_tb = re.search(r'(\d+(\.\d+)?)\s*TB', s_up)
        if m_tb:
            return float(m_tb.group(1)) * 1024.0
        m_gb = re.search(r'(\d+)\s*GB', s_up)
        return float(m_gb.group(1)) if m_gb else 512.0

    @staticmethod
    def has_dedicated_gpu(s: Any) -> int:
        if not s or not isinstance(s, str):
            return 0
        s_low = s.lower()
        for kw in ["rtx", "gtx", "geforce", "radeon rx", "arc a", "quadro"]:
            if kw in s_low:
                return 1
        return 0

    @staticmethod
    def parse_cpu_tier(s: Any) -> str:
        if not s or not isinstance(s, str):
            return "tier1_other"
        s_low = s.lower()
        if any(k in s_low for k in ["i9", "ultra 9", "ryzen 9"]):
            return "tier5_flagship"
        if any(k in s_low for k in ["i7", "ultra 7", "ryzen 7"]):
            return "tier4_high"
        if any(k in s_low for k in ["i5", "ultra 5", "ryzen 5"]):
            return "tier3_mid"
        if any(k in s_low for k in ["i3", "ryzen 3"]):
            return "tier2_entry"
        return "tier1_other"

    # -------------------------------------------------------------
    # INITIALIZATION & DATA LOADING FROM MONGODB
    # -------------------------------------------------------------
    def initialize(self):
        logger.info("⚡ Initializing Recommendation Engine from MongoDB Atlas...")
        try:
            db = get_database()

            # 1. Brands and Categories Mapping
            brands_map = {str(b["_id"]): b.get("name", "Unknown") for b in db.brands.find({})}
            cats_map = {str(c["_id"]): c.get("name", "Unknown") for c in db.categories.find({})}

            # 2. Fetch products from MongoDB
            product_cursor = db.products.find({}, {
                "_id": 1, "id": 1, "title": 1, "name": 1, "price": 1, "stock": 1,
                "brand_id": 1, "category_id": 1, "specifications": 1, "images": 1,
                "embedding": 1, "recommendation_embedding": 1, "rag_embedding": 1
            })
            raw_products = list(product_cursor)

            self.products = []
            rows = []

            for p in raw_products:
                str_id = str(p["_id"])
                specs = p.get("specifications") or {}
                
                # Brand
                b_id = p.get("brand_id")
                brand_name = brands_map.get(str(b_id), "Unknown") if b_id else "Unknown"

                # Category
                cat_ids = p.get("category_id") or []
                cat_name = "Unknown"
                if isinstance(cat_ids, list) and len(cat_ids) > 0:
                    cat_name = cats_map.get(str(cat_ids[0]), "Unknown")
                elif cat_ids:
                    cat_name = cats_map.get(str(cat_ids), "Unknown")

                # Embedding (384-dim)
                emb = p.get("recommendation_embedding") or p.get("embedding") or p.get("rag_embedding")
                if not emb or not isinstance(emb, list) or len(emb) != 384:
                    emb = [0.0] * 384

                row = {
                    "product_id": str_id,
                    "num_id": p.get("id", 0),
                    "title": p.get("title") or p.get("name") or "Laptop",
                    "price": float(p.get("price", 0)),
                    "brand": brand_name,
                    "category": cat_name,
                    "cpu_raw": specs.get("cpu", ""),
                    "gpu_raw": specs.get("gpu", ""),
                    "ram_gb": self.parse_ram_gb(specs.get("ram", "")),
                    "storage_gb": self.parse_storage_gb(specs.get("storage_capacity", "") or specs.get("storage", "")),
                    "cpu_tier": self.parse_cpu_tier(specs.get("cpu", "")),
                    "has_dgpu": self.has_dedicated_gpu(specs.get("gpu", "")),
                    "embedding": emb,
                    "raw_doc": p
                }
                rows.append(row)
                self.products.append(p)

            if not rows:
                logger.warning("No products found in DB for recommendation engine.")
                return

            self.items_df = pd.DataFrame(rows)
            self.items_df["ram_gb"] = self.items_df["ram_gb"].fillna(16.0)
            self.items_df["storage_gb"] = self.items_df["storage_gb"].fillna(512.0)

            # Build structured + text embedding vectors
            cat_cols = ["brand", "category", "cpu_tier"]
            ohe = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
            struct_cat = ohe.fit_transform(self.items_df[cat_cols])

            num_cols = ["price", "ram_gb", "storage_gb", "has_dgpu"]
            scaler = MinMaxScaler()
            struct_num = scaler.fit_transform(self.items_df[num_cols])

            structured_matrix = np.hstack([struct_cat, struct_num])
            embedding_matrix = np.vstack(self.items_df["embedding"].values)

            # L2 Normalize
            def l2norm(x):
                n = np.linalg.norm(x, axis=1, keepdims=True)
                n[n == 0] = 1.0
                return x / n

            W_STRUCT, W_EMB = 0.6, 0.4
            self.content_vectors = np.hstack([
                l2norm(structured_matrix) * W_STRUCT,
                l2norm(embedding_matrix) * W_EMB
            ])

            self.item_id_list = self.items_df["product_id"].tolist()
            self.item_id_to_idx = {pid: i for i, pid in enumerate(self.item_id_list)}
            self.content_sim_matrix = cosine_similarity(self.content_vectors)

            # 3. Load interaction matrix & users from MongoDB
            self._load_interactions(db)

            # 4. Load or initialize Two-Tower model weights
            self._load_or_train_two_tower()

            self.is_ready = True
            logger.info(f"✅ Recommendation Engine ready with {len(self.item_id_list)} items and {len(self.user_id_list)} users.")

        except Exception as e:
            logger.error(f"Error during recommendation engine initialization: {e}", exc_info=True)

    def _load_interactions(self, db):
        # Fetch interactions from MongoDB (supports both userId & user_id, productId & product_id)
        interactions = list(db.interactions.find({}, {
            "userId": 1, "user_id": 1, "productId": 1, "product_id": 1,
            "type": 1, "interaction_type": 1, "weight": 1
        }))
        
        type_weights = {
            "view": 1.0,
            "like": 3.0,
            "cart": 4.0,
            "add_to_cart": 4.0,
            "purchase": 5.0,
            "order": 5.0,
            "rating": 4.0,
            "feedback": 4.0
        }
        
        user_set = set()
        for inter in interactions:
            uid = str(inter.get("userId") or inter.get("user_id") or "")
            if uid:
                user_set.add(uid)

        # Also get all user IDs from users collection
        for u in db.users.find({}, {"_id": 1}):
            user_set.add(str(u["_id"]))

        self.user_id_list = sorted(list(user_set))
        self.user_id_to_idx = {uid: i for i, uid in enumerate(self.user_id_list)}

        n_users = max(len(self.user_id_list), 1)
        n_items = len(self.item_id_list)
        self.R_matrix = np.zeros((n_users, n_items), dtype=np.float32)

        for inter in interactions:
            uid = str(inter.get("userId") or inter.get("user_id") or "")
            pid = str(inter.get("productId") or inter.get("product_id") or "")
            if uid in self.user_id_to_idx and pid in self.item_id_to_idx:
                u_idx = self.user_id_to_idx[uid]
                i_idx = self.item_id_to_idx[pid]
                itype = str(inter.get("type") or inter.get("interaction_type") or "view").lower()
                w = float(inter.get("weight") or type_weights.get(itype, 1.0))
                self.R_matrix[u_idx, i_idx] = max(self.R_matrix[u_idx, i_idx], w)

    def _load_or_train_two_tower(self):
        n_users = max(len(self.user_id_list), 1)
        content_dim = self.content_vectors.shape[1] if self.content_vectors is not None else 64
        
        self.model = TwoTower(n_users=n_users, content_dim=content_dim, emb_dim=32).to(self.device)

        weights_path = settings.WEIGHTS_DIR / "two_tower_weights.pt"
        if weights_path.exists():
            try:
                state_dict = torch.load(weights_path, map_location=self.device)
                # Check if dimensions match
                if state_dict["user_tower.0.weight"].shape[0] == n_users and state_dict["item_tower.0.weight"].shape[1] == content_dim:
                    self.model.load_state_dict(state_dict)
                    logger.info("Loaded pre-trained TwoTower weights successfully from disk.")
                    self.model.eval()
                    return
            except Exception as e:
                logger.warning(f"Could not load saved weights: {e}. Training new instance...")

        self._quick_train_two_tower(n_users)

    def _quick_train_two_tower(self, n_users: int, epochs: int = 20):
        if self.R_matrix is None or self.content_vectors is None:
            return

        pos_pairs = []
        for u in range(n_users):
            pos_items = np.where(self.R_matrix[u] > 0)[0]
            for i in pos_items:
                pos_pairs.append((u, i))

        if not pos_pairs:
            logger.info("No interaction pairs found in DB. Two-Tower model initialized with cold start.")
            self.model.eval()
            return

        n_items = len(self.item_id_list)
        content_tensor = torch.tensor(self.content_vectors, dtype=torch.float32).to(self.device)
        optimizer = torch.optim.Adam(self.model.parameters(), lr=0.003, weight_decay=1e-5)
        
        self.model.train()
        for epoch in range(epochs):
            np.random.shuffle(pos_pairs)
            for u, pos_i in pos_pairs:
                neg_i = np.random.randint(0, n_items)
                while self.R_matrix[u, neg_i] > 0 and len(pos_items) < n_items:
                    neg_i = np.random.randint(0, n_items)

                u_tensor = torch.tensor([u], dtype=torch.long).to(self.device)
                pos_content = content_tensor[pos_i:pos_i+1]
                neg_content = content_tensor[neg_i:neg_i+1]

                optimizer.zero_grad()
                pos_score = self.model(u_tensor, pos_content)
                neg_score = self.model(u_tensor, neg_content)
                loss = -torch.nn.functional.logsigmoid(pos_score - neg_score).mean()
                loss.backward()
                optimizer.step()

        self.model.eval()
        try:
            torch.save(self.model.state_dict(), settings.WEIGHTS_DIR / "two_tower_weights.pt")
            logger.info("Saved TwoTower model weights to disk.")
        except Exception as e:
            logger.warning(f"Failed to save weights: {e}")

    # -------------------------------------------------------------
    # RECOMMENDATION INFERENCE LOGIC (Switching Hybrid + Cold Start)
    # -------------------------------------------------------------
    def get_content_based_user_scores(self, user_id: str) -> np.ndarray:
        n_items = len(self.item_id_list)
        if user_id not in self.user_id_to_idx:
            return np.zeros(n_items)
        u_idx = self.user_id_to_idx[user_id]
        user_vec = self.R_matrix[u_idx]
        interacted_idx = np.where(user_vec > 0)[0]
        if len(interacted_idx) == 0:
            return np.zeros(n_items)
        weights = user_vec[interacted_idx]
        profile = (self.content_vectors[interacted_idx] * weights[:, None]).sum(0) / weights.sum()
        scores = cosine_similarity(profile.reshape(1, -1), self.content_vectors)[0]
        return scores

    def get_two_tower_scores(self, user_id: str) -> np.ndarray:
        n_items = len(self.item_id_list)
        if user_id not in self.user_id_to_idx or self.model is None:
            return np.zeros(n_items)
        u_idx = self.user_id_to_idx[user_id]
        content_tensor = torch.tensor(self.content_vectors, dtype=torch.float32).to(self.device)
        u_tensor = torch.full((n_items,), u_idx, dtype=torch.long).to(self.device)
        with torch.no_grad():
            scores = self.model(u_tensor, content_tensor).cpu().numpy()
        return scores

    def recommend_for_user(
        self,
        user_id: Optional[str] = None,
        limit: int = 10,
        exclude_interacted: bool = True,
        max_per_brand: int = 3
    ) -> Tuple[List[Dict[str, Any]], bool, str]:
        """
        Returns (recommendations, is_cold_start, algorithm_used)
        """
        if not self.is_ready or len(self.item_id_list) == 0:
            return [], True, "fallback_empty"

        n_items = len(self.item_id_list)
        is_cold_start = False
        algorithm = "two_tower_switching_hybrid"

        # Check if user is known and has interaction history
        has_history = False
        interacted_idx = []
        if user_id and user_id in self.user_id_to_idx:
            u_idx = self.user_id_to_idx[user_id]
            interacted_idx = np.where(self.R_matrix[u_idx] > 0)[0]
            if len(interacted_idx) > 0:
                has_history = True

        if not has_history:
            # COLD-START USER: Use popularity / top-tier Content-Based diversity
            is_cold_start = True
            algorithm = "content_based_cold_start"
            scores = (self.items_df["price"] > 0).astype(float).values * 0.5
            scores += np.random.uniform(0.1, 0.4, size=n_items)
        else:
            # SWITCHING HYBRID: alpha depends on interaction count
            n_hist = len(interacted_idx)
            alpha = min(0.85, n_hist / (n_hist + 3.0))

            tt_scores = self.get_two_tower_scores(user_id)
            cb_scores = self.get_content_based_user_scores(user_id)

            def norm(s):
                mn, mx = s.min(), s.max()
                return (s - mn) / (mx - mn) if mx - mn > 1e-9 else np.zeros_like(s)

            scores = alpha * norm(tt_scores) + (1.0 - alpha) * norm(cb_scores)

            if exclude_interacted:
                scores[interacted_idx] = -1e9

        # Ranked item indices
        ranked_indices = np.argsort(-scores)

        # Apply Brand Diversity (max_per_brand limit)
        brand_count = {}
        recommended_products = []

        for idx in ranked_indices:
            if len(recommended_products) >= limit:
                break
            if scores[idx] <= -1e8:
                continue

            item_row = self.items_df.iloc[idx]
            brand = item_row["brand"]
            if brand_count.get(brand, 0) >= max_per_brand:
                continue

            brand_count[brand] = brand_count.get(brand, 0) + 1
            raw_p = item_row["raw_doc"]

            recommended_products.append({
                "product_id": str(raw_p["_id"]),
                "id": raw_p.get("id"),
                "name": raw_p.get("name") or raw_p.get("title"),
                "title": raw_p.get("title") or raw_p.get("name"),
                "price": float(raw_p.get("price", 0)),
                "brand": brand,
                "category": item_row["category"],
                "images": raw_p.get("images", {}),
                "specifications": raw_p.get("specifications", {}),
                "score": float(scores[idx]),
                "algorithm": algorithm
            })

        return recommended_products, is_cold_start, algorithm

    def recommend_similar_items(self, product_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Item-to-Item Content-Based recommendation
        """
        if not self.is_ready or product_id not in self.item_id_to_idx:
            return []

        idx = self.item_id_to_idx[product_id]
        sim_scores = self.content_sim_matrix[idx].copy()
        sim_scores[idx] = -1.0

        top_indices = np.argsort(-sim_scores)[:limit]
        results = []
        for i in top_indices:
            raw_p = self.items_df.iloc[i]["raw_doc"]
            results.append({
                "product_id": str(raw_p["_id"]),
                "id": raw_p.get("id"),
                "name": raw_p.get("name") or raw_p.get("title"),
                "title": raw_p.get("title") or raw_p.get("name"),
                "price": float(raw_p.get("price", 0)),
                "brand": self.items_df.iloc[i]["brand"],
                "category": self.items_df.iloc[i]["category"],
                "images": raw_p.get("images", {}),
                "similarity_score": float(sim_scores[i])
            })
        return results

rec_engine = RecommendationEngine()
