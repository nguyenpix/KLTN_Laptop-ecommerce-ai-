import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    // Lưu các sản phẩm được tham chiếu trong câu trả lời
    referenced_products: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        relevance_score: Number,
        chunks_used: [String] // IDs của chunks được dùng để generate answer
      }
    ],
    // Metadata cho debugging và monitoring
    metadata: {
      rag_results: {
        total_chunks: Number,
        top_scores: [Number],
        search_time_ms: Number
      },
      llm_metadata: {
        model: String,
        tokens_used: Number,
        generation_time_ms: Number
      }
    }
  },
  {
    timestamps: true
  }
);

// Indexes
messageSchema.index({ conversation_id: 1, createdAt: -1 });
messageSchema.index({ role: 1 });

export default mongoose.model('Message', messageSchema);
