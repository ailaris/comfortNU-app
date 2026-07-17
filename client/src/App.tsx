import { useEffect, useState, useCallback } from "react";
import "./App.css";
import { api } from "./api";
import type {
  Reading,
  Report,
  ReadingsFilters,
  ReportCategory,
  Location,
  Summary,
} from "./types";
import StatusHero from "./components/StatusHero";
import TemperatureChart from "./components/TemperatureChart";
import SummaryCard from "./components/SummaryCard";
import HistoryTable, { HistoryModal } from "./components/HistoryTable";
import { ReportForm, ReportsList } from "./components/ReportsSection";

export default function App() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [readingsLoading, setReadingsLoading] = useState(true);
  const [readingsError, setReadingsError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReadingsFilters>({});

  const [chartReadings, setChartReadings] = useState<Reading[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);

  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const loadReadings = useCallback(() => {
    setReadingsLoading(true);
    setReadingsError(null);
    api
      .getReadings(filters)
      .then(setReadings)
      .catch((e) => setReadingsError(e.message))
      .finally(() => setReadingsLoading(false));
  }, [filters]);

  const loadChartReadings = useCallback((date: string) => {
    setChartLoading(true);
    setChartError(null);
    api
      .getReadings({ date })
      .then(setChartReadings)
      .catch((e) => setChartError(e.message))
      .finally(() => setChartLoading(false));
  }, []);

  const loadReports = useCallback(() => {
    setReportsLoading(true);
    setReportsError(null);
    api
      .getReports()
      .then(setReports)
      .catch((e) => setReportsError(e.message))
      .finally(() => setReportsLoading(false));
  }, []);

  const loadSummary = useCallback(() => {
    setSummaryLoading(true);
    setSummaryError(null);
    api
      .getSummary()
      .then(setSummary)
      .catch((e) => setSummaryError(e.message))
      .finally(() => setSummaryLoading(false));
  }, []);

  useEffect(loadReadings, [loadReadings]);
  useEffect(loadReports, [loadReports]);
  useEffect(loadSummary, [loadSummary]);

  const latestDate =
    summary?.latest_atrium?.measured_at?.slice(0, 10) ??
    summary?.latest_outside?.measured_at?.slice(0, 10) ??
    null;

  useEffect(() => {
    if (latestDate) {
      loadChartReadings(latestDate);
    } else if (!summaryLoading) {
      setChartLoading(false);
    }
  }, [latestDate, summaryLoading, loadChartReadings]);

  const latestAtrium = summary?.latest_atrium ?? null;
  const latestOutside = summary?.latest_outside ?? null;

  const handleSubmitReport = async (
    category: ReportCategory,
    location: Location,
    comment: string,
  ) => {
    await api.createReport({ category, location, comment });
    loadReports();
  };

  const handleResolve = async (id: number) => {
    await api.updateReport(id, { status: "resolved" });
    loadReports();
  };

  const handleDelete = async (id: number) => {
    await api.deleteReport(id);
    loadReports();
  };

  return (
    <div className="container">
      <header className="app-header">
        <div className="brand">
          <img src="logi.jpg" alt="" className="icon-logo" />
          <div>
            <div className="brand-title">comfortNU</div>
            <div className="brand-subtitle">Smart space. Better decisions.</div>
          </div>
        </div>
        <nav className="nav-links">
          <a href="#status">Dashboard</a>
          <a href="#history">History</a>
          <a href="#reports">Reports</a>
          <a href="#analytics">Analytics</a>
        </nav>
      </header>

      <section id="status">
        <StatusHero latestAtrium={latestAtrium} latestOutside={latestOutside} />
      </section>

      <section id="analytics" className="section-row">
        <div className="card">
          <h3 className="section-title">Temperature (Atrium vs Outside)</h3>
          {chartLoading && <p className="state-msg">Loading…</p>}
          {chartError && (
            <p className="state-msg">Couldn't load chart: {chartError}</p>
          )}
          {!chartLoading && !chartError && (
            <TemperatureChart readings={chartReadings} />
          )}
        </div>
        <div className="card">
          <h3 className="section-title">Today's Summary</h3>
          <SummaryCard
            summary={summary}
            readings={chartReadings}
            loading={summaryLoading}
            error={summaryError}
          />
        </div>
      </section>

      <section id="history" className="section-row">
        <div className="card">
          <h3 className="section-title">Recent History</h3>
          <HistoryTable
            readings={readings}
            filters={filters}
            onFiltersChange={setFilters}
            loading={readingsLoading}
            error={readingsError}
            limit={5}
            onViewFull={() => setShowHistoryModal(true)}
          />
        </div>
        <div className="card">
          <ReportForm onSubmit={handleSubmitReport} />
        </div>
      </section>

      <section id="reports" className="card" style={{ marginBottom: 16 }}>
        <h3 className="section-title">Recent Reports</h3>
        <img></img>
        <ReportsList
          reports={reports}
          loading={reportsLoading}
          error={reportsError}
          onResolve={handleResolve}
          onDelete={handleDelete}
        />
      </section>

      {showHistoryModal && (
        <HistoryModal
          readings={readings}
          filters={filters}
          onFiltersChange={setFilters}
          loading={readingsLoading}
          error={readingsError}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
}
