import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SearchX, Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center"
      >
        <div className="relative w-24 h-24 mx-auto mb-6">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-indigo-50 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
            <SearchX size={48} />
          </div>
        </div>
        
        <div className="text-6xl font-black text-indigo-600 mb-2 tracking-tighter">404</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">{t("notFound.title")}</h1>
        <p className="text-slate-500 mb-8 leading-relaxed text-sm">
          {t("notFound.message")}
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-all cursor-pointer border border-slate-200 hover:border-slate-300"
          >
            <ArrowLeft size={18} />
            {t("notFound.goBack")}
          </button>
          <button 
            onClick={() => navigate("/dashboard/home")} 
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 cursor-pointer hover:-translate-y-0.5"
          >
            <Home size={18} />
            {t("notFound.returnToDashboard")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
