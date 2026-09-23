import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: ['product_viewed', 'added_to_cart', 'checkout_started', 'order_placed'],
    },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: String }, // For tracking anonymous users through the funnel
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Indexes for fast querying by date and eventType
analyticsSchema.index({ eventType: 1, createdAt: -1 });
analyticsSchema.index({ sessionId: 1, eventType: 1 });

export default mongoose.model('Analytics', analyticsSchema);
