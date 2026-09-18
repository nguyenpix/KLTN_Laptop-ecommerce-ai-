import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import Color from '../models/Color.js';
import userProfileService from './userProfileService.js';
import { cosineSimilarity, minMaxScale } from '../utils/vectorUtils.js';

/**
 * HYBRID RECOMMENDATION SERVICE (ONLINE SERVING ENGINE)
 * Triển khai công thức Hybrid:
 *   Score_Final = (α * Score_CF) + ((1 - α) * Score_Content)
 * 
 * - α = 1.0 -> Thuần Collaborative Filtering (xu hướng cộng đồng, hành vi đám đông)
 * - α = 0.0 -> Thuần Content-Based (đặc tả thông số cấu hình phần cứng SBERT)
 * - α = 0.7 -> Hybrid chuẩn tối ưu thương mại điện tử
 */

class HybridRecService {
  /**
   * Lấy danh sách gợi ý Hybrid cho người dùng
   * @param {Object} params
   * @param {string} params.userId - ID người dùng (nếu có)
   * @param {Array} params.sessionItems - Danh sách sản phẩm tương tác trong phiên (cho Guest/New User)
   * @param {number} params.alpha - Trọng số CF (0.0 đến 1.0, mặc định: 0.7)
   * @param {number} params.limit - Số lượng sản phẩm trả về (mặc định: 10)
   * @param {Object} params.filters - Bộ lọc (brand, category, minPrice, maxPrice)
   * @param {boolean} params.excludePurchased - Loại trừ sản phẩm đã mua (mặc định: true)
   * @param {number} params.maxPerBrand - Số lượng tối đa mỗi thương hiệu để tăng độ đa dạng (mặc định: 3)
   * @returns {Promise<Object>} Kết quả gợi ý kèm metadata
   */
  async getHybridRecommendations({
    userId = null,
    sessionItems = null,
    alpha = 0.3,
    limit = 10,
    filters = {},
    excludePurchased = true,
    maxPerBrand = 3
  } = {}) {
    // 1. Chuẩn hóa giá trị alpha trong khoảng [0, 1] (alpha = 0.3 -> 30% CF, 70% Content)
    const safeAlpha = Math.max(0, Math.min(1, typeof alpha === 'number' ? alpha : 0.3));

    // 2. Lấy User Profile Vector (hoặc Session Profile nếu là Guest)
    let userProfile;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      userProfile = await userProfileService.calculateUserProfile(userId);
    } else if (sessionItems && Array.isArray(sessionItems) && sessionItems.length > 0) {
      userProfile = await userProfileService.calculateSessionProfile(sessionItems);
    } else {
      userProfile = userProfileService._getDefaultColdStartProfile(null);
    }

    const { user_cf_vector, user_content_vector, isColdStart } = userProfile;

    // 3. Nếu là Cold-Start hoàn toàn -> Fallback Strategy (Top Trending / Bán chạy)
    if (isColdStart || (!user_cf_vector && !user_content_vector)) {
      return this._getColdStartRecommendations({ limit, filters });
    }

    // 4. Lấy danh sách sản phẩm đã mua để loại trừ (Purchase Exclusion)
    const purchasedProductIds = new Set();
    if (excludePurchased && userId && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const userOrders = await Order.find({ 
          user_id: new mongoose.Types.ObjectId(userId),
          status: { $in: ['confirmed', 'shipping', 'delivered', 'completed'] }
        }).select('_id').lean();

        if (userOrders.length > 0) {
          const orderIds = userOrders.map(o => o._id);
          const orderItems = await OrderItem.find({ order_id: { $in: orderIds } }).select('laptop_id').lean();
          orderItems.forEach(item => {
            if (item.laptop_id) purchasedProductIds.add(item.laptop_id.toString());
          });
        }
      } catch (err) {
        console.warn('Could not fetch purchased items for exclusion:', err.message);
      }
    }

    // 5. Chuẩn bị truy vấn lấy danh sách Candidate Products từ MongoDB
    const queryFilters = {};
    if (filters.brand) queryFilters.brand_id = filters.brand;
    if (filters.category) queryFilters.category_id = filters.category;
    if (filters.minPrice || filters.maxPrice) {
      queryFilters.price = {};
      if (filters.minPrice) queryFilters.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) queryFilters.price.$lte = Number(filters.maxPrice);
    }

    // Lấy tất cả sản phẩm ứng viên có chứa thông số và vector
    const candidates = await Product.find(queryFilters)
      .select('_id id title name price stock images brand_id category_id specifications item_cf_vector item_content_vector')
      .populate('brand_id', 'name slug')
      .populate('category_id', 'name slug')
      .lean();

    if (!candidates || candidates.length === 0) {
      return {
        success: true,
        data: [],
        total: 0,
        strategy: 'hybrid_filtered_empty',
        alpha: safeAlpha
      };
    }

    // 6. Tính toán điểm số độc lập cho từng sản phẩm: Score_CF và Score_Content
    const scoredCandidates = [];

    for (const product of candidates) {
      const pIdStr = product._id.toString();
      // Bỏ qua nếu là sản phẩm đã mua
      if (purchasedProductIds.has(pIdStr)) continue;

      let scoreCF = 0;
      let hasCF = false;
      let scoreContent = 0;
      let hasContent = false;

      // Nhánh 1: Collaborative Filtering Score
      if (user_cf_vector && product.item_cf_vector && product.item_cf_vector.length > 0) {
        scoreCF = cosineSimilarity(user_cf_vector, product.item_cf_vector, true); // [0, 1]
        hasCF = true;
      }

      // Nhánh 2: Content-Based Score (SBERT)
      const contentVec = product.item_content_vector;

      if (user_content_vector && contentVec && contentVec.length > 0) {
        scoreContent = cosineSimilarity(user_content_vector, contentVec, true); // [0, 1]
        hasContent = true;
      }

      // Xử lý Cold-Start cục bộ cho sản phẩm mới (New Item Cold-Start)
      // Nếu sản phẩm mới chưa có CF vector -> Content-Based gánh 100% điểm
      let effectiveAlpha = safeAlpha;
      if (!hasCF && hasContent) {
        effectiveAlpha = 0.0; // Chuyển hoàn toàn sang Content
        scoreCF = scoreContent;
      } else if (hasCF && !hasContent) {
        effectiveAlpha = 1.0;
        scoreContent = scoreCF;
      } else if (!hasCF && !hasContent) {
        scoreCF = 0.5;
        scoreContent = 0.5;
      }

      // 7. Áp dụng công thức Weighted Hybrid Scoring
      const scoreFinal = (effectiveAlpha * scoreCF) + ((1 - effectiveAlpha) * scoreContent);

      scoredCandidates.push({
        product,
        scoreCF,
        scoreContent,
        scoreFinal,
        effectiveAlpha
      });
    }

    // 8. Sắp xếp danh sách ứng viên theo Score_Final giảm dần
    scoredCandidates.sort((a, b) => b.scoreFinal - a.scoreFinal);

    // 9. Lọc đa dạng hóa thương hiệu (Brand Diversity Filter)
    const finalRecommendations = [];
    const brandCounts = {};

    for (const item of scoredCandidates) {
      if (finalRecommendations.length >= limit) break;

      const brandName = item.product.brand_id?.name || 'Khác';
      const currentBrandCount = brandCounts[brandName] || 0;

      if (maxPerBrand > 0 && currentBrandCount >= maxPerBrand) {
        continue; // Đã đủ chỉ tiêu cho thương hiệu này, nhường chỗ cho thương hiệu khác
      }

      brandCounts[brandName] = currentBrandCount + 1;

      // Chuẩn bị thông tin giải thích gợi ý
      const matchPercentage = Math.min(99, Math.max(60, Math.round(item.scoreFinal * 100)));
      let reason = `Phù hợp ${matchPercentage}% với sở thích của bạn`;
      if (item.scoreCF > 0.8 && safeAlpha >= 0.5) {
        reason = `Được nhiều người dùng có gu giống bạn lựa chọn (${matchPercentage}% Match)`;
      } else if (item.scoreContent > 0.8 && safeAlpha < 0.5) {
        reason = `Cấu hình phần cứng tối ưu đúng nhu cầu của bạn (${matchPercentage}% Match)`;
      }

      finalRecommendations.push({
        ...item.product,
        hybrid_score: {
          final_score: Number(item.scoreFinal.toFixed(4)),
          cf_score: Number(item.scoreCF.toFixed(4)),
          content_score: Number(item.scoreContent.toFixed(4)),
          alpha: item.effectiveAlpha,
          match_percentage: matchPercentage,
          reason
        }
      });
    }

    return {
      success: true,
      total: finalRecommendations.length,
      data: finalRecommendations,
      metadata: {
        strategy: 'weighted_hybrid_online_serving',
        configured_alpha: safeAlpha,
        is_cold_start: false,
        total_candidates_analyzed: candidates.length,
        user_preferences: userProfile.preferences
      }
    };
  }

  /**
   * Gợi ý các sản phẩm tương tự khi xem một sản phẩm cụ thể (Item-to-Item Similarity)
   * Kết hợp cả tương đồng cấu hình (SBERT) và tương đồng hành vi đồng mua (ALS)
   * @param {string} productId - ID sản phẩm đang xem
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async getSimilarProducts(productId, { alpha = 0.3, limit = 6 } = {}) {
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('ID sản phẩm không hợp lệ');
    }

    const targetProduct = await Product.findById(productId)
      .select('_id name title brand_id category_id item_cf_vector item_content_vector price specifications')
      .lean();

    if (!targetProduct) {
      throw new Error('Không tìm thấy sản phẩm');
    }

    const targetCF = targetProduct.item_cf_vector;
    const targetContent = targetProduct.item_content_vector;

    // Lấy các sản phẩm khác cùng tầm giá hoặc cùng category/brand
    const candidates = await Product.find({ _id: { $ne: targetProduct._id } })
      .select('_id id title name price stock images brand_id category_id specifications item_cf_vector item_content_vector')
      .populate('brand_id', 'name')
      .populate('category_id', 'name')
      .limit(100)
      .lean();

    const scored = [];
    for (const p of candidates) {
      let simCF = 0;
      let hasCF = false;
      let simContent = 0;
      let hasContent = false;

      if (targetCF && p.item_cf_vector && p.item_cf_vector.length > 0) {
        simCF = cosineSimilarity(targetCF, p.item_cf_vector, true);
        hasCF = true;
      }

      const pContent = p.item_content_vector;
      if (targetContent && pContent && pContent.length > 0) {
        simContent = cosineSimilarity(targetContent, pContent, true);
        hasContent = true;
      }

      // Trọng số chuẩn: 70% Phần cứng (Content/SBERT), 30% Hành vi (CF/ALS)
      let effectiveAlpha = alpha;
      if (!hasCF && hasContent) effectiveAlpha = 0.0;
      if (hasCF && !hasContent) effectiveAlpha = 1.0;

      const finalSim = (effectiveAlpha * simCF) + ((1 - effectiveAlpha) * simContent);

      scored.push({
        product: p,
        similarity_score: finalSim,
        cf_similarity: simCF,
        content_similarity: simContent,
        effectiveAlpha
      });
    }

    scored.sort((a, b) => b.similarity_score - a.similarity_score);
    const topResults = scored.slice(0, limit).map(item => {
      const matchPercentage = Math.min(99, Math.max(60, Math.round(item.similarity_score * 100)));
      return {
        ...item.product,
        final_score: Number(item.similarity_score.toFixed(4)),
        similarity_score: Number(item.similarity_score.toFixed(4)),
        match_percentage: matchPercentage,
        similarity: {
          score: Number(item.similarity_score.toFixed(4)),
          match_percentage: matchPercentage,
          cf_similarity: Number(item.cf_similarity.toFixed(4)),
          content_similarity: Number(item.content_similarity.toFixed(4)),
          alpha: item.effectiveAlpha,
          reason: 'Cấu hình và phân khúc tương đương sản phẩm bạn đang xem (70% phần cứng, 30% hành vi)'
        },
        hybrid_score: {
          final_score: Number(item.similarity_score.toFixed(4)),
          cf_score: Number(item.cf_similarity.toFixed(4)),
          content_score: Number(item.content_similarity.toFixed(4)),
          alpha: item.effectiveAlpha,
          match_percentage: matchPercentage,
          reason: 'Cấu hình và phân khúc tương đương sản phẩm bạn đang xem'
        }
      };
    });

    return {
      success: true,
      target_product_id: productId,
      total: topResults.length,
      data: topResults,
      alpha
    };
  }

  /**
   * Fallback Strategy cho Cold-Start User (Top Trending & Bán chạy)
   */
  async _getColdStartRecommendations({ limit = 10, filters = {} }) {
    const queryFilters = {};
    if (filters.brand) queryFilters.brand_id = filters.brand;
    if (filters.category) queryFilters.category_id = filters.category;
    if (filters.minPrice || filters.maxPrice) {
      queryFilters.price = {};
      if (filters.minPrice) queryFilters.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) queryFilters.price.$lte = Number(filters.maxPrice);
    }

    const popularProducts = await Product.find(queryFilters)
      .sort({ stock: -1, createdAt: -1 })
      .limit(limit)
      .populate('brand_id', 'name')
      .populate('category_id', 'name')
      .lean();

    const data = popularProducts.map((p, idx) => ({
      ...p,
      hybrid_score: {
        final_score: Number((0.95 - (idx * 0.03)).toFixed(4)),
        cf_score: 0.5,
        content_score: 0.5,
        alpha: 0.5,
        match_percentage: Math.max(70, 95 - (idx * 3)),
        reason: 'Sản phẩm nổi bật được nhiều người quan tâm nhất'
      }
    }));

    return {
      success: true,
      total: data.length,
      data,
      metadata: {
        strategy: 'cold_start_popular_trending',
        is_cold_start: true
      }
    };
  }
}

export default new HybridRecService();
