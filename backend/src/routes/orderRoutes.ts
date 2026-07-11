import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderDetails,
  updateOrderStatus,
  getVendorOrders
} from '../controllers/orderController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All order routes require authentication
router.use(authMiddleware);

router.post('/create', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderDetails);
router.put('/:id/status', updateOrderStatus);
router.get('/vendor/orders', getVendorOrders);

export default router;