import express from 'express';
import { optionalAuth, authenticateToken } from '../../middlewares/auth.js';
import {
  getHybridRecommendations,
  getUserProfile,
  calculateSessionProfile,
  getSimilarProducts
} from '../../controllers/recommendationController.js';

const router = express.Router();

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * HYBRID RECOMMENDATION API ROUTES (ALS + SBERT)
 * ══════════════════════════════════════════════════════════════════════════════
 */

// [GET] /api/v1/recommendations/hybrid
// Gợi ý Hybrid trực tuyến với alpha tùy biến (?alpha=0.7&limit=10)
router.get('/hybrid', optionalAuth, getHybridRecommendations);

// [GET] /api/v1/recommendations (Mặc định gọi Hybrid Recommendation)
router.get('/', optionalAuth, getHybridRecommendations);

// [GET] /api/v1/recommendations/user-profile
// Trích xuất Profile Vector và sở thích cá nhân hóa của User
router.get('/user-profile', optionalAuth, getUserProfile);

// [POST] /api/v1/recommendations/session-profile
// Tính toán tức thì Profile Vector cho Guest / New User từ các item trong phiên
router.post('/session-profile', calculateSessionProfile);

// [GET] /api/v1/recommendations/similar/:productId
// Gợi ý các sản phẩm tương tự (Item-to-Item Similarity)
router.get('/similar/:productId', getSimilarProducts);

export default router;
