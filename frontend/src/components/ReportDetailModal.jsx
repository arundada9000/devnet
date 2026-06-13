import React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const ReportDetailModal = ({ report, onClose }) => {
  const { t } = useTranslation();
  if (!report) return null;
  const [status, setStatus] = useState(report.status);

  const statusOptions = [t("reportDetail.status"), t("reportDetail.inProgress"), t("reportDetail.rejected"), t("reportDetail.resolved")];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center font-sans">
      <div className="bg-white w-full max-w-md mx-2 rounded-xl p-5 overflow-y-auto max-h-[90vh] shadow-xl space-y-4">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900">{t("reportDetail.reportDetails")}</h2>

        {/* Report Summary Section */}
        <div className="flex border-2 border-blue-500 rounded-md p-4">
          {/* Left: Icon + Title */}
          <div className="flex gap-3 items-start">
            <img
              src={report.icon || "https://via.placeholder.com/40"}
              alt="Issue Icon"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="font-semibold text-gray-800 flex items-center gap-1">
                {report.title}
                <span className="ml-1 w-2 h-2 rounded-full bg-yellow-400 inline-block" />
              </div>
              <div className="text-sm text-gray-600">
                {" "}
                {report.location?.coordinates
                  ? `Lat: ${report.location.coordinates[1].toFixed(
                      4
                    )}, Lng: ${report.location.coordinates[0].toFixed(4)}`
                  : t("reportDetail.locationNotAvailable")}
              </div>

              <div className="flex gap-2 mt-2 text-xs">
                <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-700">
                  #{report.id}
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-700">
                  {report.timeAgo}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Reporter Info */}
          <div className="text-sm text-right leading-relaxed">
            <div className="font-semibold underline text-gray-700 mb-1">
              {t("reportDetail.reportedBy")}
            </div>
            <div>
              <b>{t("reportDetail.name")}:</b> {report.reporter?.name}
            </div>
            <div>
              <b>{t("reportDetail.phone")}:</b> {report.reporter?.phone}
            </div>
            <div>
              <b>{t("reportDetail.date")}:</b> {report.date}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="font-semibold text-gray-800 mb-1">{t("reportDetail.description")}</div>
          <div className="border-2 border-blue-500 rounded-md p-3 text-sm text-gray-700">
            {report.description}
          </div>
        </div>

        {/* Attachments */}
        <div>
          <div className="font-semibold text-gray-800 mb-1">{t("reportDetail.attachments")}</div>
          <div className="border-2 border-blue-500 rounded-md p-3 space-y-2">
            {report.attachments?.photo && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">realtime_img.jpg</span>
                <button className="bg-gray-200 text-sm px-4 py-1 rounded-full text-gray-700 hover:bg-gray-300">
                  View
                </button>
              </div>
            )}
            {report.attachments?.audio && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">
                  realtime_audio.mp3
                </span>
                <button className="bg-gray-200 text-sm px-4 py-1 rounded-full text-gray-700 hover:bg-gray-300">
                  View
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Real Time Location */}
        {report.mapImage && (
          <div>
            <div className="font-semibold text-gray-800 mb-1">
              {t("reportDetail.realTimeLocation")}
            </div>
            <div className="border-2 border-blue-500 rounded-md p-1">
              <img
                src={report.mapImage}
                alt="Map"
                className="w-full h-32 object-cover rounded-md"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between pt-2">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-5 py-2 rounded-full text-sm hover:bg-gray-400"
          >
            {t("reportDetail.back")}
          </button>
          <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm hover:bg-blue-700">
            {t("reportDetail.status")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;
