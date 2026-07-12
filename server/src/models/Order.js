import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true }, // unit price paid (after discount)
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'India' },
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String },
    customOrderId: { type: String, unique: true },
    paymentMethod: { type: String, default: 'UPI' },
    utrNumber: { type: String },
    paymentStatus: {
      type: String,
      enum: ['PAYMENT_PENDING', 'PENDING_UTR', 'UTR_VERIFICATION_PENDING', 'UTR_VERIFIED', 'SUCCESSFUL', 'FAILED'],
      default: 'PAYMENT_PENDING',
    },
    orderStatus: {
      type: String,
      enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate customOrderId
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.customOrderId) {
    try {
      // Find the last order to increment the ID
      const lastOrder = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
      let nextIdNumber = 1000; // Starting point
      if (lastOrder && lastOrder.customOrderId) {
        const match = lastOrder.customOrderId.match(/ORD-(\d+)/);
        if (match && match[1]) {
          nextIdNumber = parseInt(match[1], 10) + 1;
        }
      }
      this.customOrderId = `ORD-${nextIdNumber}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export default mongoose.model('Order', orderSchema);
