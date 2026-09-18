import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  avatar_url: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // ════════════════════════════════════════════════════════════════════
  // USER PROFILE VECTORS FOR HYBRID RECOMMENDATION
  // ════════════════════════════════════════════════════════════════════
  
  // Vector Profile phản ánh hành vi ngầm từ ALS (Weighted Average + L2 Norm)
  user_cf_vector: {
    type: [Number],
    default: undefined
  },

  // Vector Profile phản ánh sở thích cấu hình phần cứng từ SBERT (384-dim)
  user_content_vector: {
    type: [Number],
    default: undefined
  },

  // Phân tích thống kê sở thích người dùng (cập nhật theo thời gian thực)
  profile_preferences: {
    top_brands: [{ type: String }],
    top_categories: [{ type: String }],
    price_affinity: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      avg: { type: Number, default: 0 }
    },
    total_interactions: { type: Number, default: 0 },
    last_calculated_at: { type: Date }
  },

  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Băm trc khi lưu
userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// check mk 
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

export default mongoose.model('User', userSchema);