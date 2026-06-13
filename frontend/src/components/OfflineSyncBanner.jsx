import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { getPendingReports, syncPendingReports } from "../utils/offlineQueue";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

/**
 * Floating banner shown on the Dashboard when there are pending offline reports.
 * Auto-syncs when the browser regains connectivity.
 */
const OfflineSyncBanner = () => {
  const { t } = useTranslation();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  // Check for pending reports on mount and periodically
  const checkPending = async () => {
    try {
      const pending = await getPendingReports();
      setPendingCount(pending.length);
    } catch {
      // IndexedDB might not be available
    }
  };

  useEffect(() => {
    checkPending().then(() => {
      // Auto-sync immediately if online with pending items
      if (navigator.onLine && pendingCount > 0) {
        handleSync();
      }
    });
    // Re-check every 30 seconds
    const interval = setInterval(checkPending, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-sync when browser comes back online
  useEffect(() => {
    const handleOnline = () => {
      if (pendingCount > 0) {
        handleSync();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [pendingCount]);

  // Listen for background sync trigger from service worker
  useEffect(() => {
    const handler = (event) => {
      if (event.data?.type === "SYNC_REPORTS" && pendingCount > 0) {
        handleSync();
      }
    };
    navigator.serviceWorker?.addEventListener("message", handler);
    return () => navigator.serviceWorker?.removeEventListener("message", handler);
  }, [pendingCount]);

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);

    try {
      const result = await syncPendingReports(API);

      if (result.synced > 0) {
        toast.success(t("offlineSync.synced", { count: result.synced }));
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 3000);
      }
      if (result.failed > 0) {
        toast.error(t("offlineSync.failed", { count: result.failed }));
      }

      await checkPending();
    } catch (err) {
      toast.error(t("offlineSync.syncError"));
    } finally {
      setSyncing(false);
    }
  };

  if (pendingCount === 0 && !justSynced) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        className="mb-4"
      >
        {justSynced ? (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-800">
              {t("offlineSync.syncedAll")}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <WifiOff size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">
                  {t("offlineSync.pendingSync", { count: pendingCount })}
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {navigator.onLine
                    ? t("offlineSync.onlineTap")
                    : t("offlineSync.autoSync")}
                </p>
              </div>
            </div>

            {navigator.onLine && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0"
              >
                <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
                {syncing ? t("offlineSync.syncing") : t("offlineSync.syncNow")}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineSyncBanner;
