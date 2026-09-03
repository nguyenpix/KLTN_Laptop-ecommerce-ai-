import express from 'express';
import { forwardToAIService } from '../../middlewares/aiServiceProxy.js';

const router = express.Router();

// Forward interaction tracking to AI Microservice (:8000)
router.use('/', forwardToAIService('/interactions'));

export default router;