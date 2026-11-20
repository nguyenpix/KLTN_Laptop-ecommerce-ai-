# Báo Cáo Kiến Trúc & Quy Trình Thuật Toán Hệ Thống Đề Xuất Laptop (Hybrid Recommender System)

---

## 1. Tổng Quan Hệ Thống

Hệ thống đề xuất thương mại điện tử chuyên biệt cho danh mục **Laptop (398 sản phẩm)** được thiết kế dựa trên mô hình lai (**Hybrid Engine**), kết hợp giữa:
1. **Lọc cộng tác dựa trên hành vi ngầm (Implicit Collaborative Filtering - Implicit ALS)**
2. **Lọc dựa trên nội dung cấu hình phần cứng (Content-based Filtering - SBERT 384-d)**

---

## 2. Quy Trình 5 Bước Tính Điểm Đề Xuất (Hybrid Scoring Pipeline)

### Bước 1: Tính Trọng Số Tương Tác ($W_i$)
Hệ thống truy vấn tối đa **100 tương tác gần nhất** của người dùng từ cơ sở dữ liệu (`interactions`). Mỗi tương tác $i$ với laptop được gán điểm trọng số $W_i$:

$$W_i = \text{Điểm Hành Vi} \times \text{Hệ số Thời Gian (Time-Decay)}$$

#### a) Bang điểm Hành vi (Behavior Scores):
* **Mua hàng (`purchase`):** $10.0$
* **Đánh giá 4–5 sao (`rating_high`):** $8.0$
* **Thêm giỏ hàng (`add_to_cart`):** $5.0$
* **Yêu thích (`like`):** $3.0$
* **Bấm từ tìm kiếm (`search_click`):** $2.0$
* **Xem chi tiết (`view`):** $1.0$ 
  * *Dwell Time Boost:* Dừng xem $>60\text{s} \rightarrow \times 1.5$; $>120\text{s} \rightarrow \times 2.0$

#### b) Hàm suy giảm theo thời gian (Time-Decay Function):
Với chu kỳ bán rã $T_{\text{half}} = 30$ ngày:

$$\text{Decay}(\Delta t) = 2^{-\frac{\Delta t}{30}} = \exp\left(-\frac{\ln 2}{30} \cdot \Delta t\right)$$

---

### Bước 2: Cộng Dồn Vector Hồ Sơ Người Dùng (Weighted Average)

Nhân trọng số $W_i$ với từng vector đại diện của laptop $i$ trong cơ sở dữ liệu để tạo ra vector hồ sơ thô của người dùng:

$$\mathbf{u}_{\text{cf\_raw}} = \sum_{i} \left( W_i \times \mathbf{item\_cf\_vector}_i \right)$$

$$\mathbf{u}_{\text{content\_raw}} = \sum_{i} \left( W_i \times \mathbf{item\_content\_vector}_i \right)$$

---

### Bước 3: Chuẩn Hóa Vector ($L_2$ Normalization)

Đưa vector về độ dài đơn vị chuẩn bằng $1.0$ để cân bằng quy mô giữa người dùng có tần suất tương tác cao và thấp:

$$\mathbf{user\_cf\_vector} = \frac{\mathbf{u}_{\text{cf\_raw}}}{\|\mathbf{u}_{\text{cf\_raw}}\|_2}$$

$$\mathbf{user\_content\_vector} = \frac{\mathbf{u}_{\text{content\_raw}}}{\|\mathbf{u}_{\text{content\_raw}}\|_2}$$

---

### Bước 4: So Sánh Độc Lập & Tính Điểm Tương Đồng (Cosine Similarity)

Hệ thống tiến hành so sánh song song theo từng nhánh độc lập:

$$\text{Score}_{\text{CF}} = \text{Cosine}(\mathbf{user\_cf\_vector}, \mathbf{item\_cf\_vector})$$

$$\text{Score}_{\text{Content}} = \text{Cosine}(\mathbf{user\_content\_vector}, \mathbf{item\_content\_vector})$$

Trong đó, hàm Cosine Similarity được chuẩn hóa về khoảng $[0, 1]$:

$$\text{Cosine}(\mathbf{u}, \mathbf{v}) = \frac{\mathbf{u} \cdot \mathbf{v} + 1}{2}$$

---

### Bước 5: Tổng Hợp Điểm Lai (Weighted Hybrid Scoring)

Kết hợp $2$ điểm số thành phần bằng công thức trọng số pha trộn $\alpha$:

$$\text{Score}_{\text{Final}} = \alpha \cdot \text{Score}_{\text{CF}} + (1 - \alpha) \cdot \text{Score}_{\text{Content}}$$

#### Cơ chế Thích ứng Động (Adaptive Fallback):
* **Sản phẩm mới (New Item Cold-Start):** Nếu item chưa có `item_cf_vector`, hệ thống tự động gán $\alpha = 0.0$ (chỉ dùng $100\%$ Content-based).
* **Khách vãng lai (Guest User):** So sánh trực tiếp profile phiên tạm thời (`Session-Profile`) dựa trên `LocalStorage`.

---

## 3. Quy Trình Hậu Xử Lý (Post-Processing Layer)

1. **Sắp xếp (Sorting):** Xếp thứ tự danh sách sản phẩm theo $\text{Score}_{\text{Final}}$ giảm dần.
2. **Loại trừ đã mua (Exclude Purchased):** Lọc bỏ các sản phẩm user đã hoàn thành đơn hàng.
3. **Đa dạng hóa thương hiệu (Brand Diversity Control):** Giới hạn tối đa **3 sản phẩm/thương hiệu** trong Top 10 đề xuất nhằm đảm bảo tính đa dạng.
4. **Gán nhãn giải thích (Explainable AI Badge):**
   * Nếu $\text{Score}_{\text{Content}} > 0.8$: "Cấu hình phần cứng tối ưu đúng nhu cầu của bạn".
   * Nếu $\text{Score}_{\text{CF}} > 0.8$: "Được nhiều người dùng có gu giống bạn lựa chọn".

---

## 4. Bảng Đánh Giá Hiệu Năng So Sánh (Metrics)

| Mô hình đề xuất | Chỉ số NDCG@10 | Điểm mạnh | Hạn chế |
| :--- | :---: | :--- | :--- |
| **Content-only (SBERT)** | `0.0113` | Khả năng phát hiện đa dạng tốt, giải quyết triệt để Cold-Start. | Thiếu thấu hiểu thói quen mua sắm ngầm. |
| **CF-only (Implicit ALS $f8\_r0.3$)** | `0.0223` | Độ chính xác cao trên các mặt hàng phổ biến. | Thất bại khi gặp sản phẩm mới. |
| **Hybrid ($\alpha = 0.7$ / Real-world)** | **`0.0248`** | **Tối ưu vượt trội.** Kết hợp độ chính xác của ALS và khả năng xử lý biên của SBERT. | Cần cơ sở hạ tầng tính toán song song. |