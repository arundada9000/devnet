import React from "react";
import { motion } from "framer-motion";

/**
 * Beautiful skeleton placeholder shown while the map page is loading data.
 * Mimics the layout of the real MapPage with shimmering placeholders.
 */
const MapSkeleton = () => {
  const shimmer = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen bg-gray-100"
    >
      {/* Header skeleton */}
      <div className="w-full flex items-center justify-center gap-4 p-4 border-b bg-white">
        <div className={`h-6 w-32 rounded-lg ${shimmer}`} />
        <div className={`h-9 w-36 rounded-lg ${shimmer}`} />
      </div>

      {/* Map area skeleton */}
      <div className="relative" style={{ height: "80vh" }}>
        <div className={`w-full h-full ${shimmer}`} />

        {/* Fake map pins */}
        {[
          { top: "30%", left: "25%" },
          { top: "45%", left: "55%" },
          { top: "60%", left: "35%" },
          { top: "25%", left: "70%" },
          { top: "55%", left: "80%" },
        ].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ top: pos.top, left: pos.left }}
            animate={{ y: [0, -4, 0], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          >
            <div className="w-6 h-8 bg-gray-300 rounded-full opacity-50" />
          </motion.div>
        ))}

        {/* Fake locate button */}
        <div className="absolute bottom-32 right-4 z-10">
          <div className={`w-14 h-14 rounded-full ${shimmer} shadow-md`} />
        </div>

        {/* Fake grid lines to simulate map */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          {[...Array(8)].map((_, i) => (
            <div key={`h-${i}`} className="absolute w-full h-px bg-gray-400" style={{ top: `${(i + 1) * 11}%` }} />
          ))}
          {[...Array(6)].map((_, i) => (
            <div key={`v-${i}`} className="absolute h-full w-px bg-gray-400" style={{ left: `${(i + 1) * 15}%` }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MapSkeleton;
