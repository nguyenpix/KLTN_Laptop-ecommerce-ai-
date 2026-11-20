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

    if (userId) {
      userProfileService.calculateUserProfile(userId, { saveToDb: true }).catch(() => {});
    }

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

// [GET] /api/v1/interactions/history
// Lấy lịch sử tương tác của người dùng hiện tại kèm thống kê theo loại hành vi
export const getUserInteractions = async (req, res) => {
  try {
    const rawUserId = req.user?._id || req.query.userId;
    if (!rawUserId || !mongoose.Types.ObjectId.isValid(rawUserId)) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để xem lịch sử tương tác',
      });
    }

    const userId = new mongoose.Types.ObjectId(rawUserId);
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const { type } = req.query;

    const filter = { userId };
    if (type && type !== 'all') {
      filter.type = type;
    }

    const [interactions, total, typeStats] = await Promise.all([
      Interaction.find(filter)
        .populate({
          path: 'productId',
          select: 'title name price images brand_id sku',
          populate: { path: 'brand_id', select: 'name' },
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Interaction.countDocuments(filter),
      Interaction.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalWeight: { $sum: '$weight' },
          },
        },
      ]),
    ]);

    const byType = {
      view: 0,
      like: 0,
      add_to_cart: 0,
      rating: 0,
      purchase: 0,
    };
    let totalAllTypes = 0;
    for (const item of typeStats) {
      if (item._id) {
        byType[item._id] = item.count;
        totalAllTypes += item.count;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        interactions,
        stats: {
          total: totalAllTypes,
          byType,
        },
        pagination: {
          current: page,
          pages: Math.ceil(total / limit) || 1,
          total,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Error getting user interactions:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử tương tác',
      error: error.message,
    });
  }
};
