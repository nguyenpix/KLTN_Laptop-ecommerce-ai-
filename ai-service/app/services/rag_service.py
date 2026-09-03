import time
import re
import logging
from typing import List, Dict, Any, Optional, Tuple
from bson import ObjectId
from datetime import datetime
import numpy as np
import requests

from app.core.config import settings
from app.core.database import get_database
from app.services.rec_service import rec_engine
from app.services.llm_service import llm_service

logger = logging.getLogger("ai-service.rag_service")

class RAGService:
    def __init__(self):
        self.hf_api_key = settings.HUGGINGFACE_API_KEY
        self.embedding_model = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        # Disable remote HF feature extraction if DNS/network is unavailable or slow
        self._hf_disabled = True

    def get_text_embedding(self, text: str) -> Optional[List[float]]:
        if not self.hf_api_key or self._hf_disabled:
            return None
        try:
            url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{self.embedding_model}"
            headers = {"Authorization": f"Bearer {self.hf_api_key}"}
            res = requests.post(url, headers=headers, json={"inputs": text[:1000]}, timeout=1)
            if res.status_code == 200:
                vec = res.json()
                if isinstance(vec, list) and isinstance(vec[0], list):
                    vec = vec[0]
                if len(vec) == 384:
                    return vec
        except Exception:
            self._hf_disabled = True
        return None

    SUPPORTED_BRANDS = {"dell", "lenovo", "acer", "msi"}
    UNSUPPORTED_BRANDS = {
        "apple", "macbook", "mac", "asus", "hp", "samsung", "lg", "huawei", "xiaomi", "surface", "razer", "gigabyte"
    }

    def parse_query_constraints(self, query: str) -> Dict[str, Any]:
        """
        Extract price limits, brand preferences, focus keywords, intent, policy, unsupported brands,
        and out-of-scope queries from Vietnamese natural language.
        """
        q = query.lower().replace(',', '').replace('.', '')
        min_price: Optional[float] = None
        max_price: Optional[float] = None

        # 0. Detect Out-of-scope (Không liên quan đến laptop / máy tính / công nghệ / cửa hàng)
        is_out_of_scope = False
        out_of_scope_patterns = [
            r'thời tiết', r'nhiệt độ hôm nay', r'mưa hay nắng', r'làm thơ', r'kể chuyện cổ tích',
            r'nấu ăn', r'công thức nấu', r'món ăn', r'chính trị', r'tổng thống',
            r'bóng đá', r'world cup', r'tình yêu', r'bói toán', r'tử vi'
        ]
        if any(re.search(p, q) for p in out_of_scope_patterns):
            # Make sure it's not asking about laptop
            if not any(k in q for k in ["laptop", "máy tính", "ram", "cpu", "giá", "mua", "bán", "cửa hàng"]):
                is_out_of_scope = True

        # 0.1 Detect Store Policy / Customer Service (Bảo hành, đổi trả, giao hàng, trả góp)
        is_policy = False
        policy_patterns = [
            r'bảo hành', r'đổi trả', r'giao hàng', r'ship hàng', r'phí ship', r'vận chuyển',
            r'trả góp', r'địa chỉ shop', r'cửa hàng ở đâu', r'showroom', r'thời gian làm việc',
            r'liên hệ', r'hotline', r'chính sách'
        ]
        if any(re.search(p, q) for p in policy_patterns):
            is_policy = True

        # 0.2 Detect Negative Feedback / Dislike previous suggestions
        negative_feedback = False
        negative_patterns = [
            r'không thích', r'bỏ qua', r'đổi dòng khác', r'mẫu khác đi', r'mấy con này chán',
            r'mấy dòng này chán', r'xem con khác', r'xem mẫu khác', r'loại khác', r'không ưng'
        ]
        if any(re.search(p, q) for p in negative_patterns):
            negative_feedback = True

        # 1. Price Range: "từ 15 đến 25 triệu", "tầm 15 - 20 tr", "15-20 triệu"
        m_range = re.search(r'(?:từ|tầm|khoảng)?\s*(\d+(?:\.\d+)?)\s*(?:đến|-|tới)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|m)?', q)
        if m_range and ('triệu' in q or 'tr' in q or 'm' in q):
            v1, v2 = float(m_range.group(1)), float(m_range.group(2))
            min_price, max_price = min(v1, v2) * 1_000_000, max(v1, v2) * 1_000_000

        # 2. Maximum price constraint: "dưới 20 triệu", "< 20tr", "tối đa 25tr", "dưới 20000000"
        m_under = re.search(r'(?:dưới|<|ít hơn|tối đa|khong qua|không quá)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|m|vnđ|vnd)?', q)
        if m_under:
            val = float(m_under.group(1))
            max_price = val * 1_000_000 if val < 1000 else val

        # 3. Minimum price constraint: "trên 20 triệu", "> 20tr", "tối thiểu 15 triệu"
        m_over = re.search(r'(?:trên|>|hơn|tối thiểu)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|m|vnđ|vnd)?', q)
        if m_over and not min_price:
            val = float(m_over.group(1))
            min_price = val * 1_000_000 if val < 1000 else val

        # 4. Approximate price: "tầm 20 triệu", "khoảng 15tr"
        m_approx = re.search(r'(?:tầm|khoảng|giá)\s*(\d+(?:\.\d+)?)\s*(?:triệu|tr|m)', q)
        if m_approx and not min_price and not max_price:
            val = float(m_approx.group(1)) * 1_000_000
            min_price, max_price = val * 0.8, val * 1.2

        # 5. Detect Intent
        intent = "general"
        if any(w in q for w in ["lập trình", "code", "dev", "it", "phần mềm", "backend", "frontend"]):
            intent = "programming"
        elif any(w in q for w in ["game", "gaming", "chơi game", "fps", "esport"]):
            intent = "gaming"
        elif any(w in q for w in ["đồ họa", "render", "thiết kế", "photoshop", "premiere", "3d"]):
            intent = "design"
        elif any(w in q for w in ["văn phòng", "học tập", "sinh viên", "mỏng nhẹ", "pin trâu", "office"]):
            intent = "office"

        # 6. Detect Supported & Unsupported Brands
        detected_supported_brands = []
        detected_unsupported_brands = []

        all_known_brands = list(self.SUPPORTED_BRANDS) + list(self.UNSUPPORTED_BRANDS)
        for b in all_known_brands:
            if re.search(r'\b' + re.escape(b) + r'\b', q):
                if b in self.SUPPORTED_BRANDS:
                    detected_supported_brands.append(b)
                else:
                    detected_unsupported_brands.append(b)

        # 7. Detect Focus Criteria (Độ phân giải / Màn hình / CPU / GPU / RAM / Pin)
        focus_criteria = []
        if any(w in q for w in ["độ phân giải", "màn hình", "display", "2k", "4k", "oled", "120hz", "144hz", "retina", "sắc nét", "fhd", "tần số quét"]):
            focus_criteria.append("screen")
        if any(w in q for w in ["cpu", "chip", "i7", "i9", "ryzen 7", "ryzen 9", "ultra 7", "ultra 9", "hiệu năng cao", "xử lý mạnh", "cpu cao", "chip mạnh"]):
            focus_criteria.append("cpu")
        if any(w in q for w in ["gpu", "card rời", "card đồ họa", "rtx", "geforce", "vga"]):
            focus_criteria.append("gpu")
        if any(w in q for w in ["ram", "16gb", "32gb"]):
            focus_criteria.append("ram")
        if any(w in q for w in ["pin", "pin trâu", "thời lượng pin", "battery"]):
            focus_criteria.append("battery")

        return {
            "min_price": min_price,
            "max_price": max_price,
            "intent": intent,
            "brands": detected_supported_brands,
            "unsupported_brands": detected_unsupported_brands,
            "focus_criteria": focus_criteria,
            "is_out_of_scope": is_out_of_scope,
            "is_policy": is_policy,
            "negative_feedback": negative_feedback
        }

    def search_relevant_products(
        self,
        query: str,
        conversation_history: Optional[List[Dict[str, Any]]] = None,
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """
        RAG Hybrid search: Constraint filter (Accumulated Price/Brand) + Semantic vector + Multi-turn Intent & Feature boosting
        """
        if not rec_engine.is_ready or rec_engine.items_df is None or len(rec_engine.items_df) == 0:
            return []

        # Parse constraints from current query
        current_constraints = self.parse_query_constraints(query)
        
        # 1. Early Return: Out of scope, Store Policy, or asking for unsupported brands
        if current_constraints["is_out_of_scope"] or current_constraints["is_policy"]:
            return []
        if current_constraints["unsupported_brands"]:
            return []

        min_p = current_constraints["min_price"]
        max_p = current_constraints["max_price"]
        intent = current_constraints["intent"]
        brands = list(current_constraints["brands"])
        focus_criteria = list(current_constraints["focus_criteria"])
        negative_feedback = current_constraints["negative_feedback"]

        # Track previously referenced products to exclude on negative feedback
        disliked_ids = set()
        if negative_feedback and conversation_history:
            for m in reversed(conversation_history):
                # Look for assistant referenced products
                refs = m.get("referenced_products") or []
                for ref in refs:
                    pid = ref.get("product_id")
                    if isinstance(pid, dict):
                        disliked_ids.add(str(pid.get("_id", "")))
                    elif isinstance(pid, str):
                        disliked_ids.add(pid)
                if disliked_ids:
                    break

        # ACCUMULATE from conversation history if not specified in current query
        if conversation_history:
            user_past_msgs = [
                m.get("content", "") for m in conversation_history
                if m.get("role") == "user"
            ]
            # Traverse past messages from most recent to oldest
            for past_text in reversed(user_past_msgs):
                past_c = self.parse_query_constraints(past_text)
                if min_p is None and past_c["min_price"] is not None:
                    min_p = past_c["min_price"]
                if max_p is None and past_c["max_price"] is not None:
                    max_p = past_c["max_price"]
                if intent == "general" and past_c["intent"] != "general":
                    intent = past_c["intent"]
                for b in past_c["brands"]:
                    if b not in brands:
                        brands.append(b)
                for f in past_c["focus_criteria"]:
                    if f not in focus_criteria:
                        focus_criteria.append(f)

        query_vec = self.get_text_embedding(query)
        scores = np.zeros(len(rec_engine.items_df))

        # 1. Semantic Vector Match
        if query_vec is not None and rec_engine.content_vectors is not None:
            emb_matrix = np.vstack(rec_engine.items_df["embedding"].values)
            norm_q = np.linalg.norm(query_vec)
            if norm_q > 0:
                q_arr = np.array(query_vec) / norm_q
                norms_db = np.linalg.norm(emb_matrix, axis=1)
                norms_db[norms_db == 0] = 1.0
                scores += np.dot(emb_matrix / norms_db[:, None], q_arr) * 0.5

        # 2. Keyword & Intent Relevance Matching
        q_lower = query.lower()
        words = [w for w in q_lower.split() if len(w) >= 2]

        for idx, row in rec_engine.items_df.iterrows():
            raw_doc = row["raw_doc"]
            doc_id = str(raw_doc.get("_id", ""))

            # Exclude disliked products from previous turn
            if doc_id in disliked_ids:
                scores[idx] = -9999.0
                continue

            price = float(row["price"])
            raw_specs = raw_doc.get("specifications") or {}
            disp_str = str(raw_specs.get("display") or "").lower()
            title_low = str(row["title"]).lower()
            brand_low = str(row["brand"]).lower()
            
            # --- STRICT BRAND FILTER ---
            # If user explicitly specified supported brand(s) (e.g., dell, lenovo, acer, msi)
            if brands:
                if not any(b in brand_low or b in title_low for b in brands):
                    scores[idx] = -9999.0
                    continue

            # --- STRICT PRICE FILTER ---
            if max_p is not None and price > max_p:
                scores[idx] = -9999.0  # Disqualify
                continue
            if min_p is not None and price < min_p:
                scores[idx] = -9999.0  # Disqualify
                continue

            kw_score = 1.0  # Base score for matching price filter
            cat_low = str(row["category"]).lower()
            cpu_low = str(row["cpu_raw"]).lower()
            gpu_low = str(row["gpu_raw"]).lower()
            ram_gb = float(row["ram_gb"])

            # Brand match boost
            if brands:
                if any(b in brand_low or b in title_low for b in brands):
                    kw_score += 2.0

            # Word matching
            for w in words:
                if w in title_low: kw_score += 0.3
                if w in brand_low: kw_score += 0.4
                if w in cat_low: kw_score += 0.3
                if w in cpu_low or w in gpu_low: kw_score += 0.3
                if w in disp_str: kw_score += 0.4

            # --- FOCUS CRITERIA BOOSTING ---
            if "screen" in focus_criteria:
                # Ưu tiên màn hình độ phân giải cao, OLED, 2K, 3K, 4K, 120Hz, 144Hz
                if any(k in disp_str for k in ["3840", "4k", "oled", "2880", "3k", "2560", "2.8k", "2k", "120hz", "144hz", "165hz", "240hz"]):
                    kw_score += 2.5
                elif "ips" in disp_str or "100% srgb" in disp_str:
                    kw_score += 1.0

            if "cpu" in focus_criteria:
                # Ưu tiên chip cao cấp: i7, i9, Ryzen 7, Ryzen 9, Ultra 7, Ultra 9
                if any(k in cpu_low for k in ["i9", "ryzen 9", "ultra 9", "hx"]):
                    kw_score += 2.5
                elif any(k in cpu_low for k in ["i7", "ryzen 7", "ultra 7", "hs", "h"]):
                    kw_score += 2.0
                elif any(k in cpu_low for k in ["i5", "ryzen 5", "ultra 5"]):
                    kw_score += 0.5

            if "gpu" in focus_criteria:
                if row["has_dgpu"] == 1:
                    kw_score += 2.0
                if any(k in gpu_low for k in ["rtx 40", "rtx 30", "rtx 50"]):
                    kw_score += 1.0

            if "ram" in focus_criteria:
                if ram_gb >= 32: kw_score += 2.0
                elif ram_gb >= 16: kw_score += 1.2

            # Intent-specific feature boost
            if intent == "programming":
                if ram_gb >= 32: kw_score += 1.5
                elif ram_gb >= 16: kw_score += 1.0
                if any(k in cpu_low for k in ["i7", "i9", "ryzen 7", "ryzen 9", "ultra"]): kw_score += 0.8
                elif any(k in cpu_low for k in ["i5", "ryzen 5"]): kw_score += 0.4
                if "gaming" in cat_low or "văn phòng" in cat_low or "đồ họa" in cat_low: kw_score += 0.3

            elif intent == "gaming":
                if row["has_dgpu"] == 1: kw_score += 1.5
                if "gaming" in cat_low: kw_score += 1.2
                if any(k in gpu_low for k in ["rtx 40", "rtx 30", "rtx 50"]): kw_score += 0.8

            elif intent == "design":
                if row["has_dgpu"] == 1: kw_score += 1.2
                if ram_gb >= 16: kw_score += 0.8
                if any(k in disp_str for k in ["oled", "ips", "retina", "srgb", "3k", "4k"]): kw_score += 1.2

            elif intent == "office":
                if "văn phòng" in cat_low or "mỏng nhẹ" in cat_low: kw_score += 1.0
                if price <= 20_000_000: kw_score += 0.8

            scores[idx] += kw_score

        # Filter out disqualified items
        valid_indices = [i for i, s in enumerate(scores) if s > -100.0]
        if not valid_indices:
            logger.warning(f"No products found matching strict price ({min_p} - {max_p}). Falling back to closest.")
            return []

        sorted_indices = sorted(valid_indices, key=lambda i: scores[i], reverse=True)[:top_k]

        results = []
        for i in sorted_indices:
            raw_p = rec_engine.items_df.iloc[i]["raw_doc"]
            results.append({
                "product_id": str(raw_p["_id"]),
                "_id": str(raw_p["_id"]),
                "id": raw_p.get("id"),
                "name": raw_p.get("name") or raw_p.get("title"),
                "title": raw_p.get("title") or raw_p.get("name"),
                "price": float(raw_p.get("price", 0)),
                "brand": rec_engine.items_df.iloc[i]["brand"],
                "category": rec_engine.items_df.iloc[i]["category"],
                "specifications": raw_p.get("specifications", {}),
                "images": raw_p.get("images", {}),
                "similarity": float(scores[i])
            })
        return results

    def build_context(self, products: List[Dict[str, Any]], query_meta: Optional[Dict[str, Any]] = None) -> str:
        if query_meta:
            if query_meta.get("is_out_of_scope"):
                return (
                    "THÔNG BÁO HỆ THỐNG (OUT OF SCOPE): Khách hàng đang hỏi một chủ đề nằm ngoài phạm vi tư vấn laptop "
                    "(ví dụ thời tiết, ẩm thực, làm thơ, bóng đá...). "
                    "HÃY: Lịch sự từ chối ngắn gọn và thân thiện, giải thích rằng mình là trợ lý chuyên sâu về laptop và thiết bị công nghệ, "
                    "sau đó khéo léo mời khách quay lại nhu cầu mua sắm/tư vấn laptop nếu cần. KHÔNG gợi ý sản phẩm nào."
                )

            if query_meta.get("is_policy"):
                return (
                    "THÔNG BÁO HỆ THỐNG (STORE POLICY): Khách hàng đang hỏi về chính sách cửa hàng. "
                    "HÃY: Trả lời rõ ràng, đầy đủ và chuyên nghiệp theo chính sách sau:\n"
                    "- **Bảo hành:** 100% sản phẩm chính hãng, bảo hành từ 12 đến 24 tháng theo tiêu chuẩn nhà sản xuất.\n"
                    "- **Đổi trả:** 1 đổi 1 trong vòng 30 ngày đầu nếu phát sinh lỗi phần cứng từ nhà sản xuất.\n"
                    "- **Giao hàng:** Miễn phí giao hàng toàn quốc, kiểm tra hàng thoải mái trước khi thanh toán (COD).\n"
                    "- **Trả góp:** Hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng hoặc các công ty tài chính đối tác.\n"
                    "- **Showroom & Hỗ trợ:** Hotline hỗ trợ 24/7 và hệ thống cửa hàng trải nghiệm trên toàn quốc."
                )

            if query_meta.get("unsupported_brands"):
                un_brands = ", ".join([b.capitalize() for b in query_meta["unsupported_brands"]])
                return (
                    f"THÔNG BÁO HỆ THỐNG (THƯƠNG HIỆU KHÔNG KINH DOANH): Khách hàng đang hỏi về dòng máy/thương hiệu: {un_brands}. "
                    f"Cửa hàng chúng mình HIỆN TẠI KHÔNG KINH DOANH {un_brands}, mà tập trung phân phối chính hãng 4 thương hiệu hàng đầu: Dell, Lenovo, Acer, MSI. "
                    f"HÃY: Lịch sự giải thích rằng cửa hàng chưa kinh doanh dòng {un_brands}, "
                    f"đồng thời giới thiệu khéo léo rằng trong kho có các dòng máy chất lượng tương đương (ví dụ nếu khách thích Apple mỏng nhẹ/sang trọng thì cửa hàng có Lenovo ThinkPad, Dell Inspiron/XPS, Acer Swift) và hỏi khách có muốn tham khảo thêm không. "
                    f"LƯU Ý: Tuyệt đối KHÔNG đính kèm thẻ sản phẩm trong lượt trả lời này."
                )

        if not products:
            return "Không tìm thấy sản phẩm cụ thể phù hợp trong kho hàng thỏa mãn điều kiện."

        lines = ["Danh sách laptop phù hợp trong kho:"]
        for idx, p in enumerate(products):
            specs = p.get("specifications") or {}
            price_fmt = f"{int(p['price']):,} VNĐ"
            
            # Shorten CPU
            cpu = str(specs.get("cpu", "N/A"))
            if "(" in cpu:
                cpu = cpu.split("(")[0].strip()
            
            # Shorten GPU
            gpu = str(specs.get("gpu", "N/A"))
            if "(" in gpu:
                gpu = gpu.split("(")[0].strip()
            if "+" in gpu:
                gpu = gpu.split("+")[0].strip()

            ram = str(specs.get("ram", "N/A"))
            storage = str(specs.get("storage") or specs.get("storage_capacity", "N/A"))
            if "M.2" in storage:
                storage = storage.split("M.2")[0].strip()

            # Format Display
            display = str(specs.get("display", "N/A"))
            if len(display) > 50:
                display = display[:47] + "..."

            lines.append(
                f"- **{p['name']}** ({price_fmt}): CPU {cpu} | Màn hình: {display} | RAM {ram} | SSD {storage} | Card: {gpu}"
            )
        return "\n".join(lines)

    @staticmethod
    def _sanitize_doc(doc: Any) -> Any:
        if isinstance(doc, ObjectId):
            return str(doc)
        if isinstance(doc, dict):
            return {k: RAGService._sanitize_doc(v) for k, v in doc.items()}
        if isinstance(doc, list):
            return [RAGService._sanitize_doc(item) for item in doc]
        return doc

    # -------------------------------------------------------------
    # CONVERSATION & MESSAGE MANAGEMENT IN MONGODB
    # -------------------------------------------------------------
    def create_conversation(self, user_id: Optional[str] = None, title: Optional[str] = "Tư vấn Laptop") -> Dict[str, Any]:
        db = get_database()
        doc = {
            "user_id": ObjectId(user_id) if user_id else None,
            "title": title or "Tư vấn Laptop",
            "status": "active",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        res = db.conversations.insert_one(doc)
        doc["_id"] = str(res.inserted_id)
        if doc["user_id"]:
            doc["user_id"] = str(doc["user_id"])
        return self._sanitize_doc(doc)

    def get_conversation_detail(self, conversation_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        db = get_database()
        try:
            conv = db.conversations.find_one({"_id": ObjectId(conversation_id)})
            if not conv:
                return None
            conv["_id"] = str(conv["_id"])
            if conv.get("user_id"):
                conv["user_id"] = str(conv["user_id"])

            messages = list(db.messages.find({"conversation_id": ObjectId(conversation_id)}).sort("createdAt", 1))
            for m in messages:
                m["_id"] = str(m["_id"])
                m["conversation_id"] = str(m["conversation_id"])

            return self._sanitize_doc({"conversation": conv, "messages": messages})
        except Exception as e:
            logger.error(f"Error fetching conversation: {e}")
            return None

    def get_user_conversations(self, user_id: str, limit: int = 20, skip: int = 0) -> List[Dict[str, Any]]:
        db = get_database()
        try:
            cursor = db.conversations.find({"user_id": ObjectId(user_id)}).sort("updatedAt", -1).skip(skip).limit(limit)
            convs = []
            for c in cursor:
                c["_id"] = str(c["_id"])
                c["user_id"] = str(c["user_id"])
                convs.append(c)
            return self._sanitize_doc(convs)
        except Exception as e:
            logger.error(f"Error fetching user conversations: {e}")
            return []

    def chat(self, conversation_id: str, user_message: str) -> Dict[str, Any]:
        start_time = time.time()
        db = get_database()
        conv_obj_id = ObjectId(conversation_id)

        # 1. Save user message
        db.messages.insert_one({
            "conversation_id": conv_obj_id,
            "role": "user",
            "content": user_message,
            "createdAt": datetime.utcnow()
        })

        # 2. Load conversation history before retrieval to accumulate multi-turn context
        raw_history = list(db.messages.find({"conversation_id": conv_obj_id}).sort("createdAt", -1).limit(6))
        raw_history.reverse()
        history = [{"role": m.get("role", "user"), "content": m.get("content", "")} for m in raw_history]

        # 3. RAG retrieval with accumulated constraints, focus criteria & intent
        query_meta = self.parse_query_constraints(user_message)
        relevant_products = self.search_relevant_products(user_message, conversation_history=history, top_k=3)
        context = self.build_context(relevant_products, query_meta=query_meta)

        # 4. Generate LLM response
        llm_res = llm_service.generate_response(user_message, context, history)

        # If unsupported brand, policy, or out of scope, force empty referenced_products
        if query_meta.get("unsupported_brands") or query_meta.get("is_policy") or query_meta.get("is_out_of_scope"):
            relevant_products = []

        # Helper to extract main image URL safely
        def get_img_url(p_item):
            imgs = p_item.get("images") or {}
            if isinstance(imgs, dict):
                main = imgs.get("mainImg")
                if isinstance(main, dict):
                    return main.get("url", "")
                if isinstance(main, str):
                    return main
                slider = imgs.get("sliderImg") or []
                if slider and isinstance(slider[0], dict):
                    return slider[0].get("url", "")
            elif isinstance(imgs, list) and imgs:
                return imgs[0] if isinstance(imgs[0], str) else imgs[0].get("url", "")
            return ""

        asst_msg = {
            "conversation_id": conv_obj_id,
            "role": "assistant",
            "content": llm_res["content"],
            "referenced_products": [
                {
                    "product_id": {
                        "_id": str(p["_id"]),
                        "name": p.get("name") or p.get("title") or "Laptop",
                        "price": float(p.get("price", 0)),
                        "images": [get_img_url(p)] if get_img_url(p) else [],
                        "brand": p.get("brand", "")
                    },
                    "relevance_score": p.get("similarity", 0.0)
                } for p in relevant_products
            ],
            "metadata": {
                "model": llm_res["model"],
                "generation_time_ms": llm_res["generation_time_ms"]
            },
            "createdAt": datetime.utcnow()
        }
        res_insert = db.messages.insert_one(asst_msg)
        asst_msg["_id"] = str(res_insert.inserted_id)
        asst_msg["conversation_id"] = str(asst_msg["conversation_id"])

        # Update conversation timestamp
        db.conversations.update_one(
            {"_id": conv_obj_id},
            {"$set": {"updatedAt": datetime.utcnow(), "lastMessage": llm_res["content"][:100]}}
        )

        total_time_ms = (time.time() - start_time) * 1000
        return {
            "message": self._sanitize_doc(asst_msg),
            "suggested_products": self._sanitize_doc(relevant_products),
            "total_time_ms": total_time_ms
        }

rag_service = RAGService()
