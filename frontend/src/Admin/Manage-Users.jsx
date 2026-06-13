import { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../api/axios";
import { Trash2, Shield, Search, Eye, X, User, Users, MapPin, Mail, Phone, Calendar, IdCard, Download } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import useDebounce from "../hooks/useDebounce";
import useAdminLocationStore from "../stores/useAdminLocationStore";
import AdminFilterBar from "../components/admin/AdminFilterBar";
import TableSkeleton from "../components/admin/TableSkeleton";
import Pagination from "../components/admin/Pagination";
import { exportToCSV } from "../utils/exportCsv";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 10;

export default function ManageUsers() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState({ visible: false, action: null });
  const [selectedUser, setSelectedUser] = useState(null);

  const { adminLocation } = useAdminLocationStore();
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => { if (adminLocation && !locationFilter) setLocationFilter(adminLocation); }, [adminLocation]);

  const { data: users = [], isLoading: loading } = useQuery({ queryKey: ["users"], queryFn: () => API.get("/auth/users").then((res) => res.data) });

  const filteredUsers = useMemo(() => {
    let data = [...users];
    if (debouncedSearch) { const q = debouncedSearch.toLowerCase(); data = data.filter((u) => u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phoneNumber?.toLowerCase().includes(q)); }
    if (roleFilter) data = data.filter((u) => u.role === roleFilter);
    if (locationFilter) data = data.filter((u) => u.localGovName?.toLowerCase().includes(locationFilter.toLowerCase()));
    return data;
  }, [users, debouncedSearch, roleFilter, locationFilter]);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, roleFilter, locationFilter]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const confirmAction = (message, action) => setModal({ visible: true, message, action });

  const handleConfirm = async () => {
    if (!modal.action) return;
    await modal.action();
    setModal({ visible: false, action: null });
  };

  const handleRoleChange = (userId, newRole) => {
    confirmAction(t("admin.manageUsers.roleChangeConfirm", { role: newRole }), async () => {
      try { await API.put(`/auth/users/${userId}/role`, { role: newRole }); toast.success(t("admin.manageUsers.roleUpdated")); queryClient.invalidateQueries({ queryKey: ["users"] }); }
      catch { toast.error(t("admin.manageUsers.roleUpdateFailed")); }
    });
  };

  const handleDeleteUser = (id) => {
    confirmAction(t("admin.manageUsers.deleteConfirm"), async () => {
      try { await API.delete(`/auth/users/${id}`); toast.success(t("admin.manageUsers.deleted")); queryClient.invalidateQueries({ queryKey: ["users"] }); }
      catch { toast.error(t("admin.manageUsers.deleteFailed")); }
    });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3 hover:text-indigo-600 transition-colors cursor-pointer">
            <Users className="text-indigo-500" size={32} />{t("admin.manageUsers.title")}
          </h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">{filteredUsers.length} {t("admin.manageUsers.userCount")}</span>
        </div>
        <button onClick={() => exportToCSV(filteredUsers, "users")} disabled={filteredUsers.length === 0}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md px-4 py-2 rounded-lg shadow-sm font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 active:scale-95 disabled:opacity-50">
          <Download size={16} /> {t("admin.manageUsers.exportCsv")}
        </button>
      </div>

      <AdminFilterBar search={search} onSearchChange={setSearch} searchPlaceholder={t("admin.manageUsers.searchPlaceholder")}
        locationFilter={locationFilter} onLocationChange={setLocationFilter}
        filters={[{ label: t("admin.manageUsers.role"), value: roleFilter, onChange: setRoleFilter, options: [{ value: "user", label: t("admin.manageUsers.user") }, { value: "admin", label: t("admin.manageUsers.admin") }] }]}
        onClearAll={() => { setSearch(""); setRoleFilter(""); setLocationFilter(""); }} />

      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>{[t("admin.manageUsers.tableName"), t("admin.manageUsers.tableEmail"), t("admin.manageUsers.tablePhone"), t("admin.manageUsers.tableRole"), t("admin.manageUsers.tableActions")].map((head) => (<th key={head} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{head}</th>))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <TableSkeleton rows={PAGE_SIZE} cols={5} /> : paginatedUsers.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-12 text-gray-400">{t("admin.manageUsers.noUsers")}</td></tr>
            ) : paginatedUsers.map((user, index) => (
              <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * index }} className="hover:bg-indigo-50/30 transition duration-200">
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{user.username}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email || "\u2014"}</td>
                <td className="px-6 py-4 text-sm text-gray-600 tabular-nums">{user.phoneNumber || "\u2014"}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{user.role}</span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedUser(user)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 hover:-translate-y-0.5 hover:shadow-sm transition-all text-xs font-medium active:scale-95">
                      <Eye size={13} /> {t("admin.manageUsers.view")}
                    </button>
                    <button onClick={() => handleRoleChange(user._id, user.role === "admin" ? "user" : "admin")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-sm transition-all text-xs font-medium active:scale-95">
                      <Shield size={13} />{user.role === "admin" ? t("admin.manageUsers.makeUser") : t("admin.manageUsers.makeAdmin")}
                    </button>
                    <button onClick={() => handleDeleteUser(user._id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:-translate-y-0.5 hover:shadow-sm transition-all text-xs font-medium active:scale-95">
                      <Trash2 size={13} /> {t("admin.manageUsers.delete")}
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredUsers.length} pageSize={PAGE_SIZE} />
      </div>

      <AnimatePresence>
        {selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[80] p-4" onClick={() => setSelectedUser(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition"><X size={18} /></button>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><User size={28} /></div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedUser.username}</h2>
                  <span className={`inline-block px-2 py-0.5 mt-1 rounded-full text-xs font-semibold capitalize ${selectedUser.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{selectedUser.role}</span>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: t("admin.manageUsers.email"), value: selectedUser.email },
                  { icon: Phone, label: t("admin.manageUsers.phone"), value: selectedUser.phoneNumber },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">
                    <Icon size={16} className="text-gray-400" />
                    <div className="flex flex-col"><span className="text-xs text-gray-400 font-semibold uppercase">{label}</span><span className="font-medium">{value || t("admin.manageUsers.notProvided")}</span></div>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: MapPin, label: t("admin.manageUsers.vdcMunicipality"), value: selectedUser.localGovName },
                    { icon: MapPin, label: t("admin.manageUsers.coordinates"), value: selectedUser.location?.coordinates ? `[${selectedUser.location.coordinates[0]?.toFixed(4)}, ${selectedUser.location.coordinates[1]?.toFixed(4)}]` : t("admin.manageUsers.notProvided") },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">
                      <Icon size={16} className="text-gray-400" />
                      <div className="flex flex-col"><span className="text-xs text-gray-400 font-semibold uppercase">{label}</span><span className="font-medium">{value}</span></div>
                    </div>
                  ))}
                </div>
                {[
                  { icon: User, label: t("admin.manageUsers.gender"), value: selectedUser.gender },
                  { icon: IdCard, label: t("admin.manageUsers.citizenshipId"), value: selectedUser.citizenshipId },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">
                    <Icon size={16} className="text-gray-400" />
                    <div className="flex flex-col"><span className="text-xs text-gray-400 font-semibold uppercase">{label}</span><span className="font-medium capitalize">{value || t("admin.manageUsers.notProvided")}</span></div>
                  </div>
                ))}
                <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">
                  <Calendar size={16} className="text-gray-400" />
                  <div className="flex flex-col"><span className="text-xs text-gray-400 font-semibold uppercase">{t("admin.manageUsers.joinedOn")}</span><span className="font-medium">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : t("admin.manageUsers.unknown")}</span></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal.visible && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[80]">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }} className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4">
              <h2 className="text-lg font-bold text-gray-800 mb-3">{t("admin.manageUsers.confirmTitle")}</h2>
              <p className="text-sm text-gray-600 mb-6">{modal.message}</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setModal({ visible: false, action: null })} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium hover:-translate-y-0.5 active:scale-95 transition-all">{t("admin.manageUsers.cancel")}</button>
                <button onClick={handleConfirm} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md hover:-translate-y-0.5 text-sm font-medium active:scale-95 transition-all">{t("admin.manageUsers.confirm")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}