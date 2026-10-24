const nodemailer = require('nodemailer');

function createTransporter() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return null;
}

async function sendOtpEmail(toEmail, otp) {
  const transporter = createTransporter();

  console.log(`\n========================================`);
  console.log(`🔑 [OTP VERIFICATION] Email: ${toEmail}`);
  console.log(`🔢 [OTP CODE]: ${otp} (Valid for 5 minutes)`);
  console.log(`========================================\n`);

  if (!transporter) {
    return {
      sent: true,
      mode: 'mock',
      message: 'Email credentials not configured in .env; OTP logged to server console.'
    };
  }

  const mailOptions = {
    from: `"Lost and Found Portal" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Your Verification Code: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; background-color: #ffffff;">
        <h2 style="color: #007bff; text-align: center; margin-bottom: 8px;">Lost and Found Portal</h2>
        <p style="color: #555; text-align: center; font-size: 14px;">Verify your email address to complete registration.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #28a745; background: #eafaf1; padding: 12px 28px; border-radius: 6px; border: 1px dashed #28a745;">
            ${otp}
          </span>
        </div>
        <p style="color: #666; font-size: 13px; text-align: center;">
          This code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 11px; text-align: center;">
          If you did not request this verification code, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { sent: true, mode: 'smtp' };
  } catch (error) {
    console.error('Failed to send email via SMTP:', error.message);
    return { sent: false, error: error.message };
  }
}

module.exports = {
  sendOtpEmail,
};
