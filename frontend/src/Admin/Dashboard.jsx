import React, { useMemo, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from "chart.js";
import { motion } from "framer-motion";
import { MapPin, LayoutDashboard, FileText, Users, Bell, Shield, Contact, PieChart } from "lucide-react";
import API from "../api/axios";
import useAdminLocationStore from "../stores/useAdminLocationStore";
import { useTranslation } from "react-i18next";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { adminLocation, availableLocations } = useAdminLocationStore();
  const [locationFilter, setLocationFilter] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (adminLocation && !hasInitialized) {
      setLocationFilter(adminLocation);
      setHasInitialized(true);
    }
  }, [adminLocation, hasInitialized]);

  // Optimized data fetching with react-query and real-time polling
  const queryConfig = { refetchInterval: 30000, staleTime: 10000 };
  const { data: reports = [], isLoading: loadingReports } = useQuery({ queryKey: ["reports"], queryFn: () => API.get("/reports").then(res => res.data), ...queryConfig });
  const { data: users = [], isLoading: loadingUsers } = useQuery({ queryKey: ["users"], queryFn: () => API.get("/auth/users").then(res => res.data), ...queryConfig });
  const { data: alerts = [], isLoading: loadingAlerts } = useQuery({ queryKey: ["alerts"], queryFn: () => API.get("/alerts").then(res => res.data), ...queryConfig });
  const { data: safeZones = [], isLoading: loadingSafeZones } = useQuery({ queryKey: ["safe-zones"], queryFn: () => API.get("/safe-zones").then(res => res.data), ...queryConfig });
  const { data: contacts = [], isLoading: loadingContacts } = useQuery({ queryKey: ["contacts"], queryFn: () => API.get("/contacts").then(res => res.data), ...queryConfig });

  const loading = loadingReports || loadingUsers || loadingAlerts || loadingSafeZones || loadingContacts;

  // Filter data by location
  const filteredReports = useMemo(() => locationFilter ? reports.filter((r) => r.localGovName?.toLowerCase() === locationFilter.toLowerCase()) : reports, [reports, locationFilter]);
  const filteredAlerts = useMemo(() => locationFilter ? alerts.filter((a) => a.location?.toLowerCase().includes(locationFilter.toLowerCase())) : alerts, [alerts, locationFilter]);
  const filteredSafeZones = useMemo(() => locationFilter ? safeZones.filter((z) => z.address?.toLowerCase().includes(locationFilter.toLowerCase()) || z.name?.toLowerCase().includes(locationFilter.toLowerCase())) : safeZones, [safeZones, locationFilter]);
  const filteredContacts = useMemo(() => locationFilter ? contacts.filter((c) => c.localGovName?.toLowerCase() === locationFilter.toLowerCase()) : contacts, [contacts, locationFilter]);

  // Aggregations
  const statusCounts = useMemo(() => {
    const c = { pending: 0, verified: 0, working: 0, solved: 0 };
    filteredReports.forEach((r) => { if (r.status && c[r.status] !== undefined) c[r.status]++; });
    return c;
  }, [filteredReports]);

  const typeCounts = useMemo(() => {
    const c = {};
    filteredReports.forEach((r) => {
      const type = r.type ? r.type.charAt(0).toUpperCase() + r.type.slice(1) : "Unknown";
      c[type] = (c[type] || 0) + 1;
    });
    return c;
  }, [filteredReports]);

  const roleCounts = useMemo(() => users.reduce((a, u) => {
    const role = u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : "User";
    a[role] = (a[role] || 0) + 1;
    return a;
  }, {}), [users]);

  const alertsByType = useMemo(() => {
    const c = {};
    filteredAlerts.forEach((a) => {
      const type = a.type ? a.type.charAt(0).toUpperCase() + a.type.slice(1) : "Unknown";
      c[type] = (c[type] || 0) + 1;
    });
    return c;
  }, [filteredAlerts]);

  const safeZoneStats = useMemo(() => {
    let active = 0;
    filteredSafeZones.forEach(z => { if(z.isActive !== false) active++; });
    return { active, inactive: filteredSafeZones.length - active };
  }, [filteredSafeZones]);

  const contactStats = useMemo(() => {
    const depts = new Set(filteredContacts.map(c => c.department)).size;
    const phones = filteredContacts.reduce((acc, c) => acc + (c.contacts?.length || 0), 0);
    return { depts, phones };
  }, [filteredContacts]);

  const topAlertTypes = Object.entries(alertsByType).sort((a,b) => b[1]-a[1]).slice(0, 2);
  const alertSubcards = topAlertTypes.length === 2 
    ? topAlertTypes.map(([label, value]) => ({ label, value, color: "text-amber-600" }))
    : topAlertTypes.length === 1
    ? [...topAlertTypes.map(([label, value]) => ({ label, value, color: "text-amber-600" })), { label: "Other", value: 0, color: "text-gray-400" }]
    : [{ label: "Flood", value: 0, color: "text-gray-400" }, { label: "Fire", value: 0, color: "text-gray-400" }];

  // Grouped Cards Data (Uniform 2 subcards each)
  const groupedCards = [
    {
      id: "reports",
      title: t("admin.dashboard.reports"),
      icon: <FileText className="text-indigo-600" size={24} />,
      total: filteredReports.length,
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      link: "/admin/manage-reports",
      subcards: [
        { label: t("admin.dashboard.active"), value: statusCounts.pending + statusCounts.working, color: "text-amber-600" },
        { label: t("admin.dashboard.resolved"), value: statusCounts.verified + statusCounts.solved, color: "text-emerald-600" },
      ]
    },
    {
      id: "users",
      title: t("admin.dashboard.users"),
      icon: <Users className="text-blue-600" size={24} />,
      total: users.length,
      bg: "bg-blue-50",
      border: "border-blue-100",
      link: "/admin/manage-users",
      subcards: [
        { label: t("admin.dashboard.admins"), value: roleCounts.Admin || 0, color: "text-purple-600" },
        { label: t("admin.dashboard.users"), value: roleCounts.User || 0, color: "text-blue-600" },
      ]
    },
    {
      id: "alerts",
      title: t("admin.dashboard.alerts"),
      icon: <Bell className="text-amber-600" size={24} />,
      total: filteredAlerts.length,
      bg: "bg-amber-50",
      border: "border-amber-100",
      link: "/admin/send-alerts",
      subcards: alertSubcards
    },
    {
      id: "safe-zones",
      title: t("admin.dashboard.safeZones"),
      icon: <Shield className="text-emerald-600" size={24} />,
      total: filteredSafeZones.length,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      link: "/admin/manage-safe-zones",
      subcards: [
        { label: t("admin.dashboard.active"), value: safeZoneStats.active, color: "text-emerald-600" },
        { label: t("admin.dashboard.inactive"), value: safeZoneStats.inactive, color: "text-gray-500" },
      ]
    },
    {
      id: "contacts",
      title: t("admin.dashboard.contacts"),
      icon: <Contact className="text-rose-600" size={24} />,
      total: filteredContacts.length,
      bg: "bg-rose-50",
      border: "border-rose-100",
      link: "/admin/manage-contacts",
      subcards: [
        { label: t("admin.dashboard.depts"), value: contactStats.depts, color: "text-rose-600" },
        { label: t("admin.dashboard.phones"), value: contactStats.phones, color: "text-orange-600" },
      ]
    }
  ];

  const SkeletonCard = () => (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
          <div className="w-24 h-6 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="w-12 h-8 bg-gray-200 animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-2 gap-2 mt-auto border-t border-gray-50 pt-2">
        {[1, 2].map(i => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />)}
      </div>
    </div>
  );

  const SkeletonChart = () => <div className="bg-gray-100 animate-pulse rounded-xl w-full h-full min-h-[250px]" />;

  return (
    <div className="pb-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3 hover:text-indigo-600 transition-colors cursor-pointer">
            <LayoutDashboard className="text-indigo-500" size={32} />
            {t("admin.dashboard.title")}
          </h1>
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 shadow-sm" title="Data updates automatically every 30s">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold tracking-wide uppercase">{t("admin.dashboard.live")}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
          <div className="pl-3 pr-1 text-gray-400"><MapPin size={18} /></div>
          <select 
            value={locationFilter} 
            onChange={(e) => setLocationFilter(e.target.value)} 
            className="px-2 py-1.5 bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
            aria-label="Filter by location"
          >
            <option value="">{t("admin.dashboard.allLocations")}</option>
            {availableLocations.map((loc) => (<option key={loc} value={loc}>{loc}</option>))}
          </select>
        </div>
      </motion.div>

      {/* Grouped Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
        {loading ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : (
          groupedCards.map((card, i) => (
            <motion.div 
              key={card.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.08 }}
              onClick={() => navigate(card.link)}
              className={`bg-white border ${card.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-1 flex flex-col group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {card.icon}
                  </div>
                  <h3 className="font-bold text-gray-700">{card.title}</h3>
                </div>
                <div className="text-2xl font-black text-gray-800">{card.total}</div>
              </div>
              
              {card.subcards.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-gray-50">
                  {card.subcards.map((sub, j) => (
                    <div key={j} className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className={`text-lg font-bold ${sub.color}`}>{sub.value}</div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{sub.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Reports by Type Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-indigo-500" />
            {t("admin.dashboard.reportsByType")}
          </h2>
          <div className="flex-1 relative min-h-[280px]">
            {loading ? <SkeletonChart /> : (
              Object.keys(typeCounts).length > 0 ? (
                <Bar 
                  data={{ 
                    labels: Object.keys(typeCounts), 
                    datasets: [{ label: t("admin.dashboard.reports"), data: Object.values(typeCounts), backgroundColor: "rgba(99, 102, 241, 0.8)", borderRadius: 6, hoverBackgroundColor: "rgba(79, 70, 229, 1)" }] 
                  }} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { color: "#f3f4f6" } }, x: { grid: { display: false } } }
                  }} 
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">{t("admin.dashboard.noReportsData")}</div>
              )
            )}
          </div>
        </div>

        {/* Status Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart className="text-blue-500" size={18} />
            {t("admin.dashboard.reportStatus")}
          </h2>
          <div className="flex-1 relative min-h-[280px] flex items-center justify-center">
            {loading ? <SkeletonChart /> : (
              filteredReports.length > 0 ? (
                <Doughnut 
                  data={{ 
                    labels: [t("charts.pending"), t("charts.verified"), t("charts.working"), t("charts.solved")], 
                    datasets: [{ data: [statusCounts.pending, statusCounts.verified, statusCounts.working, statusCounts.solved], backgroundColor: ["#fbbf24", "#3b82f6", "#a855f7", "#10b981"], borderWidth: 0, hoverOffset: 4 }] 
                  }} 
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right", labels: { usePointStyle: true, padding: 20 } } }, cutout: "65%" }}
                />
              ) : (
                <div className="text-gray-400 text-sm">{t("admin.dashboard.noStatusData")}</div>
              )
            )}
          </div>
        </div>

        {/* Alerts by Type Doughnut */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Bell size={18} className="text-amber-500" />
            {t("admin.dashboard.alertsDistribution")}
          </h2>
          <div className="flex-1 relative min-h-[280px] flex items-center justify-center">
            {loading ? <SkeletonChart /> : (
              filteredAlerts.length > 0 ? (
                <Pie 
                  data={{ 
                    labels: Object.keys(alertsByType), 
                    datasets: [{ data: Object.values(alertsByType), backgroundColor: ["#f87171", "#fb923c", "#fbbf24", "#a3e635", "#38bdf8", "#818cf8"], borderWidth: 1 }] 
                  }} 
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right", labels: { usePointStyle: true, padding: 15 } } } }}
                />
              ) : (
                <div className="text-gray-400 text-sm">{t("admin.dashboard.noAlertsData")}</div>
              )
            )}
          </div>
        </div>

        {/* Users by Role */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={18} className="text-purple-500" />
            {t("admin.dashboard.usersOverview")}
          </h2>
          <div className="flex-1 relative min-h-[280px] flex items-center justify-center">
            {loading ? <SkeletonChart /> : (
              users.length > 0 ? (
                <Bar 
                  data={{ 
                    labels: Object.keys(roleCounts), 
                    datasets: [{ label: t("admin.dashboard.users"), data: Object.values(roleCounts), backgroundColor: ["#c084fc", "#60a5fa"], borderRadius: 8 }] 
                  }} 
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, indexAxis: "y", scales: { x: { beginAtZero: true, grid: { color: "#f3f4f6" } }, y: { grid: { display: false } } } }}
                />
              ) : (
                <div className="text-gray-400 text-sm">{t("admin.dashboard.noUsersData")}</div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
