import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  hex: {
    type: String,
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

export default mongoose.model('Color', colorSchema);
