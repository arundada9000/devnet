import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BellRing, FileText, MapPin, Tag, X, Loader2 } from "lucide-react";

const ALERT_TYPES = ["fire", "flood", "earthquake", "landslide", "storm", "police", "accident", "other"];

export default function AlertModal({ open, onClose, onSubmit, initialData, submitting }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "",
    location: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        type: initialData.type || "",
        location: initialData.location || "",
      });
    } else {
      setForm({ title: "", description: "", type: "", location: "" });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <BellRing size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {initialData ? t("alertModal.editAlert") : t("alertModal.broadcastAlert")}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute top-3 left-3 text-gray-400">
                <Tag size={18} />
              </div>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder={t("alertModal.alertTitle")}
                required
                className="w-full border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div className="relative">
              <div className="absolute top-3 left-3 text-gray-400">
                <FileText size={18} />
              </div>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition appearance-none bg-white"
              >
                <option value="" disabled>{t("alertModal.selectEmergencyType")}</option>
                {ALERT_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <div className="absolute top-3 left-3 text-gray-400">
                <MapPin size={18} />
              </div>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder={t("alertModal.affectedLocation")}
                required
                className="w-full border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div className="relative">
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder={t("alertModal.detailedDescription")}
                rows={4}
                required
                className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition"
              >
                {t("alertModal.cancel")}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold text-sm transition shadow-md shadow-indigo-200 flex items-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? t("alertModal.submitting") : initialData ? t("alertModal.saveChanges") : t("alertModal.broadcast")}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
