import Setting from '../models/Setting.js';
import { asyncHandler } from '../middleware/error.js';

// Get singleton settings or create default if not exists
const getSingleton = async () => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create({ shippingFlat: 79, freeShippingThreshold: 1499 });
  }
  return setting;
};

/** GET /api/settings */
export const getSettings = asyncHandler(async (req, res) => {
  const setting = await getSingleton();
  res.json({ success: true, setting });
});

/** PATCH /api/settings (Admin only) */
export const updateSettings = asyncHandler(async (req, res) => {
  const { shippingFlat, freeShippingThreshold } = req.body;
  let setting = await getSingleton();

  if (shippingFlat !== undefined) setting.shippingFlat = Number(shippingFlat);
  if (freeShippingThreshold !== undefined) setting.freeShippingThreshold = Number(freeShippingThreshold);
  
  await setting.save();
  res.json({ success: true, setting });
});
