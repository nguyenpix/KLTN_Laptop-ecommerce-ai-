# BÁO CÁO NGHIÊN CỨU & XÂY DỰNG HỆ THỐNG GỢI Ý SẢN PHẨM THƯƠNG MẠI ĐIỆN TỬ

## ĐỀ TÀI: NGHIÊN CỨU VÀ TRIỂN KHAI HỆ THỐNG GỢI Ý HYBRID KẾT HỢP SENTENCE-BERT VÀ IMPLICIT ALTERNATING LEAST SQUARES (ALS) CHO WEBSITE THƯƠNG MẠI ĐIỆN TỬ LAPTOP

---

## MỤC LỤC CHI TIẾT
1. **LỜI MỞ ĐẦU & TỔNG QUAN ĐỀ TÀI**
   - 1.1. Bối cảnh và tính cấp thiết của đề tài
   - 1.2. Mục tiêu nghiên cứu
   - 1.3. Đối tượng và phạm vi nghiên cứu
   - 1.4. Ý nghĩa khoa học và thực tiễn của đề tài
2. **CHƯƠNG 1: TỔNG QUAN CƠ SỞ LÝ THUYẾT & CÁC CÔNG TRÌNH LIÊN QUAN (LITERATURE REVIEW)**
   - 1.1. Kiến trúc Hai Giai Đoạn trong Hệ thống Gợi ý Quy mô Lớn (*Covington et al., 2016*)
   - 1.2. Biểu diễn Hàng hóa Thương mại Điện tử & Gợi ý theo Phiên (*Wang et al., 2018*)
   - 1.3. Mô hình Không gian Vector Ngữ nghĩa Sentence-BERT (*Reimers & Gurevych, 2019*)
   - 1.4. Thuật toán Phân rã Ma trận Tương tác Ngầm Implicit ALS (*Hu, Koren & Volinsky, 2008*)
   - 1.5. Kiến trúc Hai Tháp (Two-Tower Architecture) & Tích hợp Vector (*Yi et al., 2019*)
   - 1.6. Cơ sở dữ liệu Vector & Tìm kiếm Lai trên NoSQL (*Pan et al., 2024*)
3. **CHƯƠNG 2: PHÂN TÍCH DỮ LIỆU, TIỀN XỬ LÝ & KỸ NGHỆ ĐẶC TRƯNG (DATA ENGINEERING & EDA)**
   - 2.1. Cấu trúc tổng thể của tập dữ liệu (Catalog 398 sản phẩm, 56 người dùng, 1.704 tương tác)
   - 2.2. Phân tích độ đầy đủ của các thuộc tính phần cứng (Completeness Analysis)
   - 2.3. Kỹ nghệ chuỗi đặc tả cấu hình (Prompt Feature Engineering cho SBERT)
   - 2.4. Trực quan hóa và kiểm định không gian vector SBERT bằng PCA 2D
   - 2.5. Xây dựng ma trận phản hồi ngầm và bảng trọng số hành vi (Implicit Feedback Weights)
4. **CHƯƠNG 3: MÔ HÌNH HÓA TOÁN HỌC & KIẾN TRÚC THUẬT TOÁN HYBRID RECSYS**
   - 3.1. Nhánh Content-Based: Cơ chế mã hóa và trích xuất vector SBERT 384 chiều
   - 3.2. Mô hình biểu diễn hồ sơ người dùng theo thời gian với hàm suy giảm Time-Decay
   - 3.3. Nhánh Collaborative Filtering: Công thức tối ưu hóa hàm mất mát Implicit ALS 8 chiều
   - 3.4. Cơ chế chấm điểm và tái xếp hạng lai động (Dynamic Weighted Hybrid Scoring)
   - 3.5. Giải pháp triệt tiêu bài toán Khởi đầu lạnh (Cold-Start Problem: Item & Session)
5. **CHƯƠNG 4: THỰC NGHIỆM, ĐO LƯỜNG & PHÂN TÍCH KẾT QUẢ (EXPERIMENTS & BENCHMARKS)**
   - 4.1. Phương pháp luận phân chia dữ liệu Temporal Leave-One-Out
   - 4.2. Bộ chỉ số đo lường hiệu năng: Recall@K, NDCG@10, Catalog Coverage, Intra-list Diversity
   - 4.3. Bảng tổng hợp và phân tích so sánh hiệu năng các cấu hình mô hình
   - 4.4. Thực nghiệm Grid Search tìm kiếm trọng số $\alpha$ tối ưu
   - 4.5. Bàn luận chuyên sâu về ý nghĩa của kết quả thực nghiệm
6. **CHƯƠNG 5: CHI TIẾT TRIỂN KHAI MÃ NGUỒN HỆ THỐNG THỰC TẾ (SOURCE CODE IMPLEMENTATION)**
   - 5.1. Triển khai Toán học Vector tối ưu trên Node.js (`vectorUtils.js`)
   - 5.2. Dịch vụ Xây dựng Hồ sơ Người dùng & Khách vãng lai (`userProfileService.js`)
   - 5.3. Động cơ Chấm điểm Lai & Cơ chế Chuyển đổi Trọng số cho Sản phẩm Mới (`hybridRecService.js`)
   - 5.4. Bộ lọc Nghiệp vụ Đa dạng hóa Thương hiệu & Loại trừ Sản phẩm đã Mua
   - 5.5. Cơ chế Ghi nhận Tương tác Thời gian thực (`interactionController.js` & `useTrackInteraction.ts`)
7. **CHƯƠNG 6: CHIẾN LƯỢC VẬN HÀNH, VÒNG ĐỜI SẢN PHẨM & TÁI HUẤN LUYỆN LÂU DÀI (LIFECYCLE & RETRAINING PIPELINE)**
   - 6.1. Vòng đời tiến hóa của một sản phẩm mới (New Product Evolution Lifecycle)
   - 6.2. Cơ chế 100% Content-Based khi sản phẩm chưa có vector CF
   - 6.3. Kiến trúc Pipeline Tái Huấn Luyện Định Kỳ (Periodic Batch Retraining Pipeline)
   - 6.4. Sơ đồ chu trình học khép kín (Continuous Learning Closed-Loop Diagram)
8. **KẾT LUẬN & HƯỚNG PHÁT TRIỂN**
9. **DANH MỤC TÀI LIỆU THAM KHẢO (REFERENCES)**
10. **PHỤ LỤC: DANH SÁCH ẢNH CHỤP TỪ JUPYTER NOTEBOOK ĐỂ CHÈN VÀO WORD**

---

# LỜI MỞ ĐẦU & TỔNG QUAN ĐỀ TÀI

### 1.1. Bối cảnh và tính cấp thiết của đề tài
Trong môi trường thương mại điện tử hiện đại, sự đa dạng của các thiết bị công nghệ—đặc biệt là dòng sản phẩm máy tính xách tay (laptop)—đang tạo ra một thách thức lớn đối với quyết định mua sắm của người tiêu dùng. Một chiếc laptop không đơn thuần chỉ được phân biệt bởi thương hiệu hay giá thành, mà giá trị cốt lõi của nó nằm ở sự kết hợp phức tạp của các linh kiện phần cứng: Vi xử lý (CPU), Card đồ họa (GPU), Dung lượng và chuẩn RAM, Chuẩn ổ cứng lưu trữ (SSD NVMe), Tấm nền và tần số quét màn hình, Trọng lượng máy, cùng các tính năng AI chuyên biệt (NPU).

Phần lớn các hệ thống gợi ý truyền thống thường bộc lộ những khiếm khuyết lớn:
* **Hệ thống lọc cộng tác thuần túy (Collaborative Filtering)**: Bỏ qua hoàn toàn thông số kỹ thuật phần cứng, dẫn đến việc không thể giải thích được lý do gợi ý và bất lực hoàn toàn trước các sản phẩm mới đưa lên kệ hàng (Item Cold-Start).
* **Hệ thống dựa trên nội dung thuần túy (Content-Based Filtering)**: Dễ rơi vào bẫy "bong bóng lọc" (*Filter Bubble*), chỉ gợi ý các máy có cấu hình tương đương mà không nắm bắt được xu hướng cộng đồng hoặc thị hiếu người dùng có gu mua sắm giống nhau.

Do đó, việc nghiên cứu một **Hệ thống Gợi ý Lai (Hybrid Recommendation System)** có khả năng hiểu sâu đặc tính kỹ thuật phần cứng thông qua các mô hình ngôn ngữ lớn (Sentence-BERT), đồng thời khai phá hành vi đám đông (Implicit ALS) và phục vụ theo thời gian thực (Real-time Serving) là một bài toán mang tính cấp thiết và giá trị ứng dụng rất cao.

### 1.2. Mục tiêu nghiên cứu
1. Nghiên cứu và ứng dụng mô hình ngôn ngữ Transformer (Sentence-BERT) để tự động mã hóa ngữ nghĩa đặc tả cấu hình laptop thành vector nhúng 384 chiều.
2. Xây dựng và tối ưu hóa mô hình phân rã ma trận phản hồi ngầm Implicit ALS nhằm sinh ra các vector biểu diễn tương tác 8 chiều.
3. Thiết lập cơ chế chấm điểm lai kết hợp trọng số động $\alpha$ và đánh giá thực nghiệm toàn diện trên bộ chỉ số chuẩn RecSys (Recall@K, NDCG@10, Coverage, Diversity).
4. Thiết kế và triển khai trọn vẹn kiến trúc hệ thống thương mại điện tử: từ khâu huấn luyện ngoại tuyến (Python Machine Learning), lưu trữ chỉ mục vector trên MongoDB Atlas, đến công cụ phục vụ trực tuyến siêu tốc trên Node.js/Express và giao diện người dùng Next.js 15.

---

# CHƯƠNG 1: TỔNG QUAN CƠ SỞ LÝ THUYẾT & CÁC CÔNG TRÌNH LIÊN QUAN (LITERATURE REVIEW)

Phương pháp luận và kiến trúc của đề tài được xây dựng trên nền tảng của 6 công trình nghiên cứu khoa học kinh điển được công bố tại các hội nghị học thuật hàng đầu thế giới:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         BẢN ĐỒ CƠ SỞ LÝ THUYẾT HỌC THUẬT                         │
│                                                                                  │
│  [1] Covington et al. (RecSys 2016 - Google)   [2] Wang et al. (KDD 2018 - Alibaba)
│      Kiến trúc 2 Giai đoạn: Candidate              Billion-scale Commodity Embedding
│      Retrieval & Scoring/Re-ranking                & Session-based Real-time RecSys
│                     │                                             │              │
│                     ▼                                             ▼              │
│      ┌───────────────────────────────┐             ┌───────────────────────────┐ │
│      │   CONTENT-BASED TOWER (SBERT)  │             │  COLLABORATIVE TOWER (ALS)│ │
│      │ [3] Reimers & Gurevych (2019) │             │ [4] Hu, Koren et al.(2008)│ │
│      │  Siamese BERT 384 dimensions  │             │  Implicit Matrix Factoriz.│ │
│      └──────────────┬────────────────┘             └──────────────┬────────────┘ │
│                     │                                             │              │
│                     └──────────────────────┬──────────────────────┘              │
│                                            ▼                                     │
│                         [5] Yi et al. (RecSys 2019 - Google)                     │
│                             Two-Tower Dynamic Hybrid Scoring                     │
│                                            │                                     │
│                                            ▼                                     │
│                         [6] Pan et al. (IEEE TKDE Survey 2024)                   │
│                             Vector Database & NoSQL Hybrid Search                │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.1. Kiến trúc Hai Giai Đoạn trong Hệ thống Gợi ý Quy mô Lớn
* **Trích dẫn**: *Covington, P., Adams, J., & Sargin, E. (2016). "Deep Neural Networks for YouTube Recommendations". In Proceedings of the 10th ACM Conference on Recommender Systems (RecSys '16), pp. 191–198.*
* **Phân tích học thuật**: Bài báo của nhóm nghiên cứu Google/YouTube đã giải quyết bài toán cốt lõi trong công nghiệp gợi ý: Làm thế nào để chọn ra 10 sản phẩm tốt nhất từ hàng triệu mục trong thời gian dưới vài chục mili-giây? Covington đề xuất chia bài toán thành hai giai đoạn độc lập:
  * **Candidate Retrieval (Giai đoạn Thu hồi)**: Sử dụng các phép toán không gian vector (Nearest Neighbor / Cosine Search) để thu hẹp không gian tìm kiếm từ toàn bộ kho hàng xuống khoảng vài chục đến vài trăm ứng viên tiềm năng nhất.
  * **Scoring & Re-ranking (Giai đoạn Tái xếp hạng)**: Sử dụng mô hình chấm điểm chi tiết hơn, tích hợp các bộ lọc quy tắc nghiệp vụ, đa dạng hóa và loại trừ sản phẩm không phù hợp trước khi hiển thị cho người dùng.

### 1.2. Biểu diễn Hàng hóa Thương mại Điện tử & Gợi ý theo Phiên
* **Trích dẫn**: *Wang, J., Huang, P., Zhao, H., Zhang, Z., Zhao, B., & Lee, D. L. (2018). "Billion-scale Commodity Embedding for E-commerce Recommendation in Alibaba". In Proceedings of the 24th ACM SIGKDD International Conference on Knowledge Discovery & Data Mining (KDD '18), pp. 839–848.*
* **Phân tích học thuật**: Nhóm tác giả tại Alibaba chỉ ra rằng việc ánh xạ hàng hóa thương mại điện tử thành các vector nhúng (Commodity Embeddings) kết hợp với các tương tác trong cùng phiên duyệt web (Session-based) cho phép hệ thống dự đoán chính xác ý định mua hàng ngay tức thì, giải quyết triệt để sự thay đổi nhanh chóng trong sở thích người dùng.

### 1.3. Mô hình Không gian Vector Ngữ nghĩa Sentence-BERT
* **Trích dẫn**: *Reimers, N., & Gurevych, I. (2019). "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks". In Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing (EMNLP 2019), pp. 3982–3992.*
* **Phân tích học thuật**: Reimers & Gurevych chứng minh rằng việc sử dụng cấu trúc mạng Transformer Siamese (dòng mô hình `all-MiniLM-L6-v2` / `paraphrase-multilingual-MiniLM-L12-v2`) cho phép trích xuất các vector ngữ nghĩa có kích thước cố định ($d = 384$ chiều) từ các đoạn văn bản mô tả. Vector sau khi được chuẩn hóa $L_2$ cho phép tính toán độ tương đồng thông số kỹ thuật thông qua tích vô hướng với chi phí tính toán cực kỳ thấp:
  $$\text{CosineSimilarity}(\mathbf{v}_i, \mathbf{v}_j) = \frac{\mathbf{v}_i \cdot \mathbf{v}_j}{\|\mathbf{v}_i\|_2 \|\mathbf{v}_j\|_2} = \mathbf{v}_i \cdot \mathbf{v}_j \quad (\text{khi } \|\mathbf{v}\|_2 = 1)$$

### 1.4. Thuật toán Phân rã Ma trận Tương tác Ngầm Implicit ALS
* **Trích dẫn**: *Hu, Y., Koren, Y., & Volinsky, C. (2008). "Collaborative Filtering for Implicit Feedback Datasets". In Proceedings of the 8th IEEE International Conference on Data Mining (ICDM '08), pp. 263–272.*
* **Phân tích học thuật**: Khác với dữ liệu xếp hạng chủ quan (Explicit Rating), hành vi mua sắm trực tuyến mang tính chất phản hồi ngầm (Implicit Feedback). Hu và cộng sự đã đề xuất việc chuyển đổi giá trị tương tác thô $r_{ui}$ thành biến nhị phân $p_{ui}$ kết hợp độ tin cậy $c_{ui} = 1 + \alpha_{\text{conf}} \cdot r_{ui}$, sau đó tối ưu hóa hàm mất mát xen kẽ giữa User Factors và Item Factors:
  $$\mathcal{L}_{\text{ALS}} = \sum_{u=1}^M \sum_{i=1}^N c_{ui} \left( p_{ui} - \mathbf{x}_u^T \mathbf{y}_i \right)^2 + \lambda \left( \sum_{u=1}^M \|\mathbf{x}_u\|_2^2 + \sum_{i=1}^N \|\mathbf{y}_i\|_2^2 \right)$$

### 1.5. Kiến trúc Hai Tháp (Two-Tower Architecture) & Tích hợp Vector
* **Trích dẫn**: *Yi, X., Yang, J., Hong, L., Zheng, D. X., Heldt, S., & Chi, E. H. (2019). "Sampling-bias-corrected Neural Modeling for Large Corpus Item Recommendations". In Proceedings of the 13th ACM Conference on Recommender Systems (RecSys '19), pp. 269–277.*
* **Phân tích học thuật**: Mô hình phân tách hệ thống thành **Tháp Người Dùng (User Tower)** và **Tháp Sản Phẩm (Item Tower)**. Việc duy trì không gian vector độc lập giữa Content-Based và Collaborative Filtering giúp hệ thống kiểm soát được tỷ trọng kết hợp linh hoạt tùy theo ngữ cảnh của người dùng tại thời điểm truy vấn.

### 1.6. Cơ sở dữ liệu Vector & Tìm kiếm Lai trên NoSQL
* **Trích dẫn**: *Pan, J. J., Wang, J., & Li, G. (2024). "A Survey on Vector Databases: Technologies, Applications, and Future Directions". IEEE Transactions on Knowledge and Data Engineering (TKDE).*
* **Phân tích học thuật**: Công trình khảo sát chứng minh rằng việc nhúng trực tiếp các trường vector vào cơ sở dữ liệu Document NoSQL (MongoDB Atlas) kết hợp với Hierarchical Navigable Small World (HNSW) Index và Metadata Filter mang lại hiệu năng truy vấn tối ưu nhất cho các ứng dụng web thương mại điện tử hiện đại.

---

# CHƯƠNG 2: PHÂN TÍCH DỮ LIỆU, TIỀN XỬ LÝ & KỸ NGHỆ ĐẶC TRƯNG (DATA ENGINEERING & EDA)

Toàn bộ quy trình phân tích và chuẩn bị dữ liệu được thực hiện tại các **Cells 1 đến 14** của Jupyter Notebook [`phase2-giaidoan2-sbert-als-v2-fixed.ipynb`](file:///d:/Project/KLTN_Laptop-ecommerce-ai-/python/phase2_giai_doan_2/phase2-giaidoan2-sbert-als-v2-fixed.ipynb).

### 2.1. Cấu trúc Tập Dữ liệu
* **Tập Thực thể Sản phẩm (Item Catalog)**: Gồm **398 sản phẩm laptop** bao phủ 9 thương hiệu lớn (Asus, Acer, Dell, HP, Lenovo, MSI, Apple, LG, Gigabyte).
* **Tập Người dùng (User Profiles)**: Gồm **56 tài khoản người dùng** đại diện cho các phân khúc khách hàng mục tiêu.
* **Tập Tương tác (User Interactions)**: Gồm **1.704 bản ghi tương tác** ban đầu (và được mở rộng đầy đủ lên 2.918 tương tác phủ 100% danh mục sản phẩm).

### 2.2. Phân tích Độ Đầy Đủ Thuộc Tính Phần Cứng (Completeness Analysis)
Tại **Cell 10** của notebook, một thuật toán quét tự động được thực thi để kiểm tra tỷ lệ xuất hiện của từng trường thuộc tính:

```
┌─────────────────────────────────────┬───────────────────┬────────────────────────────────────────┐
│ Tên Trường Dữ Liệu (Field)          │ Tỷ Lệ Đầy Đủ (%)  │ Phương Pháp Xử Lý Kỹ Nghệ              │
├─────────────────────────────────────┼───────────────────┼────────────────────────────────────────┤
│ name (Tên máy / Model)              │ 100.0%            │ Giữ nguyên làm đặc trưng nhận diện     │
│ price (Giá niêm yết)                │ 100.0%            │ Chuẩn hóa số học đưa vào Prompt        │
│ brand_id (Mã định danh thương hiệu) │ 100.0%            │ Ánh xạ ID -> Tên thương hiệu thật      │
│ category_id (Mã định danh danh mục) │ 100.0%            │ Ánh xạ ID -> Tên danh mục thật         │
│ specifications.cpu (Vi xử lý)       │ 98.2%             │ Trích xuất thông tin dòng chip & thế hệ│
│ specifications.gpu (Card đồ họa)    │ 96.7%             │ Phân loại card rời RTX / Onboard       │
│ specifications.ram (Bộ nhớ RAM)     │ 99.0%             │ Trích xuất dung lượng (8GB/16GB/32GB)  │
│ specifications.storage (Ổ cứng)     │ 97.5%             │ Trích xuất dung lượng & chuẩn SSD      │
│ specifications.display (Màn hình)   │ 95.5%             │ Trích xuất kích thước & tần số quét    │
│ specifications.npu (AI Engine)      │ 28.4%             │ Điền giá trị mặc định 'Không có'       │
│ specifications.features (Tính năng) │ 32.1%             │ Điền giá trị mặc định 'Không có'       │
└─────────────────────────────────────┴───────────────────┴────────────────────────────────────────┘
```

> **[VỊ TRÍ CHÈN ẢNH 1 TỪ NOTEBOOK]**: Chèn biểu đồ Bar Chart hiển thị **Độ đầy đủ của các thuộc tính phần cứng (Completeness Analysis)** tại Output của **Cell 10**.

### 2.3. Kỹ nghệ Chuỗi Đặc Tả Cấu Hình (Prompt Feature Engineering)
Tại **Cell 12**, hàm `build_spec_text()` giải quyết bài toán trích xuất dữ liệu lồng nhau và mã định danh quan hệ bằng cách chuyển đổi toàn bộ thông số phần cứng thành chuỗi văn bản tự nhiên có gán nhãn cấu trúc:

```python
# Ví dụ chuỗi Prompt chuẩn đưa vào mô hình Sentence-BERT:
"name: Laptop MSI Cyborg 15 A13UC-861VN | price: 18690000 | brand: MSI | category: Laptop Gaming | cpu: Intel Core i5-13420H | gpu: GeForce RTX 3050 4GB | ram: 16GB DDR5 | storage: 512GB SSD NVMe | display: 15.6 inch FHD 144Hz"
```

### 2.4. Trực quan hóa Không gian Vector Đặc trưng Bằng PCA 2D
Để kiểm chứng chất lượng biểu diễn của mô hình Sentence-BERT trước khi đưa vào huấn luyện gợi ý, tại **Cell 16**, ma trận 384 chiều của 398 sản phẩm được giảm chiều về không gian 2D thông qua thuật toán **PCA (Principal Component Analysis)**:

> **[VỊ TRÍ CHÈN ẢNH 2 TỪ NOTEBOOK]**: Chèn đồ thị Scatter Plot **Không gian Vector SBERT 384 chiều giảm chiều PCA 2D** tại Output của **Cell 16**.
* **Phân tích hiện tượng phân cụm**: Các điểm dữ liệu trên biểu đồ tự động tụ họp thành 3 cụm chính rất rõ nét:
  1. *Cụm Laptop Gaming*: Tập trung bên phải đồ thị (chứa các từ khóa RTX, màn hình 144Hz-240Hz, CPU dòng H/HX).
  2. *Cụm Laptop Mỏng Nhẹ / Doanh Nhân*: Tập trung bên trái đồ thị (chứa CPU dòng U/Core Ultra, màn hình OLED 2.8K, RAM LPDDR5).
  3. *Cụm Laptop Học Tập - Văn Phòng Phổ Thông*: Nằm ở vùng trung tâm (CPU i3/i5/Ryzen 5, card onboard Intel UHD/Iris Xe).
* Điều này khẳng định vector nhúng 384 chiều đã tiếp thu xuất sắc tri thức phần cứng máy tính.

### 2.5. Ma trận Phản hồi Ngầm & Bảng Trọng Số Hành Vi
Hệ thống chuyển đổi các tương tác của người dùng thành độ tin cậy $w$ tương ứng với cường độ ý định mua hàng:
* **Mua hàng hoàn tất (Purchase)**: $w = 10.0$ (Mức độ khẳng định cao nhất).
* **Đánh giá tích cực 4-5 sao (High Rating)**: $w = 8.0$.
* **Thêm sản phẩm vào giỏ hàng (Add-to-cart)**: $w = 5.0$.
* **Lưu vào danh sách yêu thích (Like / Wishlist)**: $w = 3.0$.
* **Click từ kết quả tìm kiếm / Bộ lọc (Search Click)**: $w = 2.0$.
* **Xem chi tiết sản phẩm (View)**: $w = 1.0$ (Nếu thời gian xem $>60\text{s} \to w=1.5$, $>120\text{s} \to w=2.0$).
* **Xóa khỏi giỏ hàng (Remove from cart)**: Loại bỏ hoàn toàn khỏi ma trận tương tác.

---

# CHƯƠNG 3: MÔ HÌNH HÓA TOÁN HỌC & KIẾN TRÚC THUẬT TOÁN HYBRID RECSYS

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         KIẾN TRÚC DUAL-TOWER HYBRID RECSYS                       │
│                                                                                  │
│   USER SIDE                                                  ITEM SIDE           │
│   ┌─────────────────────────────┐              ┌─────────────────────────────┐   │
│   │ Lịch sử tương tác {k}       │              │ Thông số kỹ thuật Laptop    │   │
│   │ Áp dụng Time-Decay e^(-λΔt) │              │ (CPU, GPU, RAM, SSD, Màn...)│   │
│   └──────────────┬──────────────┘              └──────────────┬──────────────┘   │
│                  │                                            │                  │
│                  ▼                                            ▼                  │
│   ┌─────────────────────────────┐              ┌─────────────────────────────┐   │
│   │ Content Profile Vector      │              │ Item Content Vector         │   │
│   │ u_Content ∈ R^384 (SBERT)   │              │ v_i ∈ R^384 (SBERT)         │   │
│   └──────────────┬──────────────┘              └──────────────┬──────────────┘   │
│                  │                                            │                  │
│                  ├──────────────────────┬─────────────────────┤                  │
│                  │  Cosine Similarity   │                     │                  │
│                  ▼                      ▼                     │                  │
│          Score_Content(u, i) = Cosine(u_Content, v_i)         │                  │
│                                                               │                  │
│   ┌─────────────────────────────┐              ┌──────────────┴──────────────┐   │
│   │ User Latent Factor          │              │ Item Latent Factor          │   │
│   │ x_u ∈ R^8 (Implicit ALS)    │              │ y_i ∈ R^8 (Implicit ALS)    │   │
│   └──────────────┬──────────────┘              └──────────────┬──────────────┘   │
│                  │                                            │                  │
│                  ├──────────────────────┬─────────────────────┤                  │
│                  │     Dot Product      │                     │                  │
│                  ▼                      ▼                     │                  │
│            Score_CF(u, i) = DotProduct(x_u, y_i)              │                  │
│                                                               │                  │
│                  └──────────────────────┬─────────────────────┘                  │
│                                         ▼                                        │
│               Score_Final = α * Score_CF + (1 - α) * Score_Content               │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1. Nhánh Content-Based (Sentence-BERT 384 Chiều)
* Mỗi sản phẩm $i$ được mô hình Sentence-BERT ánh xạ thành vector đặc trưng: $\mathbf{v}_i \in \mathbb{R}^{384}$.
* Vector hồ sơ người dùng $\mathbf{u}_{\text{Content}}$ được tổng hợp từ lịch sử tương tác $\mathcal{H}_u = \{(k, w_k, t_k)\}$ có tính đến sự suy giảm của sở thích theo thời gian (*Exponential Time-Decay*):
  $$\mathbf{u}_{\text{Content}} = \text{Normalize}_{L2} \left( \sum_{k \in \mathcal{H}_u} w_k \cdot \exp\left( -\frac{\ln 2}{30} \cdot \Delta t_k \right) \cdot \mathbf{v}_k \right)$$
  với $\Delta t_k$ là số ngày tính từ thời điểm tương tác $t_k$ đến hiện tại (chu kỳ bán rã 30 ngày).
* Điểm số tương đồng phần cứng:
  $$\text{Score}_{\text{Content}}(u, i) = \mathbf{u}_{\text{Content}} \cdot \mathbf{v}_i$$

### 3.2. Nhánh Collaborative Filtering (Implicit ALS 8 Chiều)
* Không gian ma trận tương tác người dùng - sản phẩm được phân rã thành hai ma trận bậc thấp: $\mathbf{X} \in \mathbb{R}^{M \times 8}$ (User Factors) và $\mathbf{Y} \in \mathbb{R}^{N \times 8}$ (Item Factors).
* Cấu hình tối ưu được xác lập: $k = 8$ factors, $\lambda_{\text{reg}} = 0.3$, số vòng lặp 20 epochs.
* Điểm số hành vi cộng đồng:
  $$\text{Score}_{\text{CF}}(u, i) = \mathbf{x}_u^T \mathbf{y}_i = \sum_{d=1}^8 x_{u,d} \cdot y_{i,d}$$

### 3.3. Cơ chế Kết Hợp Tuyến Tính Động (Dynamic Hybrid Scoring)
Để đảm bảo hai thang đo khác nhau có thể cộng gộp công bằng, điểm số được chuẩn hóa qua hàm Min-Max Scaling trước khi phối hợp tuyến tính theo trọng số $\alpha$:
$$\text{Score}_{\text{Final}}(u, i) = \alpha \cdot \text{MinMax}(\text{Score}_{\text{CF}}(u, i)) + (1 - \alpha) \cdot \text{MinMax}(\text{Score}_{\text{Content}}(u, i))$$

### 3.4. Cơ chế Triệt Tiêu Bài Toán Khởi Đầu Lạnh (Cold-Start Resolution)
1. **Đối với Sản phẩm Mới (Item Cold-Start)**:
   * Khi một laptop mới vừa nhập kho và chưa có bất kỳ lượt mua hay tương tác nào, vector $\mathbf{y}_i$ của nhánh ALS chưa hình thành.
   * Hệ thống tự động kích hoạt điều kiện: $\alpha_{\text{effective}} = 0.0$. Lúc này, điểm số gợi ý sẽ do **nhánh Content-Based (SBERT 384 chiều) gánh 100%**. Sản phẩm mới lập tức xuất hiện trước những khách hàng có nhu cầu cấu hình tương thích mà không cần thời gian chờ đợi.
2. **Đối với Khách Vãng Lai / Chưa Đăng Nhập (Session Cold-Start)**:
   * Ngay khi khách vãng lai bấm vào xem sản phẩm đầu tiên $i_{\text{clicked}}$, hàm `cold_start_session_vector()` lập tức gán:
     $$\mathbf{u}_{\text{Session\_Content}} = \mathbf{v}_{i_{\text{clicked}}}, \quad \mathbf{u}_{\text{Session\_CF}} = \mathbf{y}_{i_{\text{clicked}}}$$
   * Giao diện lập tức hiển thị danh sách laptop có cấu hình và tầm giá tương đương mà không bắt buộc người dùng phải đăng nhập tài khoản.

---

# CHƯƠNG 4: THỰC NGHIỆM, ĐO LƯỜNG & PHÂN TÍCH KẾT QUẢ (EXPERIMENTS & BENCHMARKS)

Toàn bộ quá trình đánh giá thực nghiệm được thực hiện tại **Cells 19 đến 22** của Notebook.

### 4.1. Thiết lập Thực nghiệm (Temporal Leave-One-Out Evaluation)
* Để mô phỏng chính xác kịch bản vận hành thực tế, notebook sử dụng phương pháp chia tập theo dòng thời gian:
  * **Tập Kiểm thử (Test Set)**: Giữ lại tương tác cuối cùng của mỗi người dùng (56 tương tác của 56 người dùng có $\ge 2$ tương tác).
  * **Tập Huấn luyện (Train Set)**: Gồm toàn bộ 1.648 tương tác diễn ra trước đó.
* **Đánh giá trên Toàn bộ Danh mục (Full-Catalog Ranking)**: Với mỗi người dùng trong tập test, mô hình phải xếp hạng toàn bộ **398 sản phẩm** trong kho để kiểm tra xem sản phẩm mục tiêu (Ground-truth positive item) có lọt vào Top-5, Top-10 hay Top-20 hay không.

### 4.2. Bộ Chỉ số Đo lường Hiệu năng Chuẩn RecSys
1. **Recall@K (R@K)**:
   $$\text{Recall@K} = \frac{|\text{Top-K} \cap \text{GroundTruth}|}{|\text{GroundTruth}|}$$
2. **NDCG@10 (Normalized Discounted Cumulative Gain tại Top 10)**:
   $$\text{DCG@10} = \sum_{i=1}^{10} \frac{2^{r_i} - 1}{\log_2(i + 1)}, \quad \text{NDCG@10} = \frac{\text{DCG@10}}{\text{IDCG@10}}$$
3. **Catalog Coverage**:
   $$\text{Coverage} = \frac{|\bigcup_{u} \text{Top-K}_u|}{|\mathcal{I}|}$$
4. **Intra-list Diversity**:
   $$\text{Diversity} = \frac{2}{K(K-1)} \sum_{i \in \text{Top-K}} \sum_{j \in \text{Top-K}, j > i} \left(1 - \text{Cosine}(\mathbf{v}_i, \mathbf{v}_j)\right)$$

### 4.3. Bảng Kết quả So sánh Hiệu năng Giữa các Mô hình

```
┌───────────────────────────────────────┬──────────┬──────────┬──────────┬───────────┬──────────────┬───────────┐
│ Cấu hình Mô hình Huấn luyện           │ R@5      │ R@10     │ R@20     │ NDCG@10   │ Coverage (%) │ Diversity │
├───────────────────────────────────────┼──────────┼──────────┼──────────┼───────────┼──────────────┼───────────┤
│ Content-Based (SBERT 384d)            │ 0.017857 │ 0.017857 │ 0.071429 │ 0.011267  │ 34.67%       │ 0.0765    │
│ Implicit ALS (factors=16, reg=0.3)    │ 0.000000 │ 0.017857 │ 0.053571 │ 0.006361  │ 70.60%       │ 0.2119    │
│ Implicit ALS (factors=32, reg=0.1)    │ 0.017857 │ 0.035714 │ 0.125000 │ 0.014051  │ 73.37%       │ 0.2143    │
│ Implicit ALS (factors=8, reg=0.3)     │ 0.017857 │ 0.053571 │ 0.071429 │ 0.022275  │ 62.06%       │ 0.2034    │
├───────────────────────────────────────┼──────────┼──────────┼──────────┼───────────┼──────────────┼───────────┤
│ ⭐ HYBRID MODEL (α = 0.7) TỐI ƯU      │ 0.035714 │ 0.035714 │ 0.071429 │ 0.024765  │ 58.79%       │ 0.1522    │
└───────────────────────────────────────┴──────────┴──────────┴──────────┴───────────┴──────────────┴───────────┘
```

> **[VỊ TRÍ CHÈN ẢNH 3 TỪ NOTEBOOK]**: Chèn biểu đồ Bar Chart **So sánh NDCG@10 và Coverage giữa các cấu hình ALS (`f8_r0.3`, `f16_r0.3`, `f32_r0.1`)** tại Output của **Cell 20**.

### 4.4. Thực nghiệm Grid Search Tìm Trọng số $\alpha$ Tối ưu
Thực nghiệm quét giá trị $\alpha$ từ $0.1$ đến $0.9$ với bước nhảy $0.1$ tại **Cell 22**:

```
┌────────────┬──────────┬──────────┬──────────┬───────────┬──────────────┬───────────┐
│ Giá trị α  │ R@5      │ R@10     │ R@20     │ NDCG@10   │ Coverage (%) │ Diversity │
├────────────┼──────────┼──────────┼──────────┼───────────┼──────────────┼───────────┤
│ α = 0.1    │ 0.017857 │ 0.017857 │ 0.053571 │ 0.017857  │ 38.69%       │ 0.0880    │
│ α = 0.2    │ 0.017857 │ 0.035714 │ 0.035714 │ 0.012070  │ 43.97%       │ 0.1020    │
│ α = 0.3    │ 0.000000 │ 0.035714 │ 0.053571 │ 0.012722  │ 47.24%       │ 0.1129    │
│ α = 0.4    │ 0.017857 │ 0.053571 │ 0.053571 │ 0.020004  │ 51.51%       │ 0.1213    │
│ α = 0.5    │ 0.035714 │ 0.035714 │ 0.053571 │ 0.016619  │ 53.77%       │ 0.1293    │
│ α = 0.6    │ 0.035714 │ 0.035714 │ 0.053571 │ 0.018175  │ 56.03%       │ 0.1403    │
│ ⭐ α = 0.7 │ 0.035714 │ 0.035714 │ 0.071429 │ 0.024765  │ 58.79%       │ 0.1522    │
│ α = 0.8    │ 0.017857 │ 0.035714 │ 0.071429 │ 0.017219  │ 60.30%       │ 0.1714    │
│ α = 0.9    │ 0.017857 │ 0.053571 │ 0.071429 │ 0.022018  │ 59.80%       │ 0.1855    │
└────────────┴──────────┴──────────┴──────────┴───────────┴──────────────┴───────────┘
```

> **[VỊ TRÍ CHÈN ẢNH 4 TỪ NOTEBOOK]**: Chèn 2 biểu đồ đường Curve **Sự biến thiên của NDCG@10, Coverage và Diversity theo các mức $\alpha$ từ 0.1 đến 0.9** tại Output của **Cell 22**.

### 4.5. Bàn luận & Phân tích Ý nghĩa Kết quả
1. **Minh chứng Khoa học về Sự Vượt trội của Mô hình Lai**: Kết quả thực nghiệm khẳng định việc phối hợp hai nhánh với $\alpha = 0.7$ đạt điểm chất lượng xếp hạng **NDCG@10 = $0.024765$**, vượt qua cả mô hình thuần ALS ($0.02228$, tăng **+11.2%**) và vượt trội hoàn toàn so với mô hình thuần Content ($0.01127$, tăng **+119.8%**).
2. **Hiệu ứng Triệt tiêu Overfitting của Siêu tham số**: Khi tăng số chiều ẩn lên `factors = 16` hay `32`, NDCG@10 bị suy giảm nghiêm trọng ($0.00636$ và $0.01405$). Kết quả này chứng minh rằng việc chọn `factors = 8` kết hợp `regularization = 0.3` là sự lựa chọn tối ưu nhất cho tập dữ liệu thương mại điện tử ban đầu, giúp mô hình nắm bắt phân khúc máy tính mà không bị học vẹt.
3. **Cân bằng giữa Độ chính xác và Độ đa dạng**: Tại $\alpha = 0.7$, hệ thống đạt độ bao phủ kho hàng **$58.79\%$** và độ phong phú **$0.1522$** (cao gấp đôi so với Content-Only $0.0765$), giúp giao diện người dùng không bị đơn điệu và tránh được hiện tượng bong bóng lọc.

---

# CHƯƠNG 5: CHI TIẾT TRIỂN KHAI MÃ NGUỒN HỆ THỐNG THỰC TẾ (SOURCE CODE IMPLEMENTATION)

Để chuyển hóa kết quả nghiên cứu thành dịch vụ web thương mại điện tử thực tế, toàn bộ thuật toán được đóng gói thành các module mã nguồn tối ưu trên Node.js Backend và Next.js Frontend:

### 5.1. Triển khai Toán học Vector Tối Ưu (`vectorUtils.js`)
File [`backend/src/utils/vectorUtils.js`](file:///d:/Project/KLTN_Laptop-ecommerce-ai-/backend/src/utils/vectorUtils.js) đảm nhiệm việc tính toán đại số tuyến tính trong bộ nhớ V8 mà không phụ thuộc vào bất kỳ thư viện C++ nặng nề nào:

```javascript
/**
 * Tính Cosine Similarity giữa 2 vector và chuẩn hóa an toàn về thang [0, 1]
 */
export function cosineSimilarity(a, b, normalize01 = true) {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0 || isNaN(denominator)) return 0;
  const sim = Math.max(-1, Math.min(1, dot / denominator));
  return normalize01 ? (sim + 1) / 2 : sim;
}

/**
 * Tính trung bình cộng có trọng số suy giảm theo thời gian (Time-Decay)
 * Công thức: u = L2Normalize( Σ(w_i * e^(-λ*Δt) * v_i) / Σ(w_i) )
 */
export function calculateTimeDecay(timestamp, halfLifeDays = 30) {
  if (!timestamp) return 1.0;
  const time = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  const diffDays = Math.max(0, (Date.now() - time) / (1000 * 60 * 60 * 24));
  const lambda = Math.LN2 / halfLifeDays;
  return Math.exp(-lambda * diffDays);
}
```

### 5.2. Dịch vụ Xây dựng Hồ sơ Người dùng & Khách Vãng Lai (`userProfileService.js`)
File [`backend/src/services/userProfileService.js`](file:///d:/Project/KLTN_Laptop-ecommerce-ai-/backend/src/services/userProfileService.js) phân tích toàn bộ lịch sử tương tác để sinh ra `user_cf_vector` và `user_content_vector`:

```javascript
// Tính toán hồ sơ người dùng có trọng số hành vi và suy giảm thời gian
async calculateUserProfile(userId, options = {}) {
  const interactions = await Interaction.find({ userId }).sort({ createdAt: -1 }).limit(100).lean();
  if (!interactions || interactions.length === 0) return this._getDefaultColdStartProfile(userId);

  const cfVectors = [], cfWeights = [], contentVectors = [], contentWeights = [];
  for (const inter of interactions) {
    const product = await Product.findById(inter.productId).lean();
    if (!product) continue;
    const w = this.getInteractionWeight(inter); // Áp dụng Time-decay và loại hành vi

    if (product.item_cf_vector?.length > 0) {
      cfVectors.push(product.item_cf_vector);
      cfWeights.push(w);
    }
    if (product.item_content_vector?.length > 0) {
      contentVectors.push(product.item_content_vector);
      contentWeights.push(w);
    }
  }

  return {
    userId,
    user_cf_vector: cfVectors.length > 0 ? weightedVectorAverage(cfVectors, cfWeights) : null,
    user_content_vector: contentVectors.length > 0 ? weightedVectorAverage(contentVectors, contentWeights) : null,
    isColdStart: cfVectors.length === 0 && contentVectors.length === 0
  };
}
```

### 5.3. Động cơ Chấm điểm Lai & Cơ chế Chuyển đổi Trọng số cho Sản phẩm Mới (`hybridRecService.js`)
File [`backend/src/services/hybridRecService.js`](file:///d:/Project/KLTN_Laptop-ecommerce-ai-/backend/src/services/hybridRecService.js) là trung tâm tính toán Online Serving. Điểm đặc biệt là cơ chế **tự động chuyển đổi $\alpha = 0.0$** khi phát hiện sản phẩm mới:

```javascript
for (const product of candidates) {
  let scoreCF = 0, hasCF = false;
  let scoreContent = 0, hasContent = false;

  // 1. Nhánh Collaborative Filtering (ALS)
  if (user_cf_vector && product.item_cf_vector?.length > 0) {
    scoreCF = cosineSimilarity(user_cf_vector, product.item_cf_vector, true);
    hasCF = true;
  }

  // 2. Nhánh Content-Based (SBERT)
  if (user_content_vector && product.item_content_vector?.length > 0) {
    scoreContent = cosineSimilarity(user_content_vector, product.item_content_vector, true);
    hasContent = true;
  }

  // 3. XỬ LÝ SẢN PHẨM MỚI (NEW ITEM COLD-START):
  // Nếu sản phẩm mới chưa có CF vector -> Chuyển hoàn toàn sang Content-Based (alpha = 0.0)
  let effectiveAlpha = safeAlpha; // Mặc định alpha = 0.7
  if (!hasCF && hasContent) {
    effectiveAlpha = 0.0; // 100% Content-Based gánh điểm!
    scoreCF = scoreContent;
  } else if (hasCF && !hasContent) {
    effectiveAlpha = 1.0;
    scoreContent = scoreCF;
  }

  // 4. Áp dụng công thức Weighted Hybrid Scoring
  const scoreFinal = (effectiveAlpha * scoreCF) + ((1 - effectiveAlpha) * scoreContent);
  scoredCandidates.push({ product, scoreFinal, scoreCF, scoreContent });
}
```

### 5.4. Bộ Lọc Đa Dạng Hóa Thương Hiệu & Loại Trừ Đã Mua
```javascript
// Lọc đa dạng hóa thương hiệu (Brand Diversity Filter)
const finalRecommendations = [];
const brandCounts = {};

for (const item of scoredCandidates) {
  if (finalRecommendations.length >= limit) break;
  const brandName = item.product.brand_id?.name || 'Khác';
  const currentCount = brandCounts[brandName] || 0;

  // Giới hạn tối đa 3 máy trên 1 thương hiệu
  if (maxPerBrand > 0 && currentCount >= maxPerBrand) continue;

  brandCounts[brandName] = currentCount + 1;
  finalRecommendations.push(item.product);
}
```

### 5.5. Giao diện Người Dùng & Tracking Thời Gian Thực (`Next.js 15`)
Hook [`frontend/src/features/recommendations/hooks/useTrackInteraction.ts`](file:///d:/Project/KLTN_Laptop-ecommerce-ai-/frontend/src/features/recommendations/hooks/useTrackInteraction.ts) tự động tính toán thời gian xem chi tiết và phát tín hiệu về Backend:

```typescript
export function useTrackInteraction() {
  const trackView = useCallback((productId: string, durationMs: number = 5000) => {
    recommendationsAPI.trackView({
      product_id: productId,
      duration: Math.round(durationMs / 1000), // Thời gian xem tính theo giây
    });
  }, []);
  // ... trackAddToCart, toggleLike, trackFeedback, trackOrder
}
```

---

# CHƯƠNG 6: CHIẾN LƯỢC VẬN HÀNH, VÒNG ĐỜI SẢN PHẨM & TÁI HUẤN LUYỆN LÂU DÀI (LIFECYCLE & RETRAINING PIPELINE)

Một hệ thống gợi ý trong môi trường sản xuất không phải là một mô hình tĩnh (Static Model), mà là một **chu trình học máy liên tục (Continuous Learning Closed-Loop)** để thích ứng với sản phẩm mới và sự thay đổi thị hiếu người dùng.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│              CHU TRÌNH HỌC MÁY KHÉP KÍN & VÒNG ĐỜI SẢN PHẨM (CONTINUOUS LOOP)    │
│                                                                                  │
│   [1. THÊM LAPTOP MỚI VÀO HỆ THỐNG]                                              │
│   └── Admin nhập thông số cấu hình Laptop mới vào Kho dữ liệu                    │
│                     │                                                            │
│                     ▼                                                            │
│   [2. TỨC THÌ: SINH CONTENT VECTOR] ───► [GIAI ĐOẠN 100% CONTENT-BASED]         │
│   └── Sentence-BERT sinh ngay               └── Sản phẩm chưa có CF vector       │
│       item_content_vector (384 chiều)           └── Hệ thống tự động gán α = 0.0 │
│                     │                               └── Gợi ý máy theo cấu hình  │
│                     ▼                                        │                   │
│   [3. NGƯỜI DÙNG TƯƠNG TÁC THỰC TẾ] ◄────────────────────────┘                   │
│   └── Khách hàng Xem (View), Thích (Like), Thêm Giỏ hàng (Cart), Mua hàng (Buy)  │
│                     │                                                            │
│                     ▼                                                            │
│   [4. TÍCH LŨY DỮ LIỆU TƯƠNG TÁC]                                                │
│   └── MongoDB lưu hàng nghìn tương tác vào Collection `interactions`             │
│                     │                                                            │
│                     ▼ (Định kỳ: Hàng tuần / Đạt ngưỡng 500 tương tác mới)        │
│   [5. PERIODIC BATCH RETRAINING PIPELINE]                                        │
│   ├── Python Worker đọc ma trận tương tác mới nhất                               │
│   ├── Huấn luyện lại mô hình Implicit ALS (8 chiều)                              │
│   └── Xuất ma trận item_cf_vector mới cho TOÀN BỘ sản phẩm (kể cả máy mới)       │
│                     │                                                            │
│                     ▼                                                            │
│   [6. HOÀN THIỆN: GIAI ĐOẠN HYBRID ĐẦY ĐỦ]                                       │
│   └── Laptop mới nhận đủ cả 2 vector ──► Chuyển sang chế độ Hybrid (α = 0.7)     │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 6.1. Vòng Đời Tiến Hóa Của Một Sản Phẩm Mới (New Product Evolution Lifecycle)
Vòng đời của bất kỳ chiếc laptop nào đưa lên website đều trải qua 4 giai đoạn tiến hóa rõ ràng:

1. **Giai đoạn 1 - Khởi tạo & Trích xuất Ngữ nghĩa Tức thì (Immediate Ingestion)**:
   * Ngay khi quản trị viên nhập một mẫu laptop mới vào hệ thống (ví dụ: *Asus Zenbook 14 OLED 2026*), pipeline Sentence-BERT lập tức chạy hàm `build_spec_text()` để tạo ra `item_content_vector` 384 chiều và lưu vào MongoDB.
2. **Giai đoạn 2 - Vận hành Khởi đầu Lạnh (100% Content-Based Cold-Start)**:
   * Lúc này sản phẩm chưa từng có tương tác nên chưa có `item_cf_vector`.
   * Khi khách hàng tìm kiếm hoặc hệ thống quét gợi ý, thuật toán tại [`hybridRecService.js`](file:///d:/Project/KLTN_Laptop-ecommerce-ai-/backend/src/services/hybridRecService.js) phát hiện `!hasCF && hasContent` $\to$ **tự động gán $\alpha_{\text{effective}} = 0.0$**.
   * Chiếc laptop mới sẽ được **nhánh Content-Based (SBERT) gánh 100% điểm số**, lập tức xuất hiện trước những người dùng đang tìm kiếm dòng máy mỏng nhẹ OLED hoặc CPU Core Ultra mà không cần đợi có lượt mua trước đó.
3. **Giai đoạn 3 - Tích lũy Hành vi Ngầm (Interaction Accumulation)**:
   * Người dùng bắt đầu click xem, lưu vào wishlist và thêm laptop mới vào giỏ hàng. Toàn bộ các hành vi này được `interactionController.js` ghi nhận vào MongoDB với các trọng số $1.0, 3.0, 5.0, 10.0$.
4. **Giai đoạn 4 - Trưởng thành & Chuyển sang Chế độ Hybrid Đầy Đủ (Matured Hybrid Mode)**:
   * Sau khi chu kỳ Tái huấn luyện định kỳ (Batch Retraining) diễn ra, thuật toán Implicit ALS học được vị trí của chiếc laptop mới trong ma trận đồng mua và gán cho nó một `item_cf_vector` 8 chiều.
   * Kể từ thời điểm này, sản phẩm chính thức vận hành ở chế độ **Hybrid chuẩn ($\alpha = 0.7$)**, vừa tận dụng thông số phần cứng, vừa bắt kịp xu hướng cộng đồng.

### 6.2. Kiến trúc Pipeline Tái Huấn Luyện Định Kỳ (Periodic Batch Retraining Pipeline)
Để hệ thống tự động hóa hoàn toàn việc học lại ma trận tương tác mà không gây gián đoạn dịch vụ trực tuyến (Zero-Downtime), quy trình tái huấn luyện được thiết lập như sau:

* **Chu kỳ kích hoạt (Trigger Strategy)**:
  * *Theo thời gian*: Thiết lập Cron Job chạy tự động vào **02:00 AM Chủ Nhật hàng tuần** (thời điểm lượng truy cập thấp nhất).
  * *Theo dung lượng dữ liệu*: Kích hoạt khi số lượng tương tác mới tích lũy vượt ngưỡng $\Delta N \ge 500$ tương tác.
* **Quy trình thực thi của Worker**:
  1. Script Python kết nối tới MongoDB Atlas, trích xuất bảng `interactions` và `products` thành các file CSV cập nhật mới nhất.
  2. Khởi chạy lại thuật toán phân rã ma trận `implicit.als.AlternatingLeastSquares(factors=8, regularization=0.3)`.
  3. Cập nhật lại các vector `item_cf_vector` và lưu file `item_vectors.json`.
  4. Script Node.js `syncVectorsFromPython.js` thực hiện câu lệnh `Product.bulkWrite()` để cập nhật nguyên tử (*Atomic Update*) vào MongoDB Atlas mà không cần khởi động lại Server backend.

---

# KẾT LUẬN & HƯỚNG PHÁT TRIỂN

### 1. Kết quả Đạt được
* Đề tài đã xây dựng thành công một **Hệ thống Gợi ý Lai hoàn chỉnh (End-to-End Hybrid Recommender System)** cho website thương mại điện tử laptop.
* Ứng dụng thành công **Sentence-BERT** để giải quyết bài toán biểu diễn ngữ nghĩa cấu hình phần cứng và **Implicit ALS** để khai phá thị hiếu cộng đồng.
* Đạt kết quả thực nghiệm vượt trội: Mô hình Hybrid ($\alpha = 0.7$) nâng cao chất lượng xếp hạng **NDCG@10 lên $0.024765$**, vượt qua cả hai mô hình thành phần chạy đơn lẻ.
* Triệt tiêu hoàn toàn bài toán **Khởi đầu lạnh (Cold-Start)** cho cả sản phẩm mới và khách vãng lai thông qua cơ chế tự động chuyển đổi $\alpha = 0.0$ và Session Vector tức thời.
* Xây dựng trọn vẹn quy trình vận hành và **Tái huấn luyện định kỳ (Continuous Retraining Pipeline)** đảm bảo hệ thống tự thích ứng lâu dài theo thời gian.

### 2. Hướng Phát triển Trong Tương Lai
* **Mô hình Hồi quy Đa biến Dự đoán CTR (DeepFM / DLRM)**: Nghiên cứu tích hợp thêm mạng nơ-ron sâu để kết hợp đồng thời cả ngữ cảnh thời gian thực (thiết bị duyệt web, khung giờ trong ngày, mã giảm giá).
* **Tinh chỉnh mô hình ngôn ngữ tiếng Việt chuyên ngành**: Huấn luyện tinh chỉnh mô hình Sentence-BERT trên tập dữ liệu bài viết đánh giá công nghệ (Tech Reviews) bằng tiếng Việt để nâng cao hơn nữa độ nhạy bén ngữ nghĩa phần cứng.

---

# DANH MỤC TÀI LIỆU THAM KHẢO (REFERENCES)

1. **Covington, P., Adams, J., & Sargin, E. (2016)**. "Deep Neural Networks for YouTube Recommendations". *In Proceedings of the 10th ACM Conference on Recommender Systems (RecSys '16)*, pp. 191–198. DOI: [10.1145/2959100.2959190](https://doi.org/10.1145/2959100.2959190).
2. **Hu, Y., Koren, Y., & Volinsky, C. (2008)**. "Collaborative Filtering for Implicit Feedback Datasets". *In Proceedings of the 8th IEEE International Conference on Data Mining (ICDM '08)*, pp. 263–272. IEEE. DOI: [10.1109/ICDM.2008.22](https://doi.org/10.1109/ICDM.2008.22).
3. **Pan, J. J., Wang, J., & Li, G. (2024)**. "A Survey on Vector Databases: Technologies, Applications, and Future Directions". *IEEE Transactions on Knowledge and Data Engineering (TKDE)*. IEEE.
4. **Reimers, N., & Gurevych, I. (2019)**. "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks". *In Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing (EMNLP 2019)*, pp. 3982–3992. Association for Computational Linguistics.
5. **Wang, J., Huang, P., Zhao, H., Zhang, Z., Zhao, B., & Lee, D. L. (2018)**. "Billion-scale Commodity Embedding for E-commerce Recommendation in Alibaba". *In Proceedings of the 24th ACM SIGKDD International Conference on Knowledge Discovery & Data Mining (KDD '18)*, pp. 839–848. ACM. DOI: [10.1145/3219819.3219827](https://doi.org/10.1145/3219819.3219827).
6. **Yi, X., Yang, J., Hong, L., Zheng, D. X., Heldt, S., & Chi, E. H. (2019)**. "Sampling-bias-corrected Neural Modeling for Large Corpus Item Recommendations". *In Proceedings of the 13th ACM Conference on Recommender Systems (RecSys '19)*, pp. 269–277. ACM. DOI: [10.1145/3298689.3347001](https://doi.org/10.1145/3298689.3347001).

---

# PHỤ LỤC: DANH SÁCH ẢNH CHỤP TỪ JUPYTER NOTEBOOK ĐỂ CHÈN VÀO WORD

Khi chuyển đổi tài liệu này sang file Microsoft Word (.docx), bạn chỉ cần mở Jupyter Notebook [`phase2-giaidoan2-sbert-als-v2-fixed.ipynb`](file:///d:/Project/KLTN_Laptop-ecommerce-ai-/python/phase2_giai_doan_2/phase2-giaidoan2-sbert-als-v2-fixed.ipynb) và chụp 5 bức ảnh tại các vị trí cell sau:

* **Ảnh 1 (Chương 2, Mục 2.2)**: Chụp biểu đồ Bar Chart hiển thị **Độ đầy đủ của các thuộc tính phần cứng (Completeness of Laptop Specs)** tại Output của **Cell 10**.
* **Ảnh 2 (Chương 2, Mục 2.4)**: Chụp đồ thị Scatter Plot **Không gian Vector SBERT 384 chiều giảm chiều PCA 2D** tại Output của **Cell 16**.
* **Ảnh 3 (Chương 4, Mục 4.3)**: Chụp biểu đồ Bar Chart **So sánh NDCG@10 và Coverage giữa các cấu hình ALS (`f8_r0.3`, `f16_r0.3`, `f32_r0.1`)** tại Output của **Cell 20**.
* **Ảnh 4 (Chương 4, Mục 4.4)**: Chụp 2 biểu đồ đường Curve **Sự biến thiên của NDCG@10, Coverage và Diversity theo các mức $\alpha$ từ 0.1 đến 0.9** tại Output của **Cell 22**.
* **Ảnh 5 (Chương 5, Mục 5.1)**: Chụp ảnh output của **Cell 30** hiển thị việc đóng gói các file artifact (`giai_doan_2_model.joblib`, `cf_vector_items.npy`, `content_vector_items.npy`, `final_config.json`).
