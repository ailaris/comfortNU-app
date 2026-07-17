import { useState } from "react";
import type { Report, ReportCategory, Location } from "../types";

const CATEGORY_LABELS: Record<ReportCategory, string> = {
  too_hot: "Too Hot",
  too_noisy: "Too Noisy",
  too_bright: "Too Bright",
  too_dark: "Too Dark",
  comfortable: "Comfortable",
  other: "Other",
};

interface FormProps {
  onSubmit: (
    category: ReportCategory,
    location: Location,
    comment: string,
  ) => Promise<void>;
}

export function ReportForm({ onSubmit }: FormProps) {
  const [category, setCategory] = useState<ReportCategory | "">("");
  const [location, setLocation] = useState<Location>("atrium");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(category, location, comment);
      setSuccess(true);
      setCategory("");
      setComment("");
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="section-title">Report an Issue</h3>

      <div className="form-field">
        <label>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ReportCategory)}
          required
        >
          <option value="">Select a category</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label>Location</label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value as Location)}
          required
        >
          <option value="atrium">Atrium</option>
          <option value="outside">Outside</option>
        </select>
      </div>

      <div className="form-field">
        <label>Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 300))}
          rows={4}
          maxLength={300}
          placeholder="Write your comment…"
        />
        <div
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            textAlign: "right",
          }}
        >
          {comment.length}/300
        </div>
      </div>

      {error && (
        <div style={{ color: "var(--wine)", fontSize: 13, marginBottom: 10 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ color: "var(--olive)", fontSize: 13, marginBottom: 10 }}>
          Report submitted, thank you!
        </div>
      )}

      <button
        className="submit-btn"
        type="submit"
        disabled={submitting || !category}
      >
        {submitting ? "Submitting…" : "Submit Report"}
      </button>
    </form>
  );
}

interface ListProps {
  reports: Report[];
  loading: boolean;
  error: string | null;
  onResolve: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function ReportsList({
  reports,
  loading,
  error,
  onResolve,
  onDelete,
}: ListProps) {
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);

  if (loading) return <div className="state-msg">Loading reports…</div>;
  if (error)
    return <div className="state-msg">Couldn't load reports: {error}</div>;
  if (reports.length === 0)
    return <div className="state-msg">No reports yet.</div>;

  return (
    <div>
      {reports.map((r) => (
        <div className="report-row" key={r.id}>
          <div>
            <p className="report-row-title">{CATEGORY_LABELS[r.category]}</p>
            <p className="report-row-meta">
              {r.comment || "No comment"} ·{" "}
              {new Date(r.created_at).toLocaleString("en-US", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span
              className="pill"
              style={{
                background: r.status === "open" ? "#c97a5f" : "#5a5f3d",
              }}
            >
              {r.status === "open" ? "Open" : "Resolved"}
            </span>
            {r.status === "open" && (
              <button className="link-btn" onClick={() => onResolve(r.id)}>
                Resolve
              </button>
            )}
            {confirmingDelete === r.id ? (
              <>
                <button className="link-btn" onClick={() => onDelete(r.id)}>
                  Confirm
                </button>
                <button
                  className="link-btn"
                  onClick={() => setConfirmingDelete(null)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="link-btn"
                onClick={() => setConfirmingDelete(r.id)}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
