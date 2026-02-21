const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a one-time login token to the user's email.
 * @param {string} to - Recipient email
 * @param {string} token - The 6-digit token
 * @param {string} displayName - User's display name
 */
async function sendTokenEmail(to, token, displayName) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: '🫖 Your Cozy Calories Login Token',
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: auto; padding: 32px; background: #fdf6ec; border-radius: 16px; border: 1px solid #e8d8c0;">
        <h2 style="color: #7c5c3e; font-size: 22px; margin-bottom: 8px;">Hello, ${displayName} 👋</h2>
        <p style="color: #5a4a3a; font-size: 15px; line-height: 1.6;">
          Here is your one-time login token for <strong>Cozy Calories</strong>.<br/>
          It expires in <strong>${process.env.TOKEN_EXPIRY_MINUTES} minutes</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="
            display: inline-block;
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 10px;
            color: #7c5c3e;
            background: #fff8f0;
            padding: 16px 32px;
            border-radius: 12px;
            border: 2px dashed #d4b896;
          ">${token}</span>
        </div>
        <p style="color: #9a8070; font-size: 13px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendTokenEmail };
