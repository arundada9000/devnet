import { motion } from "framer-motion";

export default function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded-md animate-pulse w-full" /></td>
          ))}
        </motion.tr>
      ))}
    </>
  );
}