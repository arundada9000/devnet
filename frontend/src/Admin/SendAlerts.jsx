import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../api/axios";
import { Pencil, Trash2, Plus, Bell, Download, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import AlertModal from "../components/AlertModal";
import useDebounce from "../hooks/useDebounce";
import useAdminLocationStore from "../stores/useAdminLocationStore";
import AdminFilterBar from "../components/admin/AdminFilterBar";
import TableSkeleton from "../components/admin/TableSkeleton";
import Pagination from "../components/admin/Pagination";
import { exportToCSV } from "../utils/exportCsv";
import DetailModal from "../components/DetailModal";
import { useTranslation } from "react-i18next";

const ALERT_TYPES = ["fire", "flood", "earthquake", "landslide", "storm", "police", "accident", "other"];
const PAGE_SIZE = 10;

export default function ManageAlerts() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  const { adminLocation } = useAdminLocationStore();
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => { if (adminLocation && !locationFilter) setLocationFilter(adminLocation); }, [adminLocation]);

  const { data: alerts = [], isLoading: loading } = useQuery({ queryKey: ["alerts"], queryFn: () => API.get("/alerts").then((res) => res.data) });

  const filtered = useMemo(() => {
    let data = [...alerts];
    if (debouncedSearch) { const q = debouncedSearch.toLowerCase(); data = data.filter((a) => a.title?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)); }
    if (typeFilter) data = data.filter((a) => a.type === typeFilter);
    if (locationFilter) data = data.filter((a) => a.location?.toLowerCase().includes(locationFilter.toLowerCase()));
    return data;
  }, [alerts, debouncedSearch, typeFilter, locationFilter]);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, typeFilter, locationFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDelete = async (id) => {
    if (!confirm(t("admin.sendAlerts.deleteConfirm"))) return;
    try { await API.delete(`/alerts/${id}`); toast.success(t("admin.sendAlerts.deleted")); queryClient.invalidateQueries({ queryKey: ["alerts"] }); }
    catch { toast.error(t("admin.sendAlerts.deleteFailed")); }
  };

  const handleModalSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (selectedAlert) await API.put(`/alerts/${selectedAlert._id}`, data);
      else await API.post("/alerts", data);
      setSelectedAlert(null); setShowModal(false);
      toast.success(selectedAlert ? t("admin.sendAlerts.updated") : t("admin.sendAlerts.created"));
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    } catch { toast.error(t("admin.sendAlerts.failed")); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3 hover:text-indigo-600 transition-colors cursor-pointer">
            <Bell className="text-indigo-500" size={32} /> {t("admin.sendAlerts.title")}
          </h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">{filtered.length} {t("admin.sendAlerts.alertCount")}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportToCSV(filtered, "alerts")} disabled={filtered.length === 0}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md px-4 py-2 rounded-lg shadow-sm font-medium text-sm transition-all disabled:opacity-50">
            <Download size={16} /> {t("admin.sendAlerts.exportCsv")}
          </button>
          <button onClick={() => { setSelectedAlert(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-md text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition-all active:scale-95">
            <Plus size={16} /> {t("admin.sendAlerts.createAlert")}
          </button>
        </div>
      </div>

      <AdminFilterBar search={search} onSearchChange={setSearch} searchPlaceholder={t("admin.sendAlerts.searchPlaceholder")}
        locationFilter={locationFilter} onLocationChange={setLocationFilter}
        filters={[{ label: t("admin.sendAlerts.type"), value: typeFilter, onChange: setTypeFilter, options: ALERT_TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) })) }]}
        onClearAll={() => { setSearch(""); setTypeFilter(""); setLocationFilter(""); }} />

      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr>{[t("admin.sendAlerts.tableTitle"), t("admin.sendAlerts.tableType"), t("admin.sendAlerts.tableLocation"), t("admin.sendAlerts.tableTime"), t("admin.sendAlerts.tableActions")].map((h) => (<th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>))}</tr></thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <TableSkeleton rows={PAGE_SIZE} cols={5} /> : paginated.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-12 text-gray-400">{t("admin.sendAlerts.noAlerts")}</td></tr>
            ) : paginated.map((alert, i) => (
              <motion.tr key={alert._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-indigo-50/30 transition">
                <td className="px-6 py-4 text-sm text-gray-800 font-medium">{alert.title}</td>
                <td className="px-6 py-4 text-sm"><span className="bg-gray-100 px-2.5 py-1 rounded-full text-xs font-semibold capitalize">{alert.type}</span></td>
                <td className="px-6 py-4 text-sm text-gray-600">{alert.location}</td>
                <td className="px-6 py-4 text-sm text-gray-500 tabular-nums">{new Date(alert.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => { setViewItem(alert); setViewOpen(true); }} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hover:-translate-y-0.5 hover:shadow-sm font-medium transition-all active:scale-95"><Eye size={13} /> {t("admin.sendAlerts.view")}</button>
                  <button onClick={() => { setSelectedAlert(alert); setShowModal(true); }} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-sm text-white rounded-lg font-medium transition-all active:scale-95"><Pencil size={13} /> {t("admin.sendAlerts.edit")}</button>
                  <button onClick={() => handleDelete(alert._id)} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:-translate-y-0.5 hover:shadow-sm font-medium transition-all active:scale-95"><Trash2 size={13} /> {t("admin.sendAlerts.delete")}</button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
      </div>

      <DetailModal open={viewOpen} onClose={() => { setViewOpen(false); setViewItem(null); }} title={t("admin.sendAlerts.alertDetails")} icon={<Bell size={20} />}
        fields={[
          { label: t("admin.sendAlerts.tableTitle"), value: viewItem?.title },
          { label: t("admin.sendAlerts.typeLabel"), value: viewItem?.type, render: (v) => <span className="capitalize bg-gray-100 px-2.5 py-1 rounded-full text-xs font-semibold">{v}</span> },
          { label: t("admin.sendAlerts.location"), value: viewItem?.location },
          { label: t("admin.sendAlerts.description"), value: viewItem?.description },
          { label: t("admin.sendAlerts.timestamp"), value: viewItem?.timestamp ? new Date(viewItem.timestamp).toLocaleString() : "\u2014" },
        ]} />
      <AlertModal open={showModal} onClose={() => { setSelectedAlert(null); setShowModal(false); }} onSubmit={handleModalSubmit} initialData={selectedAlert} submitting={submitting} />
    </>
  );
}