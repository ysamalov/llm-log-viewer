import type { LogEntry, Filters, SortConfig } from "../types";

export function filterLogs(entries: LogEntry[], filters: Filters): LogEntry[] {
  return entries.filter((entry) => {
    if (filters.model && entry.model !== filters.model) {
      return false;
    }

    if (filters.status && entry.status !== Number(filters.status)) {
      return false;
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      from.setHours(0, 0, 0, 0);
      if (new Date(entry.timestamp) < from) {
        return false;
      }
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(entry.timestamp) > to) {
        return false;
      }
    }

    return true;
  });
}

export function sortLogs(
  entries: LogEntry[],
  sort: SortConfig
): LogEntry[] {
  const sorted = [...entries];
  sorted.sort((a, b) => {
    let cmp: number;
    if (sort.field === "timestamp") {
      cmp =
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    } else {
      cmp = a[sort.field] - b[sort.field];
    }
    return sort.direction === "asc" ? cmp : -cmp;
  });
  return sorted;
}

export function paginateLogs(
  entries: LogEntry[],
  page: number,
  pageSize: number
): LogEntry[] {
  const start = (page - 1) * pageSize;
  return entries.slice(start, start + pageSize);
}

export function getUniqueModels(entries: LogEntry[]): string[] {
  return [...new Set(entries.map((e) => e.model))].sort();
}
