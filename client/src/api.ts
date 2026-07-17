// api.ts
import type {
  Reading,
  Report,
  ReportCreatePayload,
  ReportStatus,
  Summary,
  ReadingsFilters,
} from "./types";

// Через vite.config.ts прокси /api уходит на бэк (localhost:8000 в деве).
const BASE_URL = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // no json body, keep statusText
    }
    throw new Error(`API error ${res.status}: ${detail}`);
  }

  // DELETE может вернуть пустой body
  if (res.status === 204) return undefined as T;
  return res.json();
}

function buildQuery(filters?: ReadingsFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  // Бэкенд ждёт date_from/date_to (не "date"), см. main.py get_readings
  if (filters.date) {
    params.set("date_from", filters.date);
    params.set("date_to", filters.date);
  }
  if (filters.location) params.set("location", filters.location);
  if (filters.noise) params.set("noise", filters.noise);
  if (filters.brightness) params.set("brightness", filters.brightness);
  if (filters.sortBy)
    params.set(
      "sort_by",
      filters.sortBy === "time" ? "measured_at" : "temperature",
    );
  // Бэкенд ждёт "order" (не "sort_order")
  if (filters.sortOrder) params.set("order", filters.sortOrder);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  getReadings: (filters?: ReadingsFilters) =>
    request<Reading[]>(`/readings${buildQuery(filters)}`),

  getReading: (id: number) => request<Reading>(`/readings/${id}`),

  getSummary: (date?: string) =>
    request<Summary>(`/summary${date ? `?date=${date}` : ""}`),

  getReports: () => request<Report[]>(`/reports`),

  createReport: (payload: ReportCreatePayload) =>
    request<Report>(`/reports`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateReport: (
    id: number,
    patch: Partial<{ status: ReportStatus; comment: string }>,
  ) =>
    request<Report>(`/reports/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    }),

  deleteReport: (id: number) =>
    request<void>(`/reports/${id}`, { method: "DELETE" }),
};
