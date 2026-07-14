import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import {
  register,
  login,
  logout,
  me,
  updateProfile,
  toggleWishlist,
  syncCart,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  updatePreferences,
} from '../controllers/authController.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post('/logout', logout);
router.post(
  '/forgot-password', 
  [body('email').isEmail().withMessage('Valid email required')], 
  validate, 
  forgotPassword
);
router.get('/reset-password/:token', verifyResetToken);
router.put(
  '/reset-password/:token', 
  [body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')], 
  validate, 
  resetPassword
);

router.use(protect);
router.get('/me', me);
router.put('/profile', updateProfile);
router.post('/wishlist/:productId', toggleWishlist);
router.post('/cart/sync', syncCart);
router.put('/preferences', updatePreferences);

export default router;
