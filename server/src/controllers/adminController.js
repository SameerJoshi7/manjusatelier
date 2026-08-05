import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import PushSubscription from '../models/PushSubscription.js';
import { asyncHandler } from '../middleware/error.js';

const LOW_STOCK_THRESHOLD = 5;

/** GET /api/admin/stats — overview metrics for the dashboard. */
export const getStats = asyncHandler(async (req, res) => {
  const [revenueAgg, totalOrders, paidOrders, pendingOrders, productCount, customerCount, lowStock, recentOrders] =
    await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: 'paid' }),
      Order.countDocuments({ orderStatus: 'processing' }),
      Product.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Product.find({ stock: { $lte: LOW_STOCK_THRESHOLD } })
        .select('name stock slug images')
        .sort({ stock: 1 })
        .limit(10),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

  res.json({
    success: true,
    stats: {
      revenue: revenueAgg[0]?.total || 0,
      totalOrders,
      paidOrders,
      pendingOrders,
      productCount,
      customerCount,
      lowStock,
      recentOrders,
    },
  });
});

/** POST /api/admin/upload — single image upload (multer sets req.file). */
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  // With Cloudinary Storage, the remote URL is stored in req.file.path
  res.status(201).json({ success: true, url: req.file.path });
});

/** POST /api/admin/marketing/broadcast — Send a promotional email and push to all opted-in users. */
export const sendBroadcastEmail = asyncHandler(async (req, res) => {
  const { title, content, couponCode, discountPercentage } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  // Fetch all users who opted in and all push subscriptions concurrently
  const [users, pushSubscriptions] = await Promise.all([
    User.find({ 'emailPreferences.promotional': true }).select('email'),
    PushSubscription.find()
  ]);

  if (users.length === 0 && pushSubscriptions.length === 0) {
    return res.json({ success: true, message: 'No opted-in users or push subscribers found' });
  }

  // 1. Send Emails
  if (users.length > 0) {
    const { sendBatchEmail } = await import('../utils/sendEmail.js');
    const { getPromotionalTemplate } = await import('../utils/emailTemplates.js');
    
    const html = getPromotionalTemplate(title, content, couponCode, discountPercentage);
    const emailsData = users.map((user) => ({
      to: user.email,
      subject: title,
      html,
      text: content,
    }));

    const chunkSize = 100;
    for (let i = 0; i < emailsData.length; i += chunkSize) {
      const chunk = emailsData.slice(i, i + chunkSize);
      await sendBatchEmail(chunk);
    }
  }

  // 2. Send Push Notifications
  if (pushSubscriptions.length > 0) {
    const { sendBatchPushNotification } = await import('../utils/push.js');
    
    // Construct the notification payload
    const pushPayload = {
      title,
      body: content,
      icon: '/pwa-192x192.png',
      url: '/shop'
    };
    
    // Fire and forget (or await it). We await to ensure we don't end request prematurely
    await sendBatchPushNotification(pushSubscriptions, pushPayload);
  }

  res.json({
    success: true,
    message: `Broadcast sent successfully (Emails: ${users.length}, Push: ${pushSubscriptions.length})`,
  });
});
