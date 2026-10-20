import { useQuery } from "@tanstack/react-query";
import type { LogEntry } from "../types";

async function fetchLogs(): Promise<LogEntry[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  const response = await fetch("/data.json");
  if (!response.ok) {
    throw new Error(`Ошибка загрузки данных: ${response.status}`);
  }
  return response.json();
}

export function useLogData() {
  return useQuery<LogEntry[], Error>({
    queryKey: ["logs"],
    queryFn: fetchLogs,
    staleTime: 5 * 60 * 1000,
  });
}
