import sendEmail from '../utils/sendEmail.js';

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
      <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
    `;

    await sendEmail({
      email: 'queries@manjusatelier.in',
      subject: `Contact Form: ${subject || 'New Inquiry from ' + name}`,
      html: emailHtml,
      message: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    });

    res.status(200).json({ message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: error.message || 'Failed to send message. Please try again later.' });
  }
};

import { getBulkOrderReplyTemplate } from '../utils/emailTemplates.js';

export const submitBulkOrderForm = async (req, res) => {
  try {
    const { name, email, phone, organization, productsOfInterest, expectedQuantity, details } = req.body;

    if (!name || !email || !phone || !productsOfInterest) {
      return res.status(400).json({ error: 'Name, email, phone, and products of interest are required.' });
    }

    const emailHtml = `
      <h2>New Bulk Order Inquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Organization:</strong> ${organization || 'N/A'}</p>
      <p><strong>Products of Interest:</strong> ${productsOfInterest}</p>
      <p><strong>Expected Quantity:</strong> ${expectedQuantity || 'N/A'}</p>
      <p><strong>Additional Details:</strong><br/>${details ? details.replace(/\n/g, '<br/>') : 'N/A'}</p>
    `;

    // Email to Admin
    await sendEmail({
      email: 'queries@manjusatelier.in',
      subject: \`Bulk Order Inquiry from \${name}\`,
      html: emailHtml,
      message: \`Name: \${name}\\nEmail: \${email}\\nPhone: \${phone}\\nProducts: \${productsOfInterest}\`
    });

    // Email to Customer
    await sendEmail({
      email,
      subject: "We've received your Bulk Order request!",
      html: getBulkOrderReplyTemplate(name),
      message: \`Hi \${name}, thank you for your bulk order inquiry. We will get back to you shortly.\`
    });

    res.status(200).json({ message: 'Bulk order inquiry submitted successfully.' });
  } catch (error) {
    console.error('Bulk order form error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit inquiry. Please try again later.' });
  }
};
