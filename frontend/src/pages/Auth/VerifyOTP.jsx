import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useRegistration from "../../stores/useRegistration";
import useAuth from "../../stores/useAuth";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { stepData, clearStepData } = useRegistration();
  const login = useAuth((state) => state.login);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputsRef = useRef([]);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!stepData && !verified) {
    }
  }, [stepData, verified, navigate]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = () => {
    setError("");

    const code = otp.join("");
    if (code !== "123456") {
      setError(t("otp.invalid", "Invalid code. Please try again."));
      return;
    }

    setVerified(true);
    login({ name: stepData.name, phone: stepData.phone });
    clearStepData();
    navigate("/dashboard/home");
  };

  const handleResend = () => {
    alert(t("otp.resentTo", { phone: stepData.phone }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-6 pt-4 pb-10 flex flex-col relative">
      <button
        onClick={() => navigate(-1)}
        aria-label={t("otp.back")}
        className="absolute top-4 left-4 p-2"
      >
        <img
          src="/icons/back.png"
          alt={t("otp.backAlt")}
          className="w-8 h-8 object-contain cursor-pointer hover:scale-110 transition-transform duration-200"
        />
      </button>

      <div className="flex flex-1 justify-center items-center">
        <div className="flex flex-col items-center justify-center text-center bg-white shadow-2xl p-3 rounded-3xl">
          <div className="flex justify-center mt-8 mb-2">
            <img
              src="/assets/logo.png"
              alt={t("otp.logoAlt")}
              className="h-32 object-contain cursor-pointer transition-transform hover:scale-105 duration-200"
              onClick={() => navigate("/")}
            />
          </div>

          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            {t("otp.title", "Phone Number Verification")}
          </h1>
          <p className="text-sm text-gray-600 mb-6 max-w-xs">
            {t("otp.subtitle", "Enter the 6-digit code sent to your phone")}
          </p>

          <div className="flex gap-3 justify-center mb-4">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-12 h-14 border border-gray-300 rounded-xl text-center text-lg font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={t("otp.digitLabel", { digit: idx + 1 })}
              />
            ))}
          </div>

          {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

          <button
            onClick={handleVerify}
            className="w-full max-w-xs bg-blue-600 text-white py-3 rounded-xl font-semibold mt-2 hover:bg-blue-700 transition duration-200"
          >
            {t("otp.verify", "Verify & Continue")}
          </button>

          <p className="text-sm text-gray-600 mt-4">
            {t("otp.resendText", "Didn't receive the code?")}&nbsp;
            <span
              onClick={handleResend}
              className="text-blue-600 cursor-pointer font-medium underline"
            >
              {t("otp.resend", "Send again")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
