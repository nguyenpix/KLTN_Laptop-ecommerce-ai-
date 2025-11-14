import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../../controllers/productController.js';
import { authenticateToken, adminAuth } from '../../middlewares/auth.js';

const router = express.Router();


router.get('/', getProducts);
router.get('/:id', getProductById);

// yêu cầu xác thực admin
router.post('/', adminAuth, createProduct);
router.put('/:id', adminAuth, updateProduct);
router.delete('/:id', adminAuth, deleteProduct);

export default router;
