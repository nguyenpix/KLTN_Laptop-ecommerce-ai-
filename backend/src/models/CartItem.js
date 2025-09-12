import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  cart_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    required: true
  },
  laptop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('CartItem', cartItemSchema);
