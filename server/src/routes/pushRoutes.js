import express from 'express';
import { body, validationResult } from 'express-validator';
import PushSubscription from '../models/PushSubscription.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { sendPushNotification } from '../utils/push.js';

const router = express.Router();

// Middleware to handle validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

/**
 * @desc    Save a push subscription
 * @route   POST /api/push/subscribe
 * @access  Public (with optional user ID if logged in)
 */
router.post(
  '/subscribe',
  optionalAuth,
  [
    body('subscription').isObject().withMessage('Valid subscription object is required'),
    body('subscription.endpoint').isString().notEmpty(),
    body('subscription.keys').isObject().notEmpty(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { subscription } = req.body;
      const userId = req.user ? req.user._id : null;

      // Upsert the subscription using the endpoint as the unique key
      const updatedSubscription = await PushSubscription.findOneAndUpdate(
        { endpoint: subscription.endpoint },
        { 
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          user: userId 
        },
        { upsert: true, new: true }
      );

      // Send a welcome notification
      await sendPushNotification(subscription, {
        title: "You're subscribed!",
        body: "Thanks for enabling notifications for Manju's Atelier.",
        icon: "/pwa-192x192.png",
        url: "/"
      });

      res.status(201).json({ success: true, data: updatedSubscription });
    } catch (error) {
      console.error('Error saving push subscription:', error);
      res.status(500).json({ success: false, message: 'Server error saving subscription' });
    }
  }
);

/**
 * @desc    Remove a push subscription
 * @route   DELETE /api/push/unsubscribe
 * @access  Public
 */
router.delete('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ success: false, message: 'Endpoint is required' });
    }

    await PushSubscription.findOneAndDelete({ endpoint });
    res.status(200).json({ success: true, message: 'Subscription removed' });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @desc    Get the VAPID public key
 * @route   GET /api/push/vapid-public-key
 * @access  Public
 */
router.get('/vapid-public-key', (req, res) => {
  res.status(200).json({ 
    success: true, 
    publicKey: process.env.VAPID_PUBLIC_KEY 
  });
});

import { recentPushErrors } from '../utils/push.js';
router.get('/errors', (req, res) => {
  res.status(200).json({ success: true, errors: recentPushErrors });
});

export default router;
