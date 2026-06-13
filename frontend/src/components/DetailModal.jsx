import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { X, Maximize2 } from "lucide-react";
import useImagePreview from "../hooks/useImagePreview.jsx";

export default function DetailModal({ open, onClose, title, icon, fields, imageUrl, actions }) {
  const { t } = useTranslation();
  const { openPreview, ImagePreview } = useImagePreview();
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              {icon && <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">{icon}</div>}
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition">
              <X size={18} />
            </button>
          </div>
          <div className="p-6 overflow-y-auto space-y-5">
            {imageUrl && (
              <div className="relative w-full h-52 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden group cursor-pointer"
                onClick={() => openPreview(imageUrl)}>
                <img src={imageUrl} alt={t("detailModal.evidence")}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Maximize2 size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                </div>
              </div>
            )}
            {fields.map((field, i) => (
              <div key={i}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{field.label}</label>
                <div className="text-sm text-gray-900 font-medium">{field.render ? field.render(field.value) : field.value ?? "\u2014"}</div>
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0 flex justify-end gap-3">
            {actions}
            <button onClick={onClose} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition shadow-md">
              {t("detailModal.close")}
            </button>
          </div>
          {ImagePreview}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}