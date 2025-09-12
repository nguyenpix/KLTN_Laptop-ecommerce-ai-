import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shipping_address: {
    type: String,
    required: true
  },
  payment_method: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Order', orderSchema);
