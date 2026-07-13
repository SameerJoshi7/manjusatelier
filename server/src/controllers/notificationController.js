import Notification from '../models/Notification.js';
import { asyncHandler, ApiError } from '../middleware/error.js';

/** GET /api/notifications */
export const getUserNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50); // Fetch top 50 recent notifications
  
  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

  res.json({ success: true, notifications, unreadCount });
});

/** PATCH /api/notifications/:id/read */
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  res.json({ success: true, notification });
});

/** PATCH /api/notifications/read-all */
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ success: true, message: 'All notifications marked as read' });
});
