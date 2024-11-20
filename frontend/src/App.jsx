import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Event from "./pages/Event";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Applications from "./pages/Applications";
import Events from "./pages/Events";
import AssignedEvents from "./pages/AssignedEvents";
import UsersPage from "./pages/DashboardPages/UsersPage";
import SettingsPage from "./pages/DashboardPages/SettingsPage";
import SchoolPriorityPage from "./pages/DashboardPages/SchoolPriorityPage";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import TourApplication from "./pages/TourApplication"
import PrivateRoute from "./components/PrivateRoute";
import AddUser from "./pages/DashboardPages/AddUser";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/apply" element={<TourApplication />} />

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

        {/* Dashboard accessible to Admin and Coordinator */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={["admin", "coordinator"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        >
          <Route path="users" element={<UsersPage />} />
          <Route path="adduser" element={<AddUser />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="schoolPriority" element={<SchoolPriorityPage />} />
        </Route>

        {/* Events Route (Admin, Coordinator, Advisor) */}
        <Route
          path="/events"
          element={
            <PrivateRoute allowedRoles={["admin", "advisor"]}>
              <Events />
            </PrivateRoute>
          }
        />

        {/* Applications Route (Admin, Coordinator, Advisor) */}
        <Route
          path="/applications"
          element={
            <PrivateRoute allowedRoles={["admin", "coordinator", "advisor"]}>
              <Applications />
            </PrivateRoute>
          }
        />

        {/* Assigned Events Route (Guide and Admin) */}
        <Route
          path="/assigned-events"
          element={
            <PrivateRoute allowedRoles={["admin", "guide"]}> {/*I do not think admin should see this */}
              <AssignedEvents />
            </PrivateRoute>
          }
        />
  <Route path="/events/:id" element={<Event/>} />
        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
