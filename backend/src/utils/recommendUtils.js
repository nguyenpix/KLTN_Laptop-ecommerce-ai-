// utils/recommendUtils.js
import Product from '../models/Product.js';
import Feedback from '../models/Feedback.js';
import CartItem from '../models/CartItem.js';
import OrderItem from '../models/OrderItem.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import { Matrix } from 'ml-matrix';
import { similarity } from 'ml-distance';
import { buildUserItemMatrix } from './matrixUtils.js';

// Content-based Filtering: Tạo vector hồ sơ người dùng
async function getUserProfileVector(userId) {
  // Lấy tất cả sản phẩm đã tương tác
  const feedbacks = await Feedback.find({ user_id: userId });
  const cart = await Cart.findOne({ user_id: userId });
  const cartItems = cart ? await CartItem.find({ cart_id: cart._id }) : [];
  const orders = await Order.find({ user_id: userId, status: { $in: ['confirmed', 'delivered'] } });
  const orderItems = await OrderItem.find({ order_id: { $in: orders.map(o => o._id) } });

  const productIds = [
    ...new Set([
      ...feedbacks.map(f => f.product_id.toString()),
      ...cartItems.map(c => c.laptop_id.toString()),
      ...orderItems.map(o => o.laptop_id.toString())
    ])
  ].map(id => mongoose.Types.ObjectId(id));

  const products = await Product.find({ _id: { $in: productIds } });
  if (products.length === 0) return null; // Cold-start

  // Tính trung bình embeddings, có trọng số dựa trên tương tác
  const weights = new Map();
  feedbacks.forEach(f => weights.set(f.product_id.toString(), f.rating + (f.wishlist ? 1 : 0)));
  cartItems.forEach(c => weights.set(c.laptop_id.toString(), (weights.get(c.laptop_id.toString()) || 0) + c.quantity * 3));
  orderItems.forEach(o => weights.set(o.laptop_id.toString(), (weights.get(o.laptop_id.toString()) || 0) + o.quantity * 10));

  const embeddings = products.map(p => p.embedding);
  const totalWeight = Array.from(weights.values()).reduce((sum, w) => sum + w, 0) || 1;
  const avgVector = embeddings[0].map((_, i) =>
    embeddings.reduce((sum, emb, idx) => sum + emb[i] * (weights.get(products[idx]._id.toString()) || 1), 0) / totalWeight
  );

  return avgVector;
}

// Content-based Filtering: Tìm ứng viên
async function getContentBasedCandidates(userId, limit = 100) {
  const userVector = await getUserProfileVector(userId);
  if (!userVector) {
    // Fallback: Gợi ý sản phẩm phổ biến
    return await Product.find().sort({ 'specifications.views': -1 }).limit(limit);
  }

  const pipeline = [
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'embedding',
        queryVector: userVector,
        numCandidates: 200,
        limit
      }
    },
    { $project: { _id: 1, title: 1, price: 1, description: 1, score: { $meta: 'vectorSearchScore' } } }
  ];

  return await Product.aggregate(pipeline);
}

// Collaborative Filtering: Tính ma trận item-item similarity
async function buildItemSimilarityMatrix() {
  const { matrix } = await buildUserItemMatrix();
  const itemSimilarity = Matrix.zeros(matrix.columns, matrix.columns);

  for (let i = 0; i < matrix.columns; i++) {
    for (let j = 0; j < matrix.columns; j++) {
      const vecI = matrix.getColumn(i);
      const vecJ = matrix.getColumn(j);
      itemSimilarity.set(i, j, similarity.cosine(vecI, vecJ));
    }
  }

  return itemSimilarity;
}

// Collaborative Filtering: Tính điểm để re-rank
async function getCollaborativeScores(userId, candidates) {
  const { matrix, userIndex, itemIndex } = await buildUserItemMatrix();
  const itemSimilarity = await buildItemSimilarityMatrix();
  const feedbacks = await Feedback.find({ user_id: userId });
  const cart = await Cart.findOne({ user_id: userId });
  const cartItems = cart ? await CartItem.find({ cart_id: cart._id }) : [];
  const orders = await Order.find({ user_id: userId, status: { $in: ['confirmed', 'delivered'] } });
  const orderItems = await OrderItem.find({ order_id: { $in: orders.map(o => o._id) } });

  const userItems = [
    ...feedbacks.map(f => ({ id: f.product_id.toString(), value: f.rating + (f.wishlist ? 1 : 0) })),
    ...cartItems.map(c => ({ id: c.laptop_id.toString(), value: c.quantity * 3 })),
    ...orderItems.map(o => ({ id: o.laptop_id.toString(), value: o.quantity * 10 }))
  ];

  const scores = {};
  candidates.forEach(cand => {
    const candIdx = itemIndex.get(cand._id.toString());
    if (candIdx === undefined) return; // Bỏ qua nếu không có trong ma trận
    let score = 0;
    userItems.forEach(item => {
      const userItemIdx = itemIndex.get(item.id);
      if (userItemIdx !== undefined) {
        const sim = itemSimilarity.get(candIdx, userItemIdx) || 0;
        score += sim * item.value;
      }
    });
    scores[cand._id.toString()] = score;
  });

  return scores;
}

export { getUserProfileVector, getContentBasedCandidates, buildItemSimilarityMatrix, getCollaborativeScores };