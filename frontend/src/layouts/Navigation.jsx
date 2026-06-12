import { useState, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, AlertTriangle, Map as MapIcon, User } from "lucide-react";
import useAuth from "../stores/useAuth";
import { useLocalGovStore } from "../stores/localGovStore";

const ProfileDrawer = lazy(() => import("../pages/Dashboard/Profile"));

const NavigationLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { localGov } = useLocalGovStore();

  const user = useAuth((state) => state.user);

  const [showBottomNav, setShowBottomNav] = useState(true);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  const currentPath = location.pathname;

  const isActive = (path) => {
    if (path === "/home") {
      return currentPath === "/" || currentPath === "/dashboard/home";
    }
    return currentPath.includes(path);
  };

  const navItems = [
    { id: "home", path: "/home", labelKey: "navigation.home", icon: Home },
    { id: "reports", path: "/reports", labelKey: "navigation.report", icon: AlertTriangle },
    { id: "map", path: "/map", labelKey: "navigation.map", icon: MapIcon },
    { id: "settings", path: "/settings", labelKey: "navigation.settings", icon: User },
  ];

  const activeTabId =
    navItems.find((item) =>
      item.path !== "/settings" ? isActive(item.path) : false
    )?.id ?? (showProfileDrawer ? "settings" : null);

  const userName = user?.username || t("navigation.citizen");

  return (
    <div className="relative min-h-screen bg-bg-light text-text-dark w-full overflow-x-hidden">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold tracking-tight text-text-dark flex items-center gap-1">
              {t("navigation.hello")}, <span className="text-primary-red">{userName}!</span>
            </h1>
            <div className="flex items-center mt-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {localGov ? localGov : t("navigation.detectingLocation")}
              </span>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 cursor-pointer"
          >
            <img
              src="/assets/logo.png"
              alt={t("navigation.logoAlt")}
              className="w-12 h-12 rounded-full shadow-sm border border-gray-100"
              onClick={() => navigate("/dashboard/home")}
            />
          </motion.div>
        </div>
      </header>

      <main className="pb-24 pt-2 max-w-4xl mx-auto w-full">
        <Outlet />
      </main>

      <AnimatePresence>
        <motion.nav
          initial={false}
          animate={{ y: showBottomNav ? 0 : 100 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 left-0 right-0 z-50 px-4 pointer-events-none"
        >
          <div className="mx-auto max-w-md w-full bg-white/90 backdrop-blur-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100/80 rounded-3xl flex items-center justify-around py-2 px-2 pointer-events-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTabId === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.path === "/settings") {
                      setShowProfileDrawer(true);
                    } else {
                      setShowProfileDrawer(false);
                      navigate(`/dashboard${item.path}`);
                    }
                  }}
                  className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red ${
                    isSelected ? "text-primary-red" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/50"
                  }`}
                  aria-label={t(item.labelKey)}
                  aria-current={isSelected ? "page" : undefined}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-red-50/80 rounded-2xl"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}

                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <Icon size={22} strokeWidth={isSelected ? 2.5 : 2} className="transition-all duration-300" />
                    <span className={`text-[10px] font-medium tracking-tight ${isSelected ? "font-bold" : ""}`}>
                      {t(item.labelKey)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.nav>
      </AnimatePresence>

      <Suspense fallback={null}>
        <ProfileDrawer
          open={showProfileDrawer}
          onClose={() => setShowProfileDrawer(false)}
        />
      </Suspense>
    </div>
  );
};

export default NavigationLayout;
