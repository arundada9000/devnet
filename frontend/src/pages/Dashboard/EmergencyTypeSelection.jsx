import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ChevronLeft } from "lucide-react";
import { useLocalGovStore } from "../../stores/localGovStore";

const emergencyTypes = [
  { type: "fire", icon: "/icons/fire-red.svg", labelKey: "emergency.fire" },
  { type: "police", icon: "/icons/police-red.svg", labelKey: "emergency.police" },
  { type: "flood", icon: "/icons/flood-red.svg", labelKey: "emergency.flood" },
  { type: "accident", icon: "/icons/accident-red.svg", labelKey: "emergency.accident" },
  { type: "landslide", icon: "/icons/landslide-red.svg", labelKey: "emergency.landslide" },
  { type: "other", icon: "/icons/others-red.svg", labelKey: "emergency.other" },
];

const EmergencyTypeSelection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { localGov } = useLocalGovStore();

  const handleSelect = (type) => {
    navigate(`/dashboard/${localGov}/${type}`);
  };

  return (
    <>
      <Helmet>
        <title>Sajilo Sahayata | Select Emergency</title>
        <meta name="description" content="Select an emergency type for contact information." />
      </Helmet>
      <motion.main className="relative min-h-screen bg-bg-light text-gray-900 flex flex-col"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-3 flex items-center justify-between shadow-sm">
          <button onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors active:scale-95">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-text-dark absolute left-1/2 -translate-x-1/2">
            {t("selectEmergencyType")}
          </h1>
          <div className="w-10 h-10" />
        </header>
        <section className="flex-1 px-4 pt-6 pb-24 overflow-y-auto">
          <div className="mb-6 text-center">
            <h2 className="text-gray-500 text-sm font-medium">
              {t("emergency.reportingQuery")} <span className="font-bold text-text-dark">{localGov}</span>?
            </h2>
          </div>
          <motion.div className="grid grid-cols-2 gap-4 sm:gap-5 max-w-md mx-auto"
            initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
            {emergencyTypes.map(({ type, icon, labelKey }, index) => (
              <motion.button key={type} onClick={() => handleSelect(type)}
                className="group relative flex flex-col items-center justify-center bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 active:scale-95 aspect-square"
                variants={{ hidden: { opacity: 0, scale: 0.9, y: 15 }, visible: { opacity: 1, scale: 1, y: 0 } }}>
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity pointer-events-none" />
                <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3 bg-red-50/50 rounded-2xl flex items-center justify-center p-3 shadow-inner">
                  <img src={icon} alt="" className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-sm sm:text-base font-semibold text-gray-800 tracking-tight capitalize z-10">{t(labelKey)}</span>
              </motion.button>
            ))}
          </motion.div>
        </section>
      </motion.main>
    </>
  );
};

export default EmergencyTypeSelection;