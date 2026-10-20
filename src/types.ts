export interface LogEntry {
  id: string;
  timestamp: string;
  model: string;
  status: 200 | 429 | 500;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  cost_usd: number;
}

export interface Filters {
  model: string | null;
  status: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}

export interface Summary {
  totalRequests: number;
  errorRate: number;
  avgLatency: number;
  totalCost: number;
}

export type SortField = "timestamp" | "latency_ms" | "cost_usd";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}
