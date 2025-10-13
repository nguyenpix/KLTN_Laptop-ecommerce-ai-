import ProductFeatures from '../models/ProductFeatures.js';
import UserRecommendationProfile from '../models/UserRecommendationProfile.js';
import Interaction from '../models/Interaction.js';
import Product from '../models/Product.js';
import { cosineSimilarity, normalizeVector, calculateItemSimilarity } from '../utils/matrixUtils.js';

class RecommendationService {
  constructor() {
    this.itemSimilarityCache = new Map();
    this.userProfileCache = new Map();
  }

  // BƯỚC 1: CONTENT-BASED FILTERING - Tạo candidate set
  async getContentBasedCandidates(userId, limit = 100) {
    try {
      // 1. Lấy user profile
      const userProfile = await this.getUserContentProfile(userId);
      if (!userProfile) {
        return await this.getColdStartRecommendations(limit);
      }

      // 2. Lấy all product features
      const allProducts = await ProductFeatures.find({})
        .populate('product_id', 'name price images stock isActive');

      // 3. Tính cosine similarity với user preference vector
      const candidates = [];
      
      for (const productFeature of allProducts) {
        if (!productFeature.product_id?.isActive || productFeature.product_id.stock <= 0) {
          continue;
        }

        // Tính similarity score
        const similarity = cosineSimilarity(
          userProfile.preference_vector,
          productFeature.features.combined_vector
        );

        candidates.push({
          product_id: productFeature.product_id._id,
          product: productFeature.product_id,
          content_score: similarity,
          features: productFeature.features
        });
      }

      // 4. Sort và lấy top candidates
      candidates.sort((a, b) => b.content_score - a.content_score);
      return candidates.slice(0, limit);

    } catch (error) {
      console.error('Error in getContentBasedCandidates:', error);
      throw error;
    }
  }

  // BƯỚC 2: COLLABORATIVE FILTERING - Tinh chỉnh ranking
  async applyCollaborativeFiltering(candidates, userId, finalLimit = 20) {
    try {
      // 1. Lấy user interactions
      const userInteractions = await Interaction.find({ user_id: userId })
        .select('product_id type rating');

      if (userInteractions.length === 0) {
        // Fallback cho user mới: dùng popularity-based
        return this.applyPopularityRanking(candidates, finalLimit);
      }

      // 2. Tính collaborative score cho mỗi candidate
      const rankedCandidates = [];

      for (const candidate of candidates) {
        const collaborativeScore = await this.calculateCollaborativeScore(
          candidate.product_id,
          userInteractions
        );

        // 3. Kết hợp điểm (có thể điều chỉnh weights)
        const finalScore = (candidate.content_score * 0.3) + (collaborativeScore * 0.7);

        rankedCandidates.push({
          ...candidate,
          collaborative_score: collaborativeScore,
          final_score: finalScore
        });
      }

      // 4. Sort theo final score và return
      rankedCandidates.sort((a, b) => b.final_score - a.final_score);
      return rankedCandidates.slice(0, finalLimit);

    } catch (error) {
      console.error('Error in applyCollaborativeFiltering:', error);
      throw error;
    }
  }

  // Tính collaborative score cho 1 sản phẩm
  async calculateCollaborativeScore(targetProductId, userInteractions) {
    try {
      let totalScore = 0;
      let totalWeight = 0;

      for (const interaction of userInteractions) {
        // Tính item-item similarity
        const similarity = await this.getItemSimilarity(
          targetProductId,
          interaction.product_id
        );

        if (similarity > 0) {
          // Implicit rating từ interaction
          const implicitRating = this.getImplicitRating(interaction);
          
          totalScore += similarity * implicitRating;
          totalWeight += similarity;
        }
      }

      return totalWeight > 0 ? totalScore / totalWeight : 0;

    } catch (error) {
      console.error('Error calculating collaborative score:', error);
      return 0;
    }
  }

  // Tính item-item similarity (cached)
  async getItemSimilarity(productId1, productId2) {
    const key = `${productId1}_${productId2}`;
    const reverseKey = `${productId2}_${productId1}`;

    // Check cache
    if (this.itemSimilarityCache.has(key)) {
      return this.itemSimilarityCache.get(key);
    }
    if (this.itemSimilarityCache.has(reverseKey)) {
      return this.itemSimilarityCache.get(reverseKey);
    }

    // Calculate similarity
    const similarity = await calculateItemSimilarity(productId1, productId2);
    
    // Cache result
    this.itemSimilarityCache.set(key, similarity);
    return similarity;
  }

  // Convert interaction thành implicit rating
  getImplicitRating(interaction) {
    const weights = {
      'view': 1,
      'like': 2,
      'add_to_cart': 3,
      'purchase': 5,
      'search_click': 1.5
    };

    let rating = weights[interaction.type] || 1;
    
    // Bonus from explicit rating
    if (interaction.rating) {
      rating = rating * (interaction.rating / 5);
    }

    return Math.min(rating, 5); // Cap at 5
  }

  // MAIN METHOD: Sequential Hybrid Recommendation
  async getRecommendations(userId, options = {}) {
    const {
      candidateLimit = 100,
      finalLimit = 20,
      excludeInteracted = true
    } = options;

    try {
      // Step 1: Content-based candidates
      console.log('Step 1: Getting content-based candidates...');
      const candidates = await this.getContentBasedCandidates(userId, candidateLimit);

      if (candidates.length === 0) {
        return [];
      }

      // Step 2: Apply collaborative filtering
      console.log('Step 2: Applying collaborative filtering...');
      let recommendations = await this.applyCollaborativeFiltering(
        candidates, 
        userId, 
        finalLimit
      );

      // Step 3: Post-processing
      if (excludeInteracted) {
        recommendations = await this.excludeInteractedItems(recommendations, userId);
      }

      // Step 4: Add diversity (optional)
      recommendations = this.addDiversity(recommendations);

      console.log(`Generated ${recommendations.length} recommendations for user ${userId}`);
      return recommendations;

    } catch (error) {
      console.error('Error in getRecommendations:', error);
      throw error;
    }
  }

  // Helper methods...
  async getUserContentProfile(userId) {
    // Implementation để build user content profile
    // Tính từ các interactions trước đó
  }

  async getColdStartRecommendations(limit) {
    // Popularity-based recommendations cho user mới
  }

  // ... more helper methods
}

export default new RecommendationService();