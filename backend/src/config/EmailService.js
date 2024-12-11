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

exports.sendReviewEmail = async (email, name, reviewLink) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // Sender email
      to: email, // Recipient email
      subject: "Submit Your Review", // Subject line
      text: `Dear ${name},\n\nPlease submit your review for the event. Click the link: ${reviewLink}\n\nBest regards,\nYour Team`, // Plain text email body
      html: `<p>Dear ${name},</p><p>Please submit your review for the event. Click the link: <a href="${reviewLink}">Submit Review</a></p><p>Best regards,<br>Your Team</p>`, // HTML email body
    });
    console.log(`Review email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send review email to ${email}:`, error.message);
    throw new Error("Email sending failed.");
  }
};
