const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  service: "gmail", // Replace with your email service provider
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your app password
  },
});

exports.sendConfirmationEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // Sender address
      to: email, // Recipient address
      subject: "Tour Application Confirmation", // Email subject
      text: `Dear ${name},\n\nThank you for submitting your tour application! We have received your request and will process it shortly.\n\nBest regards,\nYour Team`, // Plain text body
    });
    console.log(`Confirmation email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send confirmation email to ${email}:`, error);
  }
};
