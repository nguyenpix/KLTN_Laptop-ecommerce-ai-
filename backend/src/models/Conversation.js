import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      default: 'Hội thoại mới'
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'closed'],
      default: 'active',
      index: true
    },
    // Lưu context tổng hợp của conversation
    context_summary: {
      interested_products: [
        {
          product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
          },
          mention_count: {
            type: Number,
            default: 1
          }
        }
      ],
      topics: [String], // ['gaming laptop', 'price under 20M', 'RTX 4050']
      last_intent: String // 'inquiry', 'comparison', 'purchase_intent', 'technical_question'
    },
    last_message_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes
conversationSchema.index({ user_id: 1, status: 1 });
conversationSchema.index({ last_message_at: -1 });
conversationSchema.index({ 'context_summary.interested_products.product_id': 1 });

export default mongoose.model('Conversation', conversationSchema);
