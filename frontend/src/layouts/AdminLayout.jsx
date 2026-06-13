import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import useAdminLocationStore from "../stores/useAdminLocationStore";

/**
 * Admin layout wrapper.
 * The sidebar is a sticky flex-child that never re-mounts.
 * Only the <Outlet /> (page content) swaps on navigation.
 */
const AdminLayout = () => {
  const init = useAdminLocationStore((s) => s.init);

  // Initialize admin location store once on mount
  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
