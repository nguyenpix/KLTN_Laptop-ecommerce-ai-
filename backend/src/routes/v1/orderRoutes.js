import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders
} from '../../controllers/orderController.js';
import { authenticateToken } from '../../middlewares/auth.js';

const router = express.Router();


router.use(authenticateToken);

router.post('/', createOrder);
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus); 
router.get('/', getAllOrders); 

export default router;
