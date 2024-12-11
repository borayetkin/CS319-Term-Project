const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendConfirmationEmail = async (email, name, status = "processing") => {
  try {
    let subject = "Tour Application Update";
    let text = `Dear ${name},\n\nThank you for submitting your tour application! Your application is currently being processed. We will notify you once a decision has been made.\n\nBest regards,\nAtom Team`;

    if (status === "accepted") {
      subject = "Tour Application Accepted";
      text = `Dear ${name},\n\nWe are pleased to inform you that your tour application has been accepted! We will contact you soon, we look forward to your visit.\n\nBest regards,\nAtom Team`;
    } else if (status === "rejected") {
      subject = "Tour Application Rejected";
      text = `Dear ${name},\n\nWe regret to inform you that your tour application has been rejected. Please apply again in the future.\n\nBest regards,\nAtom Team`;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text,
    });

    console.log(`Email sent to ${email} with status: ${status}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
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
