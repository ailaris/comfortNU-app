import type { Reading } from "./types";

export function getLatestByLocation(
  readings: Reading[],
  location: "atrium" | "outside"
): Reading | null {
  return (
    readings
      .filter((r) => r.location === location)
      .sort(
        (a, b) =>
          new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()
      )[0] ?? null
  );
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
}

export interface DayInsights {
  warmestTime: string | null;
  coolestTime: string | null;
  quietestTime: string | null;
  avgTempDiff: number | null;
}

export function computeDayInsights(readings: Reading[]): DayInsights {
  const atrium = readings.filter((r) => r.location === "atrium");
  const outside = readings.filter((r) => r.location === "outside");

  const warmest = atrium.reduce<Reading | null>((best, r) => {
    if (!best || r.temperature > best.temperature) return r;
    return best;
  }, null);

  const coolest = atrium.reduce<Reading | null>((best, r) => {
    if (!best || r.temperature < best.temperature) return r;
    return best;
  }, null);

  const quietest = atrium
    .filter((r) => r.noise === "quiet")
    .sort(
      (a, b) =>
        new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
    )[0];

  let avgTempDiff: number | null = null;
  if (atrium.length && outside.length) {
    const avgAtrium =
      atrium.reduce((s, r) => s + r.temperature, 0) / atrium.length;
    const avgOutside =
      outside.reduce((s, r) => s + r.temperature, 0) / outside.length;
    avgTempDiff = Math.round((avgAtrium - avgOutside) * 10) / 10;
  }

  return {
    warmestTime: warmest ? formatTime(warmest.measured_at) : null,
    coolestTime: coolest ? formatTime(coolest.measured_at) : null,
    quietestTime: quietest ? formatTime(quietest.measured_at) : null,
    avgTempDiff,
  };
}
