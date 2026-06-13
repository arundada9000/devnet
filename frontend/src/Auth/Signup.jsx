import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuth from "../../stores/useAuth";
import useRegistration from "../../stores/useRegistration";

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(null);
  const setStepData = useRegistration((state) => state.setStepData);

  const login = useAuth((state) => state.login);

  const handleSignup = () => {
    setError("");
    setStatus(null);

    const nameValid = /^[A-Za-z\s]{3,}$/.test(name.trim());
    const phoneValid = /^[0-9]{10}$/.test(phone);
    const passwordValid = password.length >= 8;
    const passwordsMatch = password === confirmPassword;

    if (!nameValid) return setError(t("register.invalidName"));
    if (!phoneValid) return setError(t("register.invalidPhone"));
    if (!passwordValid) return setError(t("register.shortPassword"));
    if (!passwordsMatch) return setError(t("register.passwordMismatch"));

    const fullPhone = "+977" + phone;

    // ✅ BACKEND INTEGRATION PLACE
    login({ name, phone: fullPhone });
    if (!nameValid || !phoneValid || !passwordValid || !passwordsMatch) return;
    // ✅ Store temporary data in Zustand and move to OTP screen
    setStatus("success");
     
    navigate("/verify-otp");
  };

  return (
    <div className="min-h-screen bg-white px-6 pt-4 pb-8 relative flex flex-col">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        aria-label={t("register.back")}
        className="absolute top-4 left-4 p-2"
      >
        <img
          src="/icons/back.png"
          alt="Back"
          className="w-10 h-10 object-contain cursor-pointer hover:scale-110 transition-transform duration-200"
        />
      </button>

      {/* Form */}
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        {/* Header */}
        <div className="pt-4 pb-4 text-center mt-2">
          <h1 className="text-xl font-bold text-gray-800">
            {t("register.title", "Create an account")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("register.subtitle", "Welcome! Please enter your details")}
          </p>
        </div>
        <div className="w-full max-w-xs space-y-4 text-left">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              aria-label="Full Name"
              className="w-full border rounded-full px-4 py-2 text-sm mt-1"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </label>
            <div className="flex items-center border rounded-full px-3 py-2 mt-1">
              <span className="text-sm text-gray-600 mr-2">+977</span>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9800000000"
                aria-label="Phone Number"
                className="flex-1 outline-none text-sm"
                maxLength={10}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="flex items-center border rounded-full px-3 py-2 mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="flex-1 outline-none text-sm"
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 text-sm cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full border rounded-full px-4 py-2 text-sm mt-1"
              aria-label="Confirm Password"
            />
          </div>

          {/* Validation Message */}
          <p className="text-xs text-gray-500">
            ✅ Password must be at least 8 characters
          </p>

          {/* Error */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Signup Button */}
          <button
            onClick={handleSignup}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold mt-2 hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
            aria-label={t("register.signup", "Sign Up")}
          >
            {t("register.signup", "Sign Up")}
          </button>

          {/* Success */}
          {status === "success" && (
            <p className="text-green-600 text-sm mt-2">
              {t("register.success", "Account created! Redirecting...")}
            </p>
          )}
        </div>
      </div>

      {/* Already have account */}
      <p className="text-sm text-center mt-auto">
        {t("register.haveAccount", "Already have an account?") + " "}
        <span
          className="text-blue-600 font-semibold cursor-pointer"
          onClick={() => navigate("/signin")}
        >
          {t("register.login")}
        </span>
      </p>
    </div>
  );
};

export default Register;
