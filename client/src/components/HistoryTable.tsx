import { useState } from "react";
import type { Reading, ReadingsFilters, Location } from "../types";

interface Props {
  readings: Reading[];
  filters: ReadingsFilters;
  onFiltersChange: (f: ReadingsFilters) => void;
  loading: boolean;
  error: string | null;
  limit?: number; // show only first N rows
  onViewFull?: () => void;
}

export default function HistoryTable({
  readings,
  filters,
  onFiltersChange,
  loading,
  error,
  limit,
  onViewFull,
}: Props) {
  const rows = limit ? readings.slice(0, limit) : readings;

  return (
    <div>
      <div className="filters-row">
        <input
          type="date"
          value={filters.date ?? ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, date: e.target.value })
          }
        />
        <select
          value={filters.location ?? ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              location: (e.target.value || undefined) as Location | undefined,
            })
          }
        >
          <option value="">All Locations</option>
          <option value="atrium">Atrium</option>
          <option value="outside">Outside</option>
        </select>
        <select
          value={filters.noise ?? ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, noise: e.target.value || undefined })
          }
        >
          <option value="">All Noise Levels</option>
          <option value="Quiet">Quiet</option>
          <option value="Mild noise">Mild</option>
          <option value="Noisy">Noisy</option>
          <option value="Very noisy">Very noisy</option>
        </select>
        <select
          value={filters.sortBy ?? "time"}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              sortBy: e.target.value as "time" | "temperature",
            })
          }
        >
          <option value="time">Sort: Time</option>
          <option value="temperature">Sort: Temperature</option>
        </select>
      </div>

      {loading && <div className="state-msg">Loading…</div>}
      {error && <div className="state-msg">Couldn't load history: {error}</div>}
      {!loading && !error && rows.length === 0 && (
        <div className="state-msg">No readings match these filters.</div>
      )}

      {!loading && !error && rows.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Location</th>
              <th>Temp. (°C)</th>
              <th>Brightness</th>
              <th>Noise</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  {new Date(r.measured_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td>{r.location === "atrium" ? "● Atrium" : "● Outside"}</td>
                <td>{r.temperature.toFixed(1)}</td>
                <td>{r.brightness ?? "—"}</td>
                <td>{r.noise ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {limit && readings.length > limit && onViewFull && (
        <button
          className="link-btn"
          style={{ marginTop: 10 }}
          onClick={onViewFull}
        >
          View full history →
        </button>
      )}
    </div>
  );
}

//  full-history modal wrapper
export function HistoryModal(props: Props & { onClose: () => void }) {
  const [localFilters, setLocalFilters] = useState(props.filters);

  return (
    <div className="modal-overlay" onClick={props.onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={props.onClose}>
          <img src="ICON_CLOSE_URL" alt="Close" className="icon-inline" />
        </button>
        <h3 className="section-title">Full History</h3>
        <HistoryTable
          {...props}
          filters={localFilters}
          onFiltersChange={(f) => {
            setLocalFilters(f);
            props.onFiltersChange(f);
          }}
          limit={undefined}
        />
      </div>
    </div>
  );
}
