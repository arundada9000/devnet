import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef } from "react";
import usePreferences from "../../stores/UsePreference.jsx";
import { useNavigate } from "react-router-dom";
import useAuth from "../../stores/useAuth";
import API from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalGovStore } from "../../stores/localGovStore";
import {
  X, Camera, Phone, Mail, User as UserIcon, IdCard,
  MapPin, Globe, Type, Settings,
  Moon, Sun, LogOut, ShieldCheck, Pencil, Save, XCircle, Bell, Loader2,
} from "lucide-react";
import usePushNotifications from "../../hooks/usePushNotifications";
import toast from "react-hot-toast";

const drawerVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { x: "100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const profileFields = [
  { key: "username", labelKey: "profile.name", icon: UserIcon, type: "text", placeholder: "profile.namePlaceholder" },
  { key: "phoneNumber", labelKey: "profile.phone", icon: Phone, type: "tel", placeholder: "profile.phonePlaceholder" },
  { key: "email", labelKey: "profile.email", icon: Mail, type: "email", placeholder: "profile.emailPlaceholder" },
  { key: "gender", labelKey: "profile.gender", icon: UserIcon, type: "select", options: ["Male", "Female", "Other"] },
  { key: "address", labelKey: "profile.address", icon: MapPin, type: "text", placeholder: "profile.addressPlaceholder" },
  { key: "citizenshipId", labelKey: "profile.citizenship", icon: IdCard, type: "text", placeholder: "profile.citizenshipPlaceholder" },
  { key: "isVolunteer", labelKey: "profile.isVolunteer", icon: ShieldCheck, type: "checkbox" },
  { key: "skills", labelKey: "profile.skills", icon: UserIcon, type: "text", placeholder: "profile.skillsPlaceholder" },
];

const PushToggleRow = () => {
  const { isSupported, isSubscribed, loading, subscribe, unsubscribe } = usePushNotifications();
  const { t } = useTranslation();
  if (!isSupported) return null;
  const handleToggle = async () => {
    if (isSubscribed) await unsubscribe();
    else await subscribe();
  };
  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          <Bell size={18} />
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-700">{t("profile.pushNotifications", "Push Notifications")}</span>
          {Notification.permission === "denied" && <p className="text-xs text-red-500 mt-0.5">{t("profile.blockedByBrowser")}</p>}
        </div>
      </div>
      <button onClick={handleToggle} disabled={loading || Notification.permission === "denied"}
        aria-label={t("profile.toggleNotifications")}
        className={`w-12 h-6 rounded-full transition-colors relative disabled:opacity-50 ${isSubscribed ? "bg-blue-500" : "bg-gray-300"}`}>
        <motion.div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"
          animate={{ x: isSubscribed ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }} />
      </button>
    </div>
  );
};

const ProfileDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { localGov } = useLocalGovStore();
  const fileInputRef = useRef(null);

  const { theme, setTheme, fontSize, setFontSize, fontFamily, setFontFamily, language, setLanguage } = usePreferences();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const updateUser = useAuth((s) => s.updateUser);

  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "/assets/dummy/krishna.jpg");
  useEffect(() => { if (user?.avatar) setAvatarUrl(user.avatar); }, [user?.avatar]);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (isEditing && user) {
      setEditForm({
        username: user.username || "",
        phoneNumber: user.phoneNumber || "",
        email: user.email || "",
        gender: user.gender || "",
        citizenshipId: user.citizenshipId || "",
        address: user.address || "",
        isVolunteer: user.isVolunteer || false,
        skills: user.skills?.join(", ") || "",
      });
    }
  }, [isEditing, user]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [open]);

  useEffect(() => { if (!open) setIsEditing(false); }, [open]);

  const handleLogout = () => { logout(); onClose(); navigate("/welcome"); };
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setAvatarUrl(reader.result); updateUser({ avatar: reader.result }); };
      reader.readAsDataURL(file);
    }
  };

  const handleFormChange = (key, value) => setEditForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...editForm };
      if (typeof payload.skills === "string") payload.skills = payload.skills.split(",").map((s) => s.trim()).filter(Boolean);
      const { data } = await API.put("/auth/profile", payload);
      updateUser(data.user);
      toast.success(t("profile.saveSuccess"));
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || t("profile.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => setIsEditing(false);
  const filledFields = profileFields.filter((f) => user?.[f.key] && String(user[f.key]).trim() !== "");

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial="hidden" animate="visible" exit="exit" variants={overlayVariants}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={onClose} aria-hidden="true" />
          <motion.div initial="hidden" animate="visible" exit="exit" variants={drawerVariants}
            className="fixed top-0 right-0 h-full w-[100vw] sm:w-[420px] bg-bg-light z-[70] shadow-2xl flex flex-col overflow-hidden"
            role="dialog" aria-label="Profile">
            <div className="relative shrink-0 bg-gradient-to-br from-[#155ac1] to-blue-400 pt-14 pb-20 px-6">
              <button onClick={onClose} aria-label={t("profile.back") || "Close"}
                className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors">
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto -mt-14 pb-10">
              <div className="relative z-10 flex flex-col items-center px-6 pb-4">
                <div className="relative">
                  <img src={avatarUrl} alt={user?.username || "Avatar"}
                    className="w-28 h-28 rounded-full border-[5px] border-white bg-white shadow-lg object-cover" />
                  <button onClick={handleAvatarClick} aria-label={t("profile.changePhoto")}
                    className="absolute bottom-0 right-0 bg-primary-red p-2 rounded-full shadow-md text-white hover:bg-red-700 hover:scale-105 transition-all duration-200 active:scale-95">
                    <Camera size={16} strokeWidth={2.5} />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
                <h2 className="mt-3 text-2xl font-extrabold text-gray-900 tracking-tight">{user?.username || t("profile.guest")}</h2>
                <div className="flex items-center gap-1.5 mt-1 text-sm">
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full font-medium capitalize">
                    <ShieldCheck size={14} />{user?.role || t("profile.notLoggedIn")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                  <MapPin size={14} className="text-red-500" />
                  <span>{localGov || t("profile.detectingLocation")}</span>
                </div>
                {user && !isEditing && (
                  <motion.button onClick={() => setIsEditing(true)}
                    className="mt-4 flex items-center gap-2 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-full transition-colors active:scale-95"
                    whileTap={{ scale: 0.95 }}>
                    <Pencil size={15} />{t("profile.editProfile")}
                  </motion.button>
                )}
              </div>
              <div className="px-5 space-y-6">
                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.section key="edit-mode" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-2">{t("profile.editProfile")}</h3>
                      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100/80 space-y-4">
                        {profileFields.map((field) => (
                          <EditField key={field.key} icon={field.icon} label={t(field.labelKey)}
                            type={field.type} value={editForm[field.key] || ""}
                            placeholder={field.placeholder} options={field.options}
                            onChange={(val) => handleFormChange(field.key, val)} />
                        ))}
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button onClick={handleCancel} disabled={saving}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors active:scale-[0.98] disabled:opacity-50">
                          <XCircle size={18} />{t("profile.cancel")}
                        </button>
                        <button onClick={handleSave} disabled={saving}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-md hover:bg-blue-700 transition-colors active:scale-[0.98] disabled:opacity-70">
                          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                          {saving ? t("profile.saving") : t("profile.save")}
                        </button>
                      </div>
                    </motion.section>
                  ) : (
                    <motion.section key="view-mode" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                      {filledFields.length > 0 && (
                        <>
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-2">{t("profile.personalInfo")}</h3>
                          <div className="bg-white rounded-3xl p-1 shadow-sm border border-gray-100/80">
                            {filledFields.map((field, idx) => (
                              <div key={field.key}>
                                <InfoRow icon={field.icon} label={t(field.labelKey) || field.key}
                                  value={field.type === "checkbox" ? (user[field.key] ? t("common.yes", "Yes") : t("common.no", "No")) : (Array.isArray(user[field.key]) ? user[field.key].join(", ") : user[field.key])} />
                                {idx < filledFields.length - 1 && <div className="h-[1px] bg-gray-50 ml-14" />}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      {filledFields.length === 0 && user && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/80 text-center">
                          <p className="text-gray-400 text-sm">{t("profile.noProfileInfo")}</p>
                          <button onClick={() => setIsEditing(true)} className="mt-3 text-blue-600 font-semibold text-sm hover:underline">{t("profile.addDetails")}</button>
                        </div>
                      )}
                    </motion.section>
                  )}
                </AnimatePresence>
                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-2">{t("profile.appPreferences")}</h3>
                  <div className="bg-white rounded-3xl p-1 shadow-sm border border-gray-100/80">
                    <SelectRow icon={Globe} label={t("profile.language")} value={language} onChange={setLanguage}
                      options={[
                        { value: "bhojpuri", label: "भोजपुरी" }, { value: "en", label: "English" }, { value: "hindi", label: "हिन्दी" },
                        { value: "magar", label: "मगर" }, { value: "maithili", label: "मैथिली" }, { value: "ne", label: "नेपाली" },
                        { value: "newar", label: "नेपालभाषा" }, { value: "tamang", label: "तामाङ" }, { value: "tharu", label: "थारु" },
                        { value: "chinese", label: "中文" }, { value: "japanese", label: "日本語" }, { value: "korean", label: "한국어" },
                      ]} />
                    <div className="h-[1px] bg-gray-50 ml-14" />
                    <SelectRow icon={Type} label={t("profile.fontSize")} value={fontSize} onChange={setFontSize}
                      options={[
                        { value: "sm", label: t("profile.fontSizeSmall") }, { value: "base", label: t("profile.fontSizeDefault") },
                        { value: "lg", label: t("profile.fontSizeLarge") }, { value: "xl", label: t("profile.fontSizeExtraLarge") },
                      ]} />
                    <div className="h-[1px] bg-gray-50 ml-14" />
                    <SelectRow icon={Settings} label={t("profile.fontFamily")} value={fontFamily} onChange={setFontFamily}
                      options={[
                        { value: "inter", label: t("profile.fontInter") }, { value: "poppins", label: t("profile.fontPoppins") },
                        { value: "montserrat", label: t("profile.fontMontserrat") }, { value: "roboto", label: t("profile.fontRoboto") },
                        { value: "outfit", label: t("profile.fontOutfit") }, { value: "mukta", label: t("profile.fontMukta") },
                        { value: "yantramanav", label: t("profile.fontYantramanav") }, { value: "khand", label: t("profile.fontKhand") },
                        { value: "kalam", label: t("profile.fontKalam") }, { value: "laila", label: t("profile.fontLaila") },
                        { value: "arial", label: "Arial" }, { value: "sans", label: "System Sans" },
                        { value: "serif", label: "System Serif" }, { value: "mono", label: "Monospace" },
                      ]} />
                    <div className="h-[1px] bg-gray-50 ml-14" />
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                          {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{t("profile.theme")}</span>
                      </div>
                      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                        aria-label={t("profile.toggleTheme")}
                        className={`w-12 h-6 rounded-full transition-colors relative ${theme === "dark" ? "bg-purple-500" : "bg-gray-300"}`}>
                        <motion.div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"
                          animate={{ x: theme === "dark" ? 24 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                      </button>
                    </div>
                    <div className="h-[1px] bg-gray-50 ml-14" />
                    <PushToggleRow />
                  </div>
                </section>
                <section className="space-y-3 pt-2 pb-6">
                  {user?.role === "admin" && (
                    <button onClick={() => { onClose(); navigate("/admin"); }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-50 text-indigo-700 font-bold rounded-2xl hover:bg-indigo-100 transition-colors active:scale-[0.98]">
                      <ShieldCheck size={20} />{t("profile.adminDashboard")}
                    </button>
                  )}
                  {user ? (
                    <button onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors active:scale-[0.98]">
                      <LogOut size={20} />{t("auth.logout")}
                    </button>
                  ) : (
                    <button onClick={() => { onClose(); navigate("/welcome"); }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white font-bold rounded-2xl shadow-md hover:bg-blue-700 transition-colors active:scale-[0.98]">
                      {t("auth.login")}
                    </button>
                  )}
                </section>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center p-3 gap-3">
    <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
      <Icon size={18} />
    </div>
    <div className="flex flex-col flex-1 min-w-0">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-gray-800 truncate">{value}</span>
    </div>
  </div>
);

const EditField = ({ icon: Icon, label, type, value, placeholder, options, onChange }) => {
  const { t } = useTranslation();
  const genderLabelMap = { Male: "profile.male", Female: "profile.female", Other: "profile.other" };
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 mt-1 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
        <Icon size={18} />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label || "Field"}</label>
        {type === "checkbox" ? (
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)}
            className="w-5 h-5 accent-blue-600 rounded cursor-pointer mt-1" />
        ) : type === "select" ? (
          <select value={value} onChange={(e) => onChange(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition">
            <option value="">{t("profile.selectOption")}</option>
            {options.map((opt) => <option key={opt} value={opt}>{t(genderLabelMap[opt] || opt)}</option>)}
          </select>
        ) : (
          <input type={type} value={value} placeholder={t(placeholder)} onChange={(e) => onChange(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition" />
        )}
      </div>
    </div>
  );
};

const SelectRow = ({ icon: Icon, label, value, onChange, options }) => (
  <div className="flex items-center justify-between p-3 gap-3">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
        <Icon size={18} />
      </div>
      <span className="text-sm font-semibold text-gray-700">{label}</span>
    </div>
    <select className="bg-transparent text-sm font-medium text-gray-500 text-right focus:outline-none cursor-pointer"
      value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
      {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

export default ProfileDrawer;