import mongoose from 'mongoose';

const productSpecificationSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  cpu: {
    type: String,
    required: true
  },
  gpu: {
    type: String,
    required: true
  },
  ram: {
    type: String,
    required: true
  },
  storage: {
    type: String,
    required: true
  },
  display: {
    type: String,
    required: true
  },
  battery: {
    type: String
  },
  os: {
    type: String
  },
  features: {
    type: String
  },
  npu: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('ProductSpecification', productSpecificationSchema);
