import { useTranslation } from "react-i18next";

const statusColors = {
  status: "bg-blue-500",
  "in progress": "bg-yellow-500",
  resolved: "bg-green-500",
  rejected: "bg-red-500",
};

const ReportCard = ({ title, location, id, time, status, icon, onView }) => {
  const { t } = useTranslation();
  const latitude = location?.coordinates?.[1];
  const longitude = location?.coordinates?.[0];

  return (
    <div className="flex items-center justify-between border-2 border-[#155ac1] rounded-lg p-3 shadow m-3 bg-white">
      <div className="flex items-start">
        <img src={icon} alt={title} className="w-8 h-8 mr-3" />
        <div>
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs text-gray-600">
            {latitude && longitude
              ? `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
              : t("reportCard.locationNotAvailable")}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-[10px] text-gray-400">#{id}</span>
            <span className="text-[10px] text-gray-500">{time}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end space-y-2">
        <span
          className={`text-white text-xs px-2 py-[2px] rounded-full capitalize ${
            statusColors[status.toLowerCase()]
          }`}
        >
          {status}
        </span>
        <button
          onClick={onView}
          className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
        >
          {t("reportCard.viewReports")}
        </button>
      </div>
    </div>
  );
};

export default ReportCard;
