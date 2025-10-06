import express from 'express';
import {
  createColor,
  getColors,
  getColorById,
  updateColor,
  deleteColor,
} from '../../controllers/colorController.js';
import { authenticateToken } from '../../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getColors);
router.get('/:id', getColorById);

// Protected routes (assuming admin access is checked within authenticateToken or a future middleware)
router.post('/', authenticateToken, createColor);
router.put('/:id', authenticateToken, updateColor);
router.delete('/:id', authenticateToken, deleteColor);

export default router;
