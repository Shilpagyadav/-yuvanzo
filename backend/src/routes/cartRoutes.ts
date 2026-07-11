import express from 'express';
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

router.post('/add', addToCart);
router.get('/', getCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);

export default router;