import { Navigate } from "react-router-dom";
import useAuth from "../stores/useAuth"; // adjust if path differs
import AdminSkeletonLoader from "../components/AdminSkeletonLoader";

export default function RequireAdmin({ children }) {
  const user = useAuth((state) => state.user);
  const isCheckingAuth = useAuth((state) => state.isCheckingAuth);

  // Wait for the global autoLogin (fired once in App.jsx) to finish
  if (isCheckingAuth) {
    return <AdminSkeletonLoader />;
  }

  if (!user) return <Navigate to="/signin" />;
  if (user.role !== "admin") return <Navigate to="/unauthorized" />;

  return children;
}
