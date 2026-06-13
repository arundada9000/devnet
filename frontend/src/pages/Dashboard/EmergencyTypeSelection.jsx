import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ChevronLeft } from "lucide-react";
import { useLocalGovStore } from "../../stores/localGovStore";

const emergencyTypes = [
  { type: "fire", icon: "/icons/fire-red.svg", labelKey: "emergency.fire" },
  {
    type: "police",
    icon: "/icons/police-red.svg",
    labelKey: "emergency.police",
  },
  { type: "flood", icon: "/icons/flood-red.svg", labelKey: "emergency.flood" },
  {
    type: "accident",
    icon: "/icons/accident-red.svg",
    labelKey: "emergency.accident",
  },
  {
    type: "landslide",
    icon: "/icons/landslide-red.svg",
    labelKey: "emergency.landslide",
  },
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
        <meta
          name="description"
          content="Select an emergency type to view rapid response contact information."
        />
      </Helmet>

      {/* Main Container - Premium iOS/Android app feel */}
      <motion.main
        className="relative min-h-screen bg-bg-light text-gray-900 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-3 flex items-center justify-between shadow-sm">
          <button
            onClick={() => navigate(-1)}
            aria-label={t("register.back") || "Go Back"}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary-red outline-none transition-colors duration-200 active:scale-95"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-text-dark absolute left-1/2 -translate-x-1/2">
            {t("selectEmergencyType")}
          </h1>
          <div className="w-10 h-10" aria-hidden="true" />{" "}
          {/* Spacer for centering */}
        </header>

        {/* Content Area */}
        <section className="flex-1 px-4 pt-6 pb-24 overflow-y-auto">
          <div className="mb-6 text-center">
            <h2 className="text-gray-500 text-sm font-medium">
              {t("emergency.reportingQuery")}
              <span className="font-bold text-text-dark">{localGov}</span>?
            </h2>
          </div>

          {/* Emergency Grid */}
          <motion.div
            className="grid grid-cols-2 gap-4 sm:gap-5 max-w-md mx-auto"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.08 } },
            }}
          >
            {emergencyTypes.map(({ type, icon, labelKey }, index) => (
              <motion.button
                key={type}
                onClick={() => handleSelect(type)}
                className="group relative flex flex-col items-center justify-center bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 focus-visible:ring-2 focus-visible:ring-primary-red focus-visible:outline-none transition-all duration-300 active:scale-95 aspect-square"
                variants={{
                  hidden: { opacity: 0, scale: 0.9, y: 15 },
                  visible: { opacity: 1, scale: 1, y: 0 },
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                aria-label={`Select ${t(labelKey)} emergency`}
              >
                {/* Subtle gradient glow behind the icon */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 pointer-events-none" />

                <motion.div
                  className="w-16 h-16 sm:w-20 sm:h-20 mb-3 bg-red-50/50 rounded-2xl flex items-center justify-center p-3 shadow-inner"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                >
                  <img
                    src={icon}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-210 transition-transform duration-300 scale-200"
                  />
                </motion.div>

                <span className="text-sm sm:text-base font-semibold text-gray-800 tracking-tight capitalize z-10">
                  {t(labelKey)}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </section>
      </motion.main>
    </>
  );
};

export default EmergencyTypeSelection;
