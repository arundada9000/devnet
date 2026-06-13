import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";
import { motion } from "framer-motion";
import { HeartHandshake, Search, MapPin, Phone, Mail, User as UserIcon, Loader2, Send } from "lucide-react";
import useAdminLocationStore from "../stores/useAdminLocationStore";
import Pagination from "../components/admin/Pagination";
import TableSkeleton from "../components/admin/TableSkeleton";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 10;

export default function ManageVolunteers() {
  const { t } = useTranslation();
  const { adminLocation } = useAdminLocationStore();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);

  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => API.get("/auth/users").then((res) => res.data),
  });

  const volunteers = useMemo(() => {
    let data = users.filter((u) => u.isVolunteer === true);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (v) =>
          v.username?.toLowerCase().includes(q) ||
          v.email?.toLowerCase().includes(q) ||
          v.phoneNumber?.toLowerCase().includes(q) ||
          v.skills?.some((s) => s.toLowerCase().includes(q))
      );
    }
    return data;
  }, [users, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(volunteers.length / PAGE_SIZE);
  const paginated = volunteers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(paginated.map((v) => v._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) {
      setSelectedUsers((prev) => [...prev, id]);
    } else {
      setSelectedUsers((prev) => prev.filter((uId) => uId !== id));
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim() || selectedUsers.length === 0) return;
    setBroadcasting(true);
    try {
      const { data } = await API.post("/push/broadcast", { userIds: selectedUsers, message: broadcastMessage });
      import("react-hot-toast").then(m => m.default.success(data.message || t("admin.manageVolunteers.broadcastSuccess", "Broadcast sent successfully!")));
      setBroadcastOpen(false);
      setBroadcastMessage("");
      setSelectedUsers([]);
    } catch (err) {
      import("react-hot-toast").then(m => m.default.error(err.response?.data?.message || t("admin.manageVolunteers.broadcastError", "Failed to broadcast")));
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3 hover:text-indigo-600 transition-colors cursor-pointer">
          <HeartHandshake className="text-indigo-500" size={32} />
          {t("admin.manageVolunteers.title", "Manage Volunteers")}
        </h1>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(
              "admin.manageVolunteers.searchPlaceholder",
              "Search by name, email, skill..."
            )}
            className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none w-56"
          />
        </div>
      </div>
      
      {selectedUsers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl p-3 shadow-sm">
          <span className="text-sm font-semibold text-indigo-800 ml-2">
            {selectedUsers.length} {t("admin.manageVolunteers.volunteersSelected", "volunteers selected")}
          </span>
          <button onClick={() => setBroadcastOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow transition">
            <Send size={16} />
            {t("admin.manageVolunteers.broadcastBtn", "Broadcast Alert")}
          </button>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-5 bg-indigo-50 border border-indigo-100 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
            <HeartHandshake className="text-indigo-600" size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">
              {isLoading ? "—" : volunteers.length}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t("admin.manageVolunteers.totalVolunteers", "Total Volunteers")}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-xl p-5 bg-emerald-50 border border-emerald-100 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <UserIcon className="text-emerald-600" size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">
              {isLoading
                ? "—"
                : new Set(volunteers.flatMap((v) => v.skills || [])).size}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t("admin.manageVolunteers.uniqueSkills", "Unique Skills")}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="rounded-xl p-5 bg-blue-50 border border-blue-100 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Phone className="text-blue-600" size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">
              {isLoading
                ? "—"
                : volunteers.filter((v) => v.phoneNumber).length}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t("admin.manageVolunteers.withPhone", "With Phone")}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">
                <input 
                  type="checkbox" 
                  checked={paginated.length > 0 && selectedUsers.length === paginated.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </th>
              {[
                t("admin.manageVolunteers.name", "Name"),
                t("admin.manageVolunteers.contact", "Contact"),
                t("admin.manageVolunteers.skills", "Skills"),
                t("admin.manageVolunteers.location", "Location"),
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <TableSkeleton rows={PAGE_SIZE} cols={5} />
            ) : isError ? (
              <tr>
                <td colSpan="5" className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-red-500">
                    <span className="font-bold">{t("admin.manageVolunteers.errorLoading", "Failed to load volunteers.")}</span>
                    <span className="text-sm">{error?.message || t("admin.manageVolunteers.tryAgain", "Please try refreshing the page.")}</span>
                  </div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-gray-400">
                  {t(
                    "admin.manageVolunteers.noVolunteers",
                    "No volunteers found."
                  )}
                </td>
              </tr>
            ) : (
              paginated.map((v, i) => (
                <motion.tr
                  key={v._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-indigo-50/30 transition"
                >
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox"
                      checked={selectedUsers.includes(v._id)}
                      onChange={(e) => handleSelectOne(e, v._id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      {v.username?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    {v.username || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex flex-col gap-0.5">
                      {v.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={12} className="text-gray-400" />
                          {v.email}
                        </span>
                      )}
                      {v.phoneNumber && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="text-gray-400" />
                          <a
                            href={`tel:${v.phoneNumber}`}
                            className="text-blue-600 hover:underline"
                          >
                            {v.phoneNumber}
                          </a>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {v.skills?.length > 0
                        ? v.skills.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-md font-medium"
                            >
                              {s}
                            </span>
                          ))
                        : <span className="text-gray-400 text-xs">{t("admin.manageVolunteers.noSkills", "No skills listed")}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-red-400" />
                      {v.address || "—"}
                    </span>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={volunteers.length}
          pageSize={PAGE_SIZE}
        />
      </div>

      {broadcastOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Send size={20} className="text-indigo-600" />
              {t("admin.manageVolunteers.broadcastTitle", "Broadcast to Volunteers")}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {t("admin.manageVolunteers.broadcastDesc", "Send a push notification alert to the")} {selectedUsers.length} {t("admin.manageVolunteers.selectedVolunteers", "selected volunteers.")}
            </p>
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder={t("admin.manageVolunteers.broadcastPlaceholder", "Type your emergency broadcast message here...")}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setBroadcastOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                {t("admin.manageVolunteers.cancel", "Cancel")}
              </button>
              <button 
                onClick={handleBroadcast} 
                disabled={broadcasting || !broadcastMessage.trim()}
                className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition disabled:opacity-50 flex items-center gap-2"
              >
                {broadcasting && <Loader2 size={16} className="animate-spin" />}
                {broadcasting ? t("admin.manageVolunteers.sending", "Sending...") : t("admin.manageVolunteers.sendBroadcast", "Send Broadcast")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
