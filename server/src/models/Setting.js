import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    shippingFlat: {
      type: Number,
      required: true,
      default: 79,
    },
    freeShippingThreshold: {
      type: Number,
      required: true,
      default: 1499,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Setting', settingSchema);
