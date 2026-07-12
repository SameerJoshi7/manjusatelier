import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getProducts,
  getFeatured,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { getProductReviews, createReview } from '../controllers/reviewController.js';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/:slug', getProductBySlug);

// reviews nested under product
router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', protect, createReview);

// admin
router.post('/', protect, adminOnly, createProduct);
router.patch('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
