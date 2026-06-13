import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import {
  Phone,
  BellRing,
  ChevronDown,
  ChevronUp,
  MapPin as MapPinIcon,
  Clock,
  CircleAlert,
  X,
} from "lucide-react";
import API from "../../api/axios";
import OfflineSyncBanner from "../../components/OfflineSyncBanner";

// Fetch reports from backend
const fetchReports = async () => {
  const { data } = await API.get("/reports");
  return data;
};

// Fetch alerts from backend
const fetchAlerts = async () => {
  const { data } = await API.get("/alerts");
  return data.map((alert) => ({
    type: alert.type,
    location: alert.location || "",
    description: alert.description,
    timeAgo: new Date(alert.timestamp).toLocaleTimeString(),
    timestamp: alert.timestamp,
  }));
};

// Alert type visual config
const alertMeta = {
  fire: {
    icon: "/icons/fire-red.svg",
    bg: "bg-red-50",
    border: "border-red-200",
    accent: "bg-red-500",
    iconColor: "text-red-500",
    badge: "bg-red-100 text-red-700",
  },
  police: {
    icon: "/icons/police-red.svg",
    bg: "bg-blue-50",
    border: "border-blue-200",
    accent: "bg-blue-500",
    iconColor: "text-blue-500",
    badge: "bg-blue-100 text-blue-700",
  },
  flood: {
    icon: "/icons/flood-red.svg",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    accent: "bg-cyan-500",
    iconColor: "text-cyan-500",
    badge: "bg-cyan-100 text-cyan-700",
  },
  earthquake: {
    icon: "/icons/others-red.svg",
    bg: "bg-amber-50",
    border: "border-amber-200",
    accent: "bg-amber-500",
    iconColor: "text-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  accident: {
    icon: "/icons/accident-red.svg",
    bg: "bg-rose-50",
    border: "border-rose-200",
    accent: "bg-rose-500",
    iconColor: "text-rose-500",
    badge: "bg-rose-100 text-rose-700",
  },
  landslide: {
    icon: "/icons/landslide-red.svg",
    bg: "bg-orange-50",
    border: "border-orange-200",
    accent: "bg-orange-500",
    iconColor: "text-orange-500",
    badge: "bg-orange-100 text-orange-700",
  },
  other: {
    icon: "/icons/others-red.svg",
    bg: "bg-gray-50",
    border: "border-gray-200",
    accent: "bg-gray-500",
    iconColor: "text-gray-500",
    badge: "bg-gray-100 text-gray-700",
  },
};

const getRelativeTime = (timestamp, t) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("dashboard.justNow");
  if (mins < 60) return t("dashboard.minutesAgo", { mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t("dashboard.hoursAgo", { hrs });
  const days = Math.floor(hrs / 24);
  return t("dashboard.daysAgo", { days });
};

// Nominatim Reverse Geocoding fetcher (with rate limit awareness)
const fetchReverseGeocode = async (lat, lon) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
  );
  if (!res.ok) throw new Error("Geocoding failed");
  const json = await res.json();
  return json.display_name;
};

const INITIAL_VISIBLE = 10;

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("all");
  const [sortOrder] = useState("latest");
  const [expandedLocationId, setExpandedLocationId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // 1. Fetch Alerts (React Query)
  const { data: notifications = [], isLoading: loadingAlerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    staleTime: 60 * 1000, // 1 minute
  });

  // 2. Fetch Reports (React Query)
  const { data: incidents = [], isLoading: loadingIncidents } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
    staleTime: 60 * 1000,
  });

  // 3. Fetch Geolocation Data for all incidents (React Query)
  // useQueries runs these in parallel but caches them globally
  const locationQueries = useQueries({
    queries: incidents.map((incident) => {
      const coords = incident.location?.coordinates;
      const isValidCoords = coords && coords.length === 2;

      let lat = null,
        lng = null;
      if (isValidCoords) {
        // Nepal Lat is ~26-30, Lng is ~80-88
        // If coords[0] is > 70, it's the longitude (new format [lng, lat])
        if (coords[0] > 70) {
          lng = coords[0];
          lat = coords[1];
        } else {
          // Old format [lat, lng]
          lat = coords[0];
          lng = coords[1];
        }
      }

      return {
        queryKey: ["geocode", isValidCoords ? `${lat},${lng}` : incident._id],
        queryFn: () => (isValidCoords ? fetchReverseGeocode(lat, lng) : null),
        enabled: isValidCoords,
        staleTime: Infinity,
        retry: 1,
      };
    }),
  });

  // Build a map of incident ID to location name from the queries
  const locationNames = {};
  incidents.forEach((incident, index) => {
    const query = locationQueries[index];
    if (query?.data) {
      locationNames[incident._id] = query.data;
    }
  });

  // Filter & Sort Logic
  const filteredIncidents = incidents
    .filter((incident) => {
      const status = incident.status || "reported";
      if (status === "rejected") return false; // Hide spam/rejected reports from public feed
      return filterType === "all" || status === filterType;
    })
    .sort((a, b) =>
      sortOrder === "latest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt),
    );

  const statusDotColor = {
    verified: "bg-red-500",
    working: "bg-yellow-500",
    solved: "bg-green-500",
    pending: "bg-orange-400",
  };

  const formatLocation = (incident) => {
    const location = incident.location;
    if (!location) return t("dashboard.unknownLocation");
    if (locationNames[incident._id]) return locationNames[incident._id];
    if (typeof location === "string") return location;
    if (location.city && location.area)
      return `${location.area}, ${location.city}`;
    if (location.city) return location.city;
    return t("dashboard.unknownLocation");
  };

  return (
    <>
      <Helmet>
        <title>Sajilo Sahayata | Dashboard</title>
        <meta
          name="description"
          content="View the latest emergency reports and alerts in your area."
        />
      </Helmet>

      {/* Offline Sync Banner */}
      <div className="px-4 pt-4 max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto">
        <OfflineSyncBanner />
      </div>

      <motion.div
        className="mt-0 px-4 py-4 pb-48 space-y-4 max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl min-h-[calc(100vh-80px)] mx-auto bg-bg-card shadow-sm rounded-lg relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        exit={{ opacity: 0, y: -20 }}
      >
        {/* Alerts Section */}
        {loadingAlerts ? (
          <Skeleton height={80} borderRadius={16} />
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <BellRing size={18} className="text-red-500" />
              <h2 className="text-lg font-bold text-gray-800 tracking-tight">
                {t("dashboard.activeAlerts")}
              </h2>
              <span className="ml-auto text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">
                {notifications.length}
              </span>
            </div>
            <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 scroll-smooth scrollbar-hide md:overflow-visible pb-1">
              <AnimatePresence>
                {notifications.map((notification, index) => {
                  const meta = alertMeta[notification.type] || alertMeta.other;
                  return (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedNotification(notification)}
                      className={`min-w-[280px] md:min-w-0 relative overflow-hidden rounded-2xl border ${meta.border} ${meta.bg} shadow-sm hover:shadow-md transition-all group text-left cursor-pointer active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-400`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{
                        delay: index * 0.06,
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      whileHover={{ y: -2 }}
                      role="alert"
                      aria-live="polite"
                    >
                      {/* Left accent bar */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 ${meta.accent} rounded-l-2xl`}
                      />

                      <div className="pl-4 pr-4 py-4">
                        {/* Top row: type badge + time */}
                        <div className="flex items-center justify-between mb-2.5">
                          <div
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${meta.badge}`}
                          >
                            <img
                              src={meta.icon}
                              alt={notification.type}
                              className="w-3.5 h-3.5 object-contain filter drop-shadow-sm"
                            />
                            <span>{notification.type}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                            <Clock size={11} />
                            <span>
                              {notification.timestamp
                                ? getRelativeTime(notification.timestamp, t)
                                : notification.timeAgo}
                            </span>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-1.5 mb-1.5">
                          <MapPinIcon
                            size={13}
                            className="text-gray-500 mt-0.5 flex-shrink-0"
                          />
                          <span className="text-sm font-semibold text-gray-800 leading-snug">
                            {notification.location || t("dashboard.unknownArea")}
                          </span>
                        </div>

                        {/* Description */}
                        {notification.description && (
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-1 pl-5">
                            {notification.description}
                          </p>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ) : null}

        {/* Reports Section */}
        <div className="space-y-3 mt-8">
          <div className="flex justify-between items-center rounded-lg px-1">
            <h2 className="text-2xl font-bold text-text-dark tracking-tight">
              {t("dashboard.latestReports")}
            </h2>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-50 transition"
              aria-label={t("dashboard.statusFilter")}
            >
              <option value="all">{t("dashboard.All")}</option>
              <option value="verified">{t("dashboard.Verified")}</option>
              <option value="working">{t("dashboard.Working")}</option>
              <option value="solved">{t("dashboard.Solved")}</option>
              <option value="pending">{t("dashboard.Pending")}</option>
            </select>
          </div>

          {loadingIncidents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
              <div className="h-80 w-full rounded-3xl overflow-hidden shadow-sm">
                <Skeleton className="w-full h-full" />
              </div>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm text-gray-500 border border-gray-100">
              {t("dashboard.noIncidents")}
            </div>
          ) : (
            <>
              <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-2 scrollbar-hide md:overflow-visible pb-6">
                <AnimatePresence>
                  {filteredIncidents
                    .slice(0, visibleCount)
                    .map((incident, index) => {
                      const status = incident.status || "reported";
                      const queryIndex = incidents.findIndex(
                        (i) => i._id === incident._id,
                      );
                      const isGeoLoading =
                        locationQueries[queryIndex]?.isLoading;

                      return (
                        <motion.div
                          key={incident._id}
                          className="relative min-w-[270px] md:min-w-0 rounded-[2rem] shadow-sm bg-white p-4 border border-gray-100 flex flex-col h-full snap-center hover:shadow-md transition-shadow"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="relative overflow-hidden rounded-2xl group">
                            <img
                              src={
                                incident.imageUrl?.startsWith("http")
                                  ? incident.imageUrl
                                  : `${import.meta.env.VITE_API_URL.replace("/api", "")}${incident.imageUrl}`
                              }
                              alt={incident.type}
                              loading="lazy"
                              className="h-56 w-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
                              onClick={() => {
                                const c = incident.location.coordinates;
                                const isValid = c && c.length === 2;
                                let lat = 0,
                                  lng = 0;
                                if (isValid) {
                                  if (c[0] > 70) {
                                    lng = c[0];
                                    lat = c[1];
                                  } else {
                                    lat = c[0];
                                    lng = c[1];
                                  }
                                }
                                navigate("/dashboard/map", {
                                  state: {
                                    focus: {
                                      id: incident._id,
                                      lat,
                                      lng,
                                      title: incident.title,
                                      type: incident.type,
                                    },
                                  },
                                });
                              }}
                            />

                            {/* Location label */}
                            <div
                              className="absolute bottom-3 left-3 max-w-[85%] cursor-pointer"
                              onClick={() =>
                                setExpandedLocationId(
                                  expandedLocationId === incident._id
                                    ? null
                                    : incident._id,
                                )
                              }
                              aria-expanded={
                                expandedLocationId === incident._id
                              }
                            >
                              <div
                                className={`text-white transition-all duration-300 ${
                                  expandedLocationId === incident._id
                                    ? "bg-black/90 text-[11px] px-3 py-2 rounded-xl shadow-lg z-10 whitespace-normal backdrop-blur-md"
                                    : "bg-black/60 backdrop-blur-md text-[10px] px-3 py-1.5 rounded-lg truncate shadow-sm hover:bg-black/80"
                                }`}
                              >
                                {isGeoLoading ? (
                                  <Skeleton
                                    width={80}
                                    height={12}
                                    baseColor="#333"
                                    highlightColor="#555"
                                  />
                                ) : (
                                  formatLocation(incident)
                                )}
                              </div>
                            </div>

                            {/* Status Dot */}
                            <div
                              className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                                statusDotColor[status] || "bg-gray-400"
                              }`}
                              title={t("dashboard.statusTooltip") + status}
                            ></div>
                          </div>

                          <div className="pt-4 pb-1 px-2 flex-grow flex flex-col">
                            <div className="text-[15px] font-black capitalize text-gray-900 tracking-tight">
                              {t(`incidentTypes.${incident.type}`)}
                            </div>
                            <p className="text-[13px] text-gray-600 mt-2 line-clamp-3 leading-relaxed flex-grow">
                              {incident.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}

                  {/* Show More / Less Card - Inside the Grid */}
                  {filteredIncidents.length > INITIAL_VISIBLE && (
                    <motion.div
                      key="show-more-card"
                      className="relative min-w-[270px] md:min-w-0 rounded-[2rem] shadow-sm bg-gray-50/50 p-4 border border-dashed border-gray-300 flex flex-col h-full items-center justify-center snap-center hover:bg-gray-50 transition-colors min-h-[300px]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <button
                        onClick={() =>
                          setVisibleCount(
                            visibleCount >= filteredIncidents.length
                              ? INITIAL_VISIBLE
                              : visibleCount + INITIAL_VISIBLE,
                          )
                        }
                        className="flex flex-col items-center gap-2 text-gray-600 hover:text-primary-red transition-colors"
                      >
                        {visibleCount >= filteredIncidents.length ? (
                          <>
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100">
                              <ChevronUp size={24} />
                            </div>
                            <span className="font-semibold text-sm">
                              {t("dashboard.showLess")}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100">
                              <ChevronDown size={24} />
                            </div>
                            <span className="font-semibold text-sm">
                              {t("dashboard.showMore")}
                            </span>
                            <span className="text-xs text-gray-400">
                              {t("dashboard.moreCount", { count: filteredIncidents.length - visibleCount })}
                            </span>
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* SOS Floating Button — Always visible above Navigation Bar */}
        <div className="fixed bottom-[104px] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[320px]">
          <motion.div
            className="relative"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            {/* Pulsing glow ring */}
            <div
              className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"
              style={{ animationDuration: "2s" }}
            />

            <motion.button
              className="relative flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-2xl sm:text-3xl w-full rounded-full shadow-[0_4px_20px_rgba(220,38,38,0.4)] hover:shadow-[0_6px_30px_rgba(220,38,38,0.55)] py-3.5 sm:py-4 px-6 focus:outline-none focus:ring-4 focus:ring-red-300 transition-shadow"
              onClick={() => navigate("/dashboard/emergency-type-selection")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              aria-label={t("dashboard.callEmergency")}
            >
              <Phone
                size={30}
                strokeWidth={2.5}
                className="drop-shadow-md animate-pulse"
              />
              <span className="tracking-wide">
                {t("dashboard.sahayatacall")}
              </span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Notification Modal */}
      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotification(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const meta =
                  alertMeta[selectedNotification.type] || alertMeta.other;
                return (
                  <>
                    <div
                      className={`${meta.bg} px-6 py-5 border-b ${meta.border} flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center p-2`}
                        >
                          <img
                            src={meta.icon}
                            alt={selectedNotification.type}
                            className="w-full h-full object-contain filter drop-shadow-sm"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 capitalize text-lg leading-tight">
                            {t("dashboard.alertType", { type: selectedNotification.type })}
                          </h3>
                          <span className="text-xs font-medium text-gray-500">
                            {selectedNotification.timestamp
                              ? new Date(
                                  selectedNotification.timestamp,
                                ).toLocaleString()
                              : selectedNotification.timeAgo}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedNotification(null)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 active:scale-95"
                      >
                        <X size={18} strokeWidth={2.5} />
                      </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1">
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPinIcon size={16} className="text-gray-400" />
                          <h4 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">
                            {t("dashboard.location")}
                          </h4>
                        </div>
                        <p className="font-bold text-gray-900 text-base pl-6 leading-snug">
                          {selectedNotification.location}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CircleAlert size={16} className="text-gray-400" />
                          <h4 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">
                            {t("dashboard.details")}
                          </h4>
                        </div>
                        <p className="text-gray-700 text-[15px] leading-relaxed pl-6 whitespace-pre-wrap">
                          {selectedNotification.description ||
                            t("dashboard.noDetails")}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                      <button
                        onClick={() => setSelectedNotification(null)}
                        className={`px-6 py-2.5 ${meta.accent} text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${meta.accent.replace("bg-", "")}`}
                      >
                        {t("dashboard.close")}
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;
