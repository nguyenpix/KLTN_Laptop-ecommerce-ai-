import mongoose from 'mongoose';

const productImageSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  url: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('ProductImage', productImageSchema);
