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
    let statusMessage = "Thank you for submitting your tour application!";
    let color = "#0056b3";  // Default color for processing
    let actionMessage = "Your application is currently being processed. We will notify you once a decision has been made.";

    if (status === "accepted") {
      subject = "Tour Application Accepted";
      statusMessage = "We are pleased to inform you that your tour application has been accepted! We will contact you soon, and we look forward to your visit.";
      color = "#4CAF50";  // Green for accepted
      actionMessage = "Congratulations, your application has been accepted!";
    } else if (status === "rejected") {
      subject = "Tour Application Rejected";
      statusMessage = "We regret to inform you that your tour application has been rejected. Please apply again in the future.";
      color = "#f44336";  // Red for rejected
      actionMessage = "We regret to inform you that your application has been rejected.";
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0056b3;">Hello ${name},</h2>
        <p>
          ${statusMessage}
        </p>
        <p style="color: ${color}; font-size: 16px; font-weight: bold;">
          ${actionMessage}
        </p>
        <p style="text-align: left; margin: 20px 0;">
          "Application Details Will Be Placed Here"
        </p>
        <p>
          Thank you for your patience!<br />
          Best regards,<br />
          <strong>ATOM Team</strong>
        </p>
        <p style="font-size: 12px; color: #888;">
          If you have any questions, feel free to reach out to us.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html: htmlContent,
    });

    console.log(`Email sent to ${email} with status: ${status}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
  }
};



exports.sendReviewEmail = async (email, name, reviewLink) => {
  console.log(`I AM TRIGGERED`);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `We Value Your Feedback on the Event`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0056b3;">Hello ${name},</h2>
        <p>
          Thank you for attending the event. We would greatly appreciate it if you could take a few moments to provide us with your feedback. Your insights are invaluable to us!
        </p>
        <p>
          Please click the button below to review the event:
        </p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="${reviewLink}" 
             style="background-color: #0056b3; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
            Submit Your Review
          </a>
        </p>
        <p>
          Alternatively, you can copy and paste the following link into your browser:
          <br />
          <a href="${reviewLink}" style="color: #0056b3;">${reviewLink}</a>
        </p>
        <p>
          Thank you for your time and feedback!
        </p>
        <p style="font-weight: bold; margin-top: 20px;">
          Best regards,<br />
          ATOM Team
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Review email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}: ${error.message}`);
    throw new Error("Failed to send email");
  }
};

