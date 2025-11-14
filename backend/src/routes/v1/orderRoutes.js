import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders
} from '../../controllers/orderController.js';
import { authenticateToken, adminAuth } from '../../middlewares/auth.js';

const router = express.Router();


router.use(authenticateToken);

router.post('/', createOrder);
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', adminAuth, updateOrderStatus); 
router.get('/', adminAuth, getAllOrders); 

export default router;
