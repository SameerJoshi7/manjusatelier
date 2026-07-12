import Coupon from '../models/Coupon.js';
import { asyncHandler, ApiError } from '../middleware/error.js';

/** POST /api/coupons/validate  { code, subtotal } */
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal = 0 } = req.body;
  const coupon = await Coupon.findOne({ code: String(code).toUpperCase() });
  if (!coupon || !coupon.active) throw new ApiError(404, 'Invalid coupon code');
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new ApiError(400, 'Coupon has expired');
  }
  const discount = coupon.computeDiscount(Number(subtotal));
  if (discount <= 0) {
    throw new ApiError(400, `Minimum order of ₹${coupon.minSubtotal} required`);
  }
  res.json({ success: true, code: coupon.code, discount });
});

// ---- Admin ----
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  res.json({ success: true, message: 'Coupon deleted' });
});
