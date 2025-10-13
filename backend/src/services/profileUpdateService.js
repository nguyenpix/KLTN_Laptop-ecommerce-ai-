import UserRecommendationProfile from '../models/UserProfile.js';
import Product from '../models/Product.js';
import Interaction from '../models/Interaction.js';

class ProfileUpdateService {
  
  // Weight mapping theo type của interaction
  static INTERACTION_WEIGHTS = {
    'view': 1,
    'like': 3,
    'add_to_cart': 5,
    'purchase': 10,
    'rating': 8,
    'remove_from_cart': -2,
    'search_click': 2
  };

  /**
   * Cập nhật user profile khi có interaction mới
   * @param {String} userId - ID của user
   * @param {String} productId - ID của sản phẩm
   * @param {String} interactionType - Loại tương tác
   * @param {Object} metadata - Thông tin bổ sung
   */
  async updateUserProfile(userId, productId, interactionType, metadata = {}) {
    try {
      // 1. Lấy thông tin sản phẩm với đầy đủ populate
      const product = await Product.findById(productId)
        .populate('brand_id', 'name')
        .populate('category_id', 'name');
      
      if (!product) {
        throw new Error('Product not found');
      }

      // 2. Tính weight của interaction với adjustments
      let weight = this.calculateAdjustedWeight(interactionType, metadata);

      // 3. Chuẩn bị update operations
      const updateOps = this.buildUpdateOperations(product, weight);

      // 4. Update profile với $inc để cộng dồn weights
      await UserRecommendationProfile.updateOne(
        { userId: userId },
        { 
          $inc: updateOps
        },
        { upsert: true }
      );

      // 5. Recalculate price range preferences
      await this.updatePriceRangePreferences(userId);

      console.log(`✅ Updated profile for user ${userId} with ${interactionType} on ${product.name}`);
      
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Tính weight đã điều chỉnh dựa trên metadata
   */
  calculateAdjustedWeight(interactionType, metadata) {
    let weight = this.INTERACTION_WEIGHTS[interactionType] || 1;

    // Adjustment cho view duration
    if (interactionType === 'view' && metadata.duration) {
      if (metadata.duration < 10) {
        weight *= 0.5;  // View nhanh -> weight thấp
      } else if (metadata.duration > 60) {
        weight *= 1.5;  // View lâu -> weight cao
      } else if (metadata.duration > 180) {
        weight *= 2;    // View rất lâu -> weight rất cao
      }
    }

    // Adjustment cho rating value
    if (interactionType === 'rating' && metadata.rating_value) {
      weight = weight * (metadata.rating_value / 5);
    }

    // Bonus cho interaction từ recommendation
    if (metadata.source === 'recommendation') {
      weight *= 1.2;
    }

    return Math.round(weight * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Xây dựng update operations dựa trên product attributes
   */
  buildUpdateOperations(product, weight) {
    const updateOps = {};

    // Brand preference
    if (product.brand_id?.name) {
      updateOps[`profile.preferences.brands.${product.brand_id.name}`] = weight;
    }

    // Categories preference (vì category_id là array)
    if (product.category_id && Array.isArray(product.category_id)) {
      product.category_id.forEach(category => {
        if (category?.name) {
          updateOps[`profile.preferences.categories.${category.name}`] = weight;
        }
      });
    }

    // Technical specifications preferences
    if (product.specifications) {
      const specs = product.specifications;

      // CPU preferences
      if (specs.cpu) {
        const cpuClean = this.cleanSpecValue(specs.cpu);
        updateOps[`profile.preferences.cpu_specs.${cpuClean}`] = weight;
      }

      // GPU preferences  
      if (specs.gpu) {
        const gpuClean = this.cleanSpecValue(specs.gpu);
        updateOps[`profile.preferences.gpu_specs.${gpuClean}`] = weight;
      }

      // RAM preferences
      if (specs.ram) {
        const ramClean = this.cleanSpecValue(specs.ram);
        updateOps[`profile.preferences.ram_specs.${ramClean}`] = weight;
      }

      // Display preferences
      if (specs.display) {
        const displayClean = this.cleanSpecValue(specs.display);
        updateOps[`profile.preferences.display_specs.${displayClean}`] = weight;
      }

      // Storage type preferences
      if (specs.storage_type) {
        updateOps[`profile.preferences.storage_type_specs.${specs.storage_type}`] = weight;
      }

      // Storage capacity preferences
      if (specs.storage_capacity) {
        updateOps[`profile.preferences.storage_capacity_specs.${specs.storage_capacity}`] = weight;
      }
    }

    return updateOps;
  }

  /**
   * Clean specification values để consistent
   */
  cleanSpecValue(value) {
    if (!value) return '';
    
    return value
      .toString()
      .trim()
      .replace(/\s+/g, ' ')           // Multiple spaces -> single space
      .replace(/[^\w\s.-]/g, '')      // Remove special chars except . and -
      .substring(0, 50);              // Limit length
  }

  /**
   * Cập nhật price range preferences dựa trên purchase history
   */
  async updatePriceRangePreferences(userId) {
    try {
      // Lấy purchase interactions với product prices
      const purchases = await Interaction.find({ 
        userId, 
        type: 'purchase' 
      }).populate('productId', 'price');

      if (purchases.length === 0) {
        return; // No purchases yet
      }

      // Extract prices
      const prices = purchases
        .map(p => p.productId?.price)
        .filter(price => price && price > 0);

      if (prices.length === 0) {
        return;
      }

      // Calculate price statistics
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

      // Create price range buckets
      const priceRanges = {
        'under_10m': prices.filter(p => p < 10000000).length,
        '10m_20m': prices.filter(p => p >= 10000000 && p < 20000000).length,
        '20m_30m': prices.filter(p => p >= 20000000 && p < 30000000).length,
        '30m_50m': prices.filter(p => p >= 30000000 && p < 50000000).length,
        'over_50m': prices.filter(p => p >= 50000000).length
      };

      // Update price range preferences
      const priceUpdateOps = {};
      Object.keys(priceRanges).forEach(range => {
        if (priceRanges[range] > 0) {
          priceUpdateOps[`profile.preferences.price_range.${range}`] = priceRanges[range] * 10;
        }
      });

      await UserRecommendationProfile.updateOne(
        { userId },
        { $inc: priceUpdateOps }
      );

      console.log(`✅ Updated price range preferences for user ${userId}`);

    } catch (error) {
      console.error('❌ Error updating price range preferences:', error);
    }
  }

  /**
   * Lấy profile đã được normalize để dùng cho recommendation
   */
  async getNormalizedProfile(userId) {
    try {
      const profile = await UserRecommendationProfile.findOne({ userId });
      
      if (!profile) {
        return null;
      }

      // Normalize weights trong từng category
      const normalized = {
        brands: this.normalizeWeights(profile.profile.preferences.brands || {}),
        categories: this.normalizeWeights(profile.profile.preferences.categories || {}),
        cpu_specs: this.normalizeWeights(profile.profile.preferences.cpu_specs || {}),
        gpu_specs: this.normalizeWeights(profile.profile.preferences.gpu_specs || {}),
        ram_specs: this.normalizeWeights(profile.profile.preferences.ram_specs || {}),
        display_specs: this.normalizeWeights(profile.profile.preferences.display_specs || {}),
        storage_type_specs: this.normalizeWeights(profile.profile.preferences.storage_type_specs || {}),
        storage_capacity_specs: this.normalizeWeights(profile.profile.preferences.storage_capacity_specs || {}),
        price_range: this.normalizeWeights(profile.profile.preferences.price_range || {})
      };

      return normalized;

    } catch (error) {
      console.error('❌ Error getting normalized profile:', error);
      return null;
    }
  }

  /**
   * Normalize weights trong 1 category về range 0-1
   */
  normalizeWeights(weights) {
    const values = Object.values(weights);
    if (values.length === 0) return {};

    const maxWeight = Math.max(...values);
    if (maxWeight === 0) return {};

    const normalized = {};
    Object.keys(weights).forEach(key => {
      normalized[key] = weights[key] / maxWeight;
    });

    return normalized;
  }

  /**
   * Reset profile của user (nếu cần)
   */
  async resetUserProfile(userId) {
    try {
      await UserRecommendationProfile.deleteOne({ userId });
      console.log(`✅ Reset profile for user ${userId}`);
    } catch (error) {
      console.error('❌ Error resetting user profile:', error);
      throw error;
    }
  }

  /**
   * Lấy profile statistics
   */
  async getProfileStats(userId) {
    try {
      const profile = await UserRecommendationProfile.findOne({ userId });
      
      if (!profile) {
        return null;
      }

      const prefs = profile.profile.preferences;
      
      // Tính tổng số interactions
      const totalInteractions = Object.values(prefs).reduce((total, category) => {
        return total + Object.values(category || {}).reduce((sum, weight) => sum + weight, 0);
      }, 0);

      // Top preferences
      const topBrands = this.getTopPreferences(prefs.brands || {});
      const topCategories = this.getTopPreferences(prefs.categories || {});
      const topSpecs = {
        cpu: this.getTopPreferences(prefs.cpu_specs || {}),
        gpu: this.getTopPreferences(prefs.gpu_specs || {}),
        ram: this.getTopPreferences(prefs.ram_specs || {})
      };

      return {
        totalInteractions,
        topBrands,
        topCategories,
        topSpecs,
        profileStrength: Math.min(totalInteractions / 100, 1) // 0-1 scale
      };

    } catch (error) {
      console.error('❌ Error getting profile stats:', error);
      return null;
    }
  }

  /**
   * Get top N preferences từ 1 category
   */
  getTopPreferences(categoryPrefs, limit = 5) {
    return Object.entries(categoryPrefs)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([key, weight]) => ({ name: key, weight }));
  }
}

export default new ProfileUpdateService();