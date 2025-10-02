// Load dotenv with specific .env.local file
require('dotenv').config({ path: '.env.local' });
const nodemailer = require("nodemailer");

async function main() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    MAIL_FROM,
  } = process.env;

  // Debug: Check environment variables
  console.log('🔧 Environment Variables:');
  console.log('SMTP_HOST:', SMTP_HOST);
  console.log('SMTP_PORT:', SMTP_PORT);
  console.log('SMTP_USER:', SMTP_USER);
  console.log('SMTP_PASS length:', SMTP_PASS ? SMTP_PASS.length : 'MISSING');
  console.log('MAIL_FROM:', MAIL_FROM);
  console.log('');

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error('❌ Missing required environment variables!');
    console.error('Please check your .env.local file');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: false, // Use TLS
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  try {
    console.log('🔌 Testing SMTP connection...');
    
    // First verify the connection
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: MAIL_FROM,
      to: SMTP_USER, // send test email to yourself
      subject: "✅ Test Email from BidCraft",
      text: "If you see this, your Gmail SMTP works!",
      html: "<p>If you see this, your <b>Gmail SMTP works</b>!</p>",
    });

    console.log("✅ Message sent successfully!");
    console.log("Message ID:", info.messageId);
    
  } catch (err) {
    console.error("❌ SMTP Error Details:");
    console.error("Error message:", err.message);
    
    if (err.response) {
      console.error("SMTP Response:", err.response);
    }
    
    if (err.code === 'EAUTH') {
      console.log('\n🔐 Authentication Failed! Possible solutions:');
      console.log('1. Make sure 2-Factor Authentication is enabled');
      console.log('2. Use an App Password (not regular password)');
    }
  }
}

main();