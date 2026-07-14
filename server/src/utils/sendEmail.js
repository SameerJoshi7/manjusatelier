import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Create a transporter using ImprovMX SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.improvmx.com',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Define email options
  const message = {
    from: `${process.env.FROM_NAME || "Manju's Atelier"} <${process.env.EMAIL_FROM || 'help@manjusatelier.in'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Optional: if we want to send HTML emails
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    // You can throw the error if you want the request to fail when email fails
    // throw error; 
  }
};

export default sendEmail;
