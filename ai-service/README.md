# AI & Recommendation Microservice (FastAPI + PyTorch)

Microservice độc lập phục vụ Hệ thống Gợi ý Thông minh (**Two-Tower Model & Switching Hybrid**) và **Trợ lý Chatbot RAG** cho sàn thương mại điện tử Laptop.

---

## 🚀 1. Cài đặt Môi trường & Khởi chạy

### Yêu cầu:
- Python >= 3.10
- Kết nối MongoDB Atlas

### Các bước chạy:
```bash
cd ai-service

# 1. Cài đặt dependencies
pip install -r requirements.txt

# 2. Huấn luyện / Xuất weights mô hình Two-Tower (Tùy chọn khi có dữ liệu tương tác mới)
python train_and_save_model.py

# 3. Khởi chạy AI Microservice (Port 8000)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📡 2. Danh sách Endpoints API

### 🎯 Recommendation Endpoints
* **`GET /api/v1/recommendations`**:
  * Trả về danh sách gợi ý cá nhân hóa dựa trên mô hình Deep Learning **Two-Tower** và **Switching Hybrid**.
  * Tự động chuyển đổi sang **Content-Based Filtering** khi gặp User mới (**Cold-Start User**).
  * Params: `limit` (mặc định 10), `exclude_interacted` (mặc định `true`).
  * Header: `Authorization: Bearer <JWT_TOKEN>` (Tùy chọn).

* **`GET /api/v1/recommendations/similar/{product_id}`**:
  * Gợi ý sản phẩm tương đồng về cấu hình phần cứng (CPU, GPU, RAM, Ổ cứng, Tầm giá).

---

### 💬 Chatbot RAG Endpoints
* **`POST /api/v1/chat/conversations`**: Tạo phiên trò chuyện mới.
* **`GET /api/v1/chat/conversations`**: Lấy lịch sử các cuộc hội thoại của user.
* **`GET /api/v1/chat/conversations/{id}`**: Lấy chi tiết tin nhắn trong cuộc hội thoại.
* **`POST /api/v1/chat/conversations/{id}/messages`**: Gửi câu hỏi và nhận câu trả lời tư vấn laptop từ RAG + LLM.

---

### 📊 Interaction Tracking Endpoints
* **`POST /api/v1/interactions/track`**: Ghi nhận hành vi `view`, `like`, `cart`, `order`, `feedback` để cập nhật ma trận gợi ý theo thời gian thực.
* **`POST /api/v1/interactions/view`**: Shortcut ghi nhận lượt xem sản phẩm.
* **`POST /api/v1/interactions/like/{product_id}`**: Shortcut toggle like.

---

## 🏛️ 3. Cấu trúc Thư mục

```
ai-service/
├── app/
│   ├── api/                  # FastAPI Routers (chat, recommendations, interactions)
│   ├── core/                 # Config (.env), MongoDB connection, JWT Security
│   ├── models/               # PyTorch Architecture (TwoTower, NCF, MF) & Pydantic Schemas
│   ├── services/             # RecEngine (Switching Hybrid, Content-based), RAGService, LLMService
│   └── main.py               # Điểm khởi chạy FastAPI & Lifespan handler
├── weights/                  # Trọng số pre-trained (.pt, .npy)
├── train_and_save_model.py   # Script huấn luyện & xuất weights từ MongoDB
├── requirements.txt          # Danh sách thư viện Python
└── README.md
```
