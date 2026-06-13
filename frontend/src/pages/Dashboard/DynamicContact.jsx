import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, Phone, WifiOff } from "lucide-react";
import API from "../../api/axios";
import { cacheContacts, getCachedContacts } from "../../utils/offlineQueue";

const departmentIcons = {
  fire: "/icons/fire-red.svg",
  police: "/icons/police-red.svg",
  flood: "/icons/flood-red.svg",
  accident: "/icons/accident-red.svg",
  landslide: "/icons/landslide-red.svg",
  other: "/icons/others-red.svg",
};

const DynamicContact = () => {
  const { localGov, department } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);

  const icon =
    departmentIcons[department?.toLowerCase()] || "/icons/others-red.svg";

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        setFromCache(false);
        const res = await API.get(`/contacts/${localGov}/${department}`);
        setContacts(res.data.contacts || []);
        // Cache for offline use
        cacheContacts(localGov, department, res.data.contacts || []);
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
        // Try offline cache
        const cached = await getCachedContacts(localGov, department);
        if (cached && cached.length > 0) {
          setContacts(cached);
          setFromCache(true);
        } else {
          setError("Could not load contact information.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (localGov && department) {
      fetchContacts();
    }
  }, [localGov, department]);

  return (
    <>
      <Helmet>
        <title>
          Sajilo Sahayata | {localGov} {department} Contacts
        </title>
        <meta
          name="description"
          content={`Emergency ${department} contacts for ${localGov} municipality.`}
        />
      </Helmet>

      {/* Main Container - Premium native feel */}
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
          <h1 className="text-lg font-bold tracking-tight text-text-dark absolute left-1/2 -translate-x-1/2 capitalize whitespace-nowrap">
            {t(`emergency.${department?.toLowerCase()}`)}{" "}
            {t("emergency.contacts")}
          </h1>
          <div className="w-10 h-10" aria-hidden="true" /> {/* Spacer */}
        </header>

        {/* Content Area */}
        <section className="flex-1 px-4 pt-6 pb-24 overflow-y-auto max-w-md mx-auto w-full">
          <div className="mb-6 flex flex-col items-center justify-center text-center">
            <motion.div
              className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-3 p-3"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <img
                src={icon}
                alt="Logo"
                aria-hidden="true"
                className="w-full h-full object-contain scale-300"
              />
            </motion.div>
            <h2 className="text-gray-500 text-sm font-medium">
              {t("emergency.verifiedContactsFor")}
              <br />
              <span className="font-bold text-text-dark text-base">
                {localGov}
              </span>
            </h2>
          </div>

          {/* Contact List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div
                className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin"
                aria-label={t("emergency.loadingContacts")}
                role="status"
              />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 bg-red-50/50 rounded-2xl p-6 border border-red-100 shadow-sm">
              <p className="font-medium">
                {error
                  ? t("emergency.errorLoading")
                  : t("emergency.errorLoading")}
              </p>
            </div>
          ) : fromCache ? (
            <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800 font-medium">
              <WifiOff size={16} />
              {t("emergency.offlineBanner")}
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p>{t("emergency.noContacts")}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {contacts.map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.08,
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300 gap-4"
                >
                  <div className="flex flex-col">
                    <h3 className="font-bold text-base text-gray-900 tracking-tight">
                      {contact.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-600 mt-1 flex items-center gap-1.5">
                      <span className="tabular-nums">{contact.phone}</span>
                      {contact.description && (
                        <>
                          <span className="text-gray-300" aria-hidden="true">
                            •
                          </span>
                          <span className="text-gray-500">
                            {contact.description}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  <a
                    href={`tel:${contact.phone}`}
                    aria-label={`Call ${contact.name} at ${contact.phone}`}
                    className="flex-shrink-0 flex items-center justify-center gap-2 bg-primary-red text-white font-semibold text-sm px-6 py-3 sm:py-2.5 rounded-full shadow-md hover:bg-primary-red-hover hover:shadow-lg focus-visible:ring-4 focus-visible:ring-red-200 outline-none transition-all duration-200 active:scale-95"
                  >
                    <Phone
                      size={18}
                      strokeWidth={2.5}
                      className="animate-pulse"
                    />
                    <span>{t("fireAuthorities.call")}</span>
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </motion.main>
    </>
  );
};

export default DynamicContact;
