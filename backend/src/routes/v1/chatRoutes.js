import express from 'express';
import { optionalAuth, authenticateToken } from '../../middlewares/auth.js';
import {
  createConversation,
  getConversations,
  getConversationDetail,
  sendMessage,
  updateConversationStatus,
  deleteConversation
} from '../../controllers/chatController.js';

const router = express.Router();

router.post('/conversations', optionalAuth, createConversation);
router.get('/conversations', optionalAuth, getConversations);
router.get('/conversations/:conversationId', optionalAuth, getConversationDetail);
router.post('/conversations/:conversationId/messages', optionalAuth, sendMessage);
router.put('/conversations/:conversationId/status', optionalAuth, updateConversationStatus);
router.delete('/conversations/:conversationId', optionalAuth, deleteConversation);

export default router;
