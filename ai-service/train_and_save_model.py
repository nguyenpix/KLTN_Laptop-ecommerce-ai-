"""
Huấn luyện và xuất trọng số mô hình Two-Tower Recommendation Model trực tiếp từ MongoDB Atlas.
Dựa trên kiến trúc và phương pháp đánh giá từ Kaggle Notebook:
phase2-train-evaluate-deploy-kaggle-v1 / hybrid_recsys_kaggle_v1.ipynb
"""

import os
import sys
import json
import re
import math
import logging
from pathlib import Path
from typing import Dict, List, Any, Tuple

# Thiết lập đường dẫn thư mục gốc ai-service
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

import numpy as np
import pandas as pd
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from bson import ObjectId

from app.core.config import settings
from app.core.database import get_database, close_database
from app.models.two_tower import TwoTower

# Thiết lập UTF-8 cho Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("train_two_tower")


# ==============================================================================
# 1. HÀM TRÍCH XUẤT ĐẶC TRƯNG TỪ MONGODB (Specs Parser)
# ==============================================================================
def parse_ram_gb(s: Any) -> float:
    if not s or not isinstance(s, str):
        return 8.0
    m = re.search(r'(\d+)\s*GB', s.upper())
    return float(m.group(1)) if m else 8.0


def parse_storage_gb(s: Any) -> float:
    if not s or not isinstance(s, str):
        return 512.0
    s_up = s.upper()
    m_tb = re.search(r'(\d+(\.\d+)?)\s*TB', s_up)
    if m_tb:
        return float(m_tb.group(1)) * 1024.0
    m_gb = re.search(r'(\d+)\s*GB', s_up)
    return float(m_gb.group(1)) if m_gb else 512.0


def has_dedicated_gpu(s: Any) -> int:
    if not s or not isinstance(s, str):
        return 0
    s_low = s.lower()
    for kw in ["rtx", "gtx", "geforce", "radeon rx", "arc a", "quadro"]:
        if kw in s_low:
            return 1
    return 0


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


def l2norm(x: np.ndarray) -> np.ndarray:
    n = np.linalg.norm(x, axis=1, keepdims=True)
    n[n == 0] = 1.0
    return x / n


# ==============================================================================
# 2. BPR DATASET CHO PYTORCH
# ==============================================================================
class BPRDataset(Dataset):
    def __init__(self, pos_pairs: List[Tuple[int, int]], n_items: int, R_matrix: np.ndarray):
        self.pos_pairs = pos_pairs
        self.n_items = n_items
        self.R = R_matrix

    def __len__(self):
        return len(self.pos_pairs)

    def __getitem__(self, idx):
        u, i = self.pos_pairs[idx]
        neg = np.random.randint(0, self.n_items)
        while self.R[u, neg] > 0:
            neg = np.random.randint(0, self.n_items)
        return (
            torch.tensor(u, dtype=torch.long),
            torch.tensor(i, dtype=torch.long),
            torch.tensor(neg, dtype=torch.long)
        )


# ==============================================================================
# 3. HÀM ĐÁNH GIÁ (Metrics: Precision@K, Recall@K, NDCG@K)
# ==============================================================================
def dcg_at_k(rels: np.ndarray) -> float:
    return sum((2**r - 1) / math.log2(idx + 2) for idx, r in enumerate(rels))


def evaluate_model(score_fn, test_dict: Dict[int, List[int]], n_items: int, k_list=(5, 10)) -> Dict[str, float]:
    p_k = {k: [] for k in k_list}
    r_k = {k: [] for k in k_list}
    ndcg_k = {k: [] for k in k_list}

    for u_idx, pos_items in test_dict.items():
        if not pos_items:
            continue
        scores = score_fn(u_idx)
        ranked = np.argsort(-scores)

        target_set = set(pos_items)
        n_pos = len(target_set)

        for k in k_list:
            topk = ranked[:k]
            hits = [1 if item in target_set else 0 for item in topk]
            p_k[k].append(sum(hits) / k)
            r_k[k].append(sum(hits) / n_pos)

            actual_dcg = dcg_at_k(hits)
            ideal_dcg = dcg_at_k([1] * min(n_pos, k))
            ndcg_k[k].append(actual_dcg / ideal_dcg if ideal_dcg > 0 else 0.0)

    results = {}
    for k in k_list:
        results[f"Precision@{k}"] = float(np.mean(p_k[k])) if p_k[k] else 0.0
        results[f"Recall@{k}"] = float(np.mean(r_k[k])) if r_k[k] else 0.0
        results[f"NDCG@{k}"] = float(np.mean(ndcg_k[k])) if ndcg_k[k] else 0.0
    return results


# ==============================================================================
# 4. CHƯƠNG TRÌNH CHÍNH
# ==============================================================================
def train_and_export():
    print("\n" + "=" * 75)
    print("🚀 HUẤN LUYỆN VÀ XUẤT TRỌNG SỐ MÔ HÌNH TWO-TOWER TỪ MONGODB ATLAS")
    print("=" * 75 + "\n")

    db = get_database()

    # --- 4.1 Lấy dữ liệu Brands & Categories để Join ---
    print("[1/6] Đang tải danh mục, thương hiệu và sản phẩm từ MongoDB...")
    brands_map = {str(b["_id"]): b.get("name", "Unknown") for b in db.brands.find({})}
    cats_map = {str(c["_id"]): c.get("name", "Unknown") for c in db.categories.find({})}

    # --- 4.2 Lấy danh sách sản phẩm ---
    products = list(db.products.find({}, {
        "_id": 1, "id": 1, "title": 1, "name": 1, "price": 1,
        "brand_id": 1, "category_id": 1, "specifications": 1,
        "embedding": 1, "recommendation_embedding": 1, "rag_embedding": 1, "stock": 1
    }))

    print(f"  -> Tìm thấy {len(products)} sản phẩm trong collection 'products'.")

    rows = []
    for p in products:
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

        rows.append({
            "product_id": str_id,
            "id": p.get("id", 0),
            "title": p.get("title") or p.get("name") or "Laptop",
            "price": float(p.get("price", 0)),
            "brand": brand_name,
            "category": cat_name,
            "cpu_raw": specs.get("cpu", ""),
            "gpu_raw": specs.get("gpu", ""),
            "ram_gb": parse_ram_gb(specs.get("ram", "")),
            "storage_gb": parse_storage_gb(specs.get("storage_capacity", "") or specs.get("storage", "")),
            "cpu_tier": parse_cpu_tier(specs.get("cpu", "")),
            "has_dgpu": has_dedicated_gpu(specs.get("gpu", "")),
            "embedding": emb,
            "stock": p.get("stock", 0)
        })

    items_df = pd.DataFrame(rows)
    items_df["ram_gb"] = items_df["ram_gb"].fillna(items_df["ram_gb"].median() if not items_df["ram_gb"].isna().all() else 16.0)
    items_df["storage_gb"] = items_df["storage_gb"].fillna(items_df["storage_gb"].median() if not items_df["storage_gb"].isna().all() else 512.0)

    # --- 4.3 Xây dựng Content Vectors (Structured + 384-dim Text Embeddings) ---
    print("[2/6] Đang xây dựng Content Feature Vectors...")
    cat_cols = ["brand", "category", "cpu_tier"]
    ohe = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
    struct_cat = ohe.fit_transform(items_df[cat_cols])

    num_cols = ["price", "ram_gb", "storage_gb", "has_dgpu"]
    scaler = MinMaxScaler()
    struct_num = scaler.fit_transform(items_df[num_cols])

    structured_matrix = np.hstack([struct_cat, struct_num])
    embedding_matrix = np.vstack(items_df["embedding"].values)

    W_STRUCT, W_EMB = 0.6, 0.4
    content_vectors = np.hstack([
        l2norm(structured_matrix) * W_STRUCT,
        l2norm(embedding_matrix) * W_EMB
    ])
    print(f"  -> Kích thước ma trận Content Vectors: {content_vectors.shape}")

    item_id_list = items_df["product_id"].tolist()
    item_id_to_idx = {pid: i for i, pid in enumerate(item_id_list)}

    # --- 4.4 Tải ma trận tương tác từ collection 'interactions' ---
    print("[3/6] Đang nạp lịch sử tương tác người dùng (Interactions)...")
    interactions = list(db.interactions.find({}, {
        "userId": 1, "user_id": 1, "productId": 1, "product_id": 1,
        "type": 1, "interaction_type": 1, "weight": 1, "createdAt": 1
    }).sort("createdAt", 1))

    print(f"  -> Tìm thấy {len(interactions)} bản ghi tương tác trong MongoDB.")

    # Lấy danh sách tất cả Users
    user_docs = list(db.users.find({}, {"_id": 1}))
    user_id_set = set(str(u["_id"]) for u in user_docs)
    for inter in interactions:
        uid = str(inter.get("userId") or inter.get("user_id") or "")
        if uid:
            user_id_set.add(uid)

    user_id_list = sorted(list(user_id_set))
    user_id_to_idx = {uid: i for i, uid in enumerate(user_id_list)}

    n_users = len(user_id_list)
    n_items = len(item_id_list)
    R_matrix = np.zeros((n_users, n_items), dtype=np.float32)

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

    user_interaction_events = []
    for inter in interactions:
        uid = str(inter.get("userId") or inter.get("user_id") or "")
        pid = str(inter.get("productId") or inter.get("product_id") or "")
        if uid in user_id_to_idx and pid in item_id_to_idx:
            u_idx = user_id_to_idx[uid]
            i_idx = item_id_to_idx[pid]
            itype = str(inter.get("type") or inter.get("interaction_type") or "view").lower()
            weight = float(inter.get("weight") or type_weights.get(itype, 1.0))

            R_matrix[u_idx, i_idx] = max(R_matrix[u_idx, i_idx], weight)
            user_interaction_events.append((u_idx, i_idx, weight))

    # --- 4.5 Phân chia Train/Test Split (Leave-One-Out theo User) ---
    print("[4/6] Phân chia Train / Test tập tương tác...")
    train_pairs = []
    test_dict = {}
    R_train = np.zeros_like(R_matrix)

    for u_idx in range(n_users):
        pos_items = np.where(R_matrix[u_idx] > 0)[0].tolist()
        if len(pos_items) >= 2:
            # Giữ lại 1 item làm test, còn lại làm train
            test_item = pos_items[-1]
            train_items = pos_items[:-1]
            test_dict[u_idx] = [test_item]
            for i in train_items:
                train_pairs.append((u_idx, i))
                R_train[u_idx, i] = R_matrix[u_idx, i]
        elif len(pos_items) == 1:
            train_pairs.append((u_idx, pos_items[0]))
            R_train[u_idx, pos_items[0]] = R_matrix[u_idx, pos_items[0]]

    print(f"  -> Số cặp train tương tác: {len(train_pairs)} | Số user test: {len(test_dict)}")

    # --- 4.6 Khởi tạo và Huấn luyện Mô hình Two-Tower ---
    print("\n[5/6] Đang huấn luyện Mô hình Two-Tower (Deep Learning PyTorch)...")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    content_dim = content_vectors.shape[1]

    model = TwoTower(n_users=n_users, content_dim=content_dim, emb_dim=32).to(device)
    content_tensor = torch.tensor(content_vectors, dtype=torch.float32).to(device)

    bpr_ds = BPRDataset(train_pairs, n_items, R_train)
    bpr_loader = DataLoader(bpr_ds, batch_size=64, shuffle=True)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.003, weight_decay=1e-5)

    EPOCHS = 35
    loss_history = []
    model.train()

    for epoch in range(EPOCHS):
        total_loss = 0.0
        for u_batch, pos_batch, neg_batch in bpr_loader:
            u = u_batch.to(device)
            pos_content = content_tensor[pos_batch.to(device)]
            neg_content = content_tensor[neg_batch.to(device)]

            optimizer.zero_grad()
            pos_score = model(u, pos_content)
            neg_score = model(u, neg_content)
            loss = -F.logsigmoid(pos_score - neg_score).mean()
            loss.backward()
            optimizer.step()
            total_loss += loss.item() * len(u)

        avg_loss = total_loss / max(len(bpr_ds), 1)
        loss_history.append(avg_loss)
        if (epoch + 1) % 5 == 0 or epoch == 0:
            print(f"   [Two-Tower] Epoch {epoch+1:02d}/{EPOCHS} - BPR Loss: {avg_loss:.4f}")

    # --- 4.7 Đánh giá Mô hình Two-Tower ---
    print("\n[6/6] Đánh giá hiệu năng mô hình...")
    model.eval()

    def two_tower_score(u_idx):
        u_tensor = torch.full((n_items,), u_idx, dtype=torch.long).to(device)
        with torch.no_grad():
            scores = model(u_tensor, content_tensor).cpu().numpy()
        # Loại bỏ các item đã có trong train
        train_interacted = np.where(R_train[u_idx] > 0)[0]
        scores[train_interacted] = -1e9
        return scores

    metrics_tt = evaluate_model(two_tower_score, test_dict, n_items, k_list=(5, 10))
    print("-" * 60)
    print("📊 KẾT QUẢ ĐÁNH GIÁ MÔ HÌNH TWO-TOWER (TRÊN DỮ LIỆU THỰC TẾ):")
    print(f"   - Precision@5:  {metrics_tt['Precision@5']:.4f}")
    print(f"   - Recall@5:     {metrics_tt['Recall@5']:.4f}")
    print(f"   - NDCG@5:       {metrics_tt['NDCG@5']:.4f}")
    print(f"   - Precision@10: {metrics_tt['Precision@10']:.4f}")
    print(f"   - Recall@10:    {metrics_tt['Recall@10']:.4f}")
    print(f"   - NDCG@10:      {metrics_tt['NDCG@10']:.4f}")
    print("-" * 60)

    # --- 4.8 Lưu trữ Trọng số & Metadata ---
    weights_dir = settings.WEIGHTS_DIR
    weights_dir.mkdir(parents=True, exist_ok=True)

    weights_path = weights_dir / "two_tower_weights.pt"
    content_vec_path = weights_dir / "content_vectors.npy"
    mappings_path = weights_dir / "id_mappings.json"
    metrics_path = weights_dir / "model_metrics.json"

    torch.save(model.state_dict(), weights_path)
    np.save(content_vec_path, content_vectors)

    mappings = {
        "item_id_list": item_id_list,
        "user_id_list": user_id_list,
        "n_users": n_users,
        "n_items": n_items,
        "content_dim": content_dim,
        "best_alpha": 0.65
    }
    with open(mappings_path, "w", encoding="utf-8") as f:
        json.dump(mappings, f, indent=2, ensure_ascii=False)

    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_tt, f, indent=2)

    print("\n✅ XUẤT MÔ HÌNH THÀNH CÔNG:")
    print(f"   💾 PyTorch Weights:  {weights_path}")
    print(f"   💾 Content Vectors:  {content_vec_path}")
    print(f"   💾 ID Mappings:      {mappings_path}")
    print(f"   💾 Model Metrics:    {metrics_path}")
    print("=" * 75 + "\n")


if __name__ == "__main__":
    try:
        train_and_export()
    finally:
        close_database()
