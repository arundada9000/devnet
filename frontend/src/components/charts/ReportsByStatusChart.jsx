import { Pie } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ReportsByStatusChart({ data }) {
  const { t } = useTranslation();
  const statusCounts = {
    pending: 0,
    verified: 0,
    working: 0,
    solved: 0,
  };

  data.forEach((report) => {
    const status = report.status || "pending";
    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    }
  });

  const chartData = {
    labels: [t("charts.pending"), t("charts.verified"), t("charts.working"), t("charts.solved")],
    datasets: [
      {
        label: t("charts.reportsByStatus"),
        data: [
          statusCounts.pending,
          statusCounts.verified,
          statusCounts.working,
          statusCounts.solved,
        ],
        backgroundColor: [
          "#facc15", // yellow
          "#3b82f6", // blue
          "#a855f7", // purple
          "#22c55e", // green
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full max-w-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        {t("charts.reportsByStatus")}
      </h2>
      <Pie data={chartData} />
    </div>
  );
}
