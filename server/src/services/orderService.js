export const mockOrders = [
  { id: '1001', status: 'Shipped', expectedDelivery: 'Tomorrow', total: '$120' },
  { id: '1002', status: 'Processing', expectedDelivery: 'Next Week', total: '$45' },
  { id: '1003', status: 'Delivered', expectedDelivery: 'Yesterday', total: '$80' },
];

export const getOrderStatus = (orderId) => {
  const order = mockOrders.find(o => String(o.id) === String(orderId));
  if (order) {
    return order;
  }
  return null;
};
