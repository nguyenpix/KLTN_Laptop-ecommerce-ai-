import express from 'express';
import { forwardToAIService } from '../../middlewares/aiServiceProxy.js';

const router = express.Router();

// Forward all recommendation requests to AI Microservice (:8000)
router.use('/', forwardToAIService('/recommendations'));

export default router;
