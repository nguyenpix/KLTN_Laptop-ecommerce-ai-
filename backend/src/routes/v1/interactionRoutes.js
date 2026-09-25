import express from 'express';
import { optionalAuth, authenticateToken } from '../../middlewares/auth.js';
import {
  trackView,
  toggleLike,
  trackAddToCart,
  trackRemoveFromCart,
  trackFeedback,
  trackOrder
} from '../../controllers/interactionController.js';

const router = express.Router();

router.post('/view', optionalAuth, trackView);
router.post('/like/:productId', optionalAuth, toggleLike);
router.post('/cart/add', optionalAuth, trackAddToCart);
router.delete('/cart/:itemId', optionalAuth, trackRemoveFromCart);
router.post('/feedback', optionalAuth, trackFeedback);
router.post('/order', optionalAuth, trackOrder);

export default router;