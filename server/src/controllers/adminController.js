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
