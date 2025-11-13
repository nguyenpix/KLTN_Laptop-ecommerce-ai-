import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema({
    interactionId: {
        type: String,
        unique: true,
        default: () => `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },

    type: {
        type: String,
        enum: ['view', 'like', 'purchase', 'rating', 'add_to_cart', 'remove_from_cart', 'search_click'],
        required: true,
        index: true
    },

    weight: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },

    // Additional data
    metadata: {
        session_id: String,
        duration: Number, // for view interactions
        rating_value: { type: Number, min: 1, max: 5 }, // for rating interactions
        source: String // search, recommendation, category_browse
    }
}, {
    timestamps: true
});

// Compound indexes cho performance
interactionSchema.index({ userId: 1, timestamp: -1 });
interactionSchema.index({ productId: 1, type: 1, timestamp: -1 });
interactionSchema.index({ userId: 1, productId: 1 });

export default mongoose.model('Interaction', interactionSchema);

// ex
// userId: "user123",
// productId: "laptop456",
// type: "view",
// weight: 1,
// metadata: {
//      session_id: "sess_20250114_abc123",
//      duration: 45, // Xem 45 giây
//      source: "search"
// }