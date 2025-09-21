import mongoose from "mongoose";
const newsSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    news_id: { type: mongoose.Schema.Types.ObjectId, ref: 'News', required: true }
}, { timestamps: true });

export default mongoose.model("ProductNews", newsSchema);
