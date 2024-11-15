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
import AssignedEvents from "./pages/AssignedEvents";
import {
  AdminDashboard,
  UsersTable,
  SchoolPriority,
  Settings,
} from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";

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

        {/* Admin and Coordinator Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={["admin", "coordinator"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        >
          <Route path="users" element={<UsersTable />} />
          <Route path="schoolPriority" element={<SchoolPriority />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Coordinator Routes */}
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

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
