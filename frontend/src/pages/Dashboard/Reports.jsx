import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import API from "../../api/axios";
import { Clock, MapPin, Flame, Waves, Mountain, Car, AlertCircle } from "lucide-react";

const typeIcons = { fire: Flame, flood: Waves, landslide: Mountain, accident: Car, other: AlertCircle };
const statusColors = { pending: "bg-orange-400", verified: "bg-red-500", working: "bg-yellow-500", solved: "bg-green-500" };

const Reports = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/reports")
      .then(({ data }) => setReports(data))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-4 max-w-3xl mx-auto"><div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}</div></div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4 pb-24">
      <h2 className="text-2xl font-bold">{t("reports.title", "My Reports")}</h2>
      {reports.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100">
          {t("reports.noReports", "No reports yet.")}
        </div>
      ) : (
        reports.map((r, i) => {
          const Icon = typeIcons[r.type] || AlertCircle;
          const timeAgo = new Date(r.createdAt).toLocaleString();
          return (
            <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4 hover:shadow-md transition-shadow">
              {r.imageUrl && (
                <img src={r.imageUrl.startsWith("http") ? r.imageUrl : `${import.meta.env.VITE_API_URL?.replace("/api", "") || ""}${r.imageUrl}`}
                  alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} className="text-gray-600" />
                  <span className="font-semibold capitalize text-gray-900">{t(`incidentTypes.${r.type}`)}</span>
                  <span className={`ml-auto w-2.5 h-2.5 rounded-full ${statusColors[r.status] || "bg-gray-400"}`} title={r.status} />
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{r.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock size={12} /> {timeAgo}</span>
                  {r.localGovName && <span className="flex items-center gap-1"><MapPin size={12} /> {r.localGovName}</span>}
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
};

export default Reports;