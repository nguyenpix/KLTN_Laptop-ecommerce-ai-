import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import Color from '../models/Color.js';
import recommendationService from '../services/recommendationService.js';
import UserRecommendationProfile from '../models/UserProfile.js';

dotenv.config();

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

export async function testRecommendationQuality() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/laptop-ecommerce';
    await mongoose.connect(mongoUri);
    console.log('\n=============================================================');
    console.log('🧪 KIỂM TRA CHẤT LƯỢNG GỢI Ý CỦA HYBRID RECOMMENDATION SYSTEM');
    console.log('=============================================================\n');

    // Lấy 5 người dùng mẫu đại diện từ database
    const users = await User.find({ email: { $regex: /@simuser\.vn$/i } }).limit(5);

    if (users.length === 0) {
      console.warn('⚠️ Không tìm thấy user mô phỏng nào. Vui lòng chạy "npm run dataset:generate" trước!');
      return;
    }

    for (const user of users) {
      console.log('-------------------------------------------------------------');
      console.log(`👤 KIỂM TRA CHO USER: [${user.name}] (${user.email})`);

      // Lấy Profile hiện tại của user
      const profile = await UserRecommendationProfile.findOne({ userId: user._id });
      if (profile && profile.profile?.preferences) {
        const topBrands = Object.entries(profile.profile.preferences.brands || {})
          .sort(([, a], [, b]) => b - a).slice(0, 3).map(([k, v]) => `${k} (score: ${v})`).join(', ');
        const topGpu = Object.entries(profile.profile.preferences.gpu_specs || {})
          .sort(([, a], [, b]) => b - a).slice(0, 2).map(([k, v]) => `${k}`).join(', ');

        console.log(`   🎯 Top Brand quan tâm: ${topBrands || 'Chưa có'}`);
        console.log(`   🎮 Top GPU quan tâm:   ${topGpu || 'Chưa có'}`);
      }

      // Gọi Hybrid Recommendation
      try {
        const recommendations = await recommendationService.getRecommendations(user._id.toString(), {
          finalLimit: 5,
          candidateLimit: 30
        });

        console.log('\n   📋 TOP 5 GỢI Ý PHÙ HỢP NHẤT (HYBRID SCORE):');
        recommendations.forEach((rec, idx) => {
          const brand = rec.brand || rec.product?.brand_id?.name || 'N/A';
          const name = rec.name || rec.product?.name || rec.product?.title || 'N/A';
          const price = formatCurrency(rec.price || rec.product?.price);
          const finalScore = ((rec.final_score || 0) * 100).toFixed(1);
          const contentScore = ((rec.content_score || 0) * 100).toFixed(1);
          const collabScore = ((rec.collaborative_score || 0) * 100).toFixed(1);

          console.log(`   ${idx + 1}. [${brand}] ${name}`);
          console.log(`      💰 Giá: ${price} | ⭐ Final Score: ${finalScore}% (Content: ${contentScore}%, Collab: ${collabScore}%)`);
        });
      } catch (recErr) {
        console.error(`   ❌ Lỗi khi lấy gợi ý cho user ${user.name}:`, recErr.message);
      }
      console.log('\n');
    }

    console.log('=============================================================');
    console.log('✅ HOÀN TẤT KIỂM TRA CHẤT LƯỢNG HYBRID RECOMMENDATION!');
    console.log('=============================================================\n');

  } catch (error) {
    console.error('❌ Lỗi khi chạy test gợi ý:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB.');
  }
}

if (process.argv[1] && process.argv[1].endsWith('testRecommendationQuality.js')) {
  testRecommendationQuality();
}
