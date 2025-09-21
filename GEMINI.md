# Tổng quan dự án

Đây là một dự án thương mại điện tử về laptop, với phần backend được xây dựng bằng Node.js và Express.js. Nó sử dụng MongoDB làm cơ sở dữ liệu và có tích hợp các tính năng AI. Dự án này có cấu trúc monorepo với các thư mục `backend`, `frontend` và `recommender`.

## Backend

### Tổng quan

Phần backend cung cấp các API cho website thương mại điện tử bán laptop, có tích hợp gợi ý sản phẩm và chatbot bằng AI. Nó xử lý các yêu cầu liên quan đến sản phẩm, người dùng, giỏ hàng, đơn hàng và tích hợp các tính năng AI.

### Tính năng chính

*   **Đăng nhập/Đăng ký & phân quyền**: Sử dụng JWT để quản lý tài khoản và phân quyền người dùng.
*   **Quản lý sản phẩm**: Thêm, sửa, xóa, lấy danh sách laptop.
*   **Giỏ hàng**: Thêm/xóa sản phẩm, cập nhật số lượng trong giỏ hàng.
*   **Đơn hàng**: Tạo đơn hàng, theo dõi trạng thái đơn hàng.
*   **Recommendation System**: Gợi ý sản phẩm dựa trên AI.
*   **Chatbot**: Tích hợp chatbot sử dụng API key, RAG (Retrieval-Augmented Generation) và Langchain để trả lời câu hỏi về sản phẩm.
*   **Người dùng**: Quản lý thông tin cá nhân của người dùng.

### Công nghệ chính

*   **Node.js**: Môi trường runtime JavaScript.
*   **Express.js**: Framework web cho Node.js.
*   **MongoDB**: Cơ sở dữ liệu NoSQL (sử dụng Mongoose ODM).
*   **Babel**: Trình biên dịch JavaScript để sử dụng các tính năng ES hiện đại.
*   **Nodemon**: Công cụ giúp tự động khởi động lại ứng dụng trong quá trình phát triển.
*   **Langchain, OpenAI**: Để tích hợp các tính năng trí tuệ nhân tạo.
*   **Bcryptjs**: Thư viện để mã hóa mật khẩu.
*   **JSON Web Token (JWT)**: Để xác thực người dùng.
*   **CORS**: Middleware để xử lý Cross-Origin Resource Sharing.
*   **Dotenv**: Để quản lý các biến môi trường.

### Cấu trúc thư mục

```
backend/
├───src/
│   ├───app.js                  // (Hiện tại trống hoặc không có mã quan trọng)
│   ├───server.js               // Điểm khởi đầu của ứng dụng Express, cấu hình server, kết nối DB
│   ├───config/                 // Chứa các tệp cấu hình cho ứng dụng (CORS, môi trường, MongoDB).
│   ├───controllers/            // Chứa logic xử lý yêu cầu cho các tài nguyên khác nhau (AI, giỏ hàng, đơn hàng, sản phẩm, người dùng).
│   ├───data/                   // Chứa dữ liệu tĩnh hoặc dữ liệu mẫu (thương hiệu, danh mục, màu sắc).
│   ├───middlewares/            // Chứa các middleware Express để xử lý xác thực, lỗi, v.v.
│   ├───models/                 // Định nghĩa schema MongoDB cho các đối tượng dữ liệu (Brand, Cart, Category, Product, User, v.v.).
│   ├───providers/              // (Hiện tại trống - có thể dùng cho các dịch vụ bên ngoài hoặc cung cấp dữ liệu).
│   ├───routes/                 // Định nghĩa các route API, được phân chia theo phiên bản (hiện tại là v1).
│   │   └───v1/
│   │       ├───aiRoutes.js
│   │       ├───cartRoutes.js
│   │       ├───exampleRoute.js
│   │       ├───index.js        // Tập hợp các route v1.
│   │       ├───orderRoutes.js
│   │       ├───productRoutes.js
│   │       └───userRoutes.js
│   ├───scripts/                // Chứa các script tiện ích cho các tác vụ như trích xuất dữ liệu, import dữ liệu, seed dữ liệu.
│   ├───services/               // Chứa logic nghiệp vụ phức tạp (ví dụ: aiService, exampleService).
│   ├───sockets/                // (Hiện tại trống - có thể dùng cho các tính năng real-time với WebSockets).
│   ├───utils/                  // Chứa các tiện ích chung, hàm trợ giúp (thuật toán, hằng số, sắp xếp).
│   └───validations/            // (Hiện tại trống - có thể dùng cho các quy tắc xác thực dữ liệu).
├───.babelrc                    // Cấu hình Babel.
├───.env.example                // Ví dụ về các biến môi trường cần thiết.
├───.eslintrc.cjs               // Cấu hình ESLint để kiểm tra lỗi cú pháp và tuân thủ quy tắc mã hóa.
├───.gitignore                  // Các tệp/thư mục bị Git bỏ qua.
├───jsconfig.json               // Cấu hình JavaScript cho VSCode để hỗ trợ IntelliSense.
├───package-lock.json           // Khóa dependencies để đảm bảo cài đặt nhất quán.
├───package.json                // Thông tin dự án, dependencies và scripts.
└───README.md                   // README của backend.
```

### Database Models

Các mô hình cơ sở dữ liệu chính được sử dụng, cùng với các trường và mối quan hệ quan trọng:

*   **User**: Tài khoản người dùng.
    *   `name`: Tên người dùng.
    *   `email`: Email (duy nhất).
    *   `password_hash`: Mật khẩu đã được băm (sử dụng `bcryptjs`).
    *   `phone`: Số điện thoại.
    *   `address`: Địa chỉ.
    *   `avatar_url`: URL ảnh đại diện.
    *   `created_at`, `updated_at`: Thời gian tạo và cập nhật.
    *   Bao gồm phương thức `comparePassword` để kiểm tra mật khẩu.
*   **Product**: Thông tin chi tiết về laptop.
    *   `id`: ID sản phẩm.
    *   `title`, `name`, `description`: Tiêu đề, tên và mô tả sản phẩm.
    *   `images`: Bao gồm `mainImg` (URL ảnh chính) và `sliderImg` (mảng các URL ảnh phụ).
    *   `price`: Giá sản phẩm.
    *   `color_id`: Tham chiếu đến `Color`.
    *   `brand_id`: Tham chiếu đến `Brand`.
    *   `specifications`: Đối tượng chứa các thông số kỹ thuật như `cpu`, `gpu`, `display`, `ram`, `storage`, `os`, `battery`, v.v.
    *   `faqs`: Mảng các câu hỏi thường gặp và trả lời.
    *   `sku`, `part_number`, `series`: Mã sản phẩm, số hiệu, dòng sản phẩm.
    *   `category_id`: Mảng các tham chiếu đến `Category`.
*   **Brand**: Thông tin về thương hiệu.
    *   `name`: Tên thương hiệu.
    *   `slug`: Slug của thương hiệu (duy nhất).
*   **Category**: Thông tin về danh mục sản phẩm.
    *   `name`: Tên danh mục.
    *   `parent_id`: Tham chiếu đến `Category` khác (cho phép danh mục con).
*   **Color**: Thông tin về màu sắc sản phẩm.
    *   `name`: Tên màu sắc.
    *   `hex`: Mã hex của màu sắc.
    *   `slug`: Slug của màu sắc (duy nhất).
*   **Cart**: Giỏ hàng của người dùng.
    *   `user_id`: Tham chiếu đến `User` (duy nhất cho mỗi người dùng).
*   **CartItem**: Các sản phẩm trong giỏ hàng.
    *   `cart_id`: Tham chiếu đến `Cart`.
    *   `laptop_id`: Tham chiếu đến `Product`.
    *   `quantity`: Số lượng sản phẩm.
    *   `price`: Giá tại thời điểm thêm vào giỏ hàng.
*   **Order**: Đơn hàng của người dùng.
    *   `user_id`: Tham chiếu đến `User`.
    *   `total_amount`: Tổng số tiền của đơn hàng.
    *   `status`: Trạng thái đơn hàng (`pending`, `confirmed`, `shipping`, `delivered`, `cancelled`).
    *   `shipping_address`: Địa chỉ giao hàng.
    *   `payment_method`: Phương thức thanh toán.
*   **OrderItem**: Chi tiết các mặt hàng trong đơn hàng.
    *   `order_id`: Tham chiếu đến `Order`.
    *   `laptop_id`: Tham chiếu đến `Product`.
    *   `quantity`: Số lượng sản phẩm.
    *   `price`: Giá tại thời điểm đặt hàng.
*   **Feedback**: Đánh giá sản phẩm.
    *   `user_id`: Tham chiếu đến `User`.
    *   `product_id`: Tham chiếu đến `Product`.
    *   `rating`: Điểm đánh giá (1-5).
    *   `comment`: Nội dung bình luận.
    *   `wishlist`: Boolean cho biết sản phẩm có trong danh sách yêu thích không.
*   **News**: Bài viết tin tức.
    *   `title`: Tiêu đề tin tức.
    *   `slug`: Slug của tin tức (duy nhất).
    *   `content`: Nội dung bài viết.
    *   `thumbnail_img`: URL ảnh thumbnail.
    *   `author_id`: Tham chiếu đến `User` (người đăng bài).
*   **ProductNews**: Liên kết sản phẩm với tin tức.
    *   `product_id`: Tham chiếu đến `Product`.
    *   `news_id`: Tham chiếu đến `News`.

### Cơ chế đăng nhập

Ứng dụng sử dụng JWT (JSON Web Token) để xác thực người dùng. Sau khi đăng ký hoặc đăng nhập thành công, người dùng sẽ nhận được một token. Token này cần được gửi trong header của các yêu cầu API (dưới dạng `Authorization: Bearer <token>`) để truy cập các tài nguyên được bảo vệ. Token có thời hạn 7 ngày.

### Tính năng AI

*   **Gợi ý sản phẩm**: Phân tích nhu cầu của người dùng và đưa ra các gợi ý laptop phù hợp.
*   **Sinh mô tả sản phẩm**: Tự động tạo mô tả sản phẩm nhanh chóng cho mục đích marketing.
*   **Chatbot**: Trả lời các câu hỏi về sản phẩm dựa trên thông tin kỹ thuật, sử dụng RAG và Langchain.

### Xây dựng và chạy

Để thiết lập và chạy phần backend:

1.  **Môi trường yêu cầu**:
    *   Node.js >= 18
    *   MongoDB
2.  **Clone repository và cài đặt thư viện**:
    ```bash
    cd backend
    npm install
    ```
3.  **Cấu hình biến môi trường**:
    Tạo một tệp `.env` trong thư mục `backend` dựa trên `.env.example` và điền các giá trị cần thiết:
    ```
    PORT=5000
    NODE_ENV=development
    MONGODB_URI=mongodb://localhost:27017/laptop-ecommerce
    JWT_SECRET=your_jwt_secret
    OPENAI_API_KEY=your_openai_api_key
    CORS_ORIGIN=http://localhost:3000
    ```
4.  **Khởi động server**:
    *   **Chế độ phát triển (Development)**: Sử dụng Nodemon để tự động khởi động lại server khi có thay đổi.
        ```bash
        npm run dev
        ```
    *   **Chế độ sản xuất (Production)**: Xây dựng mã và chạy server.
        ```bash
        npm run production
        ```
    *   **Chạy ứng dụng (thông thường)**:
        ```bash
        npm start
        ```
5.  **Seed dữ liệu (tùy chọn)**:
    Nếu bạn muốn điền dữ liệu mẫu vào cơ sở dữ liệu:
    ```bash
    npm run seed
    ```
6.  **Lint code**:
    Để kiểm tra lỗi cú pháp và tuân thủ quy tắc mã hóa:
    ```bash
    npm run lint
    ```

### API Endpoints

Khi server chạy, bạn có thể truy cập các endpoint API tại `/api/v1/...`. Dưới đây là một số ví dụ:

*   **Người dùng**:
    *   `POST /api/v1/users/register` → Đăng ký tài khoản.
    *   `POST /api/v1/users/login` → Đăng nhập và nhận JWT token.
    *   `GET /api/v1/users/profile` → Lấy thông tin cá nhân (cần xác thực).
    *   `PUT /api/v1/users/profile` → Cập nhật thông tin cá nhân (cần xác thực).
*   **Sản phẩm**:
    *   `GET /api/v1/products` → Danh sách sản phẩm.
    *   `GET /api/v1/products/:id` → Chi tiết sản phẩm theo ID.
    *   `POST /api/v1/products` → Thêm mới sản phẩm (cần đăng nhập và quyền admin).
    *   `PUT /api/v1/products/:id` → Sửa thông tin sản phẩm (cần đăng nhập và quyền admin).
    *   `DELETE /api/v1/products/:id` → Xóa sản phẩm (cần đăng nhập và quyền admin).
*   **Giỏ hàng**:
    *   `GET /api/v1/cart` → Xem giỏ hàng của người dùng (cần xác thực).
    *   `POST /api/v1/cart/add` → Thêm sản phẩm vào giỏ hàng (cần xác thực).
    *   `PUT /api/v1/cart/items/:item_id` → Cập nhật số lượng sản phẩm trong giỏ hàng (cần xác thực).
    *   `DELETE /api/v1/cart/items/:item_id` → Xóa một sản phẩm khỏi giỏ hàng (cần xác thực).
*   **Đơn hàng**:
    *   `POST /api/v1/orders` → Tạo đơn hàng mới (cần xác thực).
    *   `GET /api/v1/orders/my-orders` → Danh sách đơn hàng của người dùng hiện tại (cần xác thực).
    *   `GET /api/v1/orders/:id` → Chi tiết đơn hàng theo ID (cần xác thực).
    *   `PUT /api/v1/orders/:id/status` → Cập nhật trạng thái đơn hàng (chỉ admin).

### Mã trạng thái HTTP

*   `400 Bad Request`: Dữ liệu gửi lên không hợp lệ.
*   `401 Unauthorized`: Chưa đăng nhập hoặc token không hợp lệ/hết hạn.
*   `403 Forbidden`: Không đủ quyền để thực hiện hành động.
*   `404 Not Found`: Không tìm thấy tài nguyên yêu cầu.
*   `500 Internal Server Error`: Lỗi xảy ra ở phía server.

### Quản lý dữ liệu (Data Management)

Phần backend cung cấp các script để quản lý dữ liệu sản phẩm, bao gồm tách, xác thực và import dữ liệu vào MongoDB.

#### Cấu trúc dữ liệu

Sau khi chạy script `extractData.js`, các tệp dữ liệu JSON sau sẽ được tạo trong thư mục `backend/src/data/`:

*   `colors.json`: Danh sách màu sắc (ví dụ: 13 mục).
*   `brands.json`: Danh sách thương hiệu (ví dụ: 9 mục).
*   `categories.json`: Danh sách danh mục (ví dụ: 5 mục).
*   `products.json`: Danh sách sản phẩm (ví dụ: 398 mục).
*   `productSpecifications.json`: Thông số kỹ thuật chi tiết của sản phẩm (ví dụ: 398 mục).

#### Cấu trúc ProductSpecification

Mỗi `ProductSpecification` bao gồm các trường như `id`, `product_id`, `cpu`, `gpu`, `graphics`, `ram`, `storage`, `display`, `battery`, `os`, `features`, `npu`.

#### Các bước thực hiện

1.  **Tách dữ liệu từ `details.json`**:
    ```bash
    cd backend
    node src/scripts/extractData.js
    ```
    Script này đọc `src/details.json`, tách dữ liệu thành các tệp JSON riêng biệt, xử lý các trường liên quan đến đồ họa và tạo các mối quan hệ giữa các bảng.

2.  **Validate dữ liệu**:
    ```bash
    node src/scripts/validateData.js
    ```
    Script này kiểm tra tính hợp lệ của dữ liệu, các tham chiếu giữa các bảng, các trường bắt buộc và tránh trùng lặp.

3.  **Import vào database**:
    ```bash
    node src/scripts/importData.js
    ```
    Script này kết nối đến MongoDB, xóa dữ liệu cũ (nếu có) và import dữ liệu mới theo thứ tự: Colors, Brands, Categories, Products.

#### Lưu ý quan trọng

*   **Backup dữ liệu**: Luôn sao lưu dữ liệu hiện tại trước khi import.
*   **Thứ tự import**: Phải import dữ liệu theo đúng thứ tự để tránh lỗi khóa ngoại.
*   **Môi trường**: Đảm bảo MongoDB đang chạy và kết nối đúng.
*   **Validation**: Luôn chạy validation trước khi import.

#### Xử lý sự cố (Troubleshooting)

*   **Lỗi kết nối MongoDB**: Kiểm tra trạng thái MongoDB và chuỗi kết nối trong `config/mongodb.js`.
*   **Lỗi validation**: Kiểm tra định dạng của `details.json` và chạy lại `extractData.js`.
*   **Lỗi import**: Kiểm tra log để xem lỗi cụ thể.

## Frontend

### Tổng quan

Phần frontend là một ứng dụng web thương mại điện tử bán laptop, được xây dựng để cung cấp giao diện người dùng tương tác và hiện đại.

### Công nghệ chính

*   **Next.js 15**: Framework React để xây dựng ứng dụng web hiệu suất cao, hỗ trợ Server-Side Rendering (SSR) và Static Site Generation (SSG).
*   **TypeScript**: Ngôn ngữ lập trình có kiểu tĩnh, giúp tăng cường khả năng bảo trì và phát triển ứng dụng lớn.
*   **ShadCN UI**: Thư viện UI dựa trên Tailwind CSS, cung cấp các component có thể tùy chỉnh cao.
<!-- react query -->
*   **Tailwind CSS**: Framework CSS utility-first, giúp xây dựng giao diện nhanh chóng và linh hoạt.
*   **Zod + React Hook Form**: Để quản lý form và xác thực dữ liệu một cách mạnh mẽ và dễ dàng.
*   **Zustand + React Query**: Để quản lý trạng thái ứng dụng (Zustand) và quản lý dữ liệu server-side (React Query) hiệu quả.
*   **Multi language (Client Side)**: Hỗ trợ đa ngôn ngữ (tiếng Anh và tiếng Việt) với các tệp `en.json` và `vi.json`.

### Kiến trúc và Tính năng cơ bản

Phần frontend tuân theo kiến trúc FDD (Feature-Driven Development) với các tính năng cơ bản sau:

*   **Home**: Trang chủ của ứng dụng.
*   **Banner**: Các banner quảng cáo hoặc thông tin nổi bật.
*   **Footer**: Chân trang với các liên kết và thông tin bổ sung.
*   **Header**: Đầu trang với điều hướng, giỏ hàng, tìm kiếm, v.v.
*   **Product**: Trang hiển thị chi tiết sản phẩm, danh sách sản phẩm.
*   **Search**: Chức năng tìm kiếm sản phẩm.
*   **Profile**: Trang quản lý thông tin người dùng.

### Xây dựng và chạy

**TODO**: Khám phá thư mục `frontend` để cung cấp các lệnh cụ thể để cài đặt dependencies, chạy chế độ phát triển và xây dựng ứng dụng.

## Recommender

Thư mục `recommender` hiện đang trống. **TODO**: Khi phần recommender được phát triển, hãy cập nhật thông tin về công nghệ, cấu trúc và cách chạy tại đây.