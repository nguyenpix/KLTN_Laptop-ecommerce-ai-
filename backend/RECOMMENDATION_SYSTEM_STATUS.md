# 📊 HỆ THỐNG GỢI Ý SẢN PHẨM - TRẠNG THÁI HIỆN TẠI

**Ngày cập nhật:** 22/10/2025
**Phiên bản:** 2.0 - Phase 2 (Lazy Initialization)

---

##  **ĐÃ HOÀN THIỆN**

### **1. Models - Các Mô Hình Dữ Liệu (100%)**
-  `Product.js` - Sản phẩm có đầy đủ thông số kỹ thuật + **stock field**
-  `UserProfile.js` - Hồ sơ người dùng với embedding + **quality levels**
  - ✨ **MỚI**: Hỗ trợ `quality: 'default'` cho lazy init
  - ✨ **MỚI**: Trường `source`, `base_product_ids`, `base_product_count`
-  `Interaction.js` - Theo dõi hành vi người dùng với metadata
-  `Feedback.js` - Hệ thống đánh giá & danh sách yêu thích
-  `Cart.js`, `CartItem.js`, `Order.js`, `OrderItem.js` - Theo dõi giao dịch

### **2. Services - Các Dịch Vụ (100%)**
-  `profileUpdateService.js` - Cập nhật sở thích người dùng tự động
  - Tính trọng số điều chỉnh dựa trên metadata
  - Xây dựng các thao tác cập nhật cho MongoDB
  - Chuẩn hóa sở thích về thang 0-1
  - Tính toán khoảng giá ưa thích
  - ✨ **MỚI**: `createDefaultUserProfile()` - Tạo profile từ popular products
  - ✨ **MỚI**: `createProfileFromProducts()` - Helper tạo profile
  
-  `recommendationService.js` - Thuật toán Hybrid Tuần Tự
  - Lọc dựa trên nội dung (khớp sở thích người dùng với sản phẩm)
  - Lọc cộng tác (độ tương đồng giữa các sản phẩm)
  - Xử lý người dùng mới (Cold Start)
  - Tối ưu hóa đa dạng sản phẩm
  - ✨ **MỚI**: `ensureUserProfile()` - Lazy initialization logic

### **3. Controllers - Bộ Điều Khiển (100%)**
-  `interactionController.js` - Theo dõi tất cả tương tác người dùng
  - trackInteraction, trackView, createFeedback
  - addToCart, removeFromCart, createOrder
  - toggleLike, getUserInteractions
  
-  `recommendationController.js` - Endpoint tạo gợi ý sản phẩm
  - ✨ Tự động trigger lazy init khi cần

### **4. Routes - Các Đường Dẫn API (100%)**
-  `interactionRoutes.js` - Đầy đủ các endpoints
-  `recommendations.js` - Endpoint gợi ý sản phẩm
-  Đã import vào `/routes/v1/index.js`

### **5. Utils - Công Cụ Hỗ Trợ (100%)**
-  `matrixUtils.js` - Xây dựng ma trận người dùng-sản phẩm
-  `recommendUtils.js` - Các hàm hỗ trợ

---

## 🚀 **PHASE 2: LAZY INITIALIZATION - TÍNH NĂNG MỚI**

### **⭐ Tại sao cần Lazy Initialization?**

**Vấn đề cũ:**
```
User đăng ký → CHƯA có profile → CHƯA có embedding
                ↓
Lần đầu gọi /recommendations
                ↓
KHÔNG CÓ PROFILE → Trả về Cold Start (popular products)
                ↓
Chỉ có personalized SAU KHI có interactions
```

**Giải pháp mới:**
```
User đăng ký → CHƯA có profile (tiết kiệm resources)
                ↓
Lần đầu gọi /recommendations
                ↓
🚀 TỰ ĐỘNG TẠO PROFILE (lazy init)
   └─> Embedding từ popular products
                ↓
TRẢ VỀ PERSONALIZED ngay lập tức!
                ↓
Dần dần refine theo interactions thực tế
```

### **🎯 Luồng hoạt động Lazy Init:**

```javascript
// BƯỚC 1: User mới gọi recommendations
GET /api/v1/recommendations

// BƯỚC 2: recommendationService kiểm tra
ensureUserProfile(userId):
  ├─> Tìm profile trong DB
  ├─> CHƯA CÓ hoặc CHƯA CÓ EMBEDDING?
  │   └─> YES → Gọi createDefaultUserProfile()
  └─> ĐÃ CÓ?
      └─> Dùng luôn, không tạo mới

// BƯỚC 3: createDefaultUserProfile()
1. Lấy top products (theo popularity)
2. Extract embeddings từ products
3. Tính average embedding
4. Normalize vector
5. Tạo UserProfile với:
   - user_embedding: normalized average
   - quality: 'default'
   - source: 'popular_products' / 'newest_products'
   - base_product_ids: IDs của products dùng để tạo

// BƯỚC 4: Trả về recommendations
- Vector Search với default embedding
- User nhận personalized results ngay lập tức
```

### **📊 Quality Progression:**

```
┌──────────────────────────────────────────────────────┐
│           EMBEDDING QUALITY LIFECYCLE                │
├──────────────────────────────────────────────────────┤
│                                                      │
│  🆕 default (0 interactions)                        │
│  └─> Embedding từ popular/newest products           │
│      100% default, 0% personalized                   │
│                                                      │
│  ↓ User xem 2-3 sản phẩm                            │
│                                                      │
│  📉 low (1-4 interactions)                          │
│  └─> Mix: 60% default + 40% actual preference       │
│      Bắt đầu có chút personalized                    │
│                                                      │
│  ↓ User thêm vào cart, rating                       │
│                                                      │
│  📊 medium (5-20 interactions)                      │
│  └─> Mix: 20% default + 80% actual preference       │
│      Đã khá personalized                             │
│                                                      │
│  ↓ User mua hàng, nhiều interactions                │
│                                                      │
│  📈 high (20+ interactions)                         │
│  └─> 100% actual preference                         │
│      Hoàn toàn personalized, default không còn ảnh hưởng│
│                                                      │
└──────────────────────────────────────────────────────┘
```

### ** Ưu điểm:**

1. **Trải nghiệm tốt hơn cho user mới**
   - Không phải đợi interactions
   - Ngay lập tức có recommendations phù hợp (dựa trên popular)

2. **Tiết kiệm resources**
   - Không tạo profile khi register
   - Chỉ tạo khi thực sự cần

3. **Tự động improve theo thời gian**
   - Default → Low → Medium → High
   - Embedding dần trở nên chính xác

4. **Fallback tốt**
   - Nếu không tạo được default → Cold start
   - Luôn đảm bảo có kết quả trả về

---

## 🎯 **LOGIC HOÀN CHỈNH**

### **Luồng Hoạt Động Chính:**

```
🚀 USER MỚI ĐĂNG KÝ (LAZY INIT)
    ↓
Lần đầu gọi GET /recommendations
    ↓
🔍 ensureUserProfile(userId)
    ├─> Check: Có profile chưa?
    │   └─> CHƯA → createDefaultUserProfile()
    │       ├─> Lấy popular products (dựa trên interactions)
    │       ├─> Tính average embedding
    │       ├─> Tạo profile với quality: 'default'
    │       └─> Lưu vào database
    │   └─> ĐÃ CÓ → Dùng luôn
    ↓
NGƯỜI DÙNG TƯƠNG TÁC
    ↓
Theo Dõi & Lưu Trữ (Interaction Model)
    ↓
Cập Nhật Hồ Sơ Người Dùng (ProfileUpdateService)
    ├─> Update preferences (brands, cpu, gpu, etc.)
    ├─> Update user_embedding (weighted average)
    └─> Upgrade quality: default → low → medium → high
    ↓
Tạo Gợi Ý Sản Phẩm (RecommendationService)
    ↓
    ├─ Bước 1: Content-Based Filtering (Vector Search)
    │   └─> Tìm products tương tự với user_embedding
    │
    ├─ Bước 2: Collaborative Filtering
    │   └─> Re-rank dựa trên item-item similarity
    │
    ├─ Bước 3: Kết Hợp Điểm Số
    │   └─> finalScore = content×0.3 + collaborative×0.7
    │
    └─ Bước 4: Xử Lý Sau
        └─> Loại bỏ sản phẩm đã tương tác, thêm tính đa dạng
```

### **Ví Dụ Chi Tiết - Kịch Bản Thực Tế:**

#### **👤 KỊCH BẢN 1: User Mới - Lazy Initialization**

```javascript
// 🆕 Day 1: User đăng ký
POST /api/auth/register
{
  "username": "newuser",
  "email": "newuser@gmail.com",
  "password": "123456"
}

//  User được tạo, KHÔNG CÓ PROFILE (tiết kiệm resources)

// 📱 Day 1 (5 phút sau): User vào trang "Gợi ý cho bạn"
GET /api/v1/recommendations?limit=10

// 🚀 HỆ THỐNG TỰ ĐỘNG:
// 1. ensureUserProfile() check → CHƯA CÓ PROFILE
// 2. createDefaultUserProfile() được gọi:
//    - Tìm top 5 popular products (nhiều interactions nhất)
//    - Lấy embeddings: [emb1, emb2, emb3, emb4, emb5]
//    - Tính average: avgEmb = (emb1+emb2+emb3+emb4+emb5) / 5
//    - Normalize: userEmb = avgEmb / ||avgEmb||
// 3. Tạo profile:
{
  userId: "newuser_id",
  user_embedding: [...384 dims...],
  embedding_metadata: {
    quality: 'default',
    source: 'popular_products',
    interaction_count: 0,
    base_product_ids: [id1, id2, id3, id4, id5],
    base_product_count: 5
  }
}

// 4. Vector Search với default embedding
// 5.  TRẢ VỀ PERSONALIZED RECOMMENDATIONS (không phải cold start!)

// 📊 Response:
{
  "recommendations": [
    {
      "product": { "name": "Acer Predator Helios Neo 14", ... },
      "content_score": 0.97,
      "final_score": 0.313
    },
    // ... 9 more
  ],
  "algorithm": "sequential_hybrid"
}
```

#### **� KỊCH BẢN 2: User Tương Tác - Quality Progression**

```javascript
// 📱 Day 2: User xem 3 gaming laptops
POST /api/v1/interactions/view
{ "productId": "gaming_laptop_1", "duration": 180 }

POST /api/v1/interactions/view
{ "productId": "gaming_laptop_2", "duration": 150 }

POST /api/v1/interactions/view
{ "productId": "gaming_laptop_3", "duration": 120 }

// 🔄 HỆ THỐNG CẬP NHẬT:
// 1. Update preferences: gaming brands (Acer, MSI)
// 2. Re-calculate user_embedding:
//    - 60% default embedding (từ popular products)
//    - 40% actual preference (từ 3 gaming laptops)
// 3. Upgrade quality: 'default' → 'low'

UserProfile after updates:
{
  embedding_metadata: {
    quality: 'low',  // ← Upgraded!
    interaction_count: 3,
    source: 'mixed' // default + actual
  }
}

// 📱 Day 5: User mua 1 laptop
POST /api/v1/interactions/order
{ "productId": "gaming_laptop_1", "quantity": 1 }

// 🔄 QUALITY JUMPS:
// - interaction_count: 4 → 5
// - quality: 'low' → 'medium'
// - Embedding: 20% default + 80% actual

// 📱 Day 30: User có 25+ interactions
// - quality: 'high'
// - Embedding: 100% actual preference
// - Default embedding không còn ảnh hưởng
```

---

#### **👤 KỊCH BẢN 3: User Legacy - Nguyễn Văn A (đã có profile)**

```javascript
// Nguyễn Văn A mua laptop Dell Inspiron 15
// Thông số: Intel Core i7-12700H, RTX 3060 6GB, 16GB RAM, 512GB SSD
// Giá: 25,000,000 VNĐ

POST /api/v1/interactions/order
{
  "total_amount": 25000000,
  "items": [{
    "laptop_id": "64f1a2b3c4d5e6f7g8h9i0j1",  // Dell Inspiron 15
    "quantity": 1,
    "price": 25000000
  }],
  "shipping_address": "KTX Khu B, ĐHQG TP.HCM",
  "payment_method": "COD"
}

//  Hệ thống tự động:
// 1. Tạo Interaction record:
{
  userId: "user_123",
  productId: "64f1a2b3c4d5e6f7g8h9i0j1",
  type: "purchase",
  weight: 10,  // Trọng số cao nhất
  metadata: {
    order_id: "order_001",
    quantity: 1,
    price: 25000000,
    source: "checkout"
  }
}

// 2. Cập nhật UserProfile:
{
  userId: "user_123",
  profile: {
    preferences: {
      brands: { "Dell": 10 },
      categories: { "laptop": 10 },
      cpu_specs: { "Intel Core i7": 10 },
      gpu_specs: { "RTX 3060": 10 },
      ram_specs: { "16GB": 10 },
      storage_type_specs: { "SSD": 10 },
      storage_capacity_specs: { "512GB": 10 },
      price_range: { "20m_30m": 100 }  // 20-30 triệu
    }
  }
}
```

---

#### **📍 BƯỚC 2: Xem Laptop Gaming**

```javascript
// 3 ngày sau, Văn A xem laptop Asus ROG Strix G15
// Thông số: Intel Core i7-12700H, RTX 3060 6GB, 16GB RAM, 1TB SSD
// Giá: 28,000,000 VNĐ
// Thời gian xem: 3 phút 25 giây (205 giây)

POST /api/v1/interactions/view
{
  "productId": "64f2b3c4d5e6f7g8h9i0j2k3",  // Asus ROG Strix G15
  "duration": 205,
  "metadata": {
    "source": "category_browse",
    "session_id": "sess_20250114_abc123"
  }
}

//  Hệ thống tính toán:
// Base weight cho 'view' = 1
// Duration adjustment: 205 giây > 180s → weight × 2 = 2.0
// 
// Interaction record:
{
  type: "view",
  weight: 2.0,  // Đã điều chỉnh
  metadata: { duration: 205, source: "category_browse" }
}

// UserProfile được cập nhật (cộng dồn):
{
  preferences: {
    brands: { "Dell": 10, "Asus": 2.0 },  // Thêm Asus
    cpu_specs: { "Intel Core i7": 12.0 },  // 10 + 2
    gpu_specs: { "RTX 3060": 12.0 },
    ram_specs: { "16GB": 12.0 },
    storage_capacity_specs: { "512GB": 10, "1TB": 2.0 }  // Thêm 1TB
  }
}
```

---

#### **📍 BƯỚC 3: Thêm Vào Giỏ Hàng**

```javascript
// Văn A thích Asus ROG, thêm vào giỏ hàng

POST /api/v1/interactions/cart/add
{
  "productId": "64f2b3c4d5e6f7g8h9i0j2k3",  // Asus ROG
  "quantity": 1
}

//  Hệ thống:
// Base weight cho 'add_to_cart' = 5
// 
// Interaction:
{
  type: "add_to_cart",
  weight: 5,
  metadata: { quantity: 1, source: "product_page" }
}

// UserProfile cập nhật:
{
  preferences: {
    brands: { "Dell": 10, "Asus": 7.0 },  // 2 + 5 = 7
    cpu_specs: { "Intel Core i7": 17.0 },  // 12 + 5
    gpu_specs: { "RTX 3060": 17.0 },
    ram_specs: { "16GB": 17.0 }
  }
}
```

---

#### **📍 BƯỚC 4: Đánh Giá Sản Phẩm**

```javascript
// 1 tuần sau, Văn A đánh giá laptop Dell đã mua

POST /api/v1/interactions/feedback
{
  "productId": "64f1a2b3c4d5e6f7g8h9i0j1",  // Dell Inspiron
  "rating": 5,
  "comment": "Laptop chạy mượt, phù hợp lập trình và gaming nhẹ. Rất hài lòng!"
}

//  Hệ thống:
// Base weight cho 'rating' = 8
// Rating adjustment: 8 × (5/5) = 8.0
// 
// Interaction:
{
  type: "rating",
  weight: 8.0,
  metadata: { rating_value: 5, source: "feedback_form" }
}

// UserProfile cập nhật:
{
  preferences: {
    brands: { "Dell": 18.0, "Asus": 7.0 },  // Dell: 10 + 8
    cpu_specs: { "Intel Core i7": 25.0 },
    gpu_specs: { "RTX 3060": 25.0 }
  }
}
```

---

#### **📍 BƯỚC 5: YÊU CẦU GỢI Ý SẢN PHẨM**

```javascript
// Văn A muốn mua laptop cho bạn, yêu cầu gợi ý

GET /api/v1/recommendations?limit=10

// ========== QUÁ TRÌNH XỬ LÝ ==========

// 1️⃣ CHUẨN HÓA PROFILE (Normalize về 0-1)
Normalized Profile = {
  brands: { "Dell": 1.0, "Asus": 0.39 },      // 18/18 = 1.0, 7/18 = 0.39
  cpu_specs: { "Intel Core i7": 1.0 },
  gpu_specs: { "RTX 3060": 1.0 },
  ram_specs: { "16GB": 1.0 },
  price_range: { "20m_30m": 1.0 }
}

// 2️⃣ BUILD USER VECTOR (37 chiều)
User Vector = [
  1.0, 0.39, 0, 0, 0, 0, 0, 0, 0, 0,     // Brands (Dell=1.0, Asus=0.39)
  1.0, 0, 0, 0,                           // Categories (laptop=1.0)
  0, 0, 1.0, 0, 0, 0, 0, 0,              // CPU (i7=1.0)
  0, 0, 0, 1.0, 0, 0, 0, 0, 0, 0,        // GPU (RTX 3060=1.0)
  0, 0, 1.0, 0, 0                         // RAM (16GB=1.0)
]

// 3️⃣ CONTENT-BASED FILTERING
// Lấy tất cả laptops trong kho, tính cosine similarity

// Sản phẩm 1: Lenovo Legion 5 Pro
// Specs: i7-12700H, RTX 3060, 16GB, 1TB SSD, 29tr
Product1 Vector = [0, 0, 1, 0, 0, 0, ...] // Lenovo=1
Similarity_1 = cosineSimilarity(UserVector, Product1Vector) = 0.92

// Sản phẩm 2: HP Victus 16
// Specs: i7-12700H, RTX 4060, 16GB, 512GB SSD, 27tr  
Product2 Vector = [0, 1, 0, 0, 0, 0, ...]  // HP=1
Similarity_2 = cosineSimilarity(UserVector, Product2Vector) = 0.85

// Sản phẩm 3: MSI Katana 15
// Specs: i5-12450H, RTX 3050, 8GB, 512GB SSD, 18tr
Product3 Vector = [0, 0, 0, 0, 0, 1, ...]  // MSI=1, i5, 8GB
Similarity_3 = cosineSimilarity(UserVector, Product3Vector) = 0.65

// Top 50 candidates được chọn dựa trên content_score

// 4️⃣ COLLABORATIVE FILTERING
// Tính item-item similarity dựa trên hành vi người dùng khác

// Văn A đã mua Dell Inspiron (product: 64f1a2...)
// Tìm users khác cũng mua Dell Inspiron:
Users_bought_Dell = [user_123, user_456, user_789, user_012]

// Check users nào cũng mua Lenovo Legion:
Users_bought_Lenovo = [user_456, user_789, user_345, user_678]

// Jaccard Similarity (Dell ↔ Lenovo):
Intersection = [user_456, user_789]  // 2 users
Union = [user_123, user_456, user_789, user_012, user_345, user_678]  // 6 users
Similarity_Dell_Lenovo = 2/6 = 0.33

// Collaborative Score cho Lenovo:
// = similarity × implicit_rating
// = 0.33 × 10 (weight của purchase) = 3.3

// 5️⃣ KẾT HỢP ĐIỂM (FINAL SCORE)
Lenovo_Final_Score = (content_score × 0.3) + (collaborative_score × 0.7)
                   = (0.92 × 0.3) + (3.3 × 0.7)
                   = 0.276 + 2.31
                   = 2.586

HP_Final_Score = (0.85 × 0.3) + (2.8 × 0.7) = 2.215
MSI_Final_Score = (0.65 × 0.3) + (1.5 × 0.7) = 1.245

// 6️⃣ XẾP HẠNG VÀ TRẢ VỀ
Rankings:
1. Lenovo Legion 5 Pro - Score: 2.586 ⭐⭐⭐
2. HP Victus 16 - Score: 2.215 ⭐⭐
3. Asus TUF Gaming - Score: 2.102 ⭐⭐
...
10. MSI Katana 15 - Score: 1.245 ⭐
```

---

#### **📊 KẾT QUẢ GỢI Ý CUỐI CÙNG:**

```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "productId": "64f3c4d5e6f7g8h9i0j3k4l5",
        "product": {
          "name": "Lenovo Legion 5 Pro",
          "price": 29000000,
          "specifications": {
            "cpu": "Intel Core i7-12700H",
            "gpu": "RTX 3060 6GB",
            "ram": "16GB DDR5",
            "storage": "1TB SSD"
          },
          "images": { "mainImg": "..." }
        },
        "content_score": 0.92,
        "collaborative_score": 3.3,
        "final_score": 2.586,
        "reason": "Laptop này phù hợp với sở thích của bạn về CPU i7, GPU RTX 3060 và thương hiệu tương tự Dell"
      },
      {
        "productId": "64f4d5e6f7g8h9i0j4k5l6m7",
        "product": {
          "name": "HP Victus 16",
          "price": 27000000,
          "specifications": {
            "cpu": "Intel Core i7-12700H",
            "gpu": "RTX 4060 8GB",  
            "ram": "16GB DDR4",
            "storage": "512GB SSD"
          }
        },
        "content_score": 0.85,
        "collaborative_score": 2.8,
        "final_score": 2.215,
        "reason": "Nâng cấp GPU lên RTX 4060 với mức giá tốt"
      },
      // ... 8 sản phẩm khác
    ],
    "algorithm": "sequential_hybrid",
    "user_id": "user_123",
    "generated_at": "2025-01-14T10:30:00Z"
  }
}
```

---

### **🔍 PHÂN TÍCH TẠI SAO GỢI Ý NÀY?**

1. **Lenovo Legion 5 Pro** (Top 1):
   -  Cùng specs với Dell đã mua (i7, RTX 3060, 16GB)
   -  Nhiều người mua Dell cũng mua Lenovo (collaborative)
   -  Trong khoảng giá ưa thích (20-30tr)
   -  Thương hiệu tin cậy cho gaming

2. **HP Victus 16** (Top 2):
   -  Nâng cấp GPU lên RTX 4060
   -  Vẫn giữ i7 và 16GB RAM
   -  Giá tốt hơn (27tr)
   - ⚠️ HP ít phổ biến hơn trong cộng đồng

---

## 🔧 **CÁC API ENDPOINTS**

### **Theo Dõi Tương Tác:**
```
POST   /api/v1/interactions/track          # Theo dõi tương tác chung
POST   /api/v1/interactions/view           # Theo dõi lượt xem sản phẩm
POST   /api/v1/interactions/like/:productId # Thích/bỏ thích sản phẩm
POST   /api/v1/interactions/cart/add       # Thêm vào giỏ hàng
DELETE /api/v1/interactions/cart/:itemId   # Xóa khỏi giỏ hàng
POST   /api/v1/interactions/order          # Tạo đơn hàng
POST   /api/v1/interactions/feedback       # Tạo đánh giá/rating
GET    /api/v1/interactions/history        # Lấy lịch sử tương tác
```

### **Gợi Ý Sản Phẩm:**
```
GET    /api/v1/recommendations?limit=10    # Lấy gợi ý cá nhân hóa
```

---

## 📦 **CẤU TRÚC DATABASE**

### **UserRecommendationProfile (Hồ Sơ Gợi Ý):**
```javascript
{
  userId: ObjectId,
  profile: {
    preferences: {
      brands: { "Dell": 25, "Asus": 15, ... },          // Thương hiệu ưa thích
      categories: { "laptop": 40, ... },                 // Danh mục ưa thích
      cpu_specs: { "Intel Core i7": 30, ... },          // CPU ưa thích
      gpu_specs: { "RTX 3060": 20, ... },               // GPU ưa thích
      ram_specs: { "16GB": 25, ... },                   // RAM ưa thích
      price_range: { "20m_30m": 40, ... }               // Khoảng giá ưa thích
    }
  }
}
```

### **Interaction (Tương Tác):**
```javascript
{
  userId: ObjectId,
  productId: ObjectId,
  type: "view|like|purchase|rating|add_to_cart",  // Loại tương tác
  weight: Number (0-10),                           // Trọng số
  metadata: {
    session_id: String,        // ID phiên làm việc
    duration: Number,          // Thời gian (giây) - cho view
    rating_value: Number,      // Giá trị đánh giá (1-5) - cho rating
    source: String            // Nguồn: search, recommendation, category...
  }
}
```

---

## 🚀 **KIỂM THỬ & TRIỂN KHAI**

### **Quy Trình Kiểm Thử:**

```bash
# 1. Khởi động server
npm run dev

# 2. Test theo dõi tương tác xem sản phẩm
curl -X POST http://localhost:5000/api/v1/interactions/view \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "duration": 120,
    "metadata": {
      "source": "search"
    }
  }'

# 3. Kiểm tra hồ sơ người dùng trong MongoDB
# MongoDB Shell:
use laptop_db
db.userrecommendationprofiles.findOne({userId: ObjectId("...")})

# 4. Lấy gợi ý sản phẩm
curl http://localhost:5000/api/v1/recommendations?limit=10 \
  -H "Authorization: Bearer <token>"

# 5. Test thêm vào giỏ hàng
curl -X POST http://localhost:5000/api/v1/interactions/cart/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "quantity": 1
  }'
```

---

## 💡 **TÍNH NĂNG ĐẶC BIỆT**

1. **Xử Lý Người Dùng Mới (Cold Start)** 
   - Người dùng mới: Gợi ý sản phẩm phổ biến dựa trên số lượng tương tác
   - Fallback: Sản phẩm mới nhất trong hệ thống

2. **Điều Chỉnh Trọng Số Thông Minh** 
   - Thời gian xem: view >60s → trọng số ×1.5, >180s → ×2.0
   - Giá trị đánh giá: trọng số nhân với (rating/5)
   - Nguồn: từ gợi ý → trọng số ×1.2 (bonus)

3. **Độ Tương Đồng Sản Phẩm (Item-Item Similarity)** 
   - Jaccard Similarity dựa trên người dùng chung
   - Cached để cải thiện hiệu suất
   - Công thức: Intersection / Union

4. **Tối Ưu Đa Dạng** 
   - Tối đa 3 sản phẩm cùng thương hiệu trong kết quả
   - Đảm bảo đa dạng về loại sản phẩm

5. **Loại Trừ Sản Phẩm Đã Tương Tác** 
   - Không gợi ý sản phẩm đã mua/xem
   - Tăng tính mới mẻ cho người dùng

---

## ⚡ **TỐI ƯU HÓA HIỆU SUẤT**

-  **Caching độ tương đồng** (itemSimilarityCache)
-  **MongoDB indexes** trên userId, productId
-  **Cập nhật profile bất đồng bộ** (không chặn response)
-  **Chuẩn hóa preferences** về thang 0-1
-  **Vector operations** được tối ưu

---

## 📝 **CÁC BƯỚC TIẾP THEO (Tùy Chọn Nâng Cao)**

1. **A/B Testing**: Theo dõi hiệu quả của các gợi ý
2. **Cập Nhật Thời Gian Thực**: Socket.io cho gợi ý live
3. **Scheduled Jobs**: Làm mới cache định kỳ, tính lại profile
4. **Analytics Dashboard**: Trực quan hóa các chỉ số gợi ý
5. **Vector Embeddings**: Sử dụng Product.embedding cho tìm kiếm ngữ nghĩa

---

##  **KẾT LUẬN**

**Hệ Thống Gợi Ý Sản Phẩm đã HOÀN THIỆN 100%!**

-  Sử dụng Product model có sẵn (không cần ProductFeatures riêng)
-  Thuật Toán Hybrid Tuần Tự (Kết hợp Nội dung + Cộng tác)
-  API endpoints đầy đủ và chuẩn RESTful
-  Tự động cập nhật hồ sơ người dùng
-  Xử lý Cold Start cho người dùng mới
-  Code sẵn sàng cho Production

**Bạn có thể bắt đầu kiểm thử và triển khai ngay!** 🚀
