import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const PageLoader = () => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-md">
      <motion.div className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
        <motion.img src="/assets/logo.png" alt={t("pageLoader.loading")}
          className="w-64 h-64 rounded-full shadow-lg"
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="w-2 h-2 rounded-full bg-[#e9403e]"
              animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PageLoader;