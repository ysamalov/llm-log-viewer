import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useLogData } from "./hooks/useLogData";
import { SummaryCards } from "./components/SummaryCards";
import { Filters } from "./components/Filters";
import { LogTable } from "./components/LogTable";
import { LatencyChart } from "./components/LatencyChart";
import { filterLogs, sortLogs, paginateLogs, getUniqueModels } from "./utils/filters";
import { calculateSummary } from "./utils/calculations";
import type { Filters as FiltersType, SortConfig } from "./types";

const PAGE_SIZE = 20;

function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Переключить тему"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}

export default function App() {
  const [searchParams] = useSearchParams();
  const { data, isLoading, isError, error } = useLogData();

  const [filters, setFilters] = useState<FiltersType>(() => ({
    model: searchParams.get("model"),
    status: searchParams.get("status"),
    dateFrom: searchParams.get("dateFrom"),
    dateTo: searchParams.get("dateTo"),
  }));

  const [sort, setSort] = useState<SortConfig>({
    field: "timestamp",
    direction: "desc",
  });

  const [page, setPage] = useState(1);

  // Reset page when filters change
  const handleFiltersChange = useCallback((next: FiltersType) => {
    setFilters(next);
    setPage(1);
  }, []);

  // Init theme from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
      }
    } catch {
      // ignore
    }
  }, []);

  const allEntries = data || [];
  const models = useMemo(() => getUniqueModels(allEntries), [allEntries]);
  const filtered = useMemo(() => filterLogs(allEntries, filters), [allEntries, filters]);
  const sorted = useMemo(() => sortLogs(filtered, sort), [filtered, sort]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageEntries = useMemo(() => paginateLogs(sorted, page, PAGE_SIZE), [sorted, page]);
  const summary = useMemo(() => calculateSummary(filtered), [filtered]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Загрузка данных…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-1">
            Ошибка загрузки
          </p>
          <p className="text-sm text-red-500 dark:text-red-300">
            {error?.message || "Неизвестная ошибка"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">
          Журнал запросов к LLM
        </h1>
        <ThemeToggle />
      </div>

      <div className="space-y-4">
        <SummaryCards summary={summary} />
        <Filters
          models={models}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
        <LatencyChart entries={filtered} />
        <LogTable
          entries={pageEntries}
          sort={sort}
          onSortChange={(s) => {
            setSort(s);
            setPage(1);
          }}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
