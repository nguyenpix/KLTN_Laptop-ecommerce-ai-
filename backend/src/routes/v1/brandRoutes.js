import express from 'express';
import { getBrands, getBrandById, createBrand, updateBrand, deleteBrand } from '../../controllers/brandController.js';

import { authenticateToken, adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getBrands);
router.get('/:id', getBrandById);

// Protected routes - Admin only
router.post('/', adminAuth, createBrand);
router.put('/:id', adminAuth, updateBrand);
router.delete('/:id', adminAuth, deleteBrand);

export default router;
