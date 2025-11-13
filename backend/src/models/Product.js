import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, min: 0 },
  title: { type: String, required: true, trim: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  description_clean: { type: String },
  images: {
    mainImg: {
      url: { type: String, required: true },
      alt_text: { type: String }
    },
    sliderImg: [{
      url: { type: String, required: true },
      alt_text: { type: String }
    }]
  },

  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 20, min: 0 }, // Số lượng tồn kho
  color_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Color', required: true },
  brand_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },

  specifications: {
    cpu: { type: String },
    gpu: { type: String },
    display: { type: String },
    webcam: { type: String },
    ram: { type: String },
    storage_type: {
      type: String // SSD, HDD
    },
    storage_capacity: {
      type: String // 512GB, 1TB
    },
    ports: { type: String },
    audio: { type: String },
    connectivity: { type: String },
    keyboard: { type: String },
    os: { type: String },
    size: { type: String },
    battery: { type: String },
    weight: { type: String },
    material: { type: String },
    security: { type: String },
    accessories: { type: String }
  },

  faqs: [{
    question: String,
    answer: String
  }],
  sku: { type: String },
  part_number: { type: String },
  series: { type: String },
  category_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }],
  
  // ════════════════════════════════════════════════════════════════════
  // EMBEDDINGS SYSTEM
  // ════════════════════════════════════════════════════════════════════
  
  // 1. RECOMMENDATION SYSTEM EMBEDDING
  // Dùng để: Tìm sản phẩm tương tự, gợi ý sản phẩm
  // Input: Specifications + Price + Brand + Category
  embedding: {
    type: [Number],
    default: undefined,
    validate: {
      validator: function(v) {
        return !v || v.length === 384; // paraphrase-multilingual-MiniLM-L12-v2
      },
      message: 'Recommendation embedding must have 384 dimensions'
    }
  },
  
  // Metadata cho recommendation embedding
  recommendation_metadata: {
    model: { 
      type: String, 
      default: 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2' 
    },
    dimensions: { type: Number, default: 384 },
    generated_at: Date,
    input_features: {
      type: [String],
      default: ['specs', 'price', 'brand', 'category']
    }
  },
  
  // 2. RAG CHATBOT SUMMARY EMBEDDING
  // Dùng để: Quick filter - lọc nhanh sản phẩm liên quan trước khi deep search
  // Input: Summary của toàn bộ thông tin (name + price + specs nổi bật + mô tả ngắn)
  rag_embedding: {
    type: [Number],
    default: undefined,
    validate: {
      validator: function(v) {
        return !v || v.length === 384;
      },
      message: 'RAG summary embedding must have 384 dimensions'
    }
  },
  
  // 3. RAG CHATBOT DETAILED CHUNKS
  // Dùng để: Deep search - tìm thông tin chi tiết, chính xác
  // Input: Từng đoạn nhỏ của description, specs, FAQs
  document_chunks: [{
    content: {
      type: String,
      required: true,
      trim: true
    },
    embedding: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return v && v.length === 384;
        },
        message: 'Chunk embedding must have 384 dimensions'
      }
    },
    metadata: {
      type: {
        type: String,
        enum: ['description', 'specifications', 'faq', 'summary'],
        required: true
      },
      chunk_index: {
        type: Number,
        default: 0
      },
      char_count: Number,
      // Chỉ có khi type = 'faq'
      question: String,
      // Priority cho ranking (cao hơn = quan trọng hơn)
      priority: {
        type: Number,
        default: 5,
        min: 1,
        max: 10
      }
    }
  }],
  
  // Metadata chung cho RAG embeddings
  embedding_metadata: {
    model: { 
      type: String, 
      default: 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2' 
    },
    dimensions: { type: Number, default: 384 },
    total_chunks: { type: Number, default: 0 },
    generated_at: Date,
    description_length: Number,
    // Version để tracking khi update model
    version: { type: String, default: '1.0' }
  },
  
  tags: { type: [{ type: String }], default: [] }
}, { timestamps: true });

// ════════════════════════════════════════════════════════════════════
// INDEXES FOR PERFORMANCE
// ════════════════════════════════════════════════════════════════════

// Index cho recommendation system
productSchema.index({ embedding: 1 });

// Index cho RAG search
productSchema.index({ rag_embedding: 1 });
productSchema.index({ 'document_chunks.embedding': 1 });
productSchema.index({ 'document_chunks.metadata.type': 1 });
productSchema.index({ 'document_chunks.metadata.priority': -1 });

// Compound index cho filtering
productSchema.index({ price: 1, embedding: 1 });
productSchema.index({ brand_id: 1, embedding: 1 });
productSchema.index({ category_id: 1, embedding: 1 });

export default mongoose.model('Product', productSchema);
