import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  laptop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
}, {
  timestamps: true
});

wishlistSchema.index({ user_id: 1, laptop_id: 1 }, { unique: true });

export default mongoose.model('Wishlist', wishlistSchema);
