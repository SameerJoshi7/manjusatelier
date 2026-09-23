import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getProducts,
  getFeatured,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  subscribeBackInStock,
  getAlsoBought,
} from '../controllers/productController.js';
import { getProductReviews, createReview } from '../controllers/reviewController.js';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/:slug', getProductBySlug);
router.get('/:id/also-bought', getAlsoBought);
router.post('/:id/notify-stock', subscribeBackInStock);

// reviews nested under product
router.get('/:productId/reviews', getProductReviews);
router.post(
  '/:productId/reviews',
  protect,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isLength({ max: 500 }).withMessage('Comment too long'),
  ],
  validate,
  createReview
);

// admin
router.post(
  '/',
  protect,
  adminOnly,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
    body('stock').isInt({ min: 0 }).withMessage('Stock cannot be negative'),
    body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  validate,
  createProduct
);
router.patch(
  '/:id',
  protect,
  adminOnly,
  [
    body('price').optional().isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock cannot be negative'),
  ],
  validate,
  updateProduct
);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
