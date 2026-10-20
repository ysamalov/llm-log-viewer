import { describe, it, expect } from "vitest";
import { filterLogs, sortLogs, paginateLogs, getUniqueModels } from "../utils/filters";
import type { LogEntry, Filters, SortConfig } from "../types";

function makeEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    id: "req_00001",
    timestamp: "2024-06-15T12:00:00.000Z",
    model: "gpt-4",
    status: 200,
    input_tokens: 100,
    output_tokens: 50,
    latency_ms: 500,
    cost_usd: 0.006,
    ...overrides,
  };
}

const emptyFilters: Filters = {
  model: null,
  status: null,
  dateFrom: null,
  dateTo: null,
};

describe("filterLogs", () => {
  const entries: LogEntry[] = [
    makeEntry({ id: "1", model: "gpt-4", status: 200, timestamp: "2024-06-10T10:00:00Z" }),
    makeEntry({ id: "2", model: "gpt-3.5-turbo", status: 429, timestamp: "2024-06-12T10:00:00Z" }),
    makeEntry({ id: "3", model: "claude-3-opus", status: 500, timestamp: "2024-06-14T10:00:00Z" }),
    makeEntry({ id: "4", model: "gpt-4", status: 200, timestamp: "2024-06-16T10:00:00Z" }),
    makeEntry({ id: "5", model: "claude-3-sonnet", status: 200, timestamp: "2024-06-18T10:00:00Z" }),
  ];

  it("returns all entries with empty filters", () => {
    const result = filterLogs(entries, emptyFilters);
    expect(result).toHaveLength(5);
  });

  it("filters by model", () => {
    const result = filterLogs(entries, { ...emptyFilters, model: "gpt-4" });
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.model === "gpt-4")).toBe(true);
  });

  it("filters by status", () => {
    const result = filterLogs(entries, { ...emptyFilters, status: "429" });
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe(429);
  });

  it("filters by dateFrom", () => {
    const result = filterLogs(entries, { ...emptyFilters, dateFrom: "2024-06-14" });
    expect(result).toHaveLength(3);
  });

  it("filters by dateTo", () => {
    const result = filterLogs(entries, { ...emptyFilters, dateTo: "2024-06-12" });
    expect(result).toHaveLength(2);
  });

  it("filters by date range", () => {
    const result = filterLogs(entries, {
      ...emptyFilters,
      dateFrom: "2024-06-12",
      dateTo: "2024-06-16",
    });
    expect(result).toHaveLength(3);
  });

  it("combines model and status filters", () => {
    const result = filterLogs(entries, {
      ...emptyFilters,
      model: "gpt-4",
      status: "200",
    });
    expect(result).toHaveLength(2);
  });

  it("returns empty array when nothing matches", () => {
    const result = filterLogs(entries, {
      ...emptyFilters,
      model: "nonexistent-model",
    });
    expect(result).toHaveLength(0);
  });

  it("handles empty entries array", () => {
    const result = filterLogs([], emptyFilters);
    expect(result).toHaveLength(0);
  });
});

describe("sortLogs", () => {
  const entries: LogEntry[] = [
    makeEntry({ id: "1", timestamp: "2024-06-10T10:00:00Z", latency_ms: 300, cost_usd: 0.01 }),
    makeEntry({ id: "2", timestamp: "2024-06-15T10:00:00Z", latency_ms: 100, cost_usd: 0.05 }),
    makeEntry({ id: "3", timestamp: "2024-06-12T10:00:00Z", latency_ms: 500, cost_usd: 0.02 }),
  ];

  it("sorts by timestamp ascending", () => {
    const result = sortLogs(entries, { field: "timestamp", direction: "asc" });
    expect(result[0].id).toBe("1");
    expect(result[2].id).toBe("2");
  });

  it("sorts by timestamp descending", () => {
    const result = sortLogs(entries, { field: "timestamp", direction: "desc" });
    expect(result[0].id).toBe("2");
    expect(result[2].id).toBe("1");
  });

  it("sorts by latency ascending", () => {
    const result = sortLogs(entries, { field: "latency_ms", direction: "asc" });
    expect(result[0].latency_ms).toBe(100);
    expect(result[2].latency_ms).toBe(500);
  });

  it("sorts by cost descending", () => {
    const result = sortLogs(entries, { field: "cost_usd", direction: "desc" });
    expect(result[0].cost_usd).toBe(0.05);
    expect(result[2].cost_usd).toBe(0.01);
  });

  it("does not mutate original array", () => {
    const original = [...entries];
    sortLogs(entries, { field: "latency_ms", direction: "asc" });
    expect(entries.map((e) => e.id)).toEqual(original.map((e) => e.id));
  });
});

describe("paginateLogs", () => {
  const entries = Array.from({ length: 55 }, (_, i) =>
    makeEntry({ id: `req_${i}` })
  );

  it("returns correct page size", () => {
    expect(paginateLogs(entries, 1, 20)).toHaveLength(20);
  });

  it("returns correct last page", () => {
    expect(paginateLogs(entries, 3, 20)).toHaveLength(15);
  });

  it("returns empty for out-of-range page", () => {
    expect(paginateLogs(entries, 10, 20)).toHaveLength(0);
  });

  it("returns all items when page size exceeds total", () => {
    expect(paginateLogs(entries, 1, 100)).toHaveLength(55);
  });
});

describe("getUniqueModels", () => {
  it("returns sorted unique models", () => {
    const entries = [
      makeEntry({ model: "gpt-4" }),
      makeEntry({ model: "claude-3-opus" }),
      makeEntry({ model: "gpt-4" }),
      makeEntry({ model: "gpt-3.5-turbo" }),
    ];
    expect(getUniqueModels(entries)).toEqual([
      "claude-3-opus",
      "gpt-3.5-turbo",
      "gpt-4",
    ]);
  });

  it("returns empty for empty input", () => {
    expect(getUniqueModels([])).toEqual([]);
  });
});
