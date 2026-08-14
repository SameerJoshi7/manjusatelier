import Order from '../models/Order.js';

export const getOrderStatus = async (orderId) => {
  if (!orderId) return null;
  
  try {
    const cleanId = orderId.replace('#', '').trim();
    
    // Attempt 1: Search by customOrderId (e.g. ORD-1001)
    let order = await Order.findOne({ customOrderId: new RegExp(`^${cleanId}$`, 'i') }).populate('items.product');
    
    if (!order && cleanId.length === 24) {
      // Attempt 2: Exact MongoDB ObjectId
      order = await Order.findById(cleanId).populate('items.product');
    }

    if (!order) {
      // Attempt 3: Search all orders for the last 8 chars of ObjectId
      const recentOrders = await Order.find().sort({createdAt: -1}).limit(500);
      order = recentOrders.find(o => o._id.toString().toUpperCase().endsWith(cleanId.toUpperCase()));
    }

    if (order) {
      return {
        id: order.customOrderId || order._id.toString().slice(-8).toUpperCase(),
        status: order.orderStatus,
        paymentStatus: order.paymentStatus,
        total: order.total,
        items: order.items.map(i => i.name).join(', ')
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching order status for bot:", error);
    return null;
  }
};
