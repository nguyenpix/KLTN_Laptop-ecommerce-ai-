import mongoose from 'mongoose';
import Interaction from '../models/Interaction.js';
import userProfileService from '../services/userProfileService.js';

/**
 * INTERACTION CONTROLLER (Native Node.js Implementation)
 * Ghi nhận hành vi người dùng vào MongoDB và cập nhật Profile Vector theo thời gian thực
 */

// [POST] /api/v1/interactions/view
export const trackView = async (req, res) => {
  try {
    const { product_id, productId, duration = 5 } = req.body;
    const pId = product_id || productId;
    const userId = req.user?._id || req.body.userId || null;

    if (!pId || !mongoose.Types.ObjectId.isValid(pId)) {
      return res.status(400).json({ success: false, message: 'product_id không hợp lệ' });
    }

    const interaction = await Interaction.create({
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      productId: new mongoose.Types.ObjectId(pId),
      type: 'view',
      weight: duration > 60 ? 1.5 : 1.0,
      metadata: { duration: Number(duration) }
    });

    if (userId) {
      // Cập nhật ngầm profile
      userProfileService.calculateUserProfile(userId, { saveToDb: true }).catch(() => {});
    }

    return res.status(200).json({ success: true, data: interaction });
  } catch (error) {
    console.error('Error tracking view:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// [POST] /api/v1/interactions/like/:productId
export const toggleLike = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?._id || req.body.userId;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'productId không hợp lệ' });
    }

    const interaction = await Interaction.create({
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      productId: new mongoose.Types.ObjectId(productId),
      type: 'like',
      weight: 3.0
    });

    if (userId) {
      userProfileService.calculateUserProfile(userId, { saveToDb: true }).catch(() => {});
    }

    return res.status(200).json({ success: true, data: interaction });
  } catch (error) {
    console.error('Error tracking like:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// [POST] /api/v1/interactions/cart/add
export const trackAddToCart = async (req, res) => {
  try {
    const { product_id, productId, quantity = 1, price } = req.body;
    const pId = product_id || productId;
    const userId = req.user?._id || req.body.userId;

    if (!pId || !mongoose.Types.ObjectId.isValid(pId)) {
      return res.status(400).json({ success: false, message: 'product_id không hợp lệ' });
    }

    const interaction = await Interaction.create({
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      productId: new mongoose.Types.ObjectId(pId),
      type: 'add_to_cart',
      weight: 5.0,
      metadata: { quantity: Number(quantity), price: Number(price) }
    });

    if (userId) {
      userProfileService.calculateUserProfile(userId, { saveToDb: true }).catch(() => {});
    }

    return res.status(200).json({ success: true, data: interaction });
  } catch (error) {
    console.error('Error tracking add to cart:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// [DELETE] /api/v1/interactions/cart/:itemId
export const trackRemoveFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    return res.status(200).json({ success: true, message: 'Đã xóa khỏi giỏ', itemId });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// [POST] /api/v1/interactions/feedback
export const trackFeedback = async (req, res) => {
  try {
    const { product_id, productId, rating = 5 } = req.body;
    const pId = product_id || productId;
    const userId = req.user?._id || req.body.userId;

    const interaction = await Interaction.create({
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      productId: new mongoose.Types.ObjectId(pId),
      type: 'rating',
      weight: Number(rating) >= 4 ? 8.0 : 0.5,
      metadata: { rating_value: Number(rating) }
    });

    return res.status(200).json({ success: true, data: interaction });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// [POST] /api/v1/interactions/order
export const trackOrder = async (req, res) => {
  try {
    const { items = [], total_amount } = req.body;
    const userId = req.user?._id || req.body.userId;

    for (const item of items) {
      const pId = item.product_id || item.productId || item._id;
      if (pId && mongoose.Types.ObjectId.isValid(pId)) {
        await Interaction.create({
          userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
          productId: new mongoose.Types.ObjectId(pId),
          type: 'purchase',
          weight: 10.0,
          metadata: { price: item.price, total_amount }
        });
      }
    }

    if (userId) {
      userProfileService.calculateUserProfile(userId, { saveToDb: true }).catch(() => {});
    }

    return res.status(200).json({ success: true, message: 'Đã ghi nhận đơn hàng thành công' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
