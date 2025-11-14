import express from 'express';
import {
  createColor,
  getColors,
  getColorById,
  updateColor,
  deleteColor,
} from '../../controllers/colorController.js';
import { authenticateToken, adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getColors);
router.get('/:id', getColorById);

// Protected routes - Admin only
router.post('/', adminAuth, createColor);
router.put('/:id', adminAuth, updateColor);
router.delete('/:id', adminAuth, deleteColor);

export default router;
