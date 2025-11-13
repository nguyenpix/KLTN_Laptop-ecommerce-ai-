import express from 'express';
import * as chatController from '../../controllers/chatController.js';
import { protect, optionalAuth } from '../../middlewares/auth.js';

const router = express.Router();

// Public routes - không cần authentication (dùng optionalAuth để lấy user nếu có)
router.post('/conversations', optionalAuth, chatController.createConversation);
router.post('/conversations/:conversationId/messages', optionalAuth, chatController.sendMessage);
router.get('/conversations/:conversationId', optionalAuth, chatController.getConversationDetail);

// Protected routes - cần authentication
router.get('/conversations', protect, chatController.getConversations);
router.patch('/conversations/:conversationId/status', protect, chatController.updateConversationStatus);
router.delete('/conversations/:conversationId', protect, chatController.deleteConversation);

export default router;
