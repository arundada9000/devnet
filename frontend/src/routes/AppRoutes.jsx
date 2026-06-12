import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageLoader from "../components/PageLoader";
import ErrorBoundary from "../components/ErrorBoundary";

const Signin = React.lazy(() => import("../pages/Auth/Login"));
const Signup = React.lazy(() => import("../pages/Auth/Signup"));
const ForgotPassword = React.lazy(() => import("../pages/Auth/ForgotPassword"));
const Welcome = React.lazy(() => import("../pages/Auth/Welcome"));
const VerifyOTP = React.lazy(() => import("../pages/Auth/VerifyOTP"));
const DashboardHome = React.lazy(() => import("../pages/Dashboard/Home"));
const DashboardAlerts = React.lazy(() => import("../pages/Dashboard/Alerts"));
const DashboardReports = React.lazy(() => import("../pages/Dashboard/Reports"));
const MapPage = React.lazy(() => import("../pages/Dashboard/MapPage"));
const ReportForm = React.lazy(() => import("../pages/Reports/ReportForm"));
const EmergencyTypeSelection = React.lazy(() => import("../pages/Dashboard/EmergencyTypeSelection"));
const DynamicContact = React.lazy(() => import("../pages/Dashboard/DynamicContact"));

const AdminDashboard = React.lazy(() => import("../Admin/Dashboard"));
const ManageUsers = React.lazy(() => import("../Admin/Manage-Users"));
const ManageReports = React.lazy(() => import("../Admin/Manage-Reports"));
const ManageContacts = React.lazy(() => import("../Admin/ManageContacts"));
const SendAlerts = React.lazy(() => import("../Admin/SendAlerts"));
const ManageSafeZones = React.lazy(() => import("../Admin/ManageSafeZones"));
const Profile = React.lazy(() => import("../pages/Dashboard/Profile"));
const Unauthorized = React.lazy(() => import("../pages/Unauthorized"));
const NotFound = React.lazy(() => import("../pages/NotFound"));

import Navigation from "../layouts/Navigation";
import RequireAdmin from "../Auth/RequireAdmin";
import Logout from "../Auth/Logout";
import AdminLayout from "../layouts/AdminLayout";

const AnimatedRoutes = () => {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const routeKey = isAdminRoute ? "admin" : location.pathname;

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={routeKey}>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/logout" element={<Logout />} />

          <Route path="/" element={<Navigate to="/dashboard/home" replace />} />

          <Route path="/dashboard" element={<Navigation />}>
            <Route path="home" element={<DashboardHome />} />
            <Route path="alerts" element={<DashboardAlerts />} />
            <Route path="reports" element={<DashboardReports />} />
            <Route path="map" element={<MapPage />} />
            <Route path="report" element={<ReportForm />} />
            <Route path="profile" element={<Profile />} />
            <Route
              path="emergency-type-selection"
              element={<EmergencyTypeSelection />}
            />
            <Route path=":localGov/:department" element={<DynamicContact />} />
          </Route>

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="manage-users" element={<ManageUsers />} />
            <Route path="send-alerts" element={<SendAlerts />} />
            <Route path="manage-reports" element={<ManageReports />} />
            <Route path="manage-contacts" element={<ManageContacts />} />
            <Route path="manage-safe-zones" element={<ManageSafeZones />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

const AppRoutes = () => {
  return (
    <Router>
      <ErrorBoundary>
        <AnimatedRoutes />
      </ErrorBoundary>
    </Router>
  );
};

export default AppRoutes;
