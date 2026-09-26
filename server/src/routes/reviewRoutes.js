import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { deleteReview, getRecentReviews, createOfflineReview } from '../controllers/reviewController.js';

const router = Router();

router.get('/recent', getRecentReviews);
router.post('/offline', createOfflineReview);
router.delete('/:id', protect, deleteReview);

export default router;
