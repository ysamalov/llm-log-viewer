import type { LogEntry, SortConfig, SortField } from "../types";

interface LogTableProps {
  entries: LogEntry[];
  sort: SortConfig;
  onSortChange: (sort: SortConfig) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function StatusBadge({ status }: { status: number }) {
  const styles: Record<number, string> = {
    200: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    429: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    500: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status] || ""}`}
    >
      {status}
    </span>
  );
}

function SortHeader({
  label,
  field,
  sort,
  onSortChange,
}: {
  label: string;
  field: SortField;
  sort: SortConfig;
  onSortChange: (sort: SortConfig) => void;
}) {
  const active = sort.field === field;
  function handleClick() {
    if (active) {
      onSortChange({
        field,
        direction: sort.direction === "asc" ? "desc" : "asc",
      });
    } else {
      onSortChange({ field, direction: "desc" });
    }
  }
  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
    >
      {label}
      {active && (
        <span className="text-xs">{sort.direction === "asc" ? "▲" : "▼"}</span>
      )}
    </button>
  );
}

export function LogTable({
  entries,
  sort,
  onSortChange,
  page,
  totalPages,
  onPageChange,
}: LogTableProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
        <p className="text-lg mb-1">Нет данных</p>
        <p className="text-sm">Попробуйте изменить фильтры</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
              <th className="px-4 py-3 font-medium">
                <SortHeader
                  label="Время"
                  field="timestamp"
                  sort={sort}
                  onSortChange={onSortChange}
                />
              </th>
              <th className="px-4 py-3 font-medium">Модель</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium text-right">Токены (вх/вых)</th>
              <th className="px-4 py-3 font-medium text-right">
                <SortHeader
                  label="Задержка"
                  field="latency_ms"
                  sort={sort}
                  onSortChange={onSortChange}
                />
              </th>
              <th className="px-4 py-3 font-medium text-right">
                <SortHeader
                  label="Стоимость"
                  field="cost_usd"
                  sort={sort}
                  onSortChange={onSortChange}
                />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-4 py-2.5 whitespace-nowrap text-gray-600 dark:text-gray-300">
                  {new Date(entry.timestamp).toLocaleString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap font-mono text-xs">
                  {entry.model}
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={entry.status} />
                </td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap text-gray-600 dark:text-gray-300">
                  {entry.input_tokens.toLocaleString()} / {entry.output_tokens.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  {entry.latency_ms.toLocaleString()} мс
                </td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  ${entry.cost_usd.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Страница {page} из {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
