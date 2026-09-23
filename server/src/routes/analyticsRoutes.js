import { Router } from 'express';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';
import { trackEvent, getFunnelMetrics } from '../controllers/analyticsController.js';

const router = Router();

// Track events (public/optional auth)
router.post('/track', optionalAuth, trackEvent);

// Admin dashboard funnel (admin only)
router.get('/funnel', protect, adminOnly, getFunnelMetrics);

export default router;
