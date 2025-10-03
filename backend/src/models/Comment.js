import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    text: { type: String, required: true },
    time: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Comment", commentSchema);
