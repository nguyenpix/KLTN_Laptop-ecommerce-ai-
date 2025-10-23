import express from 'express';
import productRoutes from './productRoutes.js';
import userRoutes from './userRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import colorRoutes from './colorRoutes.js';
import brandRoutes from './brandRoutes.js';
import interactionRoutes from './interactionRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';
import newsRoutes from './newsRoutes.js';
import commentRoutes from './commentRoutes.js';
import recommendationRoutes from './recommendationRoutes.js';
const router = express.Router();

router.use('/brands', brandRoutes);
router.use('/cart', cartRoutes);
router.use('/categories', categoryRoutes);
router.use('/colors', colorRoutes);
router.use('/orders', orderRoutes);
router.use('/products', productRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/users', userRoutes);

router.use('/interactions', interactionRoutes);   
// recommendation
router.use('/feedbacks', feedbackRoutes);
router.use('/news', newsRoutes);
router.use('/comments', commentRoutes);


export default router;
