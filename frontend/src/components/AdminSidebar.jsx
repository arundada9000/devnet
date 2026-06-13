import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Bell,
  Users,
  Phone,
  LogOut,
  ChevronLeft,
  Shield,
  HeartHandshake,
} from "lucide-react";

export default function AdminSidebar() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: t("sidebar.home"), to: "/", icon: Home },
    { label: t("sidebar.dashboard"), to: "/admin", icon: LayoutDashboard, exact: true },
    { label: t("sidebar.manageUsers"), to: "/admin/manage-users", icon: Users },
    { label: t("sidebar.manageReports"), to: "/admin/manage-reports", icon: FileText },
    { label: t("sidebar.manageVolunteers", "Volunteers"), to: "/admin/manage-volunteers", icon: HeartHandshake },
    { label: t("sidebar.manageContacts"), to: "/admin/manage-contacts", icon: Phone },
    { label: t("sidebar.manageAlerts"), to: "/admin/send-alerts", icon: Bell },
    { label: t("sidebar.safeZones"), to: "/admin/manage-safe-zones", icon: Shield },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to) && item.to !== "/";
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  return (
    <>
      {/* Mobile hamburger — fixed top-left */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-[80] p-2 bg-gray-900 text-white rounded-lg shadow-lg"
        aria-label={t("sidebar.toggleSidebar")}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-[69]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          top-0 h-screen z-[70] bg-gray-900 text-white
          flex flex-col shrink-0 transition-all duration-300 ease-in-out
          ${collapsed ? "w-[68px]" : "w-64"}
          ${mobileOpen ? "fixed inset-y-0 left-0 translate-x-0 shadow-2xl" : "fixed inset-y-0 left-0 -translate-x-full md:translate-x-0 md:sticky md:shadow-none"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">{t("sidebar.admin")}</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
            aria-label={collapsed ? t("sidebar.expandSidebar") : t("sidebar.collapseSidebar")}
          >
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  ${active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }
                `}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors duration-200 w-full"
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>{t("sidebar.logout")}</span>}
          </button>
          {!collapsed && (
            <p className="text-[11px] text-gray-600 mt-3 px-3">
              {t("sidebar.footer")}
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
