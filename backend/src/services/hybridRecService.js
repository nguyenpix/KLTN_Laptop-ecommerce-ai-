import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import '../models/Brand.js';
import '../models/Category.js';
import '../models/Color.js';
import userProfileService from './userProfileService.js';
import { cosineSimilarity } from '../utils/vectorUtils.js';

/**
 * HYBRID RECOMMENDATION SERVICE — Dual-Tower (ALS + SBERT)
 * Hỗ trợ:
 *   1. MongoDB Atlas $vectorSearch (HNSW ANN) nếu cluster đã tạo Vector Search Index.
 *   2. Tự động Fallback sang Exact Cosine Similarity (trên tập Product) khi Atlas Vector Index
 *      chưa được cấu hình hoặc trả về rỗng, đảm bảo hệ thống gợi ý luôn hoạt động 100%.
 */

const CF_VECTOR_INDEX = 'item_cf_vector_index';           // 8-dim ALS
const CONTENT_VECTOR_INDEX = 'item_content_vector_index'; // 384-dim SBERT
const CANDIDATE_POOL_SIZE = 150;

const getQualityLevel = (interactionCount = 0, isColdStart = false) => {
  if (isColdStart || interactionCount <= 0) return 'default';
  if (interactionCount >= 50) return 'high';
  if (interactionCount >= 30) return 'medium';
  if (interactionCount >= 10) return 'low';
  return 'default';
};

const stripVectors = (product) => {
  if (!product) return product;
  const copy = { ...product };
  delete copy.item_cf_vector;
  delete copy.item_content_vector;
  delete copy.rag_embedding;
  delete copy.document_chunks;
  return copy;
};

class HybridRecService {
  // ══════════════════════════════════════════════════════════════════════
  // 1. MAIN: User Personalized Recommendations
  // ══════════════════════════════════════════════════════════════════════
  async getHybridRecommendations({
    userId = null,
    sessionItems = null,
    alpha = 0.7,
    limit = 10,
    filters = {},
    excludePurchased = true,
    maxPerBrand = 3,
  } = {}) {
    const safeAlpha = Math.max(0, Math.min(1, typeof alpha === 'number' ? alpha : 0.7));

    // Bước 1: Lấy User Profile Vector
    let userProfile;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      userProfile = await userProfileService.calculateUserProfile(userId);
    } else if (sessionItems && Array.isArray(sessionItems) && sessionItems.length > 0) {
      userProfile = await userProfileService.calculateSessionProfile(sessionItems);
    } else {
      userProfile = userProfileService._getDefaultColdStartProfile(null);
    }

    const { user_cf_vector, user_content_vector, isColdStart, totalInteractions = 0 } = userProfile;

    // Bước 2: Cold-Start hoàn toàn -> Fallback Trending
    if (isColdStart || (!user_cf_vector && !user_content_vector)) {
      return this._getColdStartRecommendations({ limit, filters, totalInteractions });
    }

    // Bước 3: Thu thập sản phẩm đã mua để loại trừ
    const purchasedProductIds = new Set();
    if (excludePurchased && userId && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const userOrders = await Order.find({
          user_id: new mongoose.Types.ObjectId(userId),
          status: { $in: ['confirmed', 'shipping', 'delivered', 'completed'] },
        })
          .select('_id')
          .lean();

        if (userOrders.length > 0) {
          const orderIds = userOrders.map((o) => o._id);
          const orderItems = await OrderItem.find({ order_id: { $in: orderIds } })
            .select('laptop_id')
            .lean();
          orderItems.forEach((item) => {
            if (item.laptop_id) purchasedProductIds.add(item.laptop_id.toString());
          });
        }
      } catch (err) {
        console.warn('[HybridRec] Could not fetch purchased items:', err.message);
      }
    }

    // Bước 4: Xây dựng post-filter và thử Atlas $vectorSearch trước
    const postFilter = this._buildPostFilter(filters, purchasedProductIds);
    const candidateLimit = CANDIDATE_POOL_SIZE;

    let [cfResults, contentResults] = await Promise.all([
      user_cf_vector
        ? this._vectorSearchCF(user_cf_vector, candidateLimit, postFilter, true).catch(() => [])
        : Promise.resolve([]),
      user_content_vector
        ? this._vectorSearchContent(user_content_vector, candidateLimit, postFilter, true).catch(() => [])
        : Promise.resolve([]),
    ]);

    let engineUsed = 'mongodb_atlas_$vectorSearch';

    // Bước 5: Tự động Fallback sang Exact Cosine Similarity nếu Atlas Vector Index chưa tạo / trả rỗng
    if (
      (user_cf_vector && cfResults.length === 0) ||
      (user_content_vector && contentResults.length === 0)
    ) {
      const exactResult = await this._exactDualTowerSearch({
        queryCfVector: user_cf_vector,
        queryContentVector: user_content_vector,
        filters,
        excludedIds: purchasedProductIds,
      });
      if (user_cf_vector && cfResults.length === 0) {
        cfResults = exactResult.cfResults;
      }
      if (user_content_vector && contentResults.length === 0) {
        contentResults = exactResult.contentResults;
      }
      engineUsed = 'exact_cosine_dual_tower';
    }

    // Bước 6: Gộp kết quả hai nhánh vào ScoreMap
    const scoreMap = new Map();

    for (const item of cfResults) {
      const id = item._id.toString();
      scoreMap.set(id, {
        product: stripVectors(item),
        cf_score: item.cf_score || 0,
        content_score: 0,
        hasCF: true,
        hasContent: false,
      });
    }

    for (const item of contentResults) {
      const id = item._id.toString();
      if (scoreMap.has(id)) {
        const entry = scoreMap.get(id);
        entry.content_score = item.content_score || 0;
        entry.hasContent = true;
      } else {
        scoreMap.set(id, {
          product: stripVectors(item),
          cf_score: 0,
          content_score: item.content_score || 0,
          hasCF: false,
          hasContent: true,
        });
      }
    }

    // Bước 7: Tính điểm Hybrid Final cho từng ứng viên
    const scoredCandidates = [];
    for (const [, entry] of scoreMap) {
      const { product, cf_score, content_score, hasCF, hasContent } = entry;

      let effectiveAlpha = safeAlpha;
      if (!hasCF && hasContent) effectiveAlpha = 0.0;
      if (hasCF && !hasContent) effectiveAlpha = 1.0;
      if (!hasCF && !hasContent) continue;

      const scoreFinal = effectiveAlpha * cf_score + (1 - effectiveAlpha) * content_score;
      scoredCandidates.push({ product, cf_score, content_score, scoreFinal, effectiveAlpha });
    }

    scoredCandidates.sort((a, b) => b.scoreFinal - a.scoreFinal);

    // Bước 8: Lọc đa dạng hóa thương hiệu (Brand Diversity)
    const finalRecommendations = [];
    const brandCounts = {};

    for (const item of scoredCandidates) {
      if (finalRecommendations.length >= limit) break;

      const brandName = item.product.brand_id?.name || 'Khác';
      const currentCount = brandCounts[brandName] || 0;
      if (maxPerBrand > 0 && currentCount >= maxPerBrand) continue;
      brandCounts[brandName] = currentCount + 1;

      const matchPercentage = Math.min(99, Math.max(60, Math.round(item.scoreFinal * 100)));
      let reason = `Phù hợp ${matchPercentage}% với sở thích của bạn`;

      if (item.cf_score > 0.75 && safeAlpha >= 0.5) {
        reason = `Được nhiều người dùng có gu giống bạn lựa chọn (${matchPercentage}% Match)`;
      } else if (item.content_score > 0.75 && safeAlpha < 0.5) {
        reason = `Cấu hình phần cứng tối ưu đúng nhu cầu của bạn (${matchPercentage}% Match)`;
      }

      finalRecommendations.push({
        ...item.product,
        hybrid_score: {
          final_score: Number(item.scoreFinal.toFixed(4)),
          cf_score: Number(item.cf_score.toFixed(4)),
          content_score: Number(item.content_score.toFixed(4)),
          alpha: item.effectiveAlpha,
          match_percentage: matchPercentage,
          reason,
        },
      });
    }

    // Nếu sau khi lọc vẫn rỗng -> fallback sang sản phẩm nổi bật
    if (finalRecommendations.length === 0) {
      return this._getColdStartRecommendations({ limit, filters, totalInteractions });
    }

    const quality = getQualityLevel(totalInteractions, false);

    return {
      success: true,
      total: finalRecommendations.length,
      data: finalRecommendations,
      metadata: {
        strategy: 'dual_tower_hybrid_serving',
        engine: engineUsed,
        quality,
        interaction_count: totalInteractions,
        base_product_count: scoreMap.size,
        configured_alpha: safeAlpha,
        is_cold_start: false,
        cf_candidates_fetched: cfResults.length,
        content_candidates_fetched: contentResults.length,
        total_merged_candidates: scoreMap.size,
        user_preferences: userProfile.preferences,
      },
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  // 2. Item-to-Item Similarity (xem sản phẩm -> gợi ý tương tự)
  // ══════════════════════════════════════════════════════════════════════
  async getSimilarProducts(productId, { alpha = 0.3, limit = 6 } = {}) {
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('ID sản phẩm không hợp lệ');
    }

    const targetProduct = await Product.findById(productId)
      .select('_id name title brand_id category_id item_cf_vector item_content_vector price specifications')
      .lean();

    if (!targetProduct) throw new Error('Không tìm thấy sản phẩm');

    const targetCF = targetProduct.item_cf_vector;
    const targetContent = targetProduct.item_content_vector;
    const excludeFilter = { _id: { $ne: new mongoose.Types.ObjectId(productId) } };
    const candidateLimit = Math.min(limit * 15, 200);

    let [cfResults, contentResults] = await Promise.all([
      targetCF
        ? this._vectorSearchCF(targetCF, candidateLimit, excludeFilter, true).catch(() => [])
        : Promise.resolve([]),
      targetContent
        ? this._vectorSearchContent(targetContent, candidateLimit, excludeFilter, true).catch(() => [])
        : Promise.resolve([]),
    ]);

    let engineUsed = 'mongodb_atlas_$vectorSearch';

    // Tự động Fallback sang Exact Cosine Similarity nếu Atlas Vector Search trả rỗng
    if (
      (targetCF && cfResults.length === 0) ||
      (targetContent && contentResults.length === 0)
    ) {
      const exactResult = await this._exactDualTowerSearch({
        queryCfVector: targetCF,
        queryContentVector: targetContent,
        filters: {},
        excludedIds: new Set([productId.toString()]),
      });
      if (targetCF && cfResults.length === 0) {
        cfResults = exactResult.cfResults;
      }
      if (targetContent && contentResults.length === 0) {
        contentResults = exactResult.contentResults;
      }
      engineUsed = 'exact_cosine_dual_tower';
    }

    const scoreMap = new Map();
    for (const item of cfResults) {
      scoreMap.set(item._id.toString(), {
        product: stripVectors(item),
        cf_score: item.cf_score || 0,
        content_score: 0,
        hasCF: true,
        hasContent: false,
      });
    }
    for (const item of contentResults) {
      const id = item._id.toString();
      if (scoreMap.has(id)) {
        scoreMap.get(id).content_score = item.content_score || 0;
        scoreMap.get(id).hasContent = true;
      } else {
        scoreMap.set(id, {
          product: stripVectors(item),
          cf_score: 0,
          content_score: item.content_score || 0,
          hasCF: false,
          hasContent: true,
        });
      }
    }

    const safeAlpha = Math.max(0, Math.min(1, alpha));
    const scored = [];

    for (const [, entry] of scoreMap) {
      let effectiveAlpha = safeAlpha;
      if (!entry.hasCF && entry.hasContent) effectiveAlpha = 0.0;
      if (entry.hasCF && !entry.hasContent) effectiveAlpha = 1.0;
      if (!entry.hasCF && !entry.hasContent) continue;

      const finalSim = effectiveAlpha * entry.cf_score + (1 - effectiveAlpha) * entry.content_score;
      scored.push({ ...entry, finalSim, effectiveAlpha });
    }

    scored.sort((a, b) => b.finalSim - a.finalSim);

    const topResults = scored.slice(0, limit).map((item) => {
      const matchPercentage = Math.min(99, Math.max(60, Math.round(item.finalSim * 100)));
      return {
        ...item.product,
        final_score: Number(item.finalSim.toFixed(4)),
        similarity_score: Number(item.finalSim.toFixed(4)),
        match_percentage: matchPercentage,
        similarity: {
          score: Number(item.finalSim.toFixed(4)),
          match_percentage: matchPercentage,
          cf_similarity: Number(item.cf_score.toFixed(4)),
          content_similarity: Number(item.content_score.toFixed(4)),
          alpha: item.effectiveAlpha,
          reason: 'Cấu hình và phân khúc tương đương sản phẩm bạn đang xem',
        },
        hybrid_score: {
          final_score: Number(item.finalSim.toFixed(4)),
          cf_score: Number(item.cf_score.toFixed(4)),
          content_score: Number(item.content_score.toFixed(4)),
          alpha: item.effectiveAlpha,
          match_percentage: matchPercentage,
          reason: 'Cấu hình và phân khúc tương đương sản phẩm bạn đang xem',
        },
      };
    });

    return {
      success: true,
      target_product_id: productId,
      total: topResults.length,
      data: topResults,
      metadata: {
        strategy: 'dual_tower_item_similarity',
        engine: engineUsed,
        quality: 'high',
        interaction_count: topResults.length,
        alpha: safeAlpha,
      },
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  // PRIVATE: Exact Dual-Tower Cosine Similarity Fallback (In-Memory)
  // ══════════════════════════════════════════════════════════════════════
  async _exactDualTowerSearch({
    queryCfVector = null,
    queryContentVector = null,
    filters = {},
    excludedIds = new Set(),
  }) {
    const queryFilters = {};
    if (filters.brand && mongoose.Types.ObjectId.isValid(filters.brand)) {
      queryFilters.brand_id = new mongoose.Types.ObjectId(filters.brand);
    }
    if (filters.category && mongoose.Types.ObjectId.isValid(filters.category)) {
      queryFilters.category_id = new mongoose.Types.ObjectId(filters.category);
    }
    if (filters.minPrice || filters.maxPrice) {
      queryFilters.price = {};
      if (filters.minPrice) queryFilters.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) queryFilters.price.$lte = Number(filters.maxPrice);
    }
    if (excludedIds && excludedIds.size > 0) {
      const validExcluded = [...excludedIds]
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      if (validExcluded.length > 0) {
        queryFilters._id = { $nin: validExcluded };
      }
    }

    const candidates = await Product.find(queryFilters)
      .select('_id id title name price stock images brand_id category_id specifications item_cf_vector item_content_vector')
      .populate('brand_id', 'name slug')
      .populate('category_id', 'name slug')
      .lean();

    const cfResults = [];
    const contentResults = [];

    for (const product of candidates) {
      if (
        queryCfVector &&
        Array.isArray(product.item_cf_vector) &&
        product.item_cf_vector.length === queryCfVector.length
      ) {
        const cfScore = cosineSimilarity(queryCfVector, product.item_cf_vector, true);
        cfResults.push({ ...product, cf_score: cfScore });
      }

      if (
        queryContentVector &&
        Array.isArray(product.item_content_vector) &&
        product.item_content_vector.length === queryContentVector.length
      ) {
        const contentScore = cosineSimilarity(queryContentVector, product.item_content_vector, true);
        contentResults.push({ ...product, content_score: contentScore });
      }
    }

    return { cfResults, contentResults };
  }

  // ══════════════════════════════════════════════════════════════════════
  // PRIVATE: Atlas Vector Search — Nhánh CF
  // ══════════════════════════════════════════════════════════════════════
  async _vectorSearchCF(queryVector, candidateLimit, postFilter = {}, fullInfo = false) {
    const numCandidates = Math.min(candidateLimit * 10, 10000);
    const pipeline = [
      {
        $vectorSearch: {
          index: CF_VECTOR_INDEX,
          path: 'item_cf_vector',
          queryVector: Array.from(queryVector),
          numCandidates,
          limit: numCandidates,
        },
      },
      {
        $addFields: {
          cf_score: { $meta: 'vectorSearchScore' },
        },
      },
    ];

    if (Object.keys(postFilter).length > 0) {
      pipeline.push({ $match: postFilter });
    }

    if (fullInfo) {
      pipeline.push(
        {
          $lookup: {
            from: 'brands',
            localField: 'brand_id',
            foreignField: '_id',
            as: '_brand',
          },
        },
        { $unwind: { path: '$_brand', preserveNullAndEmptyArrays: true } },
        { $addFields: { brand_id: '$_brand' } },
        {
          $lookup: {
            from: 'categories',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category_id',
          },
        }
      );
    }

    pipeline.push(
      {
        $project: {
          _id: 1, id: 1, name: 1, title: 1,
          price: 1, stock: 1, images: 1,
          brand_id: 1, category_id: 1,
          specifications: 1,
          cf_score: 1,
        },
      },
      { $limit: candidateLimit }
    );

    return Product.aggregate(pipeline);
  }

  // ══════════════════════════════════════════════════════════════════════
  // PRIVATE: Atlas Vector Search — Nhánh Content
  // ══════════════════════════════════════════════════════════════════════
  async _vectorSearchContent(queryVector, candidateLimit, postFilter = {}, fullInfo = false) {
    const numCandidates = Math.min(candidateLimit * 10, 10000);
    const pipeline = [
      {
        $vectorSearch: {
          index: CONTENT_VECTOR_INDEX,
          path: 'item_content_vector',
          queryVector: Array.from(queryVector),
          numCandidates,
          limit: numCandidates,
        },
      },
      {
        $addFields: {
          content_score: { $meta: 'vectorSearchScore' },
        },
      },
    ];

    if (Object.keys(postFilter).length > 0) {
      pipeline.push({ $match: postFilter });
    }

    if (fullInfo) {
      pipeline.push(
        {
          $lookup: {
            from: 'brands',
            localField: 'brand_id',
            foreignField: '_id',
            as: '_brand',
          },
        },
        { $unwind: { path: '$_brand', preserveNullAndEmptyArrays: true } },
        { $addFields: { brand_id: '$_brand' } },
        {
          $lookup: {
            from: 'categories',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category_id',
          },
        }
      );
    }

    pipeline.push(
      {
        $project: {
          _id: 1, id: 1, name: 1, title: 1,
          price: 1, stock: 1, images: 1,
          brand_id: 1, category_id: 1,
          specifications: 1,
          content_score: 1,
        },
      },
      { $limit: candidateLimit }
    );

    return Product.aggregate(pipeline);
  }

  // ══════════════════════════════════════════════════════════════════════
  // PRIVATE: Xây dựng post-filter cho $match sau $vectorSearch
  // ══════════════════════════════════════════════════════════════════════
  _buildPostFilter(filters = {}, excludedIds = new Set()) {
    const filter = {};

    if (filters.brand && mongoose.Types.ObjectId.isValid(filters.brand)) {
      filter.brand_id = new mongoose.Types.ObjectId(filters.brand);
    }

    if (filters.category && mongoose.Types.ObjectId.isValid(filters.category)) {
      filter.category_id = new mongoose.Types.ObjectId(filters.category);
    }

    if (filters.minPrice || filters.maxPrice) {
      filter.price = {};
      if (filters.minPrice) filter.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) filter.price.$lte = Number(filters.maxPrice);
    }

    if (excludedIds && excludedIds.size > 0) {
      filter._id = {
        $nin: [...excludedIds]
          .map((id) => {
            try {
              return new mongoose.Types.ObjectId(id);
            } catch {
              return null;
            }
          })
          .filter(Boolean),
      };
    }

    return filter;
  }

  // ══════════════════════════════════════════════════════════════════════
  // PRIVATE: Cold-Start Fallback (Top Trending / Phổ biến nhất)
  // ══════════════════════════════════════════════════════════════════════
  async _getColdStartRecommendations({ limit = 10, filters = {}, totalInteractions = 0 }) {
    const queryFilters = {};
    if (filters.brand) queryFilters.brand_id = filters.brand;
    if (filters.category) queryFilters.category_id = filters.category;
    if (filters.minPrice || filters.maxPrice) {
      queryFilters.price = {};
      if (filters.minPrice) queryFilters.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) queryFilters.price.$lte = Number(filters.maxPrice);
    }

    const popularProducts = await Product.find(queryFilters)
      .select('_id id title name price stock images brand_id category_id specifications')
      .sort({ stock: -1, createdAt: -1 })
      .limit(limit)
      .populate('brand_id', 'name slug')
      .populate('category_id', 'name slug')
      .lean();

    const data = popularProducts.map((p, idx) => ({
      ...p,
      hybrid_score: {
        final_score: Number((0.95 - idx * 0.03).toFixed(4)),
        cf_score: 0.5,
        content_score: 0.5,
        alpha: 0.5,
        match_percentage: Math.max(70, 95 - idx * 3),
        reason: 'Sản phẩm nổi bật được nhiều người quan tâm nhất',
      },
    }));

    return {
      success: true,
      total: data.length,
      data,
      metadata: {
        strategy: 'cold_start_popular_trending',
        engine: 'mongodb_find',
        quality: 'default',
        interaction_count: totalInteractions,
        base_product_count: data.length,
        is_cold_start: true,
      },
    };
  }
}

export default new HybridRecService();
