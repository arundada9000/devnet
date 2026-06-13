import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useTranslation } from "react-i18next";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LocateFixed, ChevronDown, CheckCircle, XCircle, Shield, Navigation, Phone, MapPin, Layers, Info } from "lucide-react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalGovStore } from "../../stores/localGovStore";
import API from "../../api/axios";
import MapSkeleton from "../../components/MapSkeleton";

function FlyToFocusedIncident({ incident }) {
  const map = useMap();

  useEffect(() => {
    if (incident) {
      map.flyTo([incident.lat, incident.lng], 19, {
        duration: 1.5,
      });
    }
  }, [incident, map]);

  return null;
}

function FlyToUserLocation({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(location, 16, {
        duration: 1.5,
      });
    }
  }, [location, map]);

  return null;
}

const incidentTypesConfig = [
  { key: "fire", icon: "🔥" },
  { key: "flood", icon: "🌊" },
  { key: "landslide", icon: "🚧" },
  { key: "accident", icon: "🚗" },
  { key: "garbage", icon: "🗑️" },
  { key: "relief", icon: "📦" },
  { key: "other", icon: "❓" },
];

const safeZoneTypesConfig = [
  { key: "hospital", label: "map.hospital", color: "#10b981" },
  { key: "shelter", label: "map.shelter", color: "#3b82f6" },
  { key: "police", label: "map.police", color: "#6366f1" },
  { key: "fire_station", label: "map.fireStation", color: "#ef4444" },
  { key: "distribution", label: "map.distribution", color: "#f59e0b" },
];

const incidentThemes = {
  fire: { gradient: "from-red-600 to-red-500", text: "text-red-100", btn: "text-red-600 bg-red-50 hover:bg-red-600 hover:text-white" },
  flood: { gradient: "from-cyan-600 to-blue-500", text: "text-cyan-100", btn: "text-cyan-600 bg-cyan-50 hover:bg-cyan-600 hover:text-white" },
  landslide: { gradient: "from-orange-600 to-amber-500", text: "text-orange-100", btn: "text-orange-600 bg-orange-50 hover:bg-orange-600 hover:text-white" },
  accident: { gradient: "from-rose-600 to-pink-500", text: "text-rose-100", btn: "text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white" },
  earthquake: { gradient: "from-amber-600 to-yellow-500", text: "text-amber-100", btn: "text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white" },
  garbage: { gradient: "from-teal-600 to-emerald-500", text: "text-teal-100", btn: "text-teal-600 bg-teal-50 hover:bg-teal-600 hover:text-white" },
  relief: { gradient: "from-indigo-600 to-purple-500", text: "text-indigo-100", btn: "text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white" },
  other: { gradient: "from-gray-600 to-slate-500", text: "text-gray-100", btn: "text-gray-600 bg-gray-50 hover:bg-gray-600 hover:text-white" },
};
const getIncidentTheme = (type) => incidentThemes[type] || incidentThemes.other;

const safeZoneThemes = {
  hospital: { gradient: "from-emerald-500 to-teal-400", icon: "text-emerald-500", btn: "text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white border-emerald-100/50" },
  shelter: { gradient: "from-blue-500 to-indigo-400", icon: "text-blue-500", btn: "text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white border-blue-100/50" },
  police: { gradient: "from-indigo-600 to-blue-500", icon: "text-indigo-500", btn: "text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white border-indigo-100/50" },
  fire_station: { gradient: "from-red-500 to-rose-400", icon: "text-red-500", btn: "text-red-700 bg-red-50 hover:bg-red-600 hover:text-white border-red-100/50" },
  distribution: { gradient: "from-amber-500 to-orange-400", icon: "text-amber-500", btn: "text-amber-700 bg-amber-50 hover:bg-amber-600 hover:text-white border-amber-100/50" },
};
const getSafeZoneTheme = (type) => safeZoneThemes[type] || safeZoneThemes.hospital;

const getIcon = (type) =>
  new L.Icon({
    iconUrl: `/icons/map-icons-red/${type}.svg`,
    iconSize: [48, 48],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

const getFocusedIcon = (type) =>
  new L.DivIcon({
    className: "focused-marker-glow",
    html: `<div class='relative'>
             <img src="/icons/map-icons-red/${type}.svg" class="animate-bounce-glow w-12 h-12" />
           </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -40],
  });

const getSafeZoneIcon = (type) => {
  const colors = { hospital: "#10b981", shelter: "#3b82f6", police: "#6366f1", fire_station: "#ef4444", distribution: "#f59e0b" };
  const color = colors[type] || "#6b7280";
  return new L.DivIcon({
    className: "safe-zone-marker",
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
           </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

function LocateButton({ onLocate }) {
  const { t } = useTranslation();
  const map = useMap();

  const locate = () => {
    map.locate({ setView: false });
    map.once("locationfound", (e) => {
      const latlng = [e.latlng.lat, e.latlng.lng];
      map.flyTo(latlng, 16, {
        duration: 1.5,
      });
      onLocate(e.latlng);
    });
  };
  return (
    <button
      onClick={locate}
      className="absolute bottom-32 right-4 bg-white border border-gray-300 shadow-md rounded-full p-2 z-50 hover:scale-110 transition-transform duration-200 cursor-pointer"
      title={t("map.locateMe")}
    >
      <LocateFixed size={40} className="text-blue-600" />
    </button>
  );
}

const MapPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [safeZones, setSafeZones] = useState([]);
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [loading, setLoading] = useState(true);
  const { state, search } = useLocation();
  const searchParams = new URLSearchParams(search);

  let focusedIncident = state?.focus;

  if (!focusedIncident && searchParams.get("focusId")) {
    focusedIncident = {
      id: searchParams.get("focusId"),
      lat: parseFloat(searchParams.get("lat")),
      lng: parseFloat(searchParams.get("lng")),
      title: searchParams.get("title"),
      type: searchParams.get("type"),
    };
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [incidentsRes, safeZonesRes] = await Promise.allSettled([
          API.get("/reportsLocation"),
          API.get("/safe-zones"),
        ]);
        if (incidentsRes.status === "fulfilled") setIncidents(incidentsRes.value.data);
        if (safeZonesRes.status === "fulfilled") setSafeZones(safeZonesRes.value.data);
      } catch (error) {
        console.error("Failed to fetch map data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const { t } = useTranslation();
  const { getCoordinates } = useLocalGovStore();
  const initialPosition = getCoordinates() || [27.7111, 83.4681];
  const [position, setPosition] = useState(initialPosition);
  const [userLocation, setUserLocation] = useState(getCoordinates());
  const [selectedTypes, setSelectedTypes] = useState(
    Object.fromEntries(incidentTypesConfig.map((i) => [i.key, true]))
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const latlng = [latitude, longitude];
        setPosition(latlng);
        setUserLocation(latlng);
      },
      (err) => console.warn("Geolocation failed:", err.message)
    );
  }, []);

  const toggleType = (type) => {
    setSelectedTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const setAll = (value) => {
    const all = Object.fromEntries(
      incidentTypesConfig.map((i) => [i.key, value])
    );
    setSelectedTypes(all);
  };

  const visibleIncidents = incidents.filter((i) => selectedTypes[i.type]);

  // Show skeleton while loading
  if (loading) {
    return <MapSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative min-h-screen bg-gray-50 overflow-hidden flex flex-col">
        {/* Floating Top Controls (Glassmorphism) */}
        <div className="absolute top-4 left-0 right-0 z-50 px-4 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center pointer-events-none">
          {/* Header Title */}
          <div className="bg-white/90 backdrop-blur-md shadow-lg shadow-blue-900/5 border border-white/50 rounded-2xl px-5 py-3 pointer-events-auto flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <MapPin size={18} />
            </div>
            <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">
              {t("map.title")}
            </h1>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto ml-auto">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 bg-white/90 backdrop-blur-md shadow-lg shadow-gray-900/5 border border-white/50 px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <Layers size={18} className="text-blue-500" />
                <span>{t("map.filterLabel")}</span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="absolute right-0 top-14 w-64 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-2xl p-4 space-y-3 origin-top-right"
                  >
                    <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                      {incidentTypesConfig.map((type) => (
                        <label
                          key={type.key}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                            checked={selectedTypes[type.key]}
                            onChange={() => toggleType(type.key)}
                          />
                          <img
                            src={`/icons/map-icons-red/${type.key}.svg`}
                            alt={type.key}
                            className="w-6 h-6 drop-shadow-sm"
                          />
                          <span className="text-sm font-semibold text-slate-700 capitalize">
                            {t(`incidentTypes.${type.key}`)}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-gray-100 flex gap-2">
                      <button
                        onClick={() => setAll(true)}
                        className="flex-1 flex justify-center items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-2.5 rounded-xl transition-colors"
                      >
                        <CheckCircle size={14} /> {t("map.selectAllBtn")}
                      </button>
                      <button
                        onClick={() => setAll(false)}
                        className="flex-1 flex justify-center items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2.5 rounded-xl transition-colors"
                      >
                        <XCircle size={14} /> {t("map.clearAllBtn")}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Safe Zones Toggle */}
            <button
              onClick={() => setShowSafeZones((prev) => !prev)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-md text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 ${
                showSafeZones
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20"
                  : "bg-white/90 text-slate-700 border-white/50 shadow-gray-900/5 hover:bg-white"
              }`}
            >
              <Shield size={18} className={showSafeZones ? "text-white" : "text-emerald-500"} />
              {t("map.safeZones", "Safe Zones")}
            </button>
          </div>
        </div>

        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={true}
          zoomControl={true}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
          style={{ height: "80vh", width: "100%" }}
          className="z-0"
        >
          {focusedIncident && (
            <FlyToFocusedIncident incident={focusedIncident} />
          )}
          {!focusedIncident && userLocation && (
            <FlyToUserLocation location={userLocation} />
          )}

          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {userLocation && (
            <Marker position={userLocation}>
              <Popup>{t("map.youAreHere")}</Popup>
            </Marker>
          )}

          <MarkerClusterGroup>
            <AnimatePresence>
              {visibleIncidents.length === 0 && (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute top-40 left-1/2 transform -translate-x-1/2 bg-white text-gray-600 border rounded shadow px-4 py-2 z-50"
                >
                  {t("map.noIncidents")}
                </motion.div>
              )}

              {visibleIncidents.map((incident, index) => {
                const theme = getIncidentTheme(incident.type);
                return (
                  <motion.div
                    key={incident.id}
                    initial={{ opacity: 0, scale: 0.5, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: -10 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                  >
                    <Marker
                      position={[incident.lat, incident.lng]}
                      icon={
                        focusedIncident?.id === incident.id
                          ? getFocusedIcon(incident.type)
                          : getIcon(incident.type)
                      }
                    >
                      <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                        {incident.title}
                      </Tooltip>

                      <Popup className="premium-popup">
                        <div className="w-[220px]">
                          {/* Header */}
                          <div className={`bg-gradient-to-r ${theme.gradient} p-4 rounded-t-xl text-white relative overflow-hidden`}>
                            <div className="absolute -right-4 -top-4 opacity-20">
                              <img src={`/icons/map-icons-red/${incident.type}.svg`} alt="" className="w-20 h-20 filter invert" />
                            </div>
                            <div className="relative z-10">
                              <span className="bg-black/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm mb-2 inline-block">
                                {t(`incidentTypes.${incident.type}`)}
                              </span>
                              <h3 className="font-bold text-sm leading-tight text-white mb-1 drop-shadow-sm">{incident.title}</h3>
                              <p className={`text-xs ${theme.text} flex items-center gap-1`}>
                                <Info size={12} /> {incident.time}
                              </p>
                            </div>
                          </div>
                          {/* Body */}
                          <div className="p-4 bg-white rounded-b-xl flex justify-center">
                            <button
                              onClick={() => {
                                const destination = `${incident.lat},${incident.lng}`;
                                const url = `https://www.google.com/maps/dir//${destination}`;
                                window.open(url, "_blank");
                              }}
                              className={`w-full flex justify-center items-center gap-2 font-bold py-2.5 rounded-lg transition-all duration-200 shadow-sm active:scale-95 ${theme.btn}`}
                            >
                              <Navigation size={16} />
                              {t("map.showPath")}
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </MarkerClusterGroup>

          {/* Safe Zone Markers */}
          {showSafeZones && safeZones.map((zone) => {
            const coords = zone.location?.coordinates;
            if (!coords || coords.length < 2) return null;
            // Normalize coordinates (same heuristic as Home.jsx)
            const isNewFormat = coords[0] > 70;
            const lat = isNewFormat ? coords[1] : coords[0];
            const lng = isNewFormat ? coords[0] : coords[1];

            return (
              <Marker
                key={zone._id}
                position={[lat, lng]}
                icon={getSafeZoneIcon(zone.type)}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  {zone.name}
                </Tooltip>
                <Popup className="premium-popup">
                  <div className="w-[220px]">
                    {/* Header */}
                    <div className={`bg-gradient-to-r ${getSafeZoneTheme(zone.type).gradient} p-4 rounded-t-xl text-white relative overflow-hidden`}>
                      <div className="absolute -right-4 -bottom-4 opacity-20">
                        <Shield size={80} />
                      </div>
                      <div className="relative z-10">
                        <span className="bg-black/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm mb-2 inline-block">
                          {zone.type?.replace("_", " ")}
                        </span>
                        <h3 className="font-bold text-sm leading-tight text-white drop-shadow-sm">{zone.name}</h3>
                      </div>
                    </div>
                    {/* Body */}
                    <div className="p-4 bg-white rounded-b-xl space-y-3">
                      {zone.address && (
                        <div className="flex items-start gap-2 text-gray-600">
                          <MapPin size={14} className={`mt-0.5 flex-shrink-0 ${getSafeZoneTheme(zone.type).icon}`} />
                          <span className="text-xs font-medium leading-relaxed">{zone.address}</span>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          const destination = `${lat},${lng}`;
                          const url = `https://www.google.com/maps/dir//${destination}`;
                          window.open(url, "_blank");
                        }}
                        className={`w-full flex justify-center items-center gap-2 font-bold py-2.5 rounded-lg transition-all duration-200 shadow-sm border active:scale-95 ${getSafeZoneTheme(zone.type).btn}`}
                      >
                        <Navigation size={16} />
                        {t("map.showPath")}
                      </button>
                      {zone.phone && (
                        <a
                          href={`tel:${zone.phone}`}
                          className={`w-full flex justify-center items-center gap-2 font-bold py-2 rounded-lg transition-all duration-200 text-xs border active:scale-95 ${getSafeZoneTheme(zone.type).btn}`}
                        >
                          <Phone size={14} />
                          {t("map.call", "Call")} {zone.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          <LocateButton
            onLocate={(pos) => setUserLocation([pos.lat, pos.lng])}
          />
        </MapContainer>
      </div>
    </motion.div>
  );
};

export default MapPage;

