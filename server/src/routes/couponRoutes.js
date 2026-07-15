import { Router } from 'express';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';
import {
  validateCoupon,
  getCoupons,
  getActiveCoupons,
  createCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';

const router = Router();

router.post('/validate', protect, validateCoupon);
router.get('/active', optionalAuth, getActiveCoupons);
router.get('/', protect, adminOnly, getCoupons);
router.post('/', protect, adminOnly, createCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);

export default router;
