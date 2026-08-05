import nodemailer from 'nodemailer';

// Initialize Nodemailer transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER, // Your Gmail address
    pass: process.env.SMTP_PASS, // Your 16-character App Password
  },
});

/**
 * Send a single email using Nodemailer (Gmail)
 */
export const sendEmail = async (options) => {
  // Gmail will automatically rewrite the sender address to match SMTP_USER, 
  // but we can still set the display name.
  const from = `${process.env.FROM_NAME || "Manju's Atelier"} <${process.env.SMTP_USER || 'manjusatelier@gmail.com'}>`;

  try {
    const info = await transporter.sendMail({
      from,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html, // Optional
    });
    
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email via Gmail:', error);
    throw error;
  }
};

/**
 * Send batch emails using Nodemailer (Gmail)
 * @param {Array} emailsData Array of objects: { to, subject, html, text }
 */
export const sendBatchEmail = async (emailsData) => {
  const from = `${process.env.FROM_NAME || "Manju's Atelier"} <${process.env.SMTP_USER || 'manjusatelier@gmail.com'}>`;
  
  try {
    // Send emails concurrently using Promise.allSettled
    const promises = emailsData.map((email) => 
      transporter.sendMail({
        from,
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
      })
    );
    
    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`Batch emails finished: ${successful}/${emailsData.length} sent successfully`);
    
    // Log detailed reasons for any failures
    results.forEach((r, index) => {
      if (r.status === 'rejected') {
        console.error(`Email ${index + 1} to ${emailsData[index].to} failed:`, r.reason.message || r.reason);
      }
    });

    return results;
  } catch (error) {
    console.error('Error sending batch emails via Gmail:', error);
    throw error;
  }
};

export default sendEmail;
