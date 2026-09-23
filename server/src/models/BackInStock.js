import mongoose from 'mongoose';

const backInStockSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    notified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate subscriptions for the same email and product (if not notified yet)
backInStockSchema.index({ email: 1, product: 1, notified: 1 });

export default mongoose.models.BackInStock || mongoose.model('BackInStock', backInStockSchema);
