import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Brand', brandSchema);
