import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  createOrder,
  submitUtr,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  verifyUtr,
  editUtr,
} from '../controllers/orderController.js';

const router = Router();

router.use(protect); // all order routes require auth

router.post('/', createOrder);
router.post('/:id/utr', submitUtr);
router.put('/:id/edit-utr', editUtr);
router.get('/mine', getMyOrders);

// Admin
router.get('/', adminOnly, getAllOrders);
router.patch('/:id/status', adminOnly, updateOrderStatus);
router.patch('/:id/verify-utr', adminOnly, verifyUtr);

router.get('/:id', getOrder);

export default router;
