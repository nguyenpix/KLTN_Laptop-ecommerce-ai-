import fs from 'fs';
import path from 'path';

// Định nghĩa đường dẫn tới các file dữ liệu
const dataDir = path.join(process.cwd(), 'src', 'data');
const productsPath = path.join(dataDir, 'products.json');
const productSpecificationsPath = path.join(dataDir, 'productSpecifications.json');
try {
  // Đọc các file JSON
  const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  const specificationsData = JSON.parse(fs.readFileSync(productSpecificationsPath, 'utf8'));

  // Tạo một Map để tra cứu thông số kỹ thuật nhanh chóng
  const specificationsMap = new Map(specificationsData.map(spec => [spec.product_id, spec]));

  // Gộp dữ liệu
  const mergedProducts = productsData.map(product => {
    // Tìm thông số kỹ thuật tương ứng
    const spec = specificationsMap.get(product.id);

    // Xử lý images
    const mainImg = product.images.length > 0 ? { url: product.images[0], alt_text: "Image-main" } : {};
    const sliderImg = product.images.slice(1).map(url => ({ url, alt_text:"Image-slider" }));

    const createdBy = new mongoose.Types.ObjectId(); // Giả lập user tạo

    // Gộp và định dạng lại dữ liệu
    return {
      name: product.title,
      description: product.description,
      price: product.price,
      images: {
        mainImg,
        sliderImg
      },
      specifications: {
        cpu: spec.cpu,
        gpu: spec.gpu,
        graphics: spec.graphics,
        ram: spec.ram,
        storage: spec.storage,
        display: spec.display,
        battery: spec.battery || null,
        os: spec.os || null,
        features: spec.features || null,
        npu: spec.npu || null
      },
      created_by: createdBy,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  });

  // Lưu file JSON mới
  const newProductsPath = path.join(dataDir, 'mergedProducts.json');
  fs.writeFileSync(newProductsPath, JSON.stringify(mergedProducts, null, 2), 'utf8');

  console.log('✅ Đã gộp dữ liệu thành công!');
  console.log(`📁 Số lượng sản phẩm mới: ${mergedProducts.length} items`);
  console.log(`📂 File được lưu tại: ${newProductsPath}`);

} catch (error) {
  console.error('❌ Đã xảy ra lỗi khi gộp dữ liệu:', error);
}