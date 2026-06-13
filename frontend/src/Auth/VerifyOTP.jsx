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
      setTimeout(() => navigate("/signup"), 500);
    }
  }, [stepData, verified, navigate]);

  if (!stepData) return null;

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

    setVerified(true); // <- prevent redirect
    login({ name: stepData.name, phone: stepData.phone });
    clearStepData();
    navigate("/dashboard/home");
  };

  const handleResend = () => {
    // Simulate resend
    alert("OTP resent to " + stepData.phone);
  };

  return (
    <div className="min-h-screen bg-white px-6 pt-4 pb-10 flex flex-col relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        aria-label={t("otp.back")}
        className="absolute top-4 left-4 p-2"
      >
        <img
          src="/icons/back.png"
          alt="Back"
          className="w-10 h-10 object-contain cursor-pointer hover:scale-110 transition-transform duration-200"
        />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-2">
          {t("otp.title", "Phone number Verification")}
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          {t("otp.subtitle", "Enter the 6-digit code sent to your phone")}
        </p>

        {/* OTP Inputs */}
        <div className="flex gap-2 justify-center mb-4">
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
              className="w-10 h-12 border rounded text-center text-lg font-medium"
              aria-label={`Digit ${idx + 1}`}
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

        <button
          onClick={handleVerify}
          className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold mb-3"
        >
          {t("otp.verify", "Verify & Continue")}
        </button>

        <p className="text-sm text-gray-600">
          {t("otp.resendText", "Didn't receive the code?")}&nbsp;
          <span
            onClick={handleResend}
            className="text-blue-600 cursor-pointer underline"
          >
            {t("otp.resend", "Send again")}
          </span>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
