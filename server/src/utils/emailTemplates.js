export const getPromotionalTemplate = (title, content, couponCode, discountPercentage) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #f8f5f0; padding: 20px; text-align: center;">
        <h1 style="color: #4a3b32; margin: 0; font-size: 24px;">Manju's Atelier</h1>
      </div>
      
      <div style="padding: 30px; background-color: #ffffff;">
        <h2 style="color: #4a3b32; margin-top: 0;">${title}</h2>
        <p style="color: #666666; line-height: 1.6;">${content}</p>
        
        ${couponCode ? `
        <div style="margin: 30px 0; padding: 20px; background-color: #fcf9f2; border: 2px dashed #c19b6c; text-align: center; border-radius: 8px;">
          <p style="margin: 0; color: #4a3b32; font-weight: bold; text-transform: uppercase;">Use Code at Checkout</p>
          <p style="margin: 10px 0 0; font-size: 28px; font-weight: 800; color: #c19b6c; letter-spacing: 2px;">${couponCode}</p>
          ${discountPercentage ? `<p style="margin: 10px 0 0; color: #666666; font-size: 14px;">For ${discountPercentage}% OFF</p>` : ''}
        </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.CLIENT_URL || 'https://manjusatelier.in'}" style="display: inline-block; background-color: #c19b6c; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 50px; font-weight: bold; font-size: 16px;">Shop Now</a>
        </div>
      </div>
      
      <div style="background-color: #f8f5f0; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="color: #999999; font-size: 12px; margin: 0;">
          You are receiving this email because you opted in to promotional emails from Manju's Atelier.
        </p>
        <p style="color: #999999; font-size: 12px; margin: 10px 0 0;">
          <a href="${process.env.CLIENT_URL || 'https://manjusatelier.in'}/account?tab=settings" style="color: #c19b6c; text-decoration: underline;">Unsubscribe or update preferences</a>
        </p>
      </div>
    </div>
  `;
};
