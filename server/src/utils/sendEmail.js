import nodemailer from 'nodemailer';

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Brevo SMTP Key
  },
});

/**
 * Send a single email using Nodemailer
 */
export const sendEmail = async (options) => {
  const from = `${process.env.FROM_NAME || "Manju's Atelier"} <${process.env.EMAIL_FROM || 'help@manjusatelier.in'}>`;

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
    console.error('Error sending email via Nodemailer:', error);
    throw error;
  }
};

/**
 * Send batch emails using Nodemailer (for promotional broadcasts)
 * @param {Array} emailsData Array of objects: { to, subject, html, text }
 */
export const sendBatchEmail = async (emailsData) => {
  const from = `${process.env.FROM_NAME || "Manju's Atelier"} <${process.env.PROMO_EMAIL_FROM || 'promotions@manjusatelier.in'}>`;
  
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
    return results;
  } catch (error) {
    console.error('Error sending batch emails via Nodemailer:', error);
    throw error;
  }
};

export default sendEmail;
