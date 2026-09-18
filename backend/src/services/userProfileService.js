import mongoose from 'mongoose';
import Interaction from '../models/Interaction.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import Color from '../models/Color.js';
import { 
  weightedVectorAverage, 
  l2Normalize, 
  calculateTimeDecay 
} from '../utils/vectorUtils.js';

/**
 * USER PROFILE SERVICE
 * Chuyên trách phân tích hành vi ngầm (Implicit Feedback) và tạo Profile Vector cho người dùng
 * Hỗ trợ 2 nhánh:
 *  - User CF Vector: Từ các item_cf_vector (ALS)
 *  - User Content Vector: Từ các item_content_vector (SBERT 384 chiều)
 */

// Bảng trọng số chuẩn cho các hành vi phản hồi ngầm (Implicit Feedback Weights)
export const INTERACTION_WEIGHTS = {
  purchase: 10.0,       // Mua hàng (tín hiệu mạnh nhất)
  rating_high: 8.0,     // Đánh giá 4-5 sao
  add_to_cart: 5.0,     // Thêm vào giỏ hàng (ý định mua cao)
  like: 3.0,            // Yêu thích / wishlist
  search_click: 2.0,    // Click từ kết quả tìm kiếm / bộ lọc
  view: 1.0,            // Xem chi tiết sản phẩm
  rating_low: 0.5,      // Đánh giá 1-2 sao
  remove_from_cart: 0.0 // Bỏ giỏ hàng (không tính điểm dương)
};

class UserProfileService {
  /**
   * Tính toán điểm trọng số cho một sự kiện tương tác
   * Kết hợp loại hành vi (action type) + thời gian xem (duration) + suy giảm thời gian (time-decay)
   */
  getInteractionWeight(interaction) {
    const type = interaction.type || 'view';
    let baseWeight = INTERACTION_WEIGHTS[type] !== undefined 
      ? INTERACTION_WEIGHTS[type] 
      : (interaction.weight || 1.0);

    // Điều chỉnh nếu là rating (sao)
    if (type === 'rating' && interaction.metadata?.rating_value) {
      baseWeight = interaction.metadata.rating_value >= 4 
        ? INTERACTION_WEIGHTS.rating_high 
        : INTERACTION_WEIGHTS.rating_low;
    }

    // Nếu là view nhưng thời gian xem lâu (> 60s), tăng nhẹ trọng số
    if (type === 'view' && interaction.metadata?.duration) {
      const duration = Number(interaction.metadata.duration);
      if (duration > 60) baseWeight = 1.5;
      if (duration > 120) baseWeight = 2.0;
    }

    // Áp dụng Time-Decay (chu kỳ bán rã 30 ngày)
    const timestamp = interaction.createdAt || interaction.updatedAt || Date.now();
    const decay = calculateTimeDecay(timestamp, 30);

    return baseWeight * decay;
  }

  /**
   * Tính toán Profile Vector và sở thích cho một User
   * @param {string|mongoose.Types.ObjectId} userId - ID người dùng
   * @param {Object} options
   * @param {boolean} options.saveToDb - Có lưu kết quả vào User model không (mặc định: true)
   * @param {number} options.maxInteractions - Giới hạn số lượng tương tác phân tích (mặc định: 100)
   * @returns {Promise<Object>} Profile kết quả
   */
  async calculateUserProfile(userId, options = {}) {
    const { saveToDb = true, maxInteractions = 100 } = options;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return this._getDefaultColdStartProfile(userId);
    }

    const uId = new mongoose.Types.ObjectId(userId);

    // 1. Lấy danh sách tương tác gần nhất của User
    const interactions = await Interaction.find({ userId: uId })
      .sort({ createdAt: -1 })
      .limit(maxInteractions)
      .lean();

    // 2. Nếu User chưa có tương tác -> Cold-Start User
    if (!interactions || interactions.length === 0) {
      return this._getDefaultColdStartProfile(userId);
    }

    // 3. Lấy danh sách Product IDs độc nhất từ interactions
    const productIds = [...new Set(interactions.map(i => i.productId?.toString()).filter(Boolean))];
    
    // Truy vấn thông tin sản phẩm và các vector
    const products = await Product.find({ _id: { $in: productIds } })
      .select('_id name title price brand_id category_id item_cf_vector item_content_vector')
      .populate('brand_id', 'name')
      .populate('category_id', 'name')
      .lean();

    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    // 4. Tổng hợp danh sách vector và trọng số
    const cfVectors = [];
    const cfWeights = [];
    const contentVectors = [];
    const contentWeights = [];

    const brandCounts = {};
    const categoryCounts = {};
    const prices = [];

    for (const inter of interactions) {
      const pId = inter.productId?.toString();
      const product = productMap.get(pId);
      if (!product) continue;

      const w = this.getInteractionWeight(inter);
      if (w <= 0) continue;

      // Nhánh CF Vector (ALS)
      if (product.item_cf_vector && Array.isArray(product.item_cf_vector) && product.item_cf_vector.length > 0) {
        cfVectors.push(product.item_cf_vector);
        cfWeights.push(w);
      }

      // Nhánh Content Vector (SBERT 384-dim)
      const contentVec = product.item_content_vector;
      if (contentVec && Array.isArray(contentVec) && contentVec.length > 0) {
        contentVectors.push(contentVec);
        contentWeights.push(w);
      }

      // Thống kê thị hiếu
      if (product.brand_id?.name) {
        brandCounts[product.brand_id.name] = (brandCounts[product.brand_id.name] || 0) + w;
      }
      if (product.category_id && Array.isArray(product.category_id)) {
        product.category_id.forEach(cat => {
          if (cat?.name) categoryCounts[cat.name] = (categoryCounts[cat.name] || 0) + w;
        });
      }
      if (product.price && typeof product.price === 'number') {
        prices.push(product.price);
      }
    }

    // 5. Tính toán Vector đại diện trung bình có trọng số + Chuẩn hóa L2
    const userCfVector = cfVectors.length > 0 
      ? weightedVectorAverage(cfVectors, cfWeights, true) 
      : null;

    const userContentVector = contentVectors.length > 0 
      ? weightedVectorAverage(contentVectors, contentWeights, true) 
      : null;

    // 6. Tính toán sở thích tóm tắt (Preferences Summary)
    const topBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([brand]) => brand);

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    const priceAffinity = prices.length > 0 ? {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    } : { min: 0, max: 0, avg: 0 };

    const profileData = {
      userId: userId.toString(),
      user_cf_vector: userCfVector,
      user_content_vector: userContentVector,
      isColdStart: !userCfVector && !userContentVector,
      totalInteractions: interactions.length,
      preferences: {
        top_brands: topBrands,
        top_categories: topCategories,
        price_affinity: priceAffinity,
        total_interactions: interactions.length,
        last_calculated_at: new Date()
      }
    };

    // 7. Cập nhật cache vào User Collection nếu được yêu cầu
    if (saveToDb && (!profileData.isColdStart)) {
      try {
        await User.findByIdAndUpdate(uId, {
          user_cf_vector: userCfVector,
          user_content_vector: userContentVector,
          profile_preferences: profileData.preferences
        });
      } catch (err) {
        console.warn(`Could not save user profile to DB for ${userId}:`, err.message);
      }
    }

    return profileData;
  }

  /**
   * Tính Session Vector nhanh chóng cho khách vãng lai (Guest) hoặc người dùng mới (Cold-Start)
   * dựa trên danh sách các sản phẩm vừa click/xem trong phiên hiện tại.
   * Giải quyết bài toán Cold-Start ngay từ cú click đầu tiên!
   * @param {Array<{productId: string, weight?: number}>|string[]} sessionItems
   * @returns {Promise<Object>} Session Profile
   */
  async calculateSessionProfile(sessionItems) {
    if (!sessionItems || !Array.isArray(sessionItems) || sessionItems.length === 0) {
      return this._getDefaultColdStartProfile('guest');
    }

    const items = sessionItems.map(item => {
      if (typeof item === 'string') return { productId: item, weight: 1.0 };
      return { productId: item.productId || item._id, weight: item.weight || 1.0 };
    }).filter(i => i.productId && mongoose.Types.ObjectId.isValid(i.productId));

    if (items.length === 0) {
      return this._getDefaultColdStartProfile('guest');
    }

    const pIds = items.map(i => new mongoose.Types.ObjectId(i.productId));
    const products = await Product.find({ _id: { $in: pIds } })
      .select('_id name title price brand_id category_id item_cf_vector item_content_vector')
      .populate('brand_id', 'name')
      .lean();

    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    const cfVectors = [];
    const cfWeights = [];
    const contentVectors = [];
    const contentWeights = [];
    const brandCounts = {};
    const prices = [];

    for (const item of items) {
      const p = productMap.get(item.productId.toString());
      if (!p) continue;

      const w = item.weight || 1.0;

      if (p.item_cf_vector && p.item_cf_vector.length > 0) {
        cfVectors.push(p.item_cf_vector);
        cfWeights.push(w);
      }

      const cVec = p.item_content_vector;
      if (cVec && cVec.length > 0) {
        contentVectors.push(cVec);
        contentWeights.push(w);
      }

      if (p.brand_id?.name) {
        brandCounts[p.brand_id.name] = (brandCounts[p.brand_id.name] || 0) + w;
      }
      if (p.price) prices.push(p.price);
    }

    const sessionCfVector = cfVectors.length > 0 ? weightedVectorAverage(cfVectors, cfWeights, true) : null;
    const sessionContentVector = contentVectors.length > 0 ? weightedVectorAverage(contentVectors, contentWeights, true) : null;

    return {
      userId: 'guest_session',
      user_cf_vector: sessionCfVector,
      user_content_vector: sessionContentVector,
      isColdStart: !sessionCfVector && !sessionContentVector,
      totalInteractions: items.length,
      preferences: {
        top_brands: Object.keys(brandCounts),
        price_affinity: prices.length > 0 ? {
          min: Math.min(...prices),
          max: Math.max(...prices),
          avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        } : { min: 0, max: 0, avg: 0 },
        last_calculated_at: new Date()
      }
    };
  }

  /**
   * Trả về profile mặc định cho Cold-Start User chưa có bất kỳ tương tác nào
   */
  _getDefaultColdStartProfile(userId) {
    return {
      userId: userId ? userId.toString() : 'cold_user',
      user_cf_vector: null,
      user_content_vector: null,
      isColdStart: true,
      totalInteractions: 0,
      preferences: {
        top_brands: [],
        top_categories: [],
        price_affinity: { min: 0, max: 0, avg: 0 },
        last_calculated_at: new Date()
      }
    };
  }
}

export default new UserProfileService();
