import hybridRecService from '../services/hybridRecService.js';
import userProfileService from '../services/userProfileService.js';

/**
 * RECOMMENDATION CONTROLLER
 * Cung cấp các API phục vụ gợi ý sản phẩm và trích xuất Profile Vector người dùng
 */

// [GET] /api/v1/recommendations/hybrid
// Gợi ý sản phẩm kết hợp Hybrid (ALS + SBERT)
export const getHybridRecommendations = async (req, res) => {
  try {
    const {
      alpha = 0.3,
      limit = 10,
      brand,
      category,
      minPrice,
      maxPrice,
      excludePurchased = 'true',
      maxPerBrand = 3,
      session_items
    } = req.query;

    // Xác định userId nếu người dùng đã đăng nhập
    const userId = req.user?._id || req.query.userId || null;

    // Phân tích sessionItems nếu là khách vãng lai gửi chuỗi qua query/body
    let parsedSessionItems = null;
    if (session_items) {
      try {
        parsedSessionItems = typeof session_items === 'string' 
          ? JSON.parse(session_items) 
          : session_items;
      } catch (e) {
        parsedSessionItems = session_items.split(',').map(id => ({ productId: id.trim(), weight: 1.0 }));
      }
    }

    const filters = {};
    if (brand) filters.brand = brand;
    if (category) filters.category = category;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;

    const result = await hybridRecService.getHybridRecommendations({
      userId,
      sessionItems: parsedSessionItems,
      alpha: parseFloat(alpha),
      limit: parseInt(limit, 10),
      filters,
      excludePurchased: excludePurchased === 'true',
      maxPerBrand: parseInt(maxPerBrand, 10)
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in getHybridRecommendations:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tính toán gợi ý sản phẩm',
      error: error.message
    });
  }
};

// [GET] /api/v1/recommendations/user-profile
// Lấy Profile Vector và phân tích thị hiếu của người dùng
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Yêu cầu đăng nhập hoặc cung cấp userId để xem profile'
      });
    }

    const profile = await userProfileService.calculateUserProfile(userId, { saveToDb: true });

    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tính toán Profile người dùng',
      error: error.message
    });
  }
};

// [POST] /api/v1/recommendations/session-profile
// Tính toán tức thì Session Profile Vector từ danh sách tương tác trong phiên (cho Guest / Cold-Start)
export const calculateSessionProfile = async (req, res) => {
  try {
    const { sessionItems } = req.body;
    if (!sessionItems || !Array.isArray(sessionItems)) {
      return res.status(400).json({
        success: false,
        message: 'sessionItems phải là một mảng danh sách sản phẩm'
      });
    }

    const profile = await userProfileService.calculateSessionProfile(sessionItems);

    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error in calculateSessionProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tính Session Profile',
      error: error.message
    });
  }
};

// [GET] /api/v1/recommendations/similar/:productId
// Gợi ý các sản phẩm tương tự khi đang xem một sản phẩm
export const getSimilarProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { alpha = 0.3, limit = 6 } = req.query;

    const result = await hybridRecService.getSimilarProducts(productId, {
      alpha: parseFloat(alpha),
      limit: parseInt(limit, 10)
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in getSimilarProducts:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm sản phẩm tương tự',
      error: error.message
    });
  }
};
