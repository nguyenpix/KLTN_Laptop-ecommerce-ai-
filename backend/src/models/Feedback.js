import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { 
        type: Number, 
        required: false,  // Không bắt buộc nếu chỉ wishlist
        min: 0,  // Cho phép 0 cho wishlist-only items
        max: 5,
        default: 0
    },
    comment: { 
        type: String, 
        required: false,  // Không bắt buộc nếu chỉ wishlist
        trim: true,
        default: ''
    },
    wishlist: { type: Boolean, default: false }
}, { timestamps: true });

// Add index for user-product combination
feedbackSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

export default mongoose.model('Feedback', feedbackSchema);