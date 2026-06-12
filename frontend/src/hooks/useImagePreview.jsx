import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function useImagePreview() {
  const [previewUrl, setPreviewUrl] = useState(null);

  const openPreview = useCallback((url) => setPreviewUrl(url), []);
  const closePreview = useCallback(() => setPreviewUrl(null), []);

  const ImagePreview = previewUrl ? createPortal(
    <AnimatePresence initial={false}>
      <motion.div
        key="image-preview-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={closePreview}
      >
        <motion.div
          key="image-preview-content"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={previewUrl}
            alt="Full preview"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
          />
          <button
            onClick={closePreview}
            className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-gray-900/80 hover:bg-gray-900 text-white flex items-center justify-center transition shadow-lg"
          >
            <X size={18} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  ) : null;

  return { openPreview, closePreview, ImagePreview, previewUrl };
}
