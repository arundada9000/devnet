import React from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, Phone } from "lucide-react";
import { useLocalGovStore } from "../../stores/localGovStore";
import useApi from "../../hooks/useApi";

const DynamicContact = () => {
  const { t } = useTranslation();
  const { emergencyType } = useParams();
  const navigate = useNavigate();
  const { localGov } = useLocalGovStore();
  const { data: contacts, loading, error } = useApi(`/${localGov}/${emergencyType}`);

  const displayType = emergencyType === "accident" ? "traffic" : emergencyType;
  const fallback = [
    { name: "Local Police Station", phone: "100", designation: "Police" },
    { name: "Fire Service", phone: "101", designation: "Fire" },
    { name: "Ambulance Service", phone: "102", designation: "Ambulance" },
  ];

  const list = contacts?.length > 0 ? contacts : fallback;

  return (
    <>
      <Helmet>
        <title>Sajilo Sahayata | {t(`emergency.${displayType}`)}</title>
        <meta name="description" content={`Emergency contact details for ${displayType} in ${localGov}`} />
      </Helmet>
      <motion.main className="relative min-h-screen bg-bg-light text-gray-900 flex flex-col"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-3 flex items-center justify-between shadow-sm">
          <button onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors active:scale-95">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-text-dark absolute left-1/2 -translate-x-1/2 capitalize">
            {t(`emergency.${emergencyType}`)}
          </h1>
          <div className="w-10 h-10" />
        </header>
        <section className="flex-1 px-4 pt-6 pb-24 overflow-y-auto">
          <div className="mb-6 text-center">
            <h2 className="text-gray-500 text-sm font-medium">{t("contact.inLocalGov")} <span className="font-bold text-text-dark capitalize">{localGov}</span></h2>
          </div>
          {loading ? (
            <div className="space-y-4 max-w-md mx-auto">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="space-y-2"><div className="h-4 w-32 bg-gray-200 rounded" /><div className="h-3 w-20 bg-gray-100 rounded" /></div>
                  <div className="h-10 w-10 bg-gray-200 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div className="space-y-4 max-w-md mx-auto" initial="hidden" animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
              {list.map((contact, index) => (
                <motion.div key={index}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
                  variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center shadow-inner">
                      <Phone size={22} className="text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">{contact.name}</h3>
                      <p className="text-xs text-gray-500">{contact.designation}</p>
                    </div>
                  </div>
                  <a href={`tel:${contact.phone}`}
                    className="w-12 h-12 bg-red-500 hover:bg-red-600 active:scale-90 text-white rounded-full flex items-center justify-center shadow-md transition-all">
                    <Phone size={20} />
                  </a>
                </motion.div>
              ))}
            </motion.div>
          )}
          {error && <p className="text-center text-red-500 text-sm mt-4">{t("error.loadingContact")}</p>}
        </section>
      </motion.main>
    </>
  );
};

export default DynamicContact;