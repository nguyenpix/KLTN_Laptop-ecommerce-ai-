import mongoose from 'mongoose';

const userRecommendationProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  profile: {
    preferences: {
      brands: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },

      categories: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },

      cpu_specs: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },

      gpu_specs: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },

      ram_specs: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      price_range: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      display_specs: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      storage_type_specs: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      storage_capacity_specs: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    }
  },

  // ═══════════════════════════════════════════════════════
  // USER EMBEDDING (NEW - để dùng với Vector Search)
  // ═══════════════════════════════════════════════════════
  user_embedding: {
    type: [Number],
    validate: {
      validator: function(v) {
        return !v || v.length === 0 || v.length === 384;
      },
      message: 'User embedding must have 384 dimensions'
    }
  },

  embedding_metadata: {
    model: {
      type: String,
      default: 'weighted-average-from-interactions'
    },
    dimensions: {
      type: Number,
      default: 384
    },
    generated_at: Date,
    quality: {
      type: String,
      enum: ['default', 'low', 'medium', 'high'],
      default: 'low'
      // default: từ popular products (lazy init)
      // low: < 5 interactions
      // medium: 5-20 interactions
      // high: > 20 interactions
    },
    num_interactions: {
      type: Number,
      default: 0
    },
    last_updated: Date,
    source: String, // 'popular_products', 'newest_products', 'interactions'
    base_product_ids: [mongoose.Schema.Types.ObjectId],
    base_product_count: Number
  }

}, { 
  timestamps: true 
});

// Index để query nhanh
userRecommendationProfileSchema.index({ userId: 1 });

export default mongoose.model('UserRecommendationProfile', userRecommendationProfileSchema);

// ex
// {
//   "userId": "u_001",
//   "profile": {
//     "preferences": {
//       "brands": { "Dell": 10, "Asus": 3 },
//       "categories": { "laptop_gaming": 10 },
//       "gpu_specs": { "RTX 3060": 10 }...
//     }
//   }
// }
