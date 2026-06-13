import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../api/axios";
import Modal from "../components/ReportEditModal";
import { motion, AnimatePresence } from "framer-motion";
import { ListChecks, Clock, ShieldCheck, Hammer, CheckCircle, FileText, Download, Eye } from "lucide-react";
import useDebounce from "../hooks/useDebounce";
import useAdminLocationStore from "../stores/useAdminLocationStore";
import AdminFilterBar from "../components/admin/AdminFilterBar";
import TableSkeleton from "../components/admin/TableSkeleton";
import Pagination from "../components/admin/Pagination";
import { exportToCSV } from "../utils/exportCsv";
import DetailModal from "../components/DetailModal";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

const REPORT_TYPES = ["fire", "police", "flood", "accident", "landslide", "other"];
const STATUS_TYPES = ["pending", "verified", "solved", "working", "rejected"];
const PAGE_SIZE = 10;

export default function Reports() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [showSpam, setShowSpam] = useState(false);
  
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  
  const [nearbyVolunteers, setNearbyVolunteers] = useState([]);
  const [fetchingNearby, setFetchingNearby] = useState(false);
  const [showNearby, setShowNearby] = useState(false);

  const { adminLocation } = useAdminLocationStore();
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (adminLocation && !locationFilter) setLocationFilter(adminLocation);
  }, [adminLocation]);

  const { data: reports = [], isLoading: loading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => API.get("/reports").then((res) => res.data),
  });

  const filtered = useMemo(() => {
    let data = [...reports];
    if (showSpam) {
      data = data.filter((r) => r.status === "rejected");
    } else {
      data = data.filter((r) => r.status !== "rejected");
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      data = data.filter((r) => r.description?.toLowerCase().includes(q) || r._id?.toLowerCase().includes(q));
    }
    if (statusFilter) data = data.filter((r) => r.status === statusFilter);
    if (typeFilter) data = data.filter((r) => r.type === typeFilter);
    if (locationFilter) data = data.filter((r) => r.localGovName?.toLowerCase() === locationFilter.toLowerCase());
    return data;
  }, [reports, debouncedSearch, statusFilter, typeFilter, locationFilter, showSpam]);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, statusFilter, typeFilter, locationFilter, showSpam]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleEdit = (report) => { setSelectedReport(report); setShowModal(true); };
  const handleUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    setShowModal(false);
  };
  const clearAll = () => { setSearch(""); setStatusFilter(""); setTypeFilter(""); setLocationFilter(""); };

  const [pinging, setPinging] = useState(false);
  const handlePingVolunteers = async () => {
    if (!viewItem) return;
    setPinging(true);
    try {
      console.log("[Ping] Sending to:", `/reports/${viewItem._id}/ping-volunteers`);
      console.log("[Ping] Token:", localStorage.getItem("token")?.substring(0, 20) + "...");
      const { data } = await API.post(`/reports/${viewItem._id}/ping-volunteers`);
      console.log("[Ping] Success:", data);
      toast.success(data.message || t("admin.manageReports.pingSuccess", "Successfully pinged volunteers."));
    } catch (err) {
      console.error("[Ping] Error status:", err.response?.status);
      console.error("[Ping] Error body:", err.response?.data);
      console.error("[Ping] Full error:", err);
      const errorMsg = err.response?.data?.message || err.message || t("admin.manageReports.pingError", "Failed to ping volunteers.");
      toast.error(errorMsg);
    } finally {
      setPinging(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !viewItem?.reportedByPhone) return;
    setSendingReply(true);
    try {
      const { data } = await API.post("/webhook/sms/reply", { phone: viewItem.reportedByPhone, message: replyMessage });
      toast.success(data.message || t("admin.manageReports.replySuccess", "Reply sent successfully!"));
      setReplyMessage("");
      setReplyOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.manageReports.replyError", "Failed to send reply."));
    } finally {
      setSendingReply(false);
    }
  };

  const handleFindNearby = async () => {
    const coords = Array.isArray(viewItem?.location) ? viewItem.location : viewItem?.location?.coordinates;
    if (!coords) return;
    setFetchingNearby(true);
    setShowNearby(true);
    try {
      const isNewFormat = coords[0] > 70;
      const lng = isNewFormat ? coords[0] : coords[1];
      const lat = isNewFormat ? coords[1] : coords[0];
      const { data } = await API.get(`/auth/volunteers/nearby?longitude=${lng}&latitude=${lat}&radius=10000`);
      setNearbyVolunteers(data);
    } catch (err) {
      toast.error(t("admin.manageReports.errorNearby", "Failed to fetch nearby volunteers"));
    } finally {
      setFetchingNearby(false);
    }
  };

  const counts = useMemo(() => {
    const c = { pending: 0, verified: 0, working: 0, solved: 0, spam: 0, totalReal: 0 };
    reports.forEach((r) => { 
      if (r.status === "rejected") {
        c.spam++;
      } else {
        c.totalReal++;
        if (c[r.status] !== undefined) c[r.status]++; 
      }
    });
    return c;
  }, [reports]);

  const cards = [
    { label: t("admin.manageReports.total"), color: "bg-gray-100 text-gray-800", count: counts.totalReal, icon: <ListChecks size={22} /> },
    { label: t("admin.manageReports.pending"), color: "bg-yellow-100 text-yellow-800", count: counts.pending, icon: <Clock size={22} /> },
    { label: t("admin.manageReports.verified"), color: "bg-blue-100 text-blue-800", count: counts.verified, icon: <ShieldCheck size={22} /> },
    { label: t("admin.manageReports.working"), color: "bg-purple-100 text-purple-800", count: counts.working, icon: <Hammer size={22} /> },
    { label: t("admin.manageReports.solved"), color: "bg-green-100 text-green-800", count: counts.solved, icon: <CheckCircle size={22} /> },
  ];

  const statusColor = (s) => s === "pending" ? "bg-yellow-100 text-yellow-700" : s === "verified" ? "bg-blue-100 text-blue-700" : s === "working" ? "bg-purple-100 text-purple-700" : s === "rejected" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700";

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3 hover:text-indigo-600 transition-colors cursor-pointer">
          <FileText className="text-indigo-500" size={32} />
          {t("admin.manageReports.title")}
        </h1>
        <button 
          onClick={() => exportToCSV(filtered, "reports")}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md px-4 py-2 rounded-lg shadow-sm font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
        >
          <Download size={16} /> {t("admin.manageReports.exportCsv")}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {cards.map(({ label, color, count, icon }, i) => (
          <motion.div 
            key={label} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.08 }} 
            onClick={() => setStatusFilter(label === "Total" ? "" : label.toLowerCase())}
            className={`rounded-xl p-4 shadow-sm text-center ${color} flex flex-col items-center cursor-pointer hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all`}
          >
            <div className="mb-1.5">{icon}</div>
            <div className="text-xs font-semibold uppercase tracking-wider">{label}</div>
            <div className="text-2xl font-bold mt-1">{loading ? "—" : count}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setShowSpam(false)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${!showSpam ? "bg-indigo-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
          {t("admin.manageReports.verifiedReports", "Verified Reports")}
        </button>
        <button onClick={() => setShowSpam(true)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${showSpam ? "bg-red-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
          {t("admin.manageReports.spamQueue", "Spam Queue")} 
          {counts.spam > 0 && <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${showSpam ? "bg-white text-red-600" : "bg-red-100 text-red-800"}`}>{counts.spam}</span>}
        </button>
      </div>

      <AdminFilterBar search={search} onSearchChange={setSearch} searchPlaceholder={t("admin.manageReports.searchPlaceholder")} locationFilter={locationFilter} onLocationChange={setLocationFilter}
        filters={[
          { label: t("admin.manageReports.status"), value: statusFilter, onChange: setStatusFilter, options: STATUS_TYPES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })) },
          { label: t("admin.manageReports.type"), value: typeFilter, onChange: setTypeFilter, options: REPORT_TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) })) },
        ]}
        onClearAll={clearAll}
      />

      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>{[t("admin.manageReports.tableType"), t("admin.manageReports.tableStatus"), t("admin.manageReports.tableDescription"), t("admin.manageReports.tableLocation"), t("admin.manageReports.tableActions")].map((h) => (<th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <TableSkeleton rows={PAGE_SIZE} cols={5} /> : paginated.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-12 text-gray-400">{t("admin.manageReports.noReports")}</td></tr>
            ) : paginated.map((r, i) => (
              <motion.tr key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-indigo-50/30 transition">
                <td className="px-6 py-4 text-sm font-medium text-gray-800 flex items-center gap-2">
                  <img src={`/icons/map-icons-red/${r.type}.svg`} alt={r.type} className="w-5 h-5" /><span className="capitalize">{r.type}</span>
                </td>
                <td className="px-6 py-4 text-sm"><span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColor(r.status)}`}>{r.status}</span></td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{r.description?.slice(0, 50)}{r.description?.length > 50 ? "…" : ""}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{r.localGovName || "—"}</td>
                <td className="px-6 py-4"><div className="flex gap-2">
                  <button onClick={() => { setViewItem(r); setViewOpen(true); }} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hover:-translate-y-0.5 hover:shadow-sm transition-all font-medium active:scale-95"><Eye size={13} /> {t("admin.manageReports.view")}</button>
                  <button onClick={() => handleEdit(r)} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95">{t("admin.manageReports.edit")}</button>
                </div></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
      </div>

      <DetailModal
        open={viewOpen}
        onClose={() => { setViewOpen(false); setViewItem(null); setShowNearby(false); setReplyOpen(false); }}
        title={t("admin.manageReports.reportDetails")}
        icon={<FileText size={20} />}
        imageUrl={viewItem?.imageUrl ? (viewItem.imageUrl.startsWith("http") ? viewItem.imageUrl : `${import.meta.env.VITE_API_URL.replace("/api", "")}${viewItem.imageUrl}`) : null}
        fields={[
          { label: t("admin.manageReports.typeLabel", "Type"), value: viewItem?.type, render: (v) => <span className="capitalize">{v}</span> },
          { label: t("admin.manageReports.statusLabel", "Status"), value: viewItem?.status, render: (v) => <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${v === "pending" ? "bg-yellow-100 text-yellow-700" : v === "verified" ? "bg-blue-100 text-blue-700" : v === "working" ? "bg-purple-100 text-purple-700" : v === "rejected" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{v}</span> },
          { label: t("admin.manageReports.description", "Description"), value: viewItem?.description },
          ...(viewItem?.rawDescription && viewItem.rawDescription !== viewItem.description ? [{ label: t("admin.manageReports.rawDescription", "Original SMS Text"), value: viewItem.rawDescription, render: (v) => <div className="p-2 mt-1 bg-gray-50 border border-gray-200 rounded text-sm italic text-gray-700">{v}</div> }] : []),
          ...(viewItem?.reportedByPhone ? [
            { 
              label: t("admin.manageReports.reportedByPhone", "Reported via SMS"), 
              value: viewItem.reportedByPhone, 
              render: (v) => (
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex items-center gap-3">
                    <a href={`tel:${v}`} className="text-blue-600 font-semibold hover:underline">{v}</a>
                    <button onClick={() => setReplyOpen(!replyOpen)} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-200 hover:bg-indigo-100 transition font-bold">
                      {t("admin.manageReports.replyViaSms", "Reply via SMS")}
                    </button>
                  </div>
                  {replyOpen && (
                    <div className="flex flex-col gap-2 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-inner">
                      <textarea 
                        value={replyMessage} 
                        onChange={(e) => setReplyMessage(e.target.value)} 
                        placeholder={t("admin.manageReports.typeSms", "Type SMS message to victim...")} 
                        className="w-full text-sm p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        rows={2} 
                      />
                      <button 
                        onClick={handleSendReply} 
                        disabled={sendingReply || !replyMessage.trim()} 
                        className="self-end px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition"
                      >
                        {sendingReply ? t("admin.manageReports.sending", "Sending...") : t("admin.manageReports.sendSms", "Send SMS")}
                      </button>
                    </div>
                  )}
                </div>
              ) 
            },
          ] : []),
          ...(viewItem?.smsThread && viewItem.smsThread.length > 0 ? [
            {
              label: t("admin.manageReports.smsThread", "Follow-up SMS Thread"),
              value: viewItem.smsThread,
              render: (thread) => (
                <div className="flex flex-col gap-2 mt-2">
                  {thread.map((msg, idx) => (
                    <div key={idx} className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-900 shadow-sm">
                      <div className="font-semibold text-xs text-indigo-700 mb-1">{new Date(msg.receivedAt).toLocaleString()}</div>
                      <div>{msg.message}</div>
                    </div>
                  ))}
                </div>
              )
            }
          ] : []),
          { label: t("admin.manageReports.location", "Location"), value: viewItem?.localGovName || "—" },
          ...(viewItem?.aiAnalysis ? [
            { 
              label: t("admin.manageReports.aiSeverity", "AI Severity Score"), 
              value: viewItem.aiAnalysis.severityScore, 
              render: (v) => <span className={`font-bold ${v > 7 ? 'text-red-600' : v > 4 ? 'text-yellow-600' : 'text-green-600'}`}>{v}/10</span>
            },
            { label: t("admin.manageReports.aiFakeDetection", "AI Fake Detection"), value: viewItem.aiAnalysis.isFake, render: (v) => v ? <span className="text-red-600 font-bold">{t("admin.manageReports.likelyFake", "Likely Fake")}</span> : <span className="text-green-600">{t("admin.manageReports.seemsReal", "Seems Real")}</span> },
            { label: t("admin.manageReports.aiTags", "AI Tags"), value: viewItem.aiAnalysis.tags, render: (v) => <div className="flex flex-wrap gap-1">{v?.map((t, idx) => <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-md">{t}</span>)}</div> },
            { label: t("admin.manageReports.aiSummary", "AI Summary"), value: viewItem.aiAnalysis.summary }
          ] : []),
          { label: t("admin.manageReports.coordinates", "Coordinates"), value: (Array.isArray(viewItem?.location) ? viewItem.location : viewItem?.location?.coordinates) ? `[${(Array.isArray(viewItem?.location) ? viewItem.location : viewItem?.location?.coordinates)[0]?.toFixed(5)}, ${(Array.isArray(viewItem?.location) ? viewItem.location : viewItem?.location?.coordinates)[1]?.toFixed(5)}]` : "—" },
          ...(showNearby ? [
            {
              label: t("admin.manageReports.nearbyVolunteers", "Nearby Volunteers (10km)"),
              value: null,
              render: () => (
                <div className="mt-2 flex flex-col gap-2">
                  {fetchingNearby ? (
                    <span className="text-sm text-gray-500">{t("admin.manageReports.loadingNearby", "Loading...")}</span>
                  ) : nearbyVolunteers.length === 0 ? (
                    <span className="text-sm text-gray-500">{t("admin.manageReports.noNearbyFound", "No volunteers found within 10km.")}</span>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                      {nearbyVolunteers.map(v => (
                        <div key={v._id} className="flex justify-between items-center text-sm p-2 border border-gray-100 bg-white rounded shadow-sm">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800">{v.username}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              {v.phoneNumber && <a href={`tel:${v.phoneNumber}`} className="text-blue-600 hover:underline">{v.phoneNumber}</a>}
                            </span>
                          </div>
                          <div className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded">
                            {v.skills?.length > 0 ? v.skills.join(", ") : "General"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
          ] : []),
          { label: t("admin.manageReports.reportedAt", "Reported At"), value: viewItem?.createdAt ? new Date(viewItem.createdAt).toLocaleString() : "—" },
          { label: t("admin.manageReports.updatedAt", "Updated At"), value: viewItem?.updatedAt ? new Date(viewItem.updatedAt).toLocaleString() : "—" },
        ]}
        actions={
          <>
            <button
              onClick={handleFindNearby}
              disabled={fetchingNearby || !(Array.isArray(viewItem?.location) ? viewItem.location : viewItem?.location?.coordinates)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl font-bold text-sm transition shadow-sm disabled:opacity-50"
            >
              {fetchingNearby ? t("admin.manageReports.locating", "Locating...") : t("admin.manageReports.findNearbyBtn", "Find Nearby")}
            </button>
            <button
              onClick={handlePingVolunteers}
              disabled={pinging}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition shadow-md disabled:opacity-50"
            >
              {pinging ? t("admin.manageReports.pinging", "Pinging...") : t("admin.manageReports.pingVolunteers", "Ping Nearby Volunteers")}
            </button>
          </>
        }
      />
      <AnimatePresence>
        {showModal && selectedReport && (
          <motion.div key="report-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <Modal report={selectedReport} onClose={() => setShowModal(false)} onUpdate={handleUpdate} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
