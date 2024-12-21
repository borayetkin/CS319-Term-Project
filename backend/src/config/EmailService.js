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
  status,
  tourData
) => {
  if (status === "processing") {
    await sendApplicationReceivedEmail(email, name, tourData);
  }
  else if (status === "accepted") {
    await sendAcceptedEmail(email, name, tourData);
  }
  else if (status === "rejected") {
    await sendRejectionEmail(email, name, tourData);
  }
};


const sendApplicationReceivedEmail = async (email, name, tourData) => {
  try {
    const resubmissionLink = `http://localhost:5173/resubmit-form/${tourData._id}`;
    const subject = "Tour Application Update";
    const tourDetails = generateTourDetails(tourData, email);
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.8; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <h2 style="color: #0056b3; margin-bottom: 10px;">Hello ${name},</h2>
        <p style="font-size: 16px; margin-bottom: 20px;">
          Thank you for submitting your tour application! 
        </p>

        <!-- Status Section -->
        <div style="background-color: #e7f3ff; padding: 10px 15px; border-left: 4px solid #0056b3; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 16px; color: #0056b3; font-weight: bold;">
            Your application is currently being processed. We will notify you once a decision has been made. You can use the reference code to track your application status or cancel it.
          </p>
        </div>

        <!-- Tour Details Section -->
        <div style="margin: 20px 0;">
          <h3 style="color: #333; font-size: 18px; border-bottom: 2px solid #0056b3; padding-bottom: 5px; margin-bottom: 10px;">
            Tour Details
          </h3>
          <div style="font-size: 14px; line-height: 1.6; color: #555;">
            ${tourDetails}
          </div>
        </div>

        <!-- Resubmission Warning Section -->
        <div style="background-color: #fff8e1; border: 1px solid #fbc02d; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="color: #f57f17; font-weight: bold; font-size: 15px; margin-bottom: 10px;">
            ⚠️ Important:
          </p>
          <p style="margin: 0; font-size: 14px; color: #555;">
            If you want to change your preferred visit times, please do not submit another application. Use the button below to update your preferred dates.
          </p>

        <!-- Resubmission Button -->
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resubmissionLink}" 
            style="background-color: #0056b3; color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
            Change Preferred Dates
          </a>
        </p>

        <!-- Alternative Link -->
        <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
          Alternatively, you can copy and paste the following link into your browser:<br />
          <a href="${resubmissionLink}" style="color: #0056b3; font-weight: bold;">${resubmissionLink}</a>
        </p>

        </div>

        <!-- Footer -->
        <p style="font-size: 14px; color: #555; margin-top: 30px;">
          Thank you for your patience!<br />
          Best regards,<br />
          <strong>ATOM Team</strong>
        </p>
        <p style="font-size: 12px; color: #888; margin-top: 10px;">
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

    console.log(`Confirmation email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send confirmation email to ${email}:`, error);
  }
};

const sendAcceptedEmail = async (email, name, tourData) => {
  try {
    const subject = "Your Tour Application Has Been Accepted!";
    const {
      __t,
      visitDate,
      visitTime,
      additionalNotes,
      city,
      district,
      contactPerson,
      schoolName,
      studentCount,
      phoneNumber,
      studentName,
      studentHighSchool,
      majorOfInterest,
    } = tourData;

    const tourDetails =
      __t === "SchoolTour"
        ? `
          <div style="margin: 20px 0; padding: 15px; background-color: #e7f3ff; border-left: 4px solid #0056b3; border-radius: 5px;">
            <h3 style="color: #0056b3; font-size: 18px; margin-bottom: 10px;">Tour Details</h3>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Tour Type:</strong> School Tour</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Contact Person:</strong> ${contactPerson}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>School Name:</strong> ${city}, ${schoolName}, ${district}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Number of Students:</strong> ${studentCount}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Phone Number:</strong> ${phoneNumber}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Additional Notes:</strong> ${additionalNotes || "N/A"}</p>
          </div>
        `
        : `
          <div style="margin: 20px 0; padding: 15px; background-color: #e7f3ff; border-left: 4px solid #0056b3; border-radius: 5px;">
            <h3 style="color: #0056b3; font-size: 18px; margin-bottom: 10px;">Tour Details</h3>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Tour Type:</strong> Individual Tour</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Contact Person:</strong> ${studentName}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Visit Date:</strong> ${new Date(visitDate).toLocaleDateString("en-US")}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Visit Time:</strong> ${visitTime}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>High School:</strong> ${city}, ${studentHighSchool}, ${district}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Major of Interest:</strong> ${majorOfInterest}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Additional Notes:</strong> ${additionalNotes || "N/A"}</p>
          </div>
        `;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.8; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">

        <!-- Header -->
        <h2 style="color: #4CAF50; margin-bottom: 20px;">Hello ${name},</h2>
        <p style="font-size: 16px; margin-bottom: 20px;">
          We are excited to inform you that your tour application has been accepted!
        </p>

        <!-- Visit Date and Time -->
        <div style="background-color: #e8f5e9; border-left: 4px solid #4CAF50; padding: 10px 15px; margin-bottom: 20px; border-radius: 5px;">
          <p style="margin: 0; font-size: 16px; color: #388e3c; font-weight: bold;">
            Visit Date: ${new Date(visitDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}<br />
            Visit Time: ${visitTime}
          </p>
        </div>

        <!-- Tour Details -->
        ${tourDetails}

        <!-- Closing Message -->
        <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
          We look forward to welcoming you. If you have any questions or need further assistance, feel free to contact us.
        </p>

        <!-- Footer -->
        <p style="font-size: 14px; color: #555; margin-top: 30px;">
          Thank you for choosing Bilkent University!<br />
          <strong>Best regards,</strong><br />
          <strong>ATOM Team</strong>
        </p>
      </div>
    `;


    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html: htmlContent,
    });

    console.log(`Accepted email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send accepted email to ${email}:`, error);
    throw new Error("Failed to send accepted email");
  }
};

const sendRejectionEmail = async (email, name, tourData) => {
  try {
    const rejectionReason = tourData.rejectionReason;
    const subject = "Your Tour Application Has Been Rejected";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.8; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <h2 style="color: #f44336; margin-bottom: 10px;">Hello ${name},</h2>
        <p style="font-size: 16px; margin-bottom: 20px;">We regret to inform you that your tour application has been rejected.</p>

        <!-- Rejection Reason -->
        <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 10px 15px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 16px; color: #c62828; font-weight: bold;">
            Reason for Rejection:
          </p>
          <p style="margin: 0; font-size: 14px; color: #555;">
            ${rejectionReason || "No specific reason provided."}
          </p>
        </div>

        <!-- Closing -->
        <p style="font-size: 14px; color: #555;">
          We encourage you to apply again in the future, and we thank you for your understanding.
        </p>

        <!-- Footer -->
        <p style="font-size: 14px; color: #555; margin-top: 30px;">
          Thank you for choosing Bilkent University!<br />
          <strong>Best regards,</strong><br />
          <strong>ATOM Team</strong>
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html: htmlContent,
    });

    console.log(`Rejection email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send rejection email to ${email}:`, error);
    throw new Error("Failed to send rejection email");
  }
};


exports.sendReviewEmail = async (email, name, reviewLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `We Value Your Feedback on the Event`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.8; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <h2 style="color: #0056b3; margin-bottom: 10px;">Hello ${name},</h2>
        
        <!-- Body -->
        <p style="font-size: 16px; margin-bottom: 20px;">
          Thank you for attending the event! We would greatly appreciate it if you could take a few moments to provide us with your feedback. Your insights are invaluable to us.
        </p>
        
        <!-- Button Section -->
        <div style="margin: 30px 0;">
          <a href="${reviewLink}" 
            style="background-color: #0056b3; color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
            Submit Your Review
          </a>
        </div>
        
        <!-- Alternate Link -->
        <div style="background-color: #e7f3ff; padding: 10px; border-left: 4px solid #0056b3; border-radius: 5px; margin-bottom: 20px;">
          <p style="font-size: 14px; color: #333; margin: 0;">
            Alternatively, you can copy and paste the following link into your browser:
            <br />
            <a href="${reviewLink}" style="color: #0056b3; word-break: break-all;">${reviewLink}</a>
          </p>
        </div>

        <!-- Footer -->
        <p style="font-size: 14px; margin-top: 30px;">
          Thank you for your time and feedback!<br />
          Best regards,<br />
          <strong>ATOM Team</strong>
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
      <div style="font-family: Arial, sans-serif; line-height: 1.8; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <h2 style="color: #0056b3; margin-bottom: 20px;">Welcome to ATOM, ${user.name}!</h2>

        <!-- Introduction Section -->
        <p style="font-size: 16px; margin-bottom: 20px;">
          We are excited to have you on board! You are now part of a community that values your insights and experiences, to help us represent Bilkent better.
        </p>

        <!-- Role Assignment -->
        <div style="background-color: #e7f3ff; padding: 15px; border-left: 4px solid #0056b3; border-radius: 5px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 15px; color: #0056b3; font-weight: bold;">
            You have been assigned as a <span style="text-transform: capitalize;">${user.role}</span> in our system.
          </p>
        </div>

        <!-- Account Details Section -->
        <div style="margin: 20px 0;">
          <h3 style="color: #333; font-size: 18px; border-bottom: 2px solid #0056b3; padding-bottom: 5px; margin-bottom: 10px;">
            Your Account Credentials
          </h3>
          <p style="font-size: 14px; color: #555; line-height: 1.6;">
            <strong>Email:</strong> ${email}<br />
            <strong>Password:</strong> ${user.password}
          </p>
          <p style="font-size: 14px; color: #555;">
            Please keep your credentials secure.
          </p>
        </div>

        <!-- Assistance Section -->
        <div style="background-color: #fff8e1; padding: 15px; border: 1px solid #fbc02d; border-radius: 5px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 14px; color: #555;">
            If you have any questions or need assistance, feel free to reach out to us. We are here to help!
          </p>
        </div>

        <!-- Footer -->
        <p style="font-size: 14px; margin-top: 30px;">
          Best regards,<br />
          <strong>ATOM Team</strong>
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

    const {
      __t,
      visitDate,
      visitTime,
      additionalNotes,
      city,
      district,
      contactPerson,
      schoolName,
      studentCount,
      phoneNumber,
      studentName,
      studentHighSchool,
      majorOfInterest,
    } = event;

    const tourDetails =
      event.__t === "SchoolTour"
        ? `
          <div style="margin: 20px 0; padding: 15px; background-color: #e7f3ff; border-left: 4px solid #0056b3; border-radius: 5px;">
            <h3 style="color: #0056b3; font-size: 18px; margin-bottom: 10px;">Tour Details</h3>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Tour Type:</strong> School Tour</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Contact Person:</strong> ${contactPerson}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>School Name:</strong> ${city}, ${schoolName}, ${district}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Number of Students:</strong> ${studentCount}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Phone Number:</strong> ${phoneNumber}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Additional Notes:</strong> ${additionalNotes || "N/A"}</p>
          </div>
        `
        : `
          <div style="margin: 20px 0; padding: 15px; background-color: #e7f3ff; border-left: 4px solid #0056b3; border-radius: 5px;">
            <h3 style="color: #0056b3; font-size: 18px; margin-bottom: 10px;">Tour Details</h3>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Tour Type:</strong> Individual Tour</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Contact Person:</strong> ${studentName}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Visit Date:</strong> ${new Date(visitDate).toLocaleDateString("en-US")}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Visit Time:</strong> ${visitTime}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>High School:</strong> ${city}, ${studentHighSchool}, ${district}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Major of Interest:</strong> ${majorOfInterest}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Additional Notes:</strong> ${additionalNotes || "N/A"}</p>
          </div>
        `;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.8; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">

        <!-- Header -->
        <h2 style="color: #0056b3; margin-bottom: 20px;">Hello ${guide.name},</h2>

        <!-- Main Message -->
        <p style="font-size: 16px; margin-bottom: 20px;">
          You have been assigned to a new event. Please find the event details below:
        </p>

        <!-- Event Details Section -->
        ${tourDetails}

        <!-- Action Section -->
        <p style="font-size: 14px; margin-bottom: 20px;">
          Please review the event details and prepare accordingly. If you have any questions or need further assistance, feel free to reach out to the coordinator.
        </p>

        <!-- Footer -->
        <p style="font-size: 14px; margin-top: 30px;">
          Thank you for your commitment to this event!<br />
          <strong>Best regards,</strong><br />
          <strong>ATOM Team</strong>
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
      <div style="font-family: Arial, sans-serif; line-height: 1.8; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <h2 style="color: #0056b3; margin-bottom: 20px;">Hello ${guide.name},</h2>

        <!-- Introduction -->
        <p style="font-size: 16px; margin-bottom: 20px;">
          You have been assigned to a new fair. Please find the details below.
        </p>

        <!-- Fair Details Section -->
        <div style="padding: 15px; border-radius: 5px; background-color: #ffffff; box-shadow: 0 0 2px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
          <h3 style="color: #0056b3; font-size: 18px; margin-bottom: 10px;">Fair Details</h3>
          <ul style="list-style: none; padding: 0; font-size: 14px; color: #555; line-height: 1.6;">
            <li><strong>Fair Name:</strong> ${fair.schoolName}</li>
            <li><strong>Date:</strong> ${new Date(fair.fairDate).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${fair.fairTime}</li>
            <li><strong>Location:</strong> ${fair.location}, ${fair.city}</li>
          </ul>
        </div>

        <!-- Reminder Section -->
        <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
          Please review the details and prepare accordingly. If you have any questions, feel free to reach out to the organizer.
        </p>

        <!-- Footer -->
        <p style="font-size: 14px; margin-top: 30px;">
          Best regards,<br />
          <strong>ATOM Team</strong>
        </p>
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
      <div style="font-family: Arial, sans-serif; line-height: 1.8; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">

        <!-- Header -->
        <h2 style="color: #0056b3; margin-bottom: 20px;">Hello ${name},</h2>

        <!-- Main Message -->
        <p style="font-size: 16px; margin-bottom: 20px;">
          We regret to inform you that, due to high demand, we were unable to secure a suitable spot for the dates you selected. But you can still 
            get a chance to visit us by rescheduling your tour.
        </p>

        <!-- Instruction Section -->
        <div style="background-color: #fff8e1; border: 1px solid #fbc02d; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="color: #f57f17; font-size: 14px; margin-bottom: 10px;">
            Please reschedule your preferred dates by clicking the button below:
          </p>
          <p style="font-size: 12px; margin-bottom: 5px;">
            \t 🛈  To get a higher chance to secure a spot, you can choose more dates, and less busy times.
          </p>

        <!-- Reschedule Button -->
        <p style="margin: 30px 0; text-align: center;">
          <a href="${resubmissionLink}" 
            style="background-color: #0056b3; color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Reschedule Your Event
          </a>
        </p>

        </div>

        <!-- Alternative Link -->
        <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
          Alternatively, you can copy and paste the following link into your browser:<br />
          <a href="${resubmissionLink}" style="color: #0056b3; font-weight: bold;">${resubmissionLink}</a>
        </p>

        <!-- Unique Link Note -->
        <p style="font-size: 12px; color: #888;">
          This link is unique to you. Please do not share it with anyone.
        </p>

        <!-- Footer -->
        <p style="font-size: 14px; margin-top: 30px;">
          Thank you for your understanding. We look forward to your visit!<br />
          <strong>Best regards,</strong><br />
          <strong>ATOM Team</strong>
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

const generateTourDetails = (tourData, email) => {
  const { __t, visitDate, visitTime, additionalNotes, city, district } = tourData;

  if (__t === "SchoolTour") {
    return `
      <p><strong>Tour Type:</strong> School Tour</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>School Name:</strong> ${city}, ${tourData.schoolName}, ${district}</p>
      <p><strong>Number of Students:</strong> ${tourData.studentCount}</p>
      ${tourData.reserveDates
        .map(
          (date, index) =>
            `<p style="color: gray;">Reserve Visit Date ${index + 1}: ${new Date(date.visitDate).toLocaleDateString()} at ${date.visitTime}</p>`
        )
        .join("")}
      <p><strong>Phone Number:</strong> ${tourData.applicant.phoneNumber}</p>
      <p><strong>Additional Notes:</strong> ${additionalNotes || "N/A"}</p>
      <p><stong> Reference Code </strong> ${tourData.referenceCode}</p>
    `;
  } else if (__t === "IndividualTour") {
    return `
      <p><strong>Tour Type:</strong> Individual Tour</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Contact Person:</strong> ${tourData.studentName}</p>
      <p><strong>Visit Date:</strong> ${visitDate}</p>
      <p><strong>Visit Time:</strong> ${visitTime}</p>
      <p><strong>High School:</strong> ${city}, ${tourData.studentHighSchool}, ${district}</p>
      <p><strong>Major of Interest:</strong> ${tourData.majorOfInterest}</p>
      <p><stong> Reference Code </strong> ${tourData.referenceCode}</p>
      <p><strong>Additional Notes:</strong> ${additionalNotes || "N/A"}</p>
    `;
  } else {
    return `<p><strong>Unknown Tour Type:</strong> Details are unavailable.</p>`;
  }
};

exports.sendNotificationEmail = async (email, name, changedFields,tourData) => {
  try {

      const resubmissionLink = `http://localhost:5173/resubmit-form/${tourData._id}`;

      let message = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0056b3;">Hello ${name},</h2>
        <p>There have been updates to your scheduled tour:</p>
        <ul>`;


      if (changedFields.visitDate) {
        message += `<li><strong>Date Update:</strong> Unfortunately, your current date is not suitable. The new date our advisor suggests is: <strong>${new Date(changedFields.visitDate).toLocaleDateString()}</strong>.</li>`;
        message += `
              <p style="text-align: center; margin:;">
                <a href="${resubmissionLink}"
                  style="background-color: #0056b3; color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
                  Change Preferred Dates
                </a>
              </p>`;
      }
      if (changedFields.studentCount) {
        message += `<li><strong>Number of Students:</strong> ${changedFields.studentCount} </li>`;
      }
      if (changedFields.advisorNotes) {
        message += `<li><strong>Advisor Notes:</strong> ${changedFields.advisorNotes}</li>`;
      }

      if (changedFields.visitDate) {
      message +=`
        <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
          Alternatively, you can copy and paste the following link into your browser:<br />
          <a href="${resubmissionLink}" style="color: #0056b3; font-weight: bold;">${resubmissionLink}</a>
        </p>`;
      }

      message += `</ul>
        <p>Thank you for your understanding.</p>
        <p><strong>Your Event Team</strong></p>
      </div>`;


      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Update on Your Scheduled Event",
        html: message,
      });

      console.log(`Notification email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error);
    }
};
