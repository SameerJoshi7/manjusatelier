import cron from 'node-cron';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';

export const initCronJobs = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      // Find orders that are PAYMENT_PENDING and created more than 5 minutes ago
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const expiredOrders = await Order.find({
        paymentStatus: 'PAYMENT_PENDING',
        createdAt: { $lt: fiveMinutesAgo }
      });

      if (expiredOrders.length > 0) {
        console.log(`[CRON] Found ${expiredOrders.length} expired payment-pending orders. Cancelling them...`);
        
        for (const order of expiredOrders) {
          order.paymentStatus = 'FAILED';
          order.orderStatus = 'cancelled';
          await order.save();
          
          await Notification.create({
            user: order.user,
            title: 'Order Expired',
            message: `Your payment window for order ${order.customOrderId} expired. The order has been cancelled.`,
            link: `/account?tab=orders`,
          });
          
          console.log(`[CRON] Cancelled order ${order.customOrderId}`);
        }
      }
    } catch (error) {
      console.error('[CRON] Error checking for expired orders:', error);
    }
  });
  
  console.log('[CRON] Jobs initialized.');
};
