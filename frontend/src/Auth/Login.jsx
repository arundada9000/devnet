import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuth from "../../stores/useAuth";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(null);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const login = useAuth((state) => state.login);

  const handleLogin = () => {
    setError("");
    setStatus(null);

    const isValidPhone = /^[0-9]{10}$/.test(phone);
    const isValidPassword = password.length >= 6;

    if (!isValidPhone) return setError(t("login.invalidPhone"));
    if (!isValidPassword) return setError(t("login.invalidPassword"));

    const fullPhone = "+977" + phone;

    // ✅ BACKEND LOGIC PLACE
    if (phone === "9800000000" && password === "password123") {
      login({ phone: fullPhone, name: "Citizen User" });
      setStatus("success");
      setTimeout(() => navigate("/dashboard/home"), 1000);
    } else {
      setStatus("fail");
      setError(t("login.failed"));
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 pt-4 pb-8 relative flex flex-col">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        aria-label={t("login.back")}
        className="absolute top-4 left-4 p-2"
      >
        <img
          src="/icons/back.png"
          alt="Back"
          className="w-10 h-10 object-contain cursor-pointer hover:scale-110 transition-transform duration-200"
        />
      </button>

      {/* Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center text-center mt-10">
        <div className="pt-4 pb-2 text-center">
          <h1 className="text-xl font-semibold text-gray-800">
            {t("login.title", "Sign In")}
          </h1>
        </div>
        <div className="w-full max-w-xs space-y-4">
          {/* Phone */}
          <div className="text-left">
            <label htmlFor="phone" className="text-sm font-medium">
              {t("login.phoneLabel", "Username or Phone Number")}
            </label>
            <div className="flex items-center border rounded-full px-3 py-2 mt-1">
              <span className="text-sm text-gray-600 mr-2">+977</span>
              <input
                id="phone"
                type="tel"
                aria-label={t("login.phoneLabel")}
                placeholder="9800000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 outline-none text-sm"
                maxLength={10}
              />
            </div>
          </div>

          {/* Password */}
          <div className="text-left">
            <label htmlFor="password" className="text-sm font-medium">
              {t("login.passwordLabel", "Password")}
            </label>
            <div className="flex items-center border rounded-full px-3 py-2 mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                aria-label={t("login.passwordLabel")}
                placeholder={t(
                  "login.passwordPlaceholder",
                  "Enter your password"
                )}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 text-sm"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              {t("login.remember", "Remember for 30 days")}
            </label>
            <span
              onClick={() => navigate("/forgot-password")}
              className="text-blue-600 cursor-pointer"
            >
              {t("login.forgot", "Forgot password?")}
            </span>
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            aria-label={t("login.login")}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold mt-2"
          >
            {t("login.login", "Login")}
          </button>

          {/* Feedback */}
          {status === "success" && (
            <p className="text-green-600 text-sm mt-2">
              {t("login.success", "Login successful!")}
            </p>
          )}
          {status === "fail" && (
            <p className="text-red-500 text-sm mt-2">{t("login.failed")}</p>
          )}
        </div>
      </div>

      {/* Divider (no social) */}
      {/* Bottom: Register */}
      <p className="text-sm text-center mt-auto">
        {t("login.noAccount", "Don’t have an account?") + " "}
        <span
          className="text-red-600 font-semibold cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          {t("login.register")}
        </span>
      </p>
    </div>
  );
};

export default Login;
