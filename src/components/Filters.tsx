import { useSearchParams } from "react-router-dom";
import type { Filters as FiltersType } from "../types";

interface FiltersProps {
  models: string[];
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
}

export function Filters({ models, filters, onFiltersChange }: FiltersProps) {
  const [, setSearchParams] = useSearchParams();

  function updateFilter(key: keyof FiltersType, value: string | null) {
    const next = { ...filters, [key]: value || null };
    onFiltersChange(next);

    const params = new URLSearchParams();
    if (next.model) params.set("model", next.model);
    if (next.status) params.set("status", next.status);
    if (next.dateFrom) params.set("dateFrom", next.dateFrom);
    if (next.dateTo) params.set("dateTo", next.dateTo);
    setSearchParams(params, { replace: true });
  }

  function clearAll() {
    const empty: FiltersType = {
      model: null,
      status: null,
      dateFrom: null,
      dateTo: null,
    };
    onFiltersChange(empty);
    setSearchParams({}, { replace: true });
  }

  const hasFilters = filters.model || filters.status || filters.dateFrom || filters.dateTo;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Модель
          </label>
          <select
            value={filters.model || ""}
            onChange={(e) => updateFilter("model", e.target.value)}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm"
          >
            <option value="">Все</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Статус
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm"
          >
            <option value="">Все</option>
            <option value="200">200 OK</option>
            <option value="429">429 Rate Limited</option>
            <option value="500">500 Error</option>
          </select>
        </div>

        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            С даты
          </label>
          <input
            type="date"
            value={filters.dateFrom || ""}
            onChange={(e) => updateFilter("dateFrom", e.target.value)}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm"
          />
        </div>

        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            По дату
          </label>
          <input
            type="date"
            value={filters.dateTo || ""}
            onChange={(e) => updateFilter("dateTo", e.target.value)}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-sm"
          />
        </div>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          >
            Сбросить
          </button>
        )}
      </div>
    </div>
  );
}
