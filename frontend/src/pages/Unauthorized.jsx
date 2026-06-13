import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function Unauthorized() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard/home");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
        <motion.div 
          initial={{ rotate: -15, scale: 0.5 }} 
          animate={{ rotate: 0, scale: 1 }} 
          transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
          className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-inner"
        >
          <ShieldAlert size={40} />
        </motion.div>
        
        <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">{t("unauthorized.title")}</h1>
        <p className="text-slate-500 mb-8 leading-relaxed text-sm">
          {t("unauthorized.message")}
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-all cursor-pointer border border-slate-200 hover:border-slate-300"
          >
            <ArrowLeft size={18} />
            {t("unauthorized.goBack")}
          </button>
          <button 
            onClick={() => navigate("/dashboard/home")} 
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 cursor-pointer hover:-translate-y-0.5"
          >
            <Home size={18} />
            {t("unauthorized.returnToDashboard")}
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-6 font-medium bg-slate-50 py-2 px-4 rounded-full inline-block">
          {t("unauthorized.autoRedirecting")} <span className="text-indigo-600 font-bold">{countdown}</span>...
        </p>
      </motion.div>
    </div>
  );
}
