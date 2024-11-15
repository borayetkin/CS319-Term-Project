import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Applications from "./pages/Applications";
import Events from "./pages/Events";
import AssignedEvents from "./pages/AssignedEvents"; // Import Assigned Events (Guide-specific)
import Dashboard from "./pages/Dashboard"; // Coordinator-specific
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import AdminDashboard from "./pages/AdminDashboard"; // Import AdminDashboard

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Private Routes */}
        <Route
          path="/profile"
          element={
            <PrivateRoute
              allowedRoles={["admin", "coordinator", "advisor", "guide"]}
            >
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Coordinator Routes */}
        <Route
          path="/coordinator/dashboard"
          element={
            <PrivateRoute allowedRoles={["coordinator"]}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/coordinator/applications"
          element={
            <PrivateRoute allowedRoles={["coordinator"]}>
              <Applications />
            </PrivateRoute>
          }
        />

        {/* Advisor Routes */}
        <Route
          path="/advisor/events"
          element={
            <PrivateRoute allowedRoles={["advisor"]}>
              <Events />
            </PrivateRoute>
          }
        />
        <Route
          path="/advisor/applications"
          element={
            <PrivateRoute allowedRoles={["advisor"]}>
              <Applications />
            </PrivateRoute>
          }
        />
        {/* Guide Routes */}
        <Route
          path="/guide/assigned-events"
          element={
            <PrivateRoute allowedRoles={["guide"]}>
              <AssignedEvents />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/events"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Events />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Applications />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/admin-dashboard"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
