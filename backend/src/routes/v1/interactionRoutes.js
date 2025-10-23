import express from 'express';
import interactionController from '../../controllers/interactionController.js';
import { auth } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/track', auth, interactionController.trackInteraction);
router.post('/view', auth, interactionController.trackView);
router.post('/like/:productId', auth, interactionController.toggleLike);

router.post('/cart/add', auth, interactionController.addToCart);
router.delete('/cart/:cartItemId', auth, interactionController.removeFromCart);

router.post('/order', auth, interactionController.createOrder);

router.post('/feedback', auth, interactionController.createFeedback);

router.get('/history', auth, interactionController.getUserInteractions);

export default router;