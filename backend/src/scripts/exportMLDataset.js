import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import Color from '../models/Color.js';
import Interaction from '../models/Interaction.js';
import Feedback from '../models/Feedback.js';

dotenv.config();

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function exportMLDataset() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/laptop-ecommerce';
    await mongoose.connect(mongoUri);
    console.log('\n=============================================================');
    console.log('📦 BẮT ĐẦU XUẤT DATASET RA FILE PHỤC VỤ HUẤN LUYỆN HYBRID MODEL');
    console.log('=============================================================\n');

    // Đường dẫn thư mục đầu ra trong recommender/datasets
    const rootDir = path.resolve(process.cwd(), '..');
    const outputDir = path.join(rootDir, 'recommender', 'datasets');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 1. LẤY DỮ LIỆU TỪ MONGODB
    console.log('🔍 Đang trích xuất dữ liệu từ MongoDB...');
    const [users, products, interactions, feedbacks] = await Promise.all([
      User.find().lean(),
      Product.find().populate('brand_id', 'name').populate('category_id', 'name').lean(),
      Interaction.find().sort({ createdAt: 1 }).lean(),
      Feedback.find().lean()
    ]);

    console.log(`- Tìm thấy: ${users.length} Users, ${products.length} Products, ${interactions.length} Interactions, ${feedbacks.length} Feedbacks.`);

    if (interactions.length === 0) {
      console.warn('⚠️ Chưa có dữ liệu tương tác trong database. Vui lòng chạy "npm run dataset:generate" trước!');
      return;
    }

    // Map tra cứu feedback theo user_id + product_id
    const feedbackMap = new Map();
    feedbacks.forEach(fb => {
      const key = `${fb.user_id?.toString()}_${fb.product_id?.toString()}`;
      feedbackMap.set(key, fb);
    });

    // 2. XUẤT FILE 1: item_features.csv
    console.log('📝 Đang tạo file item_features.csv...');
    const itemHeaders = [
      'product_id', 'id', 'name', 'brand', 'category', 'price',
      'cpu', 'gpu', 'ram', 'storage_type', 'storage_capacity',
      'display', 'has_embedding'
    ];
    const itemRows = [itemHeaders.join(',')];

    products.forEach(p => {
      const brandName = p.brand_id?.name || '';
      const categoryNames = Array.isArray(p.category_id) ? p.category_id.map(c => c.name).join(';') : (p.category_id?.name || '');
      const specs = p.specifications || {};
      const hasEmbedding = Array.isArray(p.embedding) && p.embedding.length > 0 ? 1 : 0;

      const row = [
        escapeCsv(p._id.toString()),
        p.id || 0,
        escapeCsv(p.name || p.title || ''),
        escapeCsv(brandName),
        escapeCsv(categoryNames),
        p.price || 0,
        escapeCsv(specs.cpu || ''),
        escapeCsv(specs.gpu || specs.graphics || ''),
        escapeCsv(specs.ram || ''),
        escapeCsv(specs.storage_type || ''),
        escapeCsv(specs.storage_capacity || ''),
        escapeCsv(specs.display || ''),
        hasEmbedding
      ];
      itemRows.push(row.join(','));
    });

    fs.writeFileSync(path.join(outputDir, 'item_features.csv'), itemRows.join('\n'), 'utf8');

    // 3. XUẤT FILE 2: users.csv
    console.log('📝 Đang tạo file users.csv...');
    const userInterMap = new Map();
    interactions.forEach(i => {
      const uId = i.userId?.toString();
      if (!userInterMap.has(uId)) {
        userInterMap.set(uId, { count: 0, purchases: 0 });
      }
      const data = userInterMap.get(uId);
      data.count++;
      if (i.type === 'purchase') data.purchases++;
    });

    const userHeaders = ['user_id', 'name', 'email', 'address', 'total_interactions', 'total_purchases'];
    const userRows = [userHeaders.join(',')];

    users.forEach(u => {
      const stats = userInterMap.get(u._id.toString()) || { count: 0, purchases: 0 };
      const row = [
        escapeCsv(u._id.toString()),
        escapeCsv(u.name || ''),
        escapeCsv(u.email || ''),
        escapeCsv(u.address || ''),
        stats.count,
        stats.purchases
      ];
      userRows.push(row.join(','));
    });

    fs.writeFileSync(path.join(outputDir, 'users.csv'), userRows.join('\n'), 'utf8');

    // 4. XUẤT FILE 3: user_interactions.csv
    console.log('📝 Đang tạo file user_interactions.csv...');
    const interHeaders = [
      'interaction_id', 'user_id', 'product_id', 'session_id',
      'interaction_type', 'implicit_weight', 'duration_seconds',
      'rating_score', 'source', 'timestamp'
    ];
    const allInterRows = [interHeaders.join(',')];

    // Nhóm interactions theo từng User để thực hiện Temporal Split (Train / Test)
    const userInteractionGroups = new Map();

    interactions.forEach(inter => {
      const uId = inter.userId?.toString();
      const pId = inter.productId?.toString();
      const fb = feedbackMap.get(`${uId}_${pId}`);
      const ratingScore = inter.metadata?.rating_value || fb?.rating || '';
      const duration = inter.metadata?.duration || 0;
      const source = inter.metadata?.source || '';
      const sessionId = inter.metadata?.session_id || '';
      const timestamp = new Date(inter.createdAt).toISOString();

      const rowObj = {
        interaction_id: inter.interactionId || inter._id.toString(),
        user_id: uId,
        product_id: pId,
        session_id: sessionId,
        interaction_type: inter.type,
        implicit_weight: inter.weight,
        duration_seconds: duration,
        rating_score: ratingScore,
        source: source,
        timestamp: timestamp,
        createdAt: new Date(inter.createdAt)
      };

      const rowStr = [
        escapeCsv(rowObj.interaction_id),
        escapeCsv(rowObj.user_id),
        escapeCsv(rowObj.product_id),
        escapeCsv(rowObj.session_id),
        escapeCsv(rowObj.interaction_type),
        rowObj.implicit_weight,
        rowObj.duration_seconds,
        rowObj.rating_score,
        escapeCsv(rowObj.source),
        escapeCsv(rowObj.timestamp)
      ].join(',');

      allInterRows.push(rowStr);

      if (!userInteractionGroups.has(uId)) {
        userInteractionGroups.set(uId, []);
      }
      userInteractionGroups.get(uId).push(rowStr);
    });

    fs.writeFileSync(path.join(outputDir, 'user_interactions.csv'), allInterRows.join('\n'), 'utf8');

    // 5. CHIA TẬP TRAIN (80%) VÀ TEST (20%) THEO THỜI GIAN (TEMPORAL SPLIT)
    console.log('✂️ Đang chia tập Train / Test (80/20) theo Temporal Split...');
    const trainRows = [interHeaders.join(',')];
    const testRows = [interHeaders.join(',')];

    userInteractionGroups.forEach(rows => {
      const splitIdx = Math.floor(rows.length * 0.8);
      const userTrain = rows.slice(0, splitIdx);
      const userTest = rows.slice(splitIdx);

      trainRows.push(...userTrain);
      testRows.push(...userTest);
    });

    fs.writeFileSync(path.join(outputDir, 'train_interactions.csv'), trainRows.join('\n'), 'utf8');
    fs.writeFileSync(path.join(outputDir, 'test_interactions.csv'), testRows.join('\n'), 'utf8');

    // 6. XUẤT TỔNG KẾT DATASET SUMMARY (JSON)
    const uniqueUsersCount = userInteractionGroups.size;
    const uniqueProductsCount = new Set(interactions.map(i => i.productId?.toString())).size;
    const totalPossiblePairs = uniqueUsersCount * products.length;
    const sparsity = (1 - (interactions.length / totalPossiblePairs)) * 100;

    const summary = {
      exported_at: new Date().toISOString(),
      total_users: uniqueUsersCount,
      total_products: products.length,
      active_products_in_interactions: uniqueProductsCount,
      catalog_coverage_percentage: Number(((uniqueProductsCount / products.length) * 100).toFixed(2)),
      total_interactions: interactions.length,
      matrix_sparsity_percentage: Number(sparsity.toFixed(2)),
      train_interactions_count: trainRows.length - 1,
      test_interactions_count: testRows.length - 1,
      files_generated: [
        'user_interactions.csv',
        'train_interactions.csv',
        'test_interactions.csv',
        'users.csv',
        'item_features.csv',
        'dataset_summary.json'
      ]
    };

    fs.writeFileSync(path.join(outputDir, 'dataset_summary.json'), JSON.stringify(summary, null, 2), 'utf8');

    console.log('\n=============================================================');
    console.log('🎉 XUẤT DATASET THÀNH CÔNG! ĐÃ LƯU TẠI:');
    console.log(`📁 Đường dẫn: ${outputDir}`);
    console.log('=============================================================');
    console.log(`📊 Tổng tương tác:       ${summary.total_interactions} dòng`);
    console.log(`🚂 Tập Train (80%):       ${summary.train_interactions_count} dòng`);
    console.log(`🎯 Tập Test (20%):        ${summary.test_interactions_count} dòng`);
    console.log(`📉 Độ thưa ma trận:      ${summary.matrix_sparsity_percentage}% (Tối ưu cho Collaborative Filtering)`);
    console.log(`🌐 Độ phủ sản phẩm:      ${summary.catalog_coverage_percentage}%`);
    console.log('=============================================================\n');

  } catch (error) {
    console.error('❌ Lỗi khi xuất dataset:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB.');
  }
}

if (process.argv[1] && process.argv[1].endsWith('exportMLDataset.js')) {
  exportMLDataset();
}
