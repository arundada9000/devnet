import ReportCard from "../../components/ReportCard";
import SummaryCard from "../../components/SummaryCard";
// import { dummyReports as report } from "../../data/dummyReports";
import ProfileDrawer from "../../pages/Dashboard/Profile";
import ReportDetailModal from "../../components/ReportDetailModal";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import axios from "axios";

const AdminDashboard = () => {
  const [report, setReport] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/reports");
        const data = response.data;
        console.log("Fetched reports:", data);
        setReport(data);
      } catch (error) {
        console.error("Error fetching incidents:", error);
      }
    };
    fetchData();
  }, []);

  const [selectedReport, setSelectedReport] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showBottomNav, setShowBottomNav] = useState(true);
  const currentPath = location.pathname;
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  const isActive = (path) => {
    if (path === "/home") {
      return currentPath === "/" || currentPath === "/dashboard/home";
    }
    return currentPath.includes(path);
  };

  return (
    <div className="max-w-[480px] mx-auto bg-white min-h-screen p-0">
      <header className="w-full flex justify-between items-center mb-4 bg-[#155ac1] p-4 text-white rounded-md shadow">
        <div className="text-xl font-bold">Admin</div>
        <img src="/icons/admin-profile.png" alt="Profile" className="w-6 h-6" />
      </header>

      <div className="grid grid-cols-4 gap-2 mb-4 p-4">
        <SummaryCard count={report.length} label="Total Reports" />
        <SummaryCard count={3} label="In Progress" />
        <SummaryCard count={8} label="Resolved" />
        <SummaryCard count={2} label="Rejected" />
      </div>

      <div className="mb-2 font-semibold text-gray-800">Incident Reports</div>

      <div className="m-3">
        <input
          type="text"
          placeholder="Search by Incident ID"
          className="border text-sm w-full px-3 py-1.5 rounded-md"
        />
      </div>

      <div className="pb-7">
        {report.map((report) => (
          <ReportCard
            key={report._id}
            {...report}
            onView={() => setSelectedReport(report)}
          />
        ))}
      </div>

      <button className="text-center w-full py-2 text-blue-700 text-sm">
        Load More ▼
      </button>

      <nav
        className={`fixed  pr-8 bottom-0 left-0 right-0 z-40 bg-[#155ac1] border-t shadow-md transition-transform duration-300 ${
          showBottomNav ? "translate-y-0" : "translate-y-full"
        }w-full max-w-[720px]`}
      >
        <div className="flex items-center justify-around py-1 px-3">
          <NavButton
            icon="/icons/home-icon.svg"
            label={t("navigation.home")}
            active={isActive("/home")}
            onClick={() => navigate("/dashboard/home")}
          />
          <NavButton
            icon="/icons/emergency-icon.svg"
            label={t("navigation.report")}
            active={isActive("/reports")}
            onClick={() => navigate("/dashboard/reports")}
          />
          <NavButton
            icon="/icons/location-icon.svg"
            label={t("navigation.map")}
            active={isActive("/map")}
            onClick={() => navigate("/dashboard/map")}
          />
          <NavButton
            icon="/icons/setting-icon.svg"
            alt="Profile"
            onClick={() => setShowProfileDrawer(true)}
            label={t("navigation.settings")}
          />
        </div>
      </nav>
      <ProfileDrawer
        open={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
      />

      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-1 transition duration-200 cursor-pointer hover:scale-110 ${
      active ? "text-red-600 scale-110 " : "text-white hover:text-red-500"
    }`}
  >
    <img src={icon} alt={label} className="w-9 h-9" />
    <span className="text-xs">{label}</span>
  </button>
);

export default AdminDashboard;
