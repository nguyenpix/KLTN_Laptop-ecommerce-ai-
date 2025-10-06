import express from 'express';
import productRoutes from './productRoutes.js';
import userRoutes from './userRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import colorRoutes from './colorRoutes.js';
import brandRoutes from './brandRoutes.js';
// import newsRoutes from './newsRoutes.js';
// import feedbackRoutes from './feedbackRoutes.js';

const router = express.Router();

// Các route API
router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/categories', categoryRoutes);
router.use('/colors', colorRoutes);
router.use('/brands', brandRoutes);
// router.use('/news', newsRoutes);
// router.use('/feedbacks', feedbackRoutes);


export default router;
