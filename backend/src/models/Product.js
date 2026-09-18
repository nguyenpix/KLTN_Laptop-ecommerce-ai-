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
  // HYBRID RECOMMENDATION SYSTEM VECTORS (ALS + SBERT)
  // ════════════════════════════════════════════════════════════════════
  
  // 1. COLLABORATIVE FILTERING VECTOR (ALS - Implicit Feedback)
  // Dùng để: Đại diện cho sức hút và định vị của laptop trong mắt cộng đồng người dùng
  // Thuật toán: Implicit ALS Matrix Factorization
  item_cf_vector: {
    type: [Number],
    default: undefined
  },
  cf_metadata: {
    model: { type: String, default: 'implicit-als' },
    dimensions: { type: Number },
    generated_at: Date
  },

  // 2. CONTENT-BASED FILTERING VECTOR (Sentence-BERT - Hardware Specs)
  // Dùng để: Hiểu đặc tính kỹ thuật phần cứng (CPU, GPU, RAM, Display), triệt tiêu Cold-Start sản phẩm mới
  // Thuật toán: Sentence-BERT (SBERT)
  item_content_vector: {
    type: [Number],
    default: undefined,
    validate: {
      validator: function(v) {
        return !v || v.length === 384; // SBERT standard dimensions
      },
      message: 'Item content vector must have 384 dimensions'
    }
  },
  content_metadata: {
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

  // ════════════════════════════════════════════════════════════════════
  // RAG CHATBOT EMBEDDINGS SYSTEM
  // ════════════════════════════════════════════════════════════════════
  
  // RAG CHATBOT SUMMARY EMBEDDING
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
  
  // RAG CHATBOT DETAILED CHUNKS
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
      question: String,
      priority: {
        type: Number,
        default: 5,
        min: 1,
        max: 10
      }
    }
  }],
  
  embedding_metadata: {
    model: { 
      type: String, 
      default: 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2' 
    },
    dimensions: { type: Number, default: 384 },
    total_chunks: { type: Number, default: 0 },
    generated_at: Date,
    description_length: Number,
    version: { type: String, default: '1.0' }
  },
  
  tags: { type: [{ type: String }], default: [] }
}, { timestamps: true });

// ════════════════════════════════════════════════════════════════════
// INDEXES FOR PERFORMANCE
// ════════════════════════════════════════════════════════════════════

// Indexes cho Hybrid Recommendation System
productSchema.index({ item_cf_vector: 1 });
productSchema.index({ item_content_vector: 1 });

// Indexes cho RAG search
productSchema.index({ rag_embedding: 1 });
productSchema.index({ 'document_chunks.embedding': 1 });
productSchema.index({ 'document_chunks.metadata.type': 1 });
productSchema.index({ 'document_chunks.metadata.priority': -1 });

// Compound indexes cho filtering kết hợp
productSchema.index({ price: 1, brand_id: 1, category_id: 1 });
productSchema.index({ brand_id: 1, price: 1 });

export default mongoose.model('Product', productSchema);
