import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Reading } from "../types";

interface Props {
  readings: Reading[];
}

interface ChartPoint {
  sortKey: number;
  time: string;
  atrium?: number;
  outside?: number;
}

function buildChartData(readings: Reading[]): ChartPoint[] {
  const byTime = new Map<number, ChartPoint>();

  for (const r of readings) {
    const ts = new Date(r.measured_at).getTime();
    const label = new Date(r.measured_at).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const point = byTime.get(ts) ?? { sortKey: ts, time: label };
    if (r.location === "atrium") point.atrium = r.temperature;
    else point.outside = r.temperature;
    byTime.set(ts, point);
  }

  return Array.from(byTime.values()).sort((a, b) => a.sortKey - b.sortKey);
}

export default function TemperatureChart({ readings }: Props) {
  const data = buildChartData(readings);

  if (data.length === 0) {
    return <div className="state-msg">No data for this day yet.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#ece3d3" />
        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} unit="°C" domain={["auto", "auto"]} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="atrium"
          name="Atrium"
          stroke="#c97a5f"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="outside"
          name="Outside"
          stroke="#a9bedf"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
