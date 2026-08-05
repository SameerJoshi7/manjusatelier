/**
 * Send a single email using Brevo REST API
 */
export const sendEmail = async (options) => {
  const senderName = process.env.FROM_NAME || "Manju's Atelier";
  const senderEmail = process.env.EMAIL_FROM || 'help@manjusatelier.in';
  const apiKey = process.env.BREVO_API_KEY || process.env.SMTP_PASS; // Fallback in case they set it there

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: options.email }],
    subject: options.subject,
    htmlContent: options.html,
    textContent: options.message,
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || JSON.stringify(data));
    }

    console.log('Email sent via Brevo API:', data.messageId);
    return data;
  } catch (error) {
    console.error('Error sending email via Brevo API:', error);
    throw error;
  }
};

/**
 * Send batch emails using Brevo REST API
 * @param {Array} emailsData Array of objects: { to, subject, html, text }
 */
export const sendBatchEmail = async (emailsData) => {
  const senderName = process.env.FROM_NAME || "Manju's Atelier";
  const senderEmail = process.env.PROMO_EMAIL_FROM || 'promotions@manjusatelier.in';
  const apiKey = process.env.BREVO_API_KEY || process.env.SMTP_PASS;

  try {
    // Send emails concurrently using Promise.allSettled
    const promises = emailsData.map((email) => {
      const payload = {
        sender: { name: senderName, email: senderEmail },
        to: [{ email: email.to }],
        subject: email.subject,
        htmlContent: email.html,
        textContent: email.text,
      };

      return fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || JSON.stringify(data));
        return data;
      });
    });
    
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
    console.error('Error sending batch emails via Brevo API:', error);
    throw error;
  }
};

export default sendEmail;
