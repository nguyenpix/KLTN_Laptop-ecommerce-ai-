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
  embedding: [Number],
  tags: { type: [{ type: String }], default: [] }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
