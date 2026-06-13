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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md">
        <h2 className="text-2xl font-semibold mb-4">
          {t("forgotPassword.title")}
        </h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            {t("forgotPassword.phoneLabel")}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("forgotPassword.phonePlaceholder")}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {t("forgotPassword.sendOtpButton")}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
