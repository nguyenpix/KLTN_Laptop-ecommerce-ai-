import fs from 'fs';
import path from 'path';

// Định nghĩa đường dẫn tới file dữ liệu
const dataDir = path.join(process.cwd(), 'src', 'data');
const sourcePath = path.join(dataDir, 'productsWithFaqs.json');
const finalPath = path.join(dataDir, 'finalProductsCleaned.json');

try {
  // Đọc file JSON
  const productsData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

  // Lọc và xóa các trường createdAt và updatedAt
  const cleanedProducts = productsData.map(product => {
    // Tạo một bản sao của đối tượng để tránh thay đổi trực tiếp dữ liệu gốc
    const newProduct = { ...product };
    
    // Xóa các trường thời gian
    delete newProduct.createdAt;
    delete newProduct.updatedAt;
    
    // Xóa các trường thời gian bên trong specifications nếu có
    if (newProduct.specifications) {
      delete newProduct.specifications.createdAt;
      delete newProduct.specifications.updatedAt;
    }

    return newProduct;
  });

  // Ghi dữ liệu đã được làm sạch vào một file mới
  fs.writeFileSync(finalPath, JSON.stringify(cleanedProducts, null, 2), 'utf8');

  console.log('✅ Đã làm sạch dữ liệu thành công!');
  console.log(`📁 Số lượng sản phẩm đã xử lý: ${cleanedProducts.length} items`);
  console.log(`📂 File được lưu tại: ${finalPath}`);

} catch (error) {
  console.error('❌ Đã xảy ra lỗi khi xử lý dữ liệu:', error);
}