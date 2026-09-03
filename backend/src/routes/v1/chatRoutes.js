import express from 'express';
import { forwardToAIService } from '../../middlewares/aiServiceProxy.js';

const router = express.Router();

// Forward all chat requests to AI Microservice (:8000)
router.use('/', forwardToAIService('/chat'));

export default router;
