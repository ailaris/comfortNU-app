import { Thermometer, Snowflake, VolumeX, ArrowLeftRight } from "lucide-react";
import type { Summary } from "../types";
import { computeDayInsights } from "../utils";
import type { Reading } from "../types";

interface Props {
  summary: Summary | null;
  readings: Reading[];
  loading: boolean;
  error: string | null;
}

export default function SummaryCard({
  summary,
  readings,
  loading,
  error,
}: Props) {
  if (loading) return <div className="state-msg">Loading summary…</div>;
  if (error)
    return <div className="state-msg">Couldn't load summary: {error}</div>;

  const insights = computeDayInsights(readings);

  const rows = [
    {
      icon: Thermometer,
      label: "Warmest time",
      value: insights.warmestTime ?? "—",
    },
    {
      icon: Snowflake,
      label: "Coolest time",
      value: insights.coolestTime ?? "—",
    },
    {
      icon: VolumeX,
      label: "Quietest time",
      value: insights.quietestTime ?? "—",
    },
    {
      icon: ArrowLeftRight,
      label: "Avg. temp difference",
      value:
        insights.avgTempDiff !== null
          ? `${insights.avgTempDiff > 0 ? "+" : ""}${insights.avgTempDiff} °C`
          : (summary?.insight ?? "—"),
    },
  ];

  return (
    <div className="summary-card">
      {rows.map(({ icon: Icon, label, value }) => (
        <div className="summary-row" key={label}>
          <Icon size={18} strokeWidth={1.75} className="summary-icon" />
          <div className="summary-row-text">
            <span className="summary-label">{label}</span>
            <span className="summary-value">{value}</span>
          </div>
        </div>
      ))}
      {summary && <p className="summary-insight">{summary.insight}</p>}
      <a className="summary-link" href="#analytics">
        View full analytics →
      </a>
    </div>
  );
}
