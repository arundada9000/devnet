import { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, Plus, Trash2 } from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const departments = ["fire", "police", "flood", "accident", "landslide", "other"];

export default function ContactEditModal({ record, adminLocation, availableLocations, onClose, onSuccess }) {
  const [form, setForm] = useState({
    localGovName: record?.localGovName || adminLocation || (availableLocations.length > 0 ? availableLocations[0] : ""),
    department: record?.department || "fire",
    contacts: record?.contacts?.length
      ? record.contacts.map((c) => ({ name: c.name || "", phone: c.phone || "", description: c.description || "" }))
      : [{ name: "", phone: "", description: "" }],
  });

  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.localGovName.trim() || !form.department) { setError(t("contactEdit.locationRequired")); return; }
    const valid = form.contacts.filter((c) => c.name.trim() && c.phone.trim());
    if (valid.length === 0) { setError(t("contactEdit.contactRequired")); return; }
    try {
      setSaving(true); setError("");
      const payload = { localGovName: form.localGovName.trim(), department: form.department, contacts: valid };
      if (record) await API.put(`/contacts/${record._id}`, payload);
      else await API.post("/contacts", payload);
      toast.success(record ? t("contactEdit.updated") : t("contactEdit.created"));
      onSuccess(); onClose();
    } catch (err) { setError(err.response?.data?.message || t("contactEdit.failedToSave")); }
    finally { setSaving(false); }
  };

  const addRow = () => setForm((p) => ({ ...p, contacts: [...p.contacts, { name: "", phone: "", description: "" }] }));
  const removeRow = (i) => setForm((p) => ({ ...p, contacts: p.contacts.filter((_, idx) => idx !== i) }));
  const updateRow = (i, field, value) => setForm((p) => ({ ...p, contacts: p.contacts.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)) }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">{record ? t("contactEdit.editRecord") : t("contactEdit.newRecord")}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-5">
          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("contactEdit.locationDepartment")}</label>
              <select value={form.localGovName} onChange={(e) => setForm((p) => ({ ...p, localGovName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="">{t("contactEdit.select")}</option>
                {availableLocations.map((loc) => <option key={loc} value={loc}>{loc} {loc === adminLocation ? t("contactEdit.yourLocation") : ""}</option>)}
              </select>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">{t("contactEdit.notInList")}</span>
                <input type="text" placeholder={t("contactEdit.typeCustom")}
                  className="flex-1 px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                  onChange={(e) => { if (e.target.value) setForm((p) => ({ ...p, localGovName: e.target.value })); }} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("contactEdit.department")}</label>
              <select value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none capitalize">
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">{t("contactEdit.phoneNumbers")}</label>
              <button type="button" onClick={addRow} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium bg-indigo-50 px-2 py-1 rounded transition">
                <Plus size={14} /> {t("contactEdit.addRow")}
              </button>
            </div>
            <div className="space-y-3">
              {form.contacts.map((c, i) => (
                <div key={i} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="text" placeholder={t("contactEdit.name")} value={c.name} onChange={(e) => updateRow(i, "name", e.target.value)}
                      className="w-full px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    <input type="text" placeholder={t("contactEdit.phone")} value={c.phone} onChange={(e) => updateRow(i, "phone", e.target.value)}
                      className="w-full px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    <input type="text" placeholder={t("contactEdit.detailsOptional")} value={c.description} onChange={(e) => updateRow(i, "description", e.target.value)}
                      className="w-full px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  {form.contacts.length > 1 && <button type="button" onClick={() => removeRow(i)} className="p-1.5 text-red-500 hover:bg-red-100 rounded transition"><Trash2 size={16} /></button>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-white border hover:bg-gray-50 rounded-lg text-sm font-medium transition">{t("contactEdit.cancel")}</button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
            <Save size={16} />{saving ? t("contactEdit.saving") : t("contactEdit.save")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}