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
import TourApplication from "./pages/TourApplication";
import AdminDashboard from "./pages/AdminDashboard"; // Import AdminDashboard
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute"; // Import AdminRoute

import UsersPage from "./pages/DashboardPages/UsersPage"; // The current dashboard functionality
import SettingsPage from "./pages/DashboardPages/SettingsPage"; // Additional page
import SchoolPriorityPage from "./pages/DashboardPages/SchoolPriorityPage"; // Additional page



function App() {

  
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/tours" element={<TourApplication />} />


        {/* Protected Profile Route */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Protected Admin Route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        >
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="schoolPriority" element={<SchoolPriorityPage />} />
          {/* Add more nested routes as needed */}
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
