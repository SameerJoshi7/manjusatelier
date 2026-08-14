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
  trackOrder,
  getPendingOrderCount,
  requestReturnExchange,
  updateReturnStatus
} from '../controllers/orderController.js';

const router = Router();

router.get('/track/:customOrderId', trackOrder);

router.use(protect); // all order routes require auth

router.post('/', createOrder);
router.post('/:id/utr', submitUtr);
router.put('/:id/edit-utr', editUtr);
router.get('/mine', getMyOrders);
router.post('/:id/request-return', requestReturnExchange);

// Admin
router.get('/pending-count', adminOnly, getPendingOrderCount);
router.get('/', adminOnly, getAllOrders);
router.patch('/:id/status', adminOnly, updateOrderStatus);
router.patch('/:id/verify-utr', adminOnly, verifyUtr);
router.patch('/:id/return-status', adminOnly, updateReturnStatus);

router.get('/:id', getOrder);

export default router;
