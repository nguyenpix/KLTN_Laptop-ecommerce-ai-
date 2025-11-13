import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    news_id: { type: mongoose.Schema.Types.ObjectId, ref: 'News' },
    text: { type: String, required: true },
    time: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Ensure either product_id or news_id is provided
commentSchema.pre('validate', function(next) {
    if (!this.product_id && !this.news_id) {
        next(new Error('Either product_id or news_id must be provided'));
    } else {
        next();
    }
});

export default mongoose.model("Comment", commentSchema);
