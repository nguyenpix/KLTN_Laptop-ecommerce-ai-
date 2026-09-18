import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Product from '../models/Product.js';

dotenv.config();

/**
 * UTILITY SCRIPT: SYNC VECTORS FROM PYTHON TO MONGODB ATLAS
 * 
 * Script này dùng để nạp 2 vector từ quá trình huấn luyện Python:
 *  1. item_cf_vector (từ thuật toán Implicit ALS)
 *  2. item_content_vector (từ Sentence-BERT 384 chiều)
 * 
 * Cách dùng:
 *  - Đặt file `item_vectors.json` vào thư mục `backend/src/data/` hoặc `recommender/datasets/`
 *  - Chạy lệnh: `node src/scripts/syncVectorsFromPython.js`
 * 
 * Cấu trúc file JSON mong đợi:
 *  [
 *    {
 *      "product_id": "68c5583b9869e837e80ce976", // hoặc "id": 1
 *      "item_cf_vector": [0.123, -0.456, ...],
 *      "item_content_vector": [0.012, 0.987, ...]
 *    },
 *    ...
 *  ]
 */

async function syncVectors() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }

  console.log('🔗 Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);

  // Tìm kiếm các vị trí file vector khả dĩ
  const possiblePaths = [
    path.resolve(process.cwd(), 'src/data/item_vectors.json'),
    path.resolve(process.cwd(), '../recommender/datasets/item_vectors.json'),
    path.resolve(process.cwd(), '../ai-service/weights/item_vectors.json'),
    path.resolve(process.cwd(), 'item_vectors.json')
  ];

  let filePath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      filePath = p;
      break;
    }
  }

  if (!filePath) {
    console.log('\n⚠️ Chưa tìm thấy file item_vectors.json tại các vị trí mặc định:');
    possiblePaths.forEach(p => console.log(`   - ${p}`));
    console.log('\n💡 HƯỚNG DẪN DÀNH CHO BẠN KHI NHẬN ĐƯỢC FILE TỪ PYTHON:');
    console.log('1. Lưu file xuất ra từ Python thành `src/data/item_vectors.json`');
    console.log('2. Chạy lại script này: `node src/scripts/syncVectorsFromPython.js`');
    console.log('\nKiểm tra trạng thái sản phẩm hiện tại trong MongoDB:');
    
    const total = await Product.countDocuments();
    const withCF = await Product.countDocuments({ item_cf_vector: { $exists: true, $ne: [] } });
    const withContent = await Product.countDocuments({ item_content_vector: { $exists: true, $ne: [] } });
    
    console.log(`- Tổng số sản phẩm: ${total}`);
    console.log(`- Đã có item_cf_vector: ${withCF}/${total}`);
    console.log(`- Đã có item_content_vector: ${withContent}/${total}`);

    await mongoose.disconnect();
    return;
  }

  console.log(`📂 Đọc dữ liệu vector từ: ${filePath}`);
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const items = JSON.parse(rawData);

  console.log(`📦 Tìm thấy ${items.length} bản ghi vector cần cập nhật.`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const item of items) {
    const query = {};
    if (item.product_id && mongoose.Types.ObjectId.isValid(item.product_id)) {
      query._id = new mongoose.Types.ObjectId(item.product_id);
    } else if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
      query._id = new mongoose.Types.ObjectId(item.productId);
    } else if (item.id !== undefined) {
      query.id = item.id;
    } else {
      skippedCount++;
      continue;
    }

    const updateDoc = {};
    if (item.item_cf_vector && Array.isArray(item.item_cf_vector)) {
      updateDoc.item_cf_vector = item.item_cf_vector;
      updateDoc.cf_metadata = {
        model: 'implicit-als',
        dimensions: item.item_cf_vector.length,
        generated_at: new Date()
      };
    }

    if (item.item_content_vector && Array.isArray(item.item_content_vector)) {
      updateDoc.item_content_vector = item.item_content_vector;
      updateDoc.content_metadata = {
        model: 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
        dimensions: item.item_content_vector.length,
        generated_at: new Date()
      };
    }

    if (Object.keys(updateDoc).length > 0) {
      const res = await Product.updateOne(query, { 
        $set: updateDoc,
        $unset: { embedding: '', recommendation_metadata: '' }
      });
      if (res.matchedCount > 0) {
        updatedCount++;
      } else {
        skippedCount++;
      }
    }
  }

  console.log(`\n✅ HOÀN TẤT ĐỒNG BỘ:`);
  console.log(`- Đã cập nhật thành công: ${updatedCount} sản phẩm`);
  console.log(`- Bỏ qua / không tìm thấy: ${skippedCount} sản phẩm`);

  await mongoose.disconnect();
}

syncVectors().catch(err => {
  console.error('❌ Lỗi khi đồng bộ vector:', err);
  process.exit(1);
});
