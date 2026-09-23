import Analytics from '../models/Analytics.js';
import { asyncHandler, ApiError } from '../middleware/error.js';

/**
 * POST /api/analytics/track
 * Tracks a frontend event
 */
export const trackEvent = asyncHandler(async (req, res) => {
  const { eventType, productId, sessionId, metadata } = req.body;
  
  if (!eventType) {
    throw new ApiError(400, 'eventType is required');
  }

  await Analytics.create({
    eventType,
    productId,
    userId: req.user?._id || undefined,
    sessionId,
    metadata,
  });

  res.status(201).json({ success: true });
});

/**
 * GET /api/analytics/funnel
 * Admin only. Gets conversion funnel metrics.
 */
export const getFunnelMetrics = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  // Count events for the funnel
  const funnel = await Analytics.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        uniqueSessions: { $addToSet: '$sessionId' }
      }
    },
    {
      $project: {
        eventType: '$_id',
        count: 1,
        uniqueCount: { $size: '$uniqueSessions' },
        _id: 0
      }
    }
  ]);

  // Transform into a flat object for easy frontend consumption
  const metrics = {
    product_viewed: { count: 0, uniqueCount: 0 },
    added_to_cart: { count: 0, uniqueCount: 0 },
    checkout_started: { count: 0, uniqueCount: 0 },
    order_placed: { count: 0, uniqueCount: 0 },
  };

  funnel.forEach(item => {
    if (metrics[item.eventType]) {
      metrics[item.eventType] = {
        count: item.count,
        uniqueCount: item.uniqueCount
      };
    }
  });

  res.json({ success: true, metrics, days: Number(days) });
});
