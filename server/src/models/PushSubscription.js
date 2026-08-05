import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema(
  {
    endpoint: {
      type: String,
      required: true,
      unique: true, // Prevent duplicate endpoints
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null means it's a guest subscriber
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly find subscriptions by user
pushSubscriptionSchema.index({ user: 1 });

const PushSubscription = mongoose.model('PushSubscription', pushSubscriptionSchema);

export default PushSubscription;
