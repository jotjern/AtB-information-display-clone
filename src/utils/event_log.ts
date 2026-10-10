import { isAxiosError } from "axios";

const STORAGE_KEY = "event-log";
const MAX_ENTRIES = 500;

export type FailureReason = "timeout" | "network" | "http" | "invalid-response" | "unknown";

export type LogEvent =
  | { type: "load"; quayId: string }
  | { type: "success"; quayId: string }
  | { type: "failure"; quayId: string; reason: FailureReason; status?: number }
  | { type: "offline"; quayId: string }
  | { type: "online"; quayId: string }
  | { type: "stop-change"; from: string; to: string };

export type LogEntry = LogEvent & {
  first: number;
  last: number;
  count: number;
  durationMs?: { total: number; max: number };
};

export function readLog(): LogEntry[] {
  try {
    const log = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(log) ? log : [];
  } catch {
    return [];
  }
}

function eventKey(event: LogEvent | LogEntry) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { first, last, count, durationMs, ...fields } = event as LogEntry;
  return JSON.stringify(fields, Object.keys(fields).sort());
}

// Consecutive identical events are merged into one entry with a count
export function logEvent(event: LogEvent, durationMs?: number) {
  const now = Date.now();
  const log = readLog();
  const previous = log[log.length - 1];

  if (previous && eventKey(previous) === eventKey(event)) {
    previous.last = now;
    previous.count++;
    if (durationMs !== undefined) {
      previous.durationMs = {
        total: (previous.durationMs?.total ?? 0) + durationMs,
        max: Math.max(previous.durationMs?.max ?? 0, durationMs),
      };
    }
  } else {
    log.push({
      ...event,
      first: now,
      last: now,
      count: 1,
      ...(durationMs !== undefined && { durationMs: { total: durationMs, max: durationMs } }),
    });
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(-MAX_ENTRIES)));
  } catch {
    // Storage full or unavailable, logging is best effort
  }
}

export function clearLog() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable
  }
}

export function failureFromError(error: unknown): { reason: FailureReason; status?: number } {
  if (isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") return { reason: "timeout" };
    if (error.response) return { reason: "http", status: error.response.status };
    return { reason: "network" };
  }
  return { reason: "unknown" };
}
