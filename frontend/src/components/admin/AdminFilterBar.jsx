import { Search, MapPin, X } from "lucide-react";
import useAdminLocationStore from "../../stores/useAdminLocationStore";
import { useTranslation } from "react-i18next";

export default function AdminFilterBar({ search = "", onSearchChange, searchPlaceholder = "Search...", locationFilter = "", onLocationChange, filters = [], onClearAll }) {
  const { t } = useTranslation();
  const { availableLocations } = useAdminLocationStore();
  const hasActiveFilters = search || locationFilter || filters.some((f) => f.value !== "" && f.value !== undefined);

  return (
    <div className="bg-white/70 backdrop-blur-lg border border-gray-200 shadow-sm rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{t("adminFilter.search")}</label>
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <Search size={16} className="text-gray-400 mr-2 shrink-0" />
          <input type="text" value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder={searchPlaceholder} className="outline-none text-sm bg-transparent w-full" />
        </div>
      </div>
      {onLocationChange && (
        <div className="min-w-[180px]">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"><span className="inline-flex items-center gap-1"><MapPin size={12} /> Location</span></label>
          <select value={locationFilter} onChange={(e) => onLocationChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition">
            <option value="">{t("adminFilter.allLocations")}</option>
            {availableLocations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>
      )}
      {filters.map((filter) => (
        <div key={filter.label} className="min-w-[160px]">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{filter.label}</label>
          <select value={filter.value} onChange={(e) => filter.onChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm capitalize focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition">
            <option value="">{t("adminFilter.all")}</option>
            {filter.options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      ))}
      {hasActiveFilters && onClearAll && (
        <button onClick={onClearAll} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition self-end">
          <X size={14} />{t("adminFilter.clear")}
        </button>
      )}
    </div>
  );
}