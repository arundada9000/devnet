import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuth from "../../stores/useAuth";
import API from "../../api/axios";
import { motion } from "framer-motion";
import { Eye, EyeOff, ChevronLeft, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const phoneInputRef = useRef(null);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const login = useAuth((state) => state.login);

  useEffect(() => {
    if (phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    const fullPhone = "+977" + phone;
    const isValidPhone = /^[0-9]{10}$/.test(phone);
    const isValidPassword = password.length >= 6;

    if (!isValidPhone) return toast.error(t("login.invalidPhone", "Invalid phone number"));
    if (!isValidPassword) return toast.error(t("login.shortPassword", "Password too short"));

    try {
      setSubmitting(true);
      const res = await API.post("/auth/login", {
        phone: fullPhone,
        password,
      });

      const { user, token } = res.data;

      login(user, token);
      toast.success(t("login.success", "Login successful!"));

      setTimeout(() => navigate("/dashboard/home"), 800);
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || t("login.failed", "Login failed. Check phone or password."));
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] px-6 py-8 relative flex flex-col overflow-hidden">
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: '1rem', background: '#333', color: '#fff' } }} />

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        aria-label={t("login.back", "Go back")}
        className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-200/50 text-gray-700 transition active:scale-95 z-10"
      >
        <ChevronLeft size={28} strokeWidth={2.5} />
      </motion.button>

      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col items-center justify-center mt-10 relative z-10">
        <motion.img
          src="/assets/logo.png"
          alt="Logo"
          className="h-16 mb-4 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate("/")}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring" }}
        />
        <motion.h1
          className="text-3xl font-black text-gray-900 tracking-tight"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {t("login.title", "Welcome Back")}
        </motion.h1>
        <motion.p
          className="text-sm font-medium text-gray-500 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t("login.subtitle", "Sign in to continue to Sajilo Sahayata.")}
        </motion.p>
      </div>

      <motion.form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white mt-8 p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 mx-auto space-y-6 text-left relative z-10 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-bold text-gray-800 mb-1.5"
          >
            {t("login.phoneLabel", "Phone Number")}
          </label>
          <div className="flex items-center border-2 border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 focus-within:ring-0 focus-within:border-blue-500 focus-within:bg-white transition-all">
            <span className="text-sm font-bold text-gray-500 mr-2">+977</span>
            <input
              id="phone"
              type="tel"
              ref={phoneInputRef}
              aria-label={t("login.phoneLabel")}
              placeholder="9800000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 outline-none text-base font-medium bg-transparent"
              maxLength={10}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-bold text-gray-800 mb-1.5"
          >
            {t("login.passwordLabel", "Password")}
          </label>
          <div className="flex items-center border-2 border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 focus-within:ring-0 focus-within:border-blue-500 focus-within:bg-white transition-all">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              aria-label={t("login.passwordLabel")}
              placeholder={t("login.passwordPlaceholder", "Enter your password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 outline-none text-base font-medium bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label={showPassword ? t("login.hidePassword", "Hide password") : t("login.showPassword", "Show password")}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm font-medium text-gray-600">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="group-hover:text-gray-800 transition-colors">{t("login.remember", "Remember me")}</span>
          </label>
          <span
            onClick={() => navigate("/forgot-password")}
            className="text-blue-600 cursor-pointer hover:text-blue-700 hover:underline transition-colors font-bold"
          >
            {t("login.forgot", "Forgot password?")}
          </span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl text-lg font-bold hover:bg-blue-700 disabled:opacity-70 shadow-lg shadow-blue-200 transition-all active:scale-95 flex justify-center items-center gap-2"
        >
          {submitting ? (
            <><Loader2 className="animate-spin" size={22} /> {t("login.submitting", "Signing in...")}</>
          ) : (
            t("login.login", "Sign In")
          )}
        </button>
      </motion.form>

      <motion.p
        className="text-sm font-medium text-center mt-8 text-gray-600 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {t("login.noAccount", "Don't have an account?") + " "}
        <span
          className="text-red-500 font-bold cursor-pointer hover:underline hover:text-red-600 transition-colors"
          onClick={() => navigate("/signup")}
        >
          {t("login.register", "Create one now")}
        </span>
      </motion.p>
    </div>
  );
};

export default Login;
