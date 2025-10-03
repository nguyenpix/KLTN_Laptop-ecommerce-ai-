import express from 'express';
import productRoutes from './productRoutes.js';
import userRoutes from './userRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import categoryRoutes from './categoryRoutes.js';

const router = express.Router();

// Các route API
router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/categories', categoryRoutes);

export default router;
