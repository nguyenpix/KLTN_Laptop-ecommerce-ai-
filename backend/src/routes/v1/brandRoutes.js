import express from 'express';
import { getBrands, getBrandById, createBrand, updateBrand, deleteBrand } from '../../controllers/brandController.js';

import { authenticateToken } from '../../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getBrands);
router.get('/:id', getBrandById);

// Protected routes (assuming admin access is checked within authenticateToken or a future middleware)
router.post('/', authenticateToken, createBrand);
router.put('/:id', authenticateToken, updateBrand);
router.delete('/:id', authenticateToken, deleteBrand);

export default router;
