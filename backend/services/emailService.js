const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like SMTP or others
  auth: {

    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password (or app password if using Gmail)
  },
});

// Function to send email
const sendEmail = (recipient, subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender's email
    to: recipient, // Recipient's email
    subject: subject,
    text: message,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
