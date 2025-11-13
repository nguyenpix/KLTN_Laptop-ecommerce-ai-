# RAG CHATBOT API DOCUMENTATION

## 🎯 Overview

Chatbot thông minh sử dụng **RAG (Retrieval-Augmented Generation)** kết hợp:
- **MongoDB Vector Search**: Tìm kiếm sản phẩm liên quan
- **HuggingFace LLM**: Generate câu trả lời thông minh (Qwen2.5-7B-Instruct)
- **Document Chunks**: Thông tin chi tiết từ 196 sản phẩm laptop

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api/v1/chat
```

### Authentication
Tất cả endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer {your_jwt_token}
```

---

## 🔌 API Reference

### 1. Tạo Conversation Mới

```http
POST /conversations
```

**Request Body:**
```json
{
  "title": "Tư vấn laptop gaming" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "674abc123...",
    "user_id": "673def456...",
    "title": "Tư vấn laptop gaming",
    "status": "active",
    "context_summary": {
      "interested_products": [],
      "topics": [],
      "last_intent": null
    },
    "last_message_at": "2025-11-12T10:30:00.000Z",
    "createdAt": "2025-11-12T10:30:00.000Z",
    "updatedAt": "2025-11-12T10:30:00.000Z"
  }
}
```

---

### 2. Lấy Danh Sách Conversations

```http
GET /conversations?status=active&limit=20&skip=0
```

**Query Parameters:**
- `status` (optional): `active` | `archived` | `closed` (default: `active`)
- `limit` (optional): Số lượng conversations (default: `20`)
- `skip` (optional): Số lượng bỏ qua (default: `0`)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "674abc123...",
      "user_id": "673def456...",
      "title": "Tư vấn laptop gaming",
      "status": "active",
      "message_count": 8,
      "last_message": {
        "content": "Cảm ơn bạn đã tư vấn!",
        "role": "user",
        "createdAt": "2025-11-12T11:00:00.000Z"
      },
      "context_summary": {
        "interested_products": [
          {
            "product_id": {
              "_id": "672xyz789...",
              "name": "Acer Predator Helios Neo 14",
              "price": 23990000,
              "images": ["..."]
            },
            "mention_count": 3
          }
        ]
      },
      "last_message_at": "2025-11-12T11:00:00.000Z"
    }
  ]
}
```

---

### 3. Lấy Chi Tiết Conversation

```http
GET /conversations/:conversationId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversation": {
      "_id": "674abc123...",
      "user_id": "673def456...",
      "title": "Tư vấn laptop gaming",
      "status": "active",
      "context_summary": {...}
    },
    "messages": [
      {
        "_id": "675msg001...",
        "conversation_id": "674abc123...",
        "role": "user",
        "content": "Tôi cần laptop gaming giá dưới 25 triệu",
        "createdAt": "2025-11-12T10:35:00.000Z"
      },
      {
        "_id": "675msg002...",
        "conversation_id": "674abc123...",
        "role": "assistant",
        "content": "Dựa vào yêu cầu của bạn, tôi gợi ý 3 laptop gaming...",
        "referenced_products": [
          {
            "product_id": {
              "_id": "672xyz789...",
              "name": "Acer Predator Helios Neo 14",
              "price": 23990000,
              "images": ["..."]
            },
            "relevance_score": 0.92,
            "chunks_used": [0, 2, 5]
          }
        ],
        "metadata": {
          "rag_results": {
            "total_chunks": 5,
            "top_scores": [0.95, 0.93, 0.89, 0.87, 0.85],
            "search_time_ms": 120
          },
          "llm_metadata": {
            "model": "Qwen/Qwen2.5-7B-Instruct",
            "tokens_used": 450,
            "generation_time_ms": 1800
          }
        },
        "createdAt": "2025-11-12T10:35:02.000Z"
      }
    ]
  }
}
```

---

### 4. Gửi Message (Chat với Bot)

```http
POST /conversations/:conversationId/messages
```

**Request Body:**
```json
{
  "message": "Tôi cần laptop gaming giá dưới 25 triệu"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": {
      "_id": "675msg003...",
      "conversation_id": "674abc123...",
      "role": "assistant",
      "content": "Dựa vào nhu cầu của bạn, tôi gợi ý 3 laptop gaming tốt dưới 25 triệu:\n\n1. ⭐ **Acer Predator Helios Neo 14 - 23.990.000đ**\n   - CPU: Intel Core i5-14650HX (14 nhân, 20 luồng)\n   - GPU: NVIDIA RTX 4050 6GB GDDR6\n   - RAM: 16GB DDR5\n   - Màn hình: 14\" 2.8K (2880x1800) 120Hz\n   - ✅ Phù hợp: Chơi game AAA ở setting trung-cao, thiết kế đồ họa\n\n2. 💻 **MSI Katana GF66 - 21.990.000đ**\n   - CPU: Intel Core i5-12450H\n   - GPU: RTX 3050 4GB\n   - RAM: 16GB DDR4\n   - Màn hình: 15.6\" Full HD 144Hz\n   - ✅ Phù hợp: Gaming esports (LOL, Valorant, CS2), đa tác vụ\n\n3. 🎮 **Asus TUF Gaming A15 - 24.490.000đ**\n   - CPU: AMD Ryzen 7 6800H (8 nhân, 16 luồng)\n   - GPU: RTX 4050 6GB\n   - RAM: 16GB DDR5\n   - Màn hình: 15.6\" Full HD 144Hz\n   - ✅ Phù hợp: Gaming + streaming, làm việc nặng\n\n💡 **Gợi ý của tôi:** Nếu bạn chơi game AAA và cần di động, chọn **Acer Predator Helios Neo 14**. Nếu ngân sách ưu tiên và chơi game nhẹ, chọn **MSI Katana GF66**.\n\nBạn chủ yếu chơi game gì để tôi tư vấn chính xác hơn? 🎯",
      "referenced_products": [...],
      "metadata": {...},
      "createdAt": "2025-11-12T10:35:02.000Z"
    },
    "suggested_products": [
      {
        "_id": "672xyz789...",
        "name": "Acer Predator Helios Neo 14",
        "price": 23990000,
        "brand_id": "670brand01...",
        "images": ["https://..."],
        "stock_quantity": 15,
        "similarity": 0.92
      },
      {
        "_id": "672xyz790...",
        "name": "MSI Katana GF66",
        "price": 21990000,
        "similarity": 0.88
      },
      {
        "_id": "672xyz791...",
        "name": "Asus TUF Gaming A15",
        "price": 24490000,
        "similarity": 0.85
      }
    ],
    "response_time_ms": 1950
  }
}
```

---

### 5. Update Conversation Status

```http
PATCH /conversations/:conversationId/status
```

**Request Body:**
```json
{
  "status": "archived" // "active" | "archived" | "closed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "674abc123...",
    "status": "archived",
    ...
  }
}
```

---

### 6. Delete Conversation

```http
DELETE /conversations/:conversationId
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation đã được xóa",
  "data": {
    "_id": "674abc123...",
    "status": "archived"
  }
}
```

---

## 🧪 Testing

### Test với script:

```bash
cd backend
node src/scripts/testRagChatbot.js
```

### Test với curl:

```bash
# 1. Login to get token
curl -X POST http://localhost:5000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'

# 2. Create conversation
curl -X POST http://localhost:5000/api/v1/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Chat"}'

# 3. Send message
curl -X POST http://localhost:5000/api/v1/chat/conversations/CONVERSATION_ID/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Tôi cần laptop gaming giá dưới 25 triệu"}'
```

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| RAG Search | 100-200ms |
| LLM Generation | 1.5-3s |
| Total Response | 1.7-3.2s |
| Products Coverage | 196 laptops |
| Chunks per Product | ~20 chunks |
| Embedding Dimensions | 384 |

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# MongoDB with Vector Search
MONGODB_URI=mongodb+srv://...

# HuggingFace API (FREE tier)
HUGGINGFACE_API_KEY=hf_...

# Server
PORT=5000
```

---

## 🎯 Use Cases

### 1. Product Inquiry
```
User: "Laptop có RTX 4050 giá bao nhiêu?"
Bot: [Tìm products với RTX 4050] → "Có 8 laptop RTX 4050, giá từ 23M-35M..."
```

### 2. Product Comparison
```
User: "So sánh Acer Predator vs MSI Katana"
Bot: [Retrieve chunks từ 2 products] → [Generate comparison table]
```

### 3. Budget-based Recommendation
```
User: "Laptop gaming dưới 25 triệu"
Bot: [Filter by price + gaming specs] → "Gợi ý 3 laptop phù hợp..."
```

### 4. Technical Questions
```
User: "RTX 4050 mạnh hơn RTX 3050 bao nhiêu?"
Bot: [Search chunks về GPU specs] → "RTX 4050 mạnh hơn ~30%, vì..."
```

---

## 💡 Tips for Frontend Integration

### React/Next.js Example:

```typescript
// Create conversation
const createConversation = async () => {
  const response = await fetch('/api/v1/chat/conversations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'New Chat' })
  });
  return response.json();
};

// Send message
const sendMessage = async (conversationId: string, message: string) => {
  const response = await fetch(
    `/api/v1/chat/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    }
  );
  return response.json();
};

// Get conversations
const getConversations = async () => {
  const response = await fetch('/api/v1/chat/conversations', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

---

## 🐛 Troubleshooting

### LLM API Error
```
Error: HuggingFace API rate limit exceeded
Solution: 
  - Đợi 1 phút và thử lại
  - Hoặc dùng fallback response
  - Upgrade HuggingFace plan
```

### No Products Found
```
Issue: RAG search returns empty
Check:
  - Embeddings đã generate chưa?
  - Query có liên quan đến laptops không?
  - Threshold quá cao (giảm xuống 0.6)
```

### Slow Response
```
Issue: Response time > 5s
Optimize:
  - Giảm topK (5 → 3)
  - Giảm max_tokens (800 → 500)
  - Cache popular queries
```

---

## 📚 References

- [HuggingFace Inference API](https://huggingface.co/docs/huggingface.js/inference/README)
- [MongoDB Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/)
- [Qwen2.5 Model Card](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)

---

**Status:** ✅ Ready for Production
**Last Updated:** 2025-11-12
