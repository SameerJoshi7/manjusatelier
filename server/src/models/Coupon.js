import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['percent', 'flat'], default: 'percent' },
    value: { type: Number, required: true, min: 0 },
    minSubtotal: { type: Number, default: 0 },
    maxDiscount: { type: Number }, // cap for percent coupons
    expiresAt: { type: Date },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.methods.computeDiscount = function computeDiscount(subtotal) {
  if (!this.active) return 0;
  if (this.expiresAt && this.expiresAt < new Date()) return 0;
  if (subtotal < this.minSubtotal) return 0;
  let discount = this.type === 'percent' ? (subtotal * this.value) / 100 : this.value;
  if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
  return Math.round(Math.min(discount, subtotal));
};

export default mongoose.model('Coupon', couponSchema);
