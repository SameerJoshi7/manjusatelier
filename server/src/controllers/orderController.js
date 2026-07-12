import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import Setting from '../models/Setting.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { getRazorpay, verifyPaymentSignature } from '../utils/razorpay.js';

/**
 * Recompute the cart total from the DATABASE (never trust client prices).
 * items: [{ productId, quantity }]
 */
async function computeCart(items, couponCode) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }
  const ids = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: ids } });
  const map = new Map(products.map((p) => [p._id.toString(), p]));

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = map.get(String(item.productId));
    if (!product) throw new ApiError(404, `Product not found: ${item.productId}`);
    const qty = Math.max(1, Number(item.quantity) || 1);
    if (product.stock < qty) throw new ApiError(400, `Insufficient stock for ${product.name}`);
    const unit = product.finalPrice;
    subtotal += unit * qty;
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: unit,
      quantity: qty,
    });
  }

  let discount = 0;
  let appliedCode;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase() });
    if (coupon) {
      discount = coupon.computeDiscount(subtotal);
      if (discount > 0) appliedCode = coupon.code;
    }
  }

  const afterDiscount = subtotal - discount;
  
  let setting = await Setting.findOne();
  if (!setting) {
    setting = { shippingFlat: 79, freeShippingThreshold: 1499 };
  }
  const shippingFee = afterDiscount >= setting.freeShippingThreshold ? 0 : setting.shippingFlat;
  const total = afterDiscount + shippingFee;

  return { orderItems, subtotal, discount, shippingFee, total, appliedCode };
}

/** POST /api/orders  — creates a pending order. */
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, couponCode } = req.body;
  if (!shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.postalCode) {
    throw new ApiError(400, 'Complete shipping address is required');
  }

  const { orderItems, subtotal, discount, shippingFee, total, appliedCode } = await computeCart(
    items,
    couponCode
  );

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    subtotal,
    discount,
    shippingFee,
    total,
    couponCode: appliedCode,
    paymentStatus: 'PAYMENT_PENDING',
  });

  res.status(201).json({
    success: true,
    order: { id: order._id, customOrderId: order.customOrderId, amount: total },
  });
});

/** POST /api/orders/:id/utr — submit UTR number. */
export const submitUtr = asyncHandler(async (req, res) => {
  const { utrNumber } = req.body;
  if (!utrNumber || utrNumber.trim().length !== 12) {
    throw new ApiError(400, 'A valid 12-digit UTR number is required');
  }

  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.paymentStatus === 'SUCCESSFUL' || order.paymentStatus === 'UTR_VERIFIED') {
    throw new ApiError(400, 'Order is already verified');
  }

  order.utrNumber = utrNumber.trim();
  order.paymentStatus = 'UTR_VERIFICATION_PENDING';
  await order.save();

  res.json({ success: true, order });
});

/** GET /api/orders/mine */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// ---------------- Admin ----------------

/** GET /api/orders  (admin) — all orders, newest first, optional status filter. */
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, paymentStatus, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, orders, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

/** PATCH /api/orders/:id/status  (admin) */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  const allowed = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(orderStatus)) throw new ApiError(400, 'Invalid order status');

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus },
    { new: true }
  ).populate('user', 'name email');
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, order });
});

/** PATCH /api/orders/:id/verify-utr (admin) */
export const verifyUtr = asyncHandler(async (req, res) => {
  const { verified } = req.body; // boolean

  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw new ApiError(404, 'Order not found');

  if (order.paymentStatus === 'SUCCESSFUL') {
    return res.json({ success: true, order });
  }

  if (!verified) {
    order.paymentStatus = 'FAILED';
    await order.save();
    return res.json({ success: true, order });
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: -item.quantity } },
          { session }
        );
      }
      order.paymentStatus = 'SUCCESSFUL';
      order.orderStatus = 'confirmed';
      await order.save({ session });
    });
  } catch (err) {
    for (const item of order.items) {
      await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } });
    }
    order.paymentStatus = 'SUCCESSFUL';
    order.orderStatus = 'confirmed';
    await order.save();
  } finally {
    session.endSession();
  }

  res.json({ success: true, order });
});

/** GET /api/orders/:id */
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not allowed');
  }
  res.json({ success: true, order });
});
