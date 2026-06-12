import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white relative px-6 pt-4 flex flex-col overflow-hidden">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 text-gray-600 transition active:scale-95 z-10"
        aria-label={t("auth.back", "Go back")}
      >
        <ChevronLeft size={28} strokeWidth={2.5} />
      </motion.button>

      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-60"></div>

      <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          onClick={() => navigate("/")}
          className="cursor-pointer"
        >
          <img
            src="/assets/logo.png"
            alt="Sajilo Sahayata"
            className="w-56 h-56 object-contain mb-8 hover:scale-105 transition-transform duration-300"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-gray-800 mb-12 tracking-tight"
        >
          {t("auth.tagline", "From alert to action — Instantly")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-xs space-y-4"
        >
          <button
            onClick={() => navigate("/signin")}
            className="w-full bg-blue-600 text-white py-3.5 rounded-2xl text-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-300 transition-all active:scale-95"
            aria-label={t("auth.login", "Login")}
          >
            {t("auth.login", "Login")}
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="w-full bg-white border-2 border-gray-200 text-gray-800 py-3.5 rounded-2xl text-lg font-bold shadow-sm hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-95"
            aria-label={t("auth.register", "Register")}
          >
            {t("auth.register", "Create an account")}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
