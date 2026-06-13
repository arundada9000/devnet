import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";
import { Plus, Trash2, Edit3, MapPin, Contact, Download, Eye } from "lucide-react";
import toast from "react-hot-toast";
import useDebounce from "../hooks/useDebounce";
import useAdminLocationStore from "../stores/useAdminLocationStore";
import AdminFilterBar from "../components/admin/AdminFilterBar";
import TableSkeleton from "../components/admin/TableSkeleton";
import Pagination from "../components/admin/Pagination";
import ContactEditModal from "../components/admin/ContactEditModal";
import { exportToCSV } from "../utils/exportCsv";
import DetailModal from "../components/DetailModal";
import { useTranslation } from "react-i18next";

const departments = ["fire", "police", "flood", "accident", "landslide", "other"];
const PAGE_SIZE = 10;

export default function ManageContacts() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  const { adminLocation, availableLocations } = useAdminLocationStore();
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => { if (adminLocation && !locationFilter) setLocationFilter(adminLocation); }, [adminLocation]);

  const { data: records = [], isLoading: loading } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => API.get("/contacts").then(res => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => API.delete(`/contacts/${id}`),
    onSuccess: () => {
      toast.success(t("admin.manageContacts.deleted"));
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: () => toast.error(t("admin.manageContacts.deleteFailed")),
  });

  const filtered = useMemo(() => {
    let data = [...records];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      data = data.filter((r) => r.localGovName.toLowerCase().includes(q) || r.department.toLowerCase().includes(q) || r.contacts.some((c) => c.name.toLowerCase().includes(q)));
    }
    if (deptFilter) data = data.filter((r) => r.department === deptFilter);
    if (locationFilter) data = data.filter((r) => r.localGovName.toLowerCase() === locationFilter.toLowerCase());
    return data;
  }, [records, debouncedSearch, deptFilter, locationFilter]);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, deptFilter, locationFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openCreateModal = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm(t("admin.manageContacts.deleteConfirm"))) return;
    deleteMutation.mutate(id);
  };

  const clearAll = () => { setSearch(""); setDeptFilter(""); setLocationFilter(""); };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3 hover:text-indigo-600 transition-colors cursor-pointer">
            <Contact className="text-indigo-500" size={32} /> {t("admin.manageContacts.title")}
          </h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">{filtered.length} {t("admin.manageContacts.recordCount")}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => exportToCSV(filtered, "contacts")}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md px-4 py-2 rounded-lg shadow-sm font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            <Download size={16} /> {t("admin.manageContacts.exportCsv")}
          </button>
          <button onClick={openCreateModal} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-md text-white px-4 py-2 rounded-lg shadow-sm font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 active:scale-95">
            <Plus size={16} /> {t("admin.manageContacts.addNew")}
          </button>
        </div>
      </div>

      <AdminFilterBar search={search} onSearchChange={setSearch} searchPlaceholder={t("admin.manageContacts.searchPlaceholder")} locationFilter={locationFilter} onLocationChange={setLocationFilter}
        filters={[{ label: t("admin.manageContacts.department"), value: deptFilter, onChange: setDeptFilter, options: departments.map((d) => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) })) }]}
        onClearAll={clearAll}
      />

      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr>{[t("admin.manageContacts.tableLocation"), t("admin.manageContacts.tableDepartment"), t("admin.manageContacts.tablePhoneNumbers"), t("admin.manageContacts.tableActions")].map((h) => (<th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>))}</tr></thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <TableSkeleton rows={PAGE_SIZE} cols={4} /> : paginated.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-12 text-gray-400">{t("admin.manageContacts.noRecords")}</td></tr>
            ) : paginated.map((record, i) => (
              <motion.tr key={record._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }} className="hover:bg-indigo-50/30 transition">
                <td className="px-6 py-4 text-sm font-medium text-gray-800"><div className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400" />{record.localGovName}</div></td>
                <td className="px-6 py-4 text-sm capitalize"><span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold">{record.department}</span></td>
                <td className="px-6 py-4 text-sm text-gray-600"><div className="flex flex-col gap-1">{record.contacts.map((c, j) => (<div key={j}><span className="font-medium text-gray-800">{c.name}</span>: {c.phone}</div>))}</div></td>
                <td className="px-6 py-4 text-sm"><div className="flex gap-2">
                  <button onClick={() => { setViewItem(record); setViewOpen(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hover:-translate-y-0.5 hover:shadow-sm transition-all text-xs font-medium active:scale-95"><Eye size={13} /> {t("admin.manageContacts.view")}</button>
                  <button onClick={() => openEditModal(record)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hover:-translate-y-0.5 hover:shadow-sm transition-all text-xs font-medium active:scale-95"><Edit3 size={13} /> {t("admin.manageContacts.edit")}</button>
                  <button onClick={() => handleDelete(record._id)} disabled={deleteMutation.isPending} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:-translate-y-0.5 hover:shadow-sm transition-all text-xs font-medium active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"><Trash2 size={13} /> {t("admin.manageContacts.delete")}</button>
                </div></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
      </div>

      <DetailModal
        open={viewOpen}
        onClose={() => { setViewOpen(false); setViewItem(null); }}
        title={t("admin.manageContacts.contactDetails")}
        icon={<Contact size={20} />}
        fields={[
          { label: t("admin.manageContacts.localGovernment"), value: viewItem?.localGovName },
          { label: t("admin.manageContacts.departmentLabel"), value: viewItem?.department, render: (v) => <span className="capitalize">{v}</span> },
          { label: t("admin.manageContacts.contacts"), value: viewItem?.contacts, render: (contacts) => (
            <div className="space-y-2">
              {contacts?.length ? contacts.map((c, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="font-semibold text-gray-900">{c.name}</div>
                  <div className="text-gray-600 text-xs mt-0.5">{c.phone}</div>
                  {c.role && <div className="text-gray-500 text-xs mt-0.5 capitalize">{c.role}</div>}
                  {c.description && <div className="text-gray-500 text-xs mt-0.5">{c.description}</div>}
                </div>
              )) : <span className="text-gray-400">{t("admin.manageContacts.noContacts")}</span>}
            </div>
          )},
          { label: t("admin.manageContacts.createdAt"), value: viewItem?.createdAt ? new Date(viewItem.createdAt).toLocaleString() : "—" },
          { label: t("admin.manageContacts.updatedAt"), value: viewItem?.updatedAt ? new Date(viewItem.updatedAt).toLocaleString() : "—" },
        ]}
      />
      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <ContactEditModal
            record={editingRecord}
            adminLocation={adminLocation}
            availableLocations={availableLocations}
            onClose={() => setModalOpen(false)}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ["contacts"] })}
          />
        )}
      </AnimatePresence>
    </>
  );
}
