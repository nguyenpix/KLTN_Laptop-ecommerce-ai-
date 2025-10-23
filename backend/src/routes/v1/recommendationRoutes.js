import express from 'express';
import recommendationController from '../../controllers/recommendationController.js';
import { auth } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/', auth, recommendationController.getRecommendations);


export default router;
