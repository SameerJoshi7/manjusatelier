import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import { asyncHandler, ApiError } from '../middleware/error.js';

async function checkCouponEligibility(coupon, user) {
  if (!coupon.active) return false;
  const now = new Date();
  if (coupon.validFrom && coupon.validFrom > now) return false;
  if (coupon.expiresAt && coupon.expiresAt < now) return false;
  
  if (!user) {
    if (coupon.code === 'HAPPYBIRTHDAY10') return false;
    return true;
  }
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  const usageThisMonth = await Order.countDocuments({
    user: user._id,
    couponCode: coupon.code,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
  });
  if (usageThisMonth > 0) return false;
  
  if (coupon.code === 'WELCOME10') {
    const hasOrdered = await Order.exists({
      user: user._id,
      orderStatus: { $ne: 'cancelled' },
      paymentStatus: { $ne: 'FAILED' }
    });
    if (hasOrdered) return false;
  }
  
  if (coupon.code === 'HAPPYBIRTHDAY10') {
    if (!user.birthday) return false;
    const bday = new Date(user.birthday);
    if (bday.getMonth() !== now.getMonth()) return false;
    
    if (user.birthdaySetAt) {
      const setAt = new Date(user.birthdaySetAt);
      if (setAt.getMonth() === now.getMonth() && setAt.getFullYear() === now.getFullYear()) {
        return false;
      }
    }
  }
  
  return true;
}

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal = 0 } = req.body;
  const coupon = await Coupon.findOne({ code: String(code).toUpperCase() });
  
  if (!coupon) throw new ApiError(404, 'Invalid coupon code');
  
  const isEligible = await checkCouponEligibility(coupon, req.user);
  if (!isEligible) {
    if (coupon.code === 'HAPPYBIRTHDAY10') throw new ApiError(400, 'This birthday coupon is not applicable right now');
    if (coupon.code === 'WELCOME10') throw new ApiError(400, 'Welcome coupon is only for first-time orders');
    throw new ApiError(400, 'Coupon is invalid, expired, or already used this month');
  }

  const discount = coupon.computeDiscount(Number(subtotal));
  if (discount <= 0) {
    throw new ApiError(400, `Minimum order of ₹${coupon.minSubtotal} required`);
  }
  res.json({ success: true, code: coupon.code, discount });
});

export const getActiveCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({ active: true }).sort({ createdAt: -1 });
  
  const eligibleCoupons = [];
  for (const coupon of coupons) {
    const isEligible = await checkCouponEligibility(coupon, req.user);
    if (isEligible) eligibleCoupons.push(coupon);
  }
  
  res.json({ success: true, coupons: eligibleCoupons });
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
