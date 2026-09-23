import PDFDocument from 'pdfkit';

export function generateInvoice(order, res) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=invoice-${order.customOrderId || order._id}.pdf`
  );

  doc.pipe(res);

  // Header
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text("Manju's Atelier", 50, 57)
    .fontSize(10)
    .text("Manju's Atelier", 200, 50, { align: 'right' })
    .text('123 Artisan Street', 200, 65, { align: 'right' })
    .text('Mumbai, India 400001', 200, 80, { align: 'right' })
    .moveDown();

  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 110).lineTo(550, 110).stroke();

  // Invoice details
  const customerName = order.user?.name || order.shippingAddress?.fullName || 'Customer';
  const invoiceDate = new Date(order.createdAt).toLocaleDateString();
  const orderId = order.customOrderId || order._id;

  doc
    .fontSize(10)
    .text(`Invoice Number: ${orderId}`, 50, 130)
    .text(`Invoice Date: ${invoiceDate}`, 50, 145)
    .text(`Total Amount: ₹${order.total}`, 50, 160)
    .text(`Payment Status: ${order.paymentStatus}`, 50, 175)
    
    .text('Bill To:', 300, 130)
    .font('Helvetica-Bold')
    .text(customerName, 300, 145)
    .font('Helvetica')
    .text(order.shippingAddress?.address || '', 300, 160)
    .text(`${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.pinCode || ''}`, 300, 175)
    .moveDown();

  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 210).lineTo(550, 210).stroke();

  // Table Header
  const tableTop = 240;
  doc.font('Helvetica-Bold');
  generateTableRow(doc, tableTop, 'Item', 'Qty', 'Unit Price', 'Total');
  doc.font('Helvetica');
  doc.strokeColor('#dddddd').lineWidth(1).moveTo(50, 260).lineTo(550, 260).stroke();

  // Items
  let i = 0;
  let position = 280;
  for (const item of order.items) {
    if (position > 700) {
      doc.addPage();
      position = 50;
    }
    const name = item.product?.name || 'Product';
    generateTableRow(
      doc,
      position,
      name,
      item.quantity,
      `Rs. ${item.price}`,
      `Rs. ${item.price * item.quantity}`
    );
    doc.strokeColor('#eeeeee').lineWidth(1).moveTo(50, position + 20).lineTo(550, position + 20).stroke();
    position += 30;
    i++;
  }

  // Summary
  const subtotalPosition = position + 30;
  doc.font('Helvetica-Bold');
  generateTableRow(doc, subtotalPosition, '', '', 'Subtotal', `Rs. ${order.subtotal}`);
  
  const discountPosition = subtotalPosition + 20;
  if (order.discount > 0) {
    generateTableRow(doc, discountPosition, '', '', 'Discount', `- Rs. ${order.discount}`);
  }
  
  const totalPosition = discountPosition + 20;
  generateTableRow(doc, totalPosition, '', '', 'Total', `Rs. ${order.total}`);

  // Footer
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(
      'Thank you for shopping with Manju\'s Atelier!',
      50,
      700,
      { align: 'center', width: 500 }
    );

  doc.end();
}

function generateTableRow(doc, y, item, qty, unit, total) {
  doc
    .fontSize(10)
    .text(item, 50, y, { width: 200 })
    .text(qty, 280, y, { width: 50, align: 'right' })
    .text(unit, 350, y, { width: 80, align: 'right' })
    .text(total, 450, y, { width: 80, align: 'right' });
}
