import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Welcome = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white relative px-6 pt-4 flex flex-col">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 p-2"
        aria-label="Go back"
      >
        <img
          src="/icons/back.png"
          alt="Back"
          className="w-10 h-10 object-contain cursor-pointer hover:scale-110 transition-transform duration-200"
        />
      </button>

      {/* Centered container */}
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <img
          src="/assets/logo.jpg"
          alt="Sajilo Sahayata"
          className="w-64 h-64 object-contain mb-6 hover:rotate-12 transition-all duration-500 cursor-pointer"
          onClick={() => navigate("/")}
        />

        <p className="text-lg font-medium text-gray-800 mb-10">
          {t("auth.tagline", "From alert to action — Instantly")}
        </p>

        <div className="w-full max-w-xs space-y-4">
          <button
            onClick={() => navigate("/signin")}
            className="w-full bg-blue-600 text-white py-3 rounded-full text-md font-semibold shadow cursor-pointer hover:bg-blue-700 transition-colors duration-200"
            aria-label={t("auth.login", "Login")}
          >
            {t("auth.login", "Login")}
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="w-full bg-red-500 text-white py-3 rounded-full text-md font-semibold shadow cursor-pointer hover:bg-red-600 transition-colors duration-200"
            aria-label={t("auth.register", "Register")}
          >
            {t("auth.register", "Register")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
