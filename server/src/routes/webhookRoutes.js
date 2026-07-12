import { Router } from 'express';
import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { verifyWebhookSignature } from '../utils/razorpay.js';

const router = Router();

/**
 * Razorpay webhook. Uses the raw body for signature verification.
 * Configure this URL in the Razorpay dashboard.
 */
router.post('/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.body; // Buffer

  if (!verifyWebhookSignature(rawBody, signature)) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }

  try {
    if (event.event === 'payment.captured') {
      const rzpOrderId = event.payload.payment.entity.order_id;
      const order = await Order.findOne({ razorpayOrderId: rzpOrderId });
      if (order && order.paymentStatus !== 'paid') {
        for (const item of order.items) {
          await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } });
        }
        order.paymentStatus = 'paid';
        order.orderStatus = 'confirmed';
        order.razorpayPaymentId = event.payload.payment.entity.id;
        await order.save();
      }
    } else if (event.event === 'payment.failed') {
      const rzpOrderId = event.payload.payment.entity.order_id;
      await Order.updateOne({ razorpayOrderId: rzpOrderId }, { paymentStatus: 'failed' });
    }
  } catch (err) {
    console.error('Webhook processing error:', err.message);
  }

  // Always 200 so Razorpay stops retrying once received.
  res.json({ success: true });
});

export default router;
