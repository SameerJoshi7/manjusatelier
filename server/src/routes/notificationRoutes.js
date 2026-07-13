import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getUserNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';

const router = Router();

router.use(protect); // All notification routes require authentication

router.get('/', getUserNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
