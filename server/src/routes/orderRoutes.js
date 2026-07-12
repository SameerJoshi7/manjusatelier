import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';

const router = Router();

router.use(protect); // all order routes require auth

router.post('/', createOrder);
router.post('/verify', verifyPayment);
router.get('/mine', getMyOrders);

// Admin
router.get('/', adminOnly, getAllOrders);
router.patch('/:id/status', adminOnly, updateOrderStatus);

router.get('/:id', getOrder);

export default router;
