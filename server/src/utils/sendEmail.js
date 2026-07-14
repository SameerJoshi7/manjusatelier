import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send a single email using Resend
 */
export const sendEmail = async (options) => {
  const from = `${process.env.FROM_NAME || "Manju's Atelier"} <${process.env.EMAIL_FROM || 'help@manjusatelier.in'}>`;

  try {
    const data = await resend.emails.send({
      from,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html, // Optional
    });
    
    console.log('Email sent:', data.id);
    return data;
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    throw error;
  }
};

/**
 * Send batch emails using Resend (for promotional broadcasts)
 * @param {Array} emailsData Array of objects: { to, subject, html, text }
 */
export const sendBatchEmail = async (emailsData) => {
  const from = `${process.env.FROM_NAME || "Manju's Atelier"} <${process.env.EMAIL_FROM || 'help@manjusatelier.in'}>`;
  
  const payload = emailsData.map((email) => ({
    from,
    to: email.to,
    subject: email.subject,
    html: email.html,
    text: email.text,
  }));

  try {
    // Resend batch API supports up to 100 emails at a time
    const data = await resend.batch.send(payload);
    console.log('Batch emails sent successfully');
    return data;
  } catch (error) {
    console.error('Error sending batch emails via Resend:', error);
    throw error;
  }
};

export default sendEmail;
