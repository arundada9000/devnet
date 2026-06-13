import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone) {
      setMessage(t("forgotPassword.enterPhone"));
      return;
    }

    try {
      // TODO: Replace with real OTP logic
      console.log(`Sending OTP to phone number: ${phone}`);
      setMessage(t("forgotPassword.otpSent"));

      setTimeout(() => {
        navigate("/verify-otp");
      }, 1500);
    } catch (error) {
      setMessage(t("forgotPassword.otpFailed"));
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-6 pt-4 pb-10 flex flex-col relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        aria-label={t("forgotPassword.back")}
        className="absolute top-4 left-4 p-2"
      >
        <img
          src="/icons/back.png"
          alt="Back"
          className="w-8 h-8 object-contain cursor-pointer hover:scale-110 transition-transform duration-200"
        />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center bg-white p-10 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mt-8 mb-2">
            <img
              src="/assets/logo.png"
              alt="Logo"
              className="h-32 object-contain cursor-pointer transition-transform hover:scale-105 duration-200"
              onClick={() => navigate("/")}
            />
          </div>

          {/* Heading */}
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {t("forgotPassword.title", "Forgot Password")}
          </h2>
          <p className="text-sm text-gray-600 mb-6 max-w-xs">
            {t(
              "forgotPassword.subtitle",
              "Enter your phone number to receive an OTP"
            )}
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xs space-y-4 text-left"
          >
            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="text-sm font-medium block mb-1">
                {t("forgotPassword.phoneLabel", "Phone Number")}
              </label>
              <div className="flex items-center border rounded-full px-3 py-2">
                <span className="text-sm text-gray-600 mr-2">+977</span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t(
                    "forgotPassword.phonePlaceholder",
                    "9800000000"
                  )}
                  className="flex-1 outline-none text-sm"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition duration-200"
            >
              {t("forgotPassword.sendOtpButton", "Send OTP")}
            </button>
          </form>

          {/* Feedback */}
          {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
