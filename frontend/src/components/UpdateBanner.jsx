import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Download } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function UpdateBanner({ visible, onUpdate }) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-[100] px-4 pt-3">
          <div className="mx-auto max-w-md w-full bg-indigo-600 text-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Download size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">{t("updateBanner.title")}</p>
              <p className="text-xs text-indigo-200 mt-0.5">{t("updateBanner.message")}</p>
            </div>
            <button onClick={onUpdate}
              className="flex items-center gap-1.5 bg-white text-indigo-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors shrink-0 cursor-pointer">
              <RefreshCw size={14} />{t("updateBanner.action")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}