Laptop E-commerce Backend API

Đây là hệ thống Backend API cho website thương mại điện tử bán laptop, có tích hợp gợi ý sản phẩm và chatbot bằng AI.
<!--  -->
Các tính năng chính

- Đăng nhập/Đăng ký & phân quyền: sử dụng JWT để quản lý tài khoản.

- Quản lý sản phẩm: thêm, sửa, xóa, lấy danh sách laptop.

- Giỏ hàng: thêm/xóa sản phẩm, cập nhật số lượng.

- Đơn hàng: tạo đơn, theo dõi trạng thái.

- Recommendation Sytem: gợi ý sản phẩm .

- Chatbot : API key + RAG + Langchain

- Người dùng: quản lý thông tin cá nhân.
<!--  -->
 Môi trường yêu cầu

Node.js >= 18

MongoDB

⚙️ Cài đặt và chạy

Clone repo và cài đặt thư viện:

cd backend
npm install
<!--  -->

Tạo file .env (dựa trên .env.example) rồi thêm cấu hình:

PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/laptop-ecommerce
JWT_SECRET=...
OPENAI_API_KEY=key-openai
CORS_ORIGIN=http://localhost:3000
<!--  -->

Khởi động server:

npm run dev   # chế độ dev
npm start     # chế độ production
<!--  -->
Danh sách API
Người dùng

POST /api/v1/users/register → Đăng ký

POST /api/v1/users/login → Đăng nhập

GET /api/v1/users/profile → Lấy thông tin cá nhân

PUT /api/v1/users/profile → Cập nhật thông tin
<!--  -->
Sản phẩm

GET /api/v1/products → Danh sách sản phẩm

GET /api/v1/products/:id → Chi tiết sản phẩm

POST /api/v1/products → Thêm mới (cần đăng nhập)

PUT /api/v1/products/:id → Sửa sản phẩm (cần đăng nhập)

DELETE /api/v1/products/:id → Xóa sản phẩm (cần đăng nhập)
<!--  -->
Giỏ hàng

GET /api/v1/cart → Xem giỏ hàng

POST /api/v1/cart/add → Thêm sản phẩm

PUT /api/v1/cart/items/:item_id → Đổi số lượng

DELETE /api/v1/cart/items/:item_id → Xóa 1 sản phẩm

<!--  -->
Đơn hàng

POST /api/v1/orders → Tạo đơn hàng

GET /api/v1/orders/my-orders → Danh sách đơn hàng của user

GET /api/v1/orders/:id → Chi tiết đơn hàng

PUT /api/v1/orders/:id/status → Cập nhật trạng thái (chỉ admin)
<!--  -->
Database Models

User – tài khoản người dùng

Product – thông tin laptop

Brand / Category / Color – thương hiệu, loại, màu sắc

Cart / CartItem – giỏ hàng và sản phẩm trong giỏ

Order / OrderItem – đơn hàng và chi tiết đơn

Review – đánh giá sản phẩm

Wishlist – danh sách yêu thích
<!--  -->
 Cơ chế đăng nhập

Dùng JWT token.

Sau khi đăng ký/đăng nhập → nhận token.

Gửi token qua header khi gọi API:

Authorization: Bearer <token>


Token hết hạn sau 7 ngày.
<!--  -->
Tính năng AI

Phân tích nhu cầu, đưa ra laptop phù hợp. Sinh mô tả sản phẩm nhanh cho marketing.
Trả lời câu hỏi về sản phẩm dựa trên thông tin kỹ thuật.

<!--  -->

npm run dev – chạy dev bằng nodemon

npm start – chạy production

npm run seed – thêm dữ liệu mẫu

npm run build – build cho production

npm run lint – check code style
<!--  -->
 (HTTP Status)

400: dữ liệu sai

401: chưa đăng nhập / token sai

403: không đủ quyền

404: không tìm thấy dữ liệu

500: lỗi server
