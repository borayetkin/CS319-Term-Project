const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const adminRoutes = require("./src/routes/adminRoutes");
const authRoutes = require("./src/routes/authRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const fairRoutes = require("./src/routes/fairRoutes");
const applicantRoutes = require("./src/routes/ApplicantRoutes");
const schoolRoutes = require("./src/routes/schoolRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const scheduleRoutes = require("./src/routes/scheduleRoutes");
const traineeRoutes = require("./src/routes/traineeRoutes");
const logRoutes = require("./src/routes/logRoutes");
const path = require("path");
const cors = require("cors"); // Import CORS

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Enable CORS for all routes (you can limit this to specific domains)
app.use(
  cors({
    origin: "http://localhost:5173", // Vite default port
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/fairs", fairRoutes);
app.use("/api/applicants", applicantRoutes);
app.use("/api", schoolRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api", traineeRoutes);
app.use("/api/logs", logRoutes);
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
