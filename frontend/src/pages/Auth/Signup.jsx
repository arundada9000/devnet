import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/axios";
import { motion } from "framer-motion";
import { Eye, EyeOff, ChevronLeft, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const nameInputRef = useRef(null);

  useEffect(() => {
    // Auto-focus full name input on mount
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const handleSignup = async (e) => {
    if (e) e.preventDefault();

    const nameValid = /^[A-Za-z\s]{3,}$/.test(name.trim());
    const phoneValid = /^(97|98)\d{8}$/.test(phone);
    const passwordValid = password.length >= 8;
    const passwordsMatch = password === confirmPassword;

    if (!nameValid) return toast.error(t("register.invalidName", "Please enter a valid full name (min 3 letters)."));
    if (!phoneValid) return toast.error(t("register.invalidPhone", "Please enter a valid 10-digit phone number."));
    if (!passwordValid) return toast.error(t("register.shortPassword", "Password must be at least 8 characters."));
    if (!passwordsMatch) return toast.error(t("register.passwordMismatch", "Passwords do not match."));

    setSubmitting(true);
    
    // Get user's current GPS coordinates for ga-pa detection
    let latitude = 0;
    let longitude = 0;
    try {
      // Loading toast for location
      toast.loading(t("register.detectingLocation", "Optimizing for your location..."), { id: "location-toast" });
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      toast.success(t("register.locationDetected", "Location optimized!"), { id: "location-toast" });
    } catch {
      // Location unavailable — backend will store "Unknown"
      toast.dismiss("location-toast");
    }

    try {
      await API.post("/auth/register", {
        username: name,
        phoneNumber: "+977" + phone,
        password,
        latitude,
        longitude,
      });

      toast.success(t("register.success", "Account created! Redirecting to login..."));
      setTimeout(() => navigate("/signin"), 1500);
    } catch (err) {
      console.error("Signup error", err);
      toast.error(err.response?.data?.message || t("register.genericError", "Something went wrong. Try again."));
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] px-6 py-8 flex flex-col items-center justify-center relative overflow-hidden">
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: '1rem', background: '#333', color: '#fff' } }} />

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        aria-label={t("register.back", "Go back")}
        className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-200/50 text-gray-700 transition active:scale-95 z-10"
      >
        <ChevronLeft size={28} strokeWidth={2.5} />
      </motion.button>

      {/* Decorative background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-red-100/50 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            className="text-3xl font-black text-gray-900 tracking-tight"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t("register.title", "Create an Account")}
          </motion.h1>
          <motion.p 
            className="text-sm font-medium text-gray-500 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t("register.subtitle", "Join Sajilo Sahayata to report emergencies securely.")}
          </motion.p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-bold text-gray-800 mb-1.5"
            >
              {t("register.name", "Full Name")}
            </label>
            <input
              id="name"
              type="text"
              ref={nameInputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("register.namePlaceholder", "e.g. John Doe")}
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 focus:ring-0 focus:border-blue-500 focus:bg-white text-base font-medium outline-none transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-bold text-gray-800 mb-1.5"
            >
              {t("register.phone", "Phone Number")}
            </label>
            <div className="flex items-center border-2 border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 focus-within:ring-0 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <span className="text-sm font-bold text-gray-500 mr-2">+977</span>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9800000000"
                maxLength={10}
                className="flex-1 outline-none text-base font-medium bg-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-gray-800 mb-1.5"
            >
              {t("register.password", "Password")}
            </label>
            <div className="flex items-center border-2 border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 focus-within:ring-0 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("register.passwordPlaceholder", "Min. 8 characters")}
                className="flex-1 outline-none text-base font-medium bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 ml-2"
                aria-label={showPassword ? t("register.hidePassword", "Hide password") : t("register.showPassword", "Show password")}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-bold text-gray-800 mb-1.5"
            >
              {t("register.confirmPassword", "Confirm Password")}
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("register.confirmPasswordPlaceholder", "Re-enter password")}
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 focus:ring-0 focus:border-blue-500 focus:bg-white text-base font-medium outline-none transition-all"
            />
          </div>

          {/* Sign Up Button */}
          <motion.button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-4 mt-2 rounded-2xl text-lg font-bold hover:bg-blue-700 disabled:opacity-70 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 className="animate-spin" size={22} /> {t("register.submitting", "Creating Account...")}</>
            ) : (
              t("register.signup", "Sign Up")
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <motion.p 
          className="text-sm font-medium text-center mt-8 text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {t("register.haveAccount", "Already have an account?") + " "}
          <span
            className="text-blue-600 font-bold cursor-pointer hover:underline hover:text-blue-700 transition-colors"
            onClick={() => navigate("/signin")}
          >
            {t("register.login", "Log in")}
          </span>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;
