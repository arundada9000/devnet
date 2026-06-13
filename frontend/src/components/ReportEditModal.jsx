import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileEdit, Trash2, MapPin, Tag, Activity, FileText, Maximize2 } from "lucide-react";
import API from "../api/axios";
import useImagePreview from "../hooks/useImagePreview.jsx";
import { useTranslation } from "react-i18next";

const REPORT_TYPES = ["fire", "police", "flood", "accident", "landslide", "other"];
const STATUS_TYPES = ["pending", "verified", "solved", "working"];

export default function ReportEditModal({ report, onClose, onUpdate }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    type: report.type, description: report.description, status: report.status,
    lat: report.location.coordinates[1], lng: report.location.coordinates[0], image: null,
  });
  const [loading, setLoading] = useState(false);
  const { openPreview, ImagePreview } = useImagePreview();

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleImageChange = (e) => setFormData((prev) => ({ ...prev, image: e.target.files[0] }));

  const handleDelete = async () => {
    if (!window.confirm(t("reportEdit.deleteConfirm"))) return;
    try { await API.delete(`/reports/${report._id}`); onClose(); onUpdate({ _id: report._id, deleted: true }); }
    catch {}
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await API.put(`/reports/${report._id}`, {
        type: formData.type, description: formData.description, status: formData.status,
        location: [parseFloat(formData.lng), parseFloat(formData.lat)],
      });
      onUpdate({ ...report, ...formData, status: formData.status, location: { coordinates: [formData.lng, formData.lat] } });
      onClose();
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[90] p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><FileEdit size={20} /></div>
              <h2 className="text-xl font-bold text-gray-800">{t("reportEdit.title")}</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition"><X size={18} /></button>
          </div>
          <div className="p-6 overflow-y-auto space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5"><Tag size={14} className="text-gray-400" /> {t("reportEdit.incidentType")}</label>
                <select name="type" value={formData.type} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none capitalize">
                  {REPORT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5"><Activity size={14} className="text-gray-400" /> {t("reportEdit.status")}</label>
                <select name="status" value={formData.status} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none capitalize">
                  {STATUS_TYPES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5"><MapPin size={14} className="text-gray-400" /> {t("reportEdit.latitude")}</label>
                <input type="number" name="lat" step="any" value={formData.lat} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5"><MapPin size={14} className="text-gray-400" /> {t("reportEdit.longitude")}</label>
                <input type="number" name="lng" step="any" value={formData.lng} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5"><FileText size={14} className="text-gray-400" /> {t("reportEdit.description")}</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none" />
            </div>
            {report.imageUrl && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("reportEdit.evidencePhoto")}</label>
                <div className="relative w-full h-48 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden group cursor-pointer"
                  onClick={() => openPreview(report.imageUrl.startsWith("http") ? report.imageUrl : `${import.meta.env.VITE_API_URL.replace("/api", "")}${report.imageUrl}`)}>
                  <img src={report.imageUrl.startsWith("http") ? report.imageUrl : `${import.meta.env.VITE_API_URL.replace("/api", "")}${report.imageUrl}`}
                    alt={t("reportEdit.altEvidence")} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Maximize2 size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                </div>
              </div>
            )}
            {ImagePreview}
          </div>
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3 rounded-b-2xl flex-shrink-0">
            <button onClick={handleDelete} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl font-semibold text-sm transition">
              <Trash2 size={16} /> {t("reportEdit.deleteReport")}
            </button>
            <div className="flex gap-3 w-full sm:w-auto">
              <button onClick={onClose} className="flex-1 sm:flex-none px-6 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-sm transition">{t("reportEdit.cancel")}</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition shadow-md shadow-indigo-200">
                {loading ? t("reportEdit.saving") : t("reportEdit.saveChanges")}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}