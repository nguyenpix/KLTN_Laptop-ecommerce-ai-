# Data Import Guide

Hướng dẫn sử dụng các script để tách và import dữ liệu từ `details.json` vào database.

## 📁 Cấu trúc dữ liệu

Sau khi chạy script `extractData.js`, các file dữ liệu sẽ được tạo trong thư mục `src/data/`:

- `colors.json` - Danh sách màu sắc (13 items)
- `brands.json` - Danh sách thương hiệu (9 items)  
- `categories.json` - Danh sách danh mục (5 items)
- `products.json` - Danh sách sản phẩm (398 items)
- `productSpecifications.json` - Thông số kỹ thuật sản phẩm (398 items)

## 🚀 Các bước thực hiện

### 1. Tách dữ liệu từ details.json

```bash
cd backend
node src/scripts/extractData.js
```

Script này sẽ:
- Đọc file `src/details.json`
- Tách dữ liệu thành các file JSON riêng biệt
- Tạo thư mục `src/data/` nếu chưa có
- Xử lý các trường graphics (Graphics, GPU, graphics)
- Tạo các mối quan hệ giữa các bảng

### 2. Validate dữ liệu

```bash
node src/scripts/validateData.js
```

Script này sẽ kiểm tra:
- Tính hợp lệ của dữ liệu
- Các tham chiếu giữa các bảng
- Các trường bắt buộc
- Tránh trùng lặp

### 3. Import vào database

```bash
node src/scripts/importData.js
```

Script này sẽ:
- Kết nối đến MongoDB
- Xóa dữ liệu cũ (nếu có)
- Import dữ liệu mới theo thứ tự:
  1. Colors
  2. Brands  
  3. Categories
  4. Products

## 📊 Thống kê dữ liệu

- **Colors**: 13 màu sắc (Đen, Trắng, Xám, Xanh, Đen ánh bạc, v.v.)
- **Brands**: 9 thương hiệu (Acer, MSI, Asus, HP, Lenovo, v.v.)
- **Categories**: 5 danh mục (Gaming, Business, Student, Creative, Ultrabook)
- **Products**: 398 sản phẩm laptop
- **ProductSpecifications**: 398 bộ thông số kỹ thuật
- **Graphics**: 204 sản phẩm có card đồ họa rời

## ⚙️ Cấu trúc ProductSpecification

Mỗi ProductSpecification bao gồm:

```json
{
  "id": 1,
  "product_id": 1,
  "cpu": "Intel® Core™ i5-13420H",
  "gpu": "GeForce RTX™ 3050 6GB GDDR6",
  "graphics": "GeForce RTX™ 3050 6GB GDDR6",
  "ram": "1 x 16GB 5200MHz DDR5",
  "storage": "512GB SSD M.2 NVMe",
  "display": "15.6\" Full HD (1920 x 1080) IPS, 180Hz, 300 nits, Acer ComfyView, 100% sRGB",
  "battery": null,
  "os": "Windows 11 Home SL",
  "features": "Bàn phím thường, HD webcam, Acer Purified Voice; Acer TrueHarmony, Non-EVO",
  "npu": null
}
```

## 🔧 Xử lý trường Graphics

Script đã được cập nhật để xử lý các trường graphics khác nhau trong file gốc:
- `Graphics` (viết hoa)
- `GPU` (viết hoa)  
- `graphics` (viết thường)

Tất cả đều được map vào trường `graphics` và `gpu` trong ProductSpecification.

## ⚠️ Lưu ý

1. **Backup dữ liệu**: Trước khi import, hãy backup dữ liệu hiện tại
2. **Thứ tự import**: Phải import theo đúng thứ tự để tránh lỗi foreign key
3. **Môi trường**: Đảm bảo MongoDB đang chạy và kết nối đúng
4. **Validation**: Luôn chạy validation trước khi import

## 🐛 Troubleshooting

### Lỗi kết nối MongoDB
- Kiểm tra MongoDB có đang chạy không
- Kiểm tra connection string trong `config/mongodb.js`

### Lỗi validation
- Kiểm tra file `details.json` có đúng format không
- Chạy lại script `extractData.js`

### Lỗi import
- Kiểm tra log để xem lỗi cụ thể
- Đảm bảo đã chạy validation thành công
