import { describe, it, expect } from "vitest";
import { calculateSummary } from "../utils/calculations";
import type { LogEntry } from "../types";

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

describe("calculateSummary", () => {
  it("returns zeros for empty array", () => {
    const summary = calculateSummary([]);
    expect(summary.totalRequests).toBe(0);
    expect(summary.errorRate).toBe(0);
    expect(summary.avgLatency).toBe(0);
    expect(summary.totalCost).toBe(0);
  });

  it("calculates correct totals for single entry", () => {
    const entries = [makeEntry({ latency_ms: 300, cost_usd: 0.01 })];
    const summary = calculateSummary(entries);
    expect(summary.totalRequests).toBe(1);
    expect(summary.errorRate).toBe(0);
    expect(summary.avgLatency).toBe(300);
    expect(summary.totalCost).toBeCloseTo(0.01);
  });

  it("calculates error rate correctly", () => {
    const entries = [
      makeEntry({ status: 200 }),
      makeEntry({ status: 200 }),
      makeEntry({ status: 429 }),
      makeEntry({ status: 500 }),
    ];
    const summary = calculateSummary(entries);
    expect(summary.totalRequests).toBe(4);
    expect(summary.errorRate).toBe(0.5);
  });

  it("calculates average latency correctly", () => {
    const entries = [
      makeEntry({ latency_ms: 100 }),
      makeEntry({ latency_ms: 200 }),
      makeEntry({ latency_ms: 300 }),
    ];
    const summary = calculateSummary(entries);
    expect(summary.avgLatency).toBe(200);
  });

  it("sums costs correctly", () => {
    const entries = [
      makeEntry({ cost_usd: 0.01 }),
      makeEntry({ cost_usd: 0.02 }),
      makeEntry({ cost_usd: 0.03 }),
    ];
    const summary = calculateSummary(entries);
    expect(summary.totalCost).toBeCloseTo(0.06);
  });

  it("treats 429 and 500 as errors, 200 as success", () => {
    const entries = [
      makeEntry({ status: 200 }),
      makeEntry({ status: 429 }),
      makeEntry({ status: 500 }),
    ];
    const summary = calculateSummary(entries);
    expect(summary.errorRate).toBeCloseTo(2 / 3);
  });

  it("handles all-error scenario", () => {
    const entries = [
      makeEntry({ status: 500 }),
      makeEntry({ status: 500 }),
    ];
    const summary = calculateSummary(entries);
    expect(summary.errorRate).toBe(1);
  });

  it("handles all-success scenario", () => {
    const entries = [
      makeEntry({ status: 200 }),
      makeEntry({ status: 200 }),
    ];
    const summary = calculateSummary(entries);
    expect(summary.errorRate).toBe(0);
  });
});
