import { useEffect, useState, useMemo } from "react";
import API from "../api/axios";
import { Pencil, Trash2, Plus, Shield, MapPin, Download, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import useDebounce from "../hooks/useDebounce";
import AdminFilterBar from "../components/admin/AdminFilterBar";
import TableSkeleton from "../components/admin/TableSkeleton";
import Pagination from "../components/admin/Pagination";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { exportToCSV } from "../utils/exportCsv";
import DetailModal from "../components/DetailModal";
import { useTranslation } from "react-i18next";

const ZONE_TYPES = ["hospital", "shelter", "police", "fire_station", "distribution"];
const PAGE_SIZE = 10;

const typeColors = {
  hospital: "bg-emerald-100 text-emerald-700",
  shelter: "bg-blue-100 text-blue-700",
  police: "bg-indigo-100 text-indigo-700",
  fire_station: "bg-red-100 text-red-700",
  distribution: "bg-amber-100 text-amber-700",
};

function SafeZoneModal({ open, onClose, onSubmit, initialData }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [type, setType] = useState("hospital");
  const [lng, setLng] = useState("");
  const [lat, setLat] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setType(initialData.type || "hospital");
      const coords = initialData.location?.coordinates;
      if (coords) { setLng(String(coords[0] || "")); setLat(String(coords[1] || "")); }
      setAddress(initialData.address || "");
      setPhone(initialData.phone || "");
      setIsActive(initialData.isActive !== false);
    } else {
      setName(""); setType("hospital"); setLng(""); setLat(""); setAddress(""); setPhone(""); setIsActive(true);
    }
  }, [initialData, open]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return toast.error(t("admin.manageSafeZones.geolocationNotSupported"));
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLng(String(pos.coords.longitude)); setLat(String(pos.coords.latitude)); toast.success(t("admin.manageSafeZones.locationCaptured")); },
      () => toast.error(t("admin.manageSafeZones.locationFailed"))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error(t("admin.manageSafeZones.nameRequiredError"));
    if (!lng || !lat) return toast.error(t("admin.manageSafeZones.coordinatesRequired"));
    const lngNum = parseFloat(lng); const latNum = parseFloat(lat);
    if (isNaN(lngNum) || isNaN(latNum)) return toast.error(t("admin.manageSafeZones.invalidCoordinates"));
    onSubmit({ name: name.trim(), type, coordinates: [lngNum, latNum], address: address.trim(), phone: phone.trim(), isActive });
  };

  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}>
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Shield size={20} className="text-emerald-600" />
              {initialData ? t("admin.manageSafeZones.editZone") : t("admin.manageSafeZones.addZoneTitle")}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t("admin.manageSafeZones.nameRequired")}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("admin.manageSafeZones.namePlaceholder")}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t("admin.manageSafeZones.typeRequired")}</label>
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none">
                {ZONE_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("admin.manageSafeZones.longitude")}</label>
                <input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="83.4681"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("admin.manageSafeZones.latitude")}</label>
                <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="27.7111"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
              </div>
            </div>
            <button type="button" onClick={handleUseMyLocation}
              className="flex items-center gap-2 text-sm text-emerald-600 font-semibold hover:text-emerald-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded p-1">
              <MapPin size={14} /> {t("admin.manageSafeZones.useCurrentLocation")}
            </button>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t("admin.manageSafeZones.addressLabel")}</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("admin.manageSafeZones.addressPlaceholder")}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t("admin.manageSafeZones.phoneLabel")}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("admin.manageSafeZones.phonePlaceholder")}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
            </div>
            {initialData && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">{t("admin.manageSafeZones.activeToggle")}</span>
                <button type="button" onClick={() => setIsActive(!isActive)}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${isActive ? "bg-emerald-500" : "bg-gray-300"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${isActive ? "left-[26px]" : "left-0.5"}`} />
                </button>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-200 transition text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 active:scale-95">{t("admin.manageSafeZones.cancel")}</button>
              <button type="submit"
                className="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 active:scale-95">
                {initialData ? t("admin.manageSafeZones.update") : t("admin.manageSafeZones.create")}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ManageSafeZones() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data: zones = [], isLoading: loading } = useQuery({ queryKey: ["safe-zones"], queryFn: () => API.get("/safe-zones").then((res) => res.data) });

  const filtered = useMemo(() => {
    let data = [...zones];
    if (debouncedSearch) { const q = debouncedSearch.toLowerCase(); data = data.filter((z) => z.name?.toLowerCase().includes(q) || z.address?.toLowerCase().includes(q)); }
    if (typeFilter) data = data.filter((z) => z.type === typeFilter);
    return data;
  }, [zones, debouncedSearch, typeFilter]);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, typeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDelete = async (id) => {
    if (!confirm(t("admin.manageSafeZones.deleteConfirm"))) return;
    try { await API.delete(`/safe-zones/${id}`); toast.success(t("admin.manageSafeZones.deleted")); queryClient.invalidateQueries({ queryKey: ["safe-zones"] }); }
    catch { toast.error(t("admin.manageSafeZones.deleteFailed")); }
  };

  const handleModalSubmit = async (data) => {
    try {
      if (selectedZone) await API.put(`/safe-zones/${selectedZone._id}`, data);
      else await API.post("/safe-zones", data);
      toast.success(selectedZone ? t("admin.manageSafeZones.updated") : t("admin.manageSafeZones.created"));
      queryClient.invalidateQueries({ queryKey: ["safe-zones"] });
    } catch { toast.error(t("admin.manageSafeZones.failed")); }
    finally { setSelectedZone(null); setShowModal(false); }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3 hover:text-emerald-600 transition-colors cursor-pointer">
            <Shield className="text-emerald-600" size={28} />{t("admin.manageSafeZones.title")}
          </h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">{filtered.length} {t("admin.manageSafeZones.zoneCount")}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportToCSV(filtered, "safe-zones")} disabled={filtered.length === 0}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md px-4 py-2 rounded-lg shadow-sm font-medium text-sm transition-all disabled:opacity-50">
            <Download size={16} /> {t("admin.manageSafeZones.exportCsv")}
          </button>
          <button onClick={() => { setSelectedZone(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-md text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition-all active:scale-95">
            <Plus size={16} /> {t("admin.manageSafeZones.addZone")}
          </button>
        </div>
      </div>

      <AdminFilterBar search={search} onSearchChange={setSearch} searchPlaceholder={t("admin.manageSafeZones.searchPlaceholder")}
        filters={[{ label: t("admin.manageSafeZones.type"), value: typeFilter, onChange: setTypeFilter, options: ZONE_TYPES.map((t) => ({ value: t, label: t.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) })) }]}
        onClearAll={() => { setSearch(""); setTypeFilter(""); }} />

      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr>{[t("admin.manageSafeZones.tableName"), t("admin.manageSafeZones.tableType"), t("admin.manageSafeZones.tableAddress"), t("admin.manageSafeZones.tablePhone"), t("admin.manageSafeZones.tableStatus"), t("admin.manageSafeZones.tableActions")].map((h) => (<th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>))}</tr></thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <TableSkeleton rows={PAGE_SIZE} cols={6} /> : paginated.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-12 text-gray-400">{t("admin.manageSafeZones.noZones")}</td></tr>
            ) : paginated.map((zone, i) => (
              <motion.tr key={zone._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-emerald-50/30 transition">
                <td className="px-6 py-4 text-sm text-gray-800 font-medium">{zone.name}</td>
                <td className="px-6 py-4 text-sm"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${typeColors[zone.type] || "bg-gray-100 text-gray-700"}`}>{zone.type?.replace("_", " ")}</span></td>
                <td className="px-6 py-4 text-sm text-gray-600">{zone.address || "\u2014"}</td>
                <td className="px-6 py-4 text-sm text-gray-600 tabular-nums">{zone.phone || "\u2014"}</td>
                <td className="px-6 py-4 text-sm"><span className={`px-2 py-1 rounded-full text-xs font-bold ${zone.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{zone.isActive ? t("admin.manageSafeZones.active") : t("admin.manageSafeZones.inactive")}</span></td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => { setViewItem(zone); setViewOpen(true); }} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hover:-translate-y-0.5 hover:shadow-sm font-medium transition-all active:scale-95"><Eye size={13} /> {t("admin.manageSafeZones.view")}</button>
                  <button onClick={() => { setSelectedZone(zone); setShowModal(true); }} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-sm text-white rounded-lg font-medium transition-all active:scale-95"><Pencil size={13} /> {t("admin.manageSafeZones.edit")}</button>
                  <button onClick={() => handleDelete(zone._id)} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:-translate-y-0.5 hover:shadow-sm font-medium transition-all active:scale-95"><Trash2 size={13} /> {t("admin.manageSafeZones.delete")}</button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
      </div>

      <DetailModal open={viewOpen} onClose={() => { setViewOpen(false); setViewItem(null); }} title={t("admin.manageSafeZones.zoneDetails")} icon={<Shield size={20} />}
        fields={[
          { label: t("admin.manageSafeZones.name"), value: viewItem?.name },
          { label: t("admin.manageSafeZones.typeLabel"), value: viewItem?.type, render: (v) => <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${typeColors[v] || "bg-gray-100 text-gray-700"}`}>{v?.replace("_", " ")}</span> },
          { label: t("admin.manageSafeZones.address"), value: viewItem?.address },
          { label: t("admin.manageSafeZones.phone"), value: viewItem?.phone },
          { label: t("admin.manageSafeZones.coordinates"), value: viewItem?.location?.coordinates ? `[${viewItem.location.coordinates[0]?.toFixed(5)}, ${viewItem.location.coordinates[1]?.toFixed(5)}]` : "\u2014" },
          { label: t("admin.manageSafeZones.status"), value: viewItem?.isActive, render: (v) => <span className={`px-2 py-1 rounded-full text-xs font-bold ${v ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{v ? t("admin.manageSafeZones.active") : t("admin.manageSafeZones.inactive")}</span> },
          { label: t("admin.manageSafeZones.createdAt"), value: viewItem?.createdAt ? new Date(viewItem.createdAt).toLocaleString() : "\u2014" },
          { label: t("admin.manageSafeZones.updatedAt"), value: viewItem?.updatedAt ? new Date(viewItem.updatedAt).toLocaleString() : "\u2014" },
        ]} />
      <SafeZoneModal open={showModal} onClose={() => { setSelectedZone(null); setShowModal(false); }} onSubmit={handleModalSubmit} initialData={selectedZone} />
    </>
  );
}