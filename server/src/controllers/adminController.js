import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
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

/** POST /api/admin/marketing/broadcast — Send a promotional email to all opted-in users. */
export const sendBroadcastEmail = asyncHandler(async (req, res) => {
  const { title, content, couponCode, discountPercentage } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  // Dynamically import the email utility and templates
  const { sendBatchEmail } = await import('../utils/sendEmail.js');
  const { getPromotionalTemplate } = await import('../utils/emailTemplates.js');

  // Fetch all users who have opted into promotional emails
  const users = await User.find({ 'emailPreferences.promotional': true }).select('email');

  if (users.length === 0) {
    return res.json({ success: true, message: 'No opted-in users found' });
  }

  const html = getPromotionalTemplate(title, content, couponCode, discountPercentage);

  const emailsData = users.map((user) => ({
    to: user.email,
    subject: title,
    html,
    text: content, // Plain text fallback
  }));

  // Chunk array into chunks of 100 (Resend limit)
  const chunkSize = 100;
  for (let i = 0; i < emailsData.length; i += chunkSize) {
    const chunk = emailsData.slice(i, i + chunkSize);
    await sendBatchEmail(chunk);
  }

  res.json({
    success: true,
    message: `Broadcast sent successfully to ${users.length} users`,
    count: users.length,
  });
});
