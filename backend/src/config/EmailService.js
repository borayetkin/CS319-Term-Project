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

exports.sendConfirmationEmail = async (
  email,
  name,
  status = "processing",
  tourData
) => {
  try {
    let subject = "Tour Application Update";
    let statusMessage = "Thank you for submitting your tour application!";
    let color = "#0056b3"; // Default color for processing
    let actionMessage =
      "Your application is currently being processed. We will notify you once a decision has been made.";

    if (status === "accepted") {
      subject = "Tour Application Accepted";
      statusMessage =
        "We are pleased to inform you that your tour application has been accepted! We will contact you soon, and we look forward to your visit.";
      color = "#4CAF50"; // Green for accepted
      actionMessage = "Congratulations, your application has been accepted!";
    } else if (status === "rejected") {
      subject = "Tour Application Rejected";
      statusMessage =
        "We regret to inform you that your tour application has been rejected. Please apply again in the future.";
      color = "#f44336"; // Red for rejected
      actionMessage =
        "We regret to inform you that your application has been rejected.";
    }
    console.log(`Tour Data: ${tourData}`);
    const tourDetails = `
      <p><strong>Tour Type:</strong> ${tourData.__t}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone Number:</strong> ${tourData.applicant?.phoneNumber}</p>
      <p><strong>Visit Date:</strong> ${tourData.visitDate}</p>
      <p><strong>Visit Time:</strong> ${tourData.visitTime}</p>

      ${
        tourData.__t === "SchoolTour"
          ? `
        <p><strong>Contact Person:</strong> ${tourData.contactPerson}</p>
        <p><strong>School Name:</strong> ${tourData.city} ${
              tourData.schoolName
            } ${tourData.district}</p>
        <p><strong>Number of Students:</strong> ${tourData.studentCount}</p>
        ${tourData.reserveDates
          .map((date, index) => {
            if (index !== 0)
              return `<p style="color: gray;">Reserve Visit Date And Time: ${date.visitDate} ${date.visitTime}</p>`;
          })
          .join("")}
      `
          : `
        <p><strong>Contact Person:</strong> ${tourData.applicant.name}</p>
        <p><strong>High School:</strong> ${tourData.city} ${tourData.studentHighSchool} ${tourData.district}</p>
        <p><strong>Major of Interest:</strong> ${tourData.majorOfInterest}</p>
      `
      }
      <p><strong>Additional Notes:</strong> ${tourData.additionalNotes}</p>
    `;

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
          ${tourDetails}
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
        <p style="text-align: left; margin: 20px 0;">
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
exports.sendNewUserEmail = async (user) => {
  const email = user.email;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Welcome to ATOM!`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0056b3;">Hello ${name},</h2>
        <p>
          We regret to inform you that, due to high demand, we were unable to secure a suitable spot for the dates you selected.
        </p>
        <p>
          To help us better accommodate your request, please resubmit your preferred dates using the link below:
        </p>
        <div style="text-align: left; margin: 20px 0;"> <!-- Centering the button -->
          <a href="${resubmissionLink}" 
            style="background-color: #0056b3; 
                    color: white; 
                    text-decoration: none; 
                    padding: 10px 20px; 
                    border-radius: 5px; 
                    font-weight: bold; 
                    display: inline-block;">
            Resubmit Your Dates
          </a>
        </div>
        <p style="font-size: 12px; color: #888;">
          Please note: This link is unique to you. Do not share it with others.
        </p>
        <p>
          Thank you for your understanding. We look forward to arranging your visit!
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
    console.log(`Signup email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}: ${error.message}`);
    throw new Error("Failed to send email");
  }
};

exports.sendGuideAssignmentEmail = async (guide, event) => {
  try {
    const subject = "You have been assigned to a new event";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0056b3;">Hello ${guide.name},</h2>
        <p>
          You have been assigned to a new event. Here are the event details:
        </p>
        <ul>
          <li><strong>Event ID:</strong> ${event._id}</li>
          <li><strong>Event Type:</strong> ${event.typeStr}</li>
          <li><strong>Visit Date:</strong> ${new Date(
            event.visitDate
          ).toLocaleDateString()}</li>
          <li><strong>Visit Time:</strong> ${event.visitTime}</li>
          <li><strong>Location:</strong> ${event.city}, ${event.district}</li>
        </ul>
        <p>
          Please review the event details and prepare accordingly. For any queries, feel free to reach out to the coordinator.
        </p>
        <p>
          Best regards,<br />
          ATOM Team
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: guide.email,
      subject,
      html: htmlContent,
    });

    console.log(`Guide assignment email sent to ${guide.email}`);
  } catch (error) {
    console.error(
      `Failed to send guide assignment email to ${guide.email}:`,
      error
    );
  }
};

exports.sendFairAssignmentEmail = async (guide, fair) => {
  try {
    const subject = "You have been assigned to a new fair";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0056b3;">Hello ${guide.name},</h2>
        <p>You have been assigned to a new fair. Here are the details:</p>
        <ul>
          <li><strong>Fair Name:</strong> ${fair.schoolName}</li>
          <li><strong>Date:</strong> ${new Date(
            fair.fairDate
          ).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${fair.fairTime}</li>
          <li><strong>Location:</strong> ${fair.location}, ${fair.city}</li>
        </ul>
        <p>Thank you for your commitment to this event. If you have any questions, please contact the organizer.</p>
        <p>Best regards,<br />ATOM Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: guide.email,
      subject,
      html: htmlContent,
    });

    console.log(`Fair assignment email sent to ${guide.email}`);
  } catch (error) {
    console.error(
      `Failed to send fair assignment email to ${guide.email}:`,
      error
    );
  }
};

exports.sendCancelationEmail = async (email, name, resubmissionLink) => {
  try {
    const subject = "Reschedule Your Tour";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: left;">
        <h2 style="color: #0056b3;">Hello ${name},</h2>
        <p>
          We regret to inform you that, due to high demand, we were unable to secure a suitable spot for the dates you selected.
        </p>
        <p>
          To help us better accommodate your request, please choose less busy times and resubmit your preferred dates:
        </p>
        <div style="text-align: left; margin: 20px auto;"> <!-- Added "margin: auto" for centering -->
          <a href="${resubmissionLink}" 
            style="background-color: #0056b3; 
                    color: white; 
                    text-decoration: none; 
                    padding: 10px 20px; 
                    border-radius: 5px; 
                    font-weight: bold; 
                    display: inline-block;"> <!-- Ensure the button behaves as inline-block -->
            Reschedule Your Event
          </a>
        </div>
        <p>
          Alternatively, you can copy and paste the following link into your browser:
          <br />
          <a href="${resubmissionLink}" style="color: #0056b3;">${resubmissionLink}</a>
        </p>
        <p style="font-size: 12px; color: #888;">
          Please note: This link is unique to you. Do not share it with others.
        </p>
        <p>
          Thank you for your understanding. We look forward to your visit!
        </p>
        <p style="font-weight: bold; margin-top: 20px;">
          Best regards,<br />
          ATOM Team
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html: htmlContent,
    });

    console.log(`Resubmission request email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send resubmission request email to ${email}:`, error);
    throw new Error("Failed to send resubmission request email");
  }
};

