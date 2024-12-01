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
import Applications from "./pages/AdvisorPages/Applications";
import ManageGuides from "./pages/AdvisorPages/ManageGuides";
import Events from "./pages/GuidePages/Events";
import AssignedEvents from "./pages/GuidePages/AssignedEvents";
import UsersPage from "./pages/CoordinatorPages/DashboardPages/UsersPage";
import SettingsPage from "./pages/CoordinatorPages/DashboardPages/SettingsPage";
import ManageFairs from "./pages/CoordinatorPages/DashboardPages/ManageFairs";
import SchoolPriorityPage from "./pages/CoordinatorPages/DashboardPages/SchoolPriorityPage";
import AdminDashboard from "./pages/CoordinatorPages/AdminDashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import TourApplication from "./pages/TourApplication"
import PrivateRoute from "./components/PrivateRoute";
import AddUser from "./pages/CoordinatorPages/DashboardPages/AddUser";
import FairApplication from "./pages/FairApplication";

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
        <Route path="/invite" element={<FairApplication />}/>

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
          <Route path= "ManageFairs" element = {<ManageFairs />} />
          <Route path="adduser" element={<AddUser />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="schoolPriority" element={<SchoolPriorityPage />} />
        </Route>

        {/* Events Route (Admin, Coordinator, Advisor) */}
        <Route
          path="/events"
          element={
            <PrivateRoute allowedRoles={["admin", "coordinator","advisor","guide"]}>
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
        <Route
          path="/manage-guides"
          element={
            <PrivateRoute allowedRoles={[ "advisor"]}>
              <ManageGuides />
            </PrivateRoute>
          }
        />

        {/* Assigned Events Route (Guide and Admin) */}
        <Route
          path="/assigned-events"
          element={
            <PrivateRoute allowedRoles={["admin","advisor", "guide"]}> {/*I do not think admin should see this */}
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
