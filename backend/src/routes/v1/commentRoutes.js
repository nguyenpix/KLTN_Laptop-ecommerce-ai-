import express from 'express';
import commentController from '../../controllers/commentController.js';
import { auth } from '../../middlewares/auth.js';

const router = express.Router();

// Get comments for product/news
router.get('/product/:productId', commentController.getProductComments);
router.get('/news/:newsId', commentController.getNewsComments);

// Comment management
router.post('/', auth, commentController.createComment);
router.put('/:commentId', auth, commentController.updateComment);
router.delete('/:commentId', auth, commentController.deleteComment);

// Comment interactions
router.post('/:commentId/like', auth, commentController.toggleLikeComment);

export default router;