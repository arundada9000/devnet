import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import useAdminLocationStore from "../stores/useAdminLocationStore";

const AdminLayout = () => {
  const init = useAdminLocationStore((s) => s.init);

  useEffect(() => { init(); }, [init]);

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