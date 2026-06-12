import { Navigate } from "react-router-dom";
import useAuth from "../stores/useAuth";
import AdminSkeletonLoader from "../components/AdminSkeletonLoader";

export default function RequireAdmin({ children }) {
  const user = useAuth((state) => state.user);
  const isCheckingAuth = useAuth((state) => state.isCheckingAuth);

  if (isCheckingAuth) {
    return <AdminSkeletonLoader />;
  }

  if (!user) return <Navigate to="/signin" />;
  if (user.role !== "admin") return <Navigate to="/unauthorized" />;

  return children;
}
