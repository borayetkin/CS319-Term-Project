import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import Event from "./pages/Event";
import Fair from "./pages/Fair";
import EditDetails from "./pages/EditDetails";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Applications from "./pages/AdvisorPages/Applications";
import ManageGuides from "./pages/AdvisorPages/ManageGuides";
import ApplicationDetails from "./pages/AdvisorPages/ApplicationDetails";
import CompletedTours from "./pages/AdvisorPages/CompletedTours";
import Events from "./pages/GuidePages/Events";
import AssignedEvents from "./pages/GuidePages/AssignedEvents";
import UsersPage from "./pages/CoordinatorPages/DashboardPages/UsersPage";
import SettingsPage from "./pages/CoordinatorPages/DashboardPages/SettingsPage";
import ManageFairs from "./pages/CoordinatorPages/DashboardPages/ManageFairs";
import GuideManagement from "./pages/CoordinatorPages/DashboardPages/GuideManagement";
import SchoolPriorityPage from "./pages/CoordinatorPages/DashboardPages/SchoolPriorityPage";
import AdminDashboard from "./pages/CoordinatorPages/AdminDashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import {TourApplication} from "./pages/TourApplication";
import PrivateRoute from "./components/PrivateRoute";
import AddUser from "./pages/CoordinatorPages/DashboardPages/AddUser";
import FairApplication from "./pages/FairApplication";
import DashboardHome from "./pages/CoordinatorPages/DashboardPages/DashboardHome";
import NotificationsPage from './pages/GuidePages/Notifications';
import ViewGuidesPage from "./pages/CoordinatorPages/DashboardPages/ViewGuidesPage";
import ReviewForm from "./pages/ReviewForm";
import ReviewSubmitted from "./pages/ReviewSubmitted";
import AdvisorInformation from "./pages/AdvisorInformation";
import ResubmitForm from "./pages/ResubmitForm";
import TraineeshipApplication from "./pages/TraineeshipApplication";
import ViewTraineesPage from "./pages/AdvisorPages/ViewTraineesPage";
import ViewLogsPage from "./pages/CoordinatorPages/DashboardPages/ViewLogsPage";
import CheckApplication from "./pages/CheckApplication";
import EditApplication from "./pages/EditApplication";

function App() {
  return (
    <Router>
      <Layout>
        <Navbar />
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/apply" element={<TourApplication />} />
        <Route path="/invite" element={<FairApplication />} />
        <Route path="/review/:eventId" element={<ReviewForm />} />
        <Route path="/review/submitted" element={<ReviewSubmitted />} />
        <Route path="/advisor-info" element={<AdvisorInformation />} />
        <Route path="/resubmit-form/:eventId" element={<ResubmitForm />} />
        <Route path="/traineeship-application" element={<TraineeshipApplication />} />
        <Route path="/check-application" element={<CheckApplication />} />
        <Route path="/edit-application/:referenceCode" element={<EditApplication />} />

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
          <Route index element={<DashboardHome />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="guides" element={<ViewGuidesPage />} />
          <Route path="ManageFairs" element={<ManageFairs />} />
          <Route path="guide-management" element ={< GuideManagement/>} />
          <Route path="adduser" element={<AddUser />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="schoolPriority" element={<SchoolPriorityPage />} />
          <Route path="logs" element={<ViewLogsPage />} />
        </Route>

        {/* Events Route (Admin, Coordinator, Advisor) */}
        <Route
          path="/events"
          element={
            <PrivateRoute
              allowedRoles={["admin", "coordinator", "advisor", "guide"]}
            >
              <Events />
            </PrivateRoute>
          }
        />

        {/* completed tours Route (Admin, Advisor) */}
        <Route
            path="/completed-tours"
            element={
              <PrivateRoute
                allowedRoles={["advisor","admin"]}
              >
                <CompletedTours />
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

        {/* Application Details Route (Admin, Coordinator, Advisor) */}
        <Route
          path="/application/:id"
          element={
            <PrivateRoute allowedRoles={["admin", "coordinator", "advisor"]}>
              <ApplicationDetails />
            </PrivateRoute>
          }
        />
        {/* Assigned Events Route (Guide and Admin) */}
        <Route
          path="/assigned-events"
          element={
            <PrivateRoute allowedRoles={["admin", "advisor", "guide"]}>
              {" "}
              {/*I do not think admin should see this */}
              <AssignedEvents />
            </PrivateRoute>
          }
        />
        <Route
          path="/trainees"
          element={
            <PrivateRoute allowedRoles={["advisor"]}>
              <ViewTraineesPage />
            </PrivateRoute>
          }
        />
        <Route path="/events/:id" element={<Event />} />
        <Route path="/edit/:id" element={< EditDetails />} />
        <Route path="/fairs/:id" element={<Fair />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
      </Layout>
    </Router>
  );
}

export default App;
