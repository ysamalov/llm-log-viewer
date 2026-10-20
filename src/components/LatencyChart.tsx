import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { LogEntry } from "../types";

interface LatencyChartProps {
  entries: LogEntry[];
}

const MODEL_COLORS: Record<string, string> = {
  "gpt-4": "#10b981",
  "gpt-3.5-turbo": "#3b82f6",
  "claude-3-opus": "#f59e0b",
  "claude-3-sonnet": "#8b5cf6",
};

interface ChartPoint {
  date: string;
  [model: string]: number | string;
}

export function LatencyChart({ entries }: LatencyChartProps) {
  if (entries.length === 0) {
    return null;
  }

  // Group entries by date and model, compute average latency
  const grouped = new Map<string, Map<string, number[]>>();

  for (const entry of entries) {
    const date = entry.timestamp.slice(0, 10); // YYYY-MM-DD
    if (!grouped.has(date)) {
      grouped.set(date, new Map());
    }
    const dateMap = grouped.get(date)!;
    if (!dateMap.has(entry.model)) {
      dateMap.set(entry.model, []);
    }
    dateMap.get(entry.model)!.push(entry.latency_ms);
  }

  const models = [...new Set(entries.map((e) => e.model))].sort();

  const data: ChartPoint[] = [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, modelMap]) => {
      const point: ChartPoint = {
        date: new Date(date).toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
        }),
      };
      for (const model of models) {
        const vals = modelMap.get(model);
        if (vals && vals.length > 0) {
          point[model] = Math.round(
            vals.reduce((s, v) => s + v, 0) / vals.length
          );
        }
      }
      return point;
    });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
        Средняя задержка по дням (мс)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--tooltip-bg, #fff)",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          />
          <Legend />
          {models.map((model) => (
            <Line
              key={model}
              type="monotone"
              dataKey={model}
              stroke={MODEL_COLORS[model] || "#6b7280"}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
