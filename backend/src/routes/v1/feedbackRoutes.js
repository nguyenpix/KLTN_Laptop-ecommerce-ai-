import express from 'express';
import feedbackController from '../../controllers/feedbackController.js';
import { auth } from '../../middlewares/auth.js';

const router = express.Router();

// Get product feedbacks
router.get('/product/:productId', feedbackController.getProductFeedbacks);

// User feedback management
router.post('/', auth, feedbackController.createFeedback);
router.put('/:feedbackId', auth, feedbackController.updateFeedback);
router.delete('/:feedbackId', auth, feedbackController.deleteFeedback);

// User's feedbacks
router.get('/my-feedbacks', auth, feedbackController.getUserFeedbacks);

// Wishlist from feedbacks
router.get('/wishlist', auth, feedbackController.getWishlistFromFeedbacks);
router.post('/wishlist/:feedbackId', auth, feedbackController.toggleWishlist);

export default router;