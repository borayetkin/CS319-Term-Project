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
