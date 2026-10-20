import type { LogEntry, Summary } from "../types";

export function calculateSummary(entries: LogEntry[]): Summary {
  if (entries.length === 0) {
    return {
      totalRequests: 0,
      errorRate: 0,
      avgLatency: 0,
      totalCost: 0,
    };
  }

  const totalRequests = entries.length;
  const errors = entries.filter((e) => e.status !== 200).length;
  const errorRate = errors / totalRequests;
  const avgLatency =
    entries.reduce((sum, e) => sum + e.latency_ms, 0) / totalRequests;
  const totalCost = entries.reduce((sum, e) => sum + e.cost_usd, 0);

  return {
    totalRequests,
    errorRate,
    avgLatency,
    totalCost,
  };
}
