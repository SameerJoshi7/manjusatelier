import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { deleteReview, getRecentReviews } from '../controllers/reviewController.js';

const router = Router();

router.get('/recent', getRecentReviews);
router.delete('/:id', protect, deleteReview);

export default router;
