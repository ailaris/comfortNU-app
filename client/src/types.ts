export type Location = "atrium" | "outside";

export interface Reading {
  id: number;
  measured_at: string;
  location: Location;
  temperature: number;
  brightness: string | null;
  noise: string | null;
}

export type ReportCategory =
  | "too_hot"
  | "too_noisy"
  | "too_bright"
  | "too_dark"
  | "comfortable"
  | "other";

export type ReportStatus = "open" | "resolved";

export interface Report {
  id: number;
  created_at: string;
  category: ReportCategory;
  comment: string;
  status: ReportStatus;
}

export interface ReportCreatePayload {
  category: ReportCategory;
  location: Location;
  comment: string;
}

export interface Summary {
  latest_atrium: Reading | null;
  latest_outside: Reading | null;
  min_temp: number | null;
  max_temp: number | null;
  avg_temp: number | null;
  comfort_status: string;
  insight: string;
}

export interface ReadingsFilters {
  date?: string;
  location?: Location;
  noise?: string;
  brightness?: string;
  sortBy?: "time" | "temperature";
  sortOrder?: "asc" | "desc";
}
