import User from '../models/User.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { signToken, cookieOptions, publicUser } from '../utils/token.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, 'Email already registered');

  const user = await User.create({ name, email, password });
  const token = signToken(user);
  res
    .cookie('token', token, cookieOptions)
    .status(201)
    .json({ success: true, token, user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email })
    .select('+password')
    .populate('cart.product');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  const token = signToken(user);
  res
    .cookie('token', token, cookieOptions)
    .json({ success: true, token, user: publicUser(user) });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: 0 });
  res.json({ success: true, message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('cart.product');
  res.json({ success: true, user: publicUser(user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { ...(name && { name }), ...(phone && { phone }), ...(address && { address }) } },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user: publicUser(user) });
});

// Wishlist toggle
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.findIndex((id) => id.toString() === productId);
  if (idx >= 0) user.wishlist.splice(idx, 1);
  else user.wishlist.push(productId);
  await user.save();
  res.json({ success: true, wishlist: user.wishlist });
});

// Cart sync
export const syncCart = asyncHandler(async (req, res) => {
  const { items } = req.body;
  
  const user = await User.findById(req.user._id);
  user.cart = items.map(item => ({
    product: item.productId,
    quantity: item.quantity
  }));
  
  await user.save();
  res.json({ success: true, cart: user.cart });
});
