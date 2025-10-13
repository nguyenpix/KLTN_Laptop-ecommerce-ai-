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
    },
    timestamps: true
  }
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
