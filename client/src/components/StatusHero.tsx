import type { Reading } from "../types";
import {
  getComfortStatus,
  normalizeBrightness,
  normalizeNoise,
} from "../comfortLogic";
import type { Temperature } from "../comfortLogic";

interface Props {
  latestAtrium: Reading | null;
  latestOutside: Reading | null;
}

const BRIGHTNESS_ICONS: Record<string, string> = {
  Bright: "yellow_sun.png",
  Moderate: "norm_light.png",
  Dim: "norm_light.png",
  Dark: "moon.png",
};

const NOISE_ICONS: Record<string, string> = {
  Quiet: "quiet.png",
  "Mild noise": "mild_noise.png",
  Noisy: "noisy.png",
};

function classifyTemperature(temp: number): Temperature {
  if (temp < 18) return "cold";
  if (temp < 21) return "cool";
  if (temp < 24) return "comfortable";
  if (temp < 27) return "warm";
  return "hot";
}

export default function StatusHero({ latestAtrium, latestOutside }: Props) {
  if (!latestAtrium) {
    return <div className="card state-msg">No readings available yet.</div>;
  }

  const temperature = classifyTemperature(latestAtrium.temperature);
  const brightness = normalizeBrightness(latestAtrium.brightness);
  const noise = normalizeNoise(latestAtrium.noise);
  const status = getComfortStatus(temperature, brightness, noise);

  const lastUpdate = new Date(latestAtrium.measured_at).toLocaleString(
    "en-US",
    { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" },
  );

  return (
    <>
      <div className="status-hero">
        <div className="status-hero-left">
          <div className="status-icon" style={{ background: status.color }}>
            <img src={status.img_url} className="icon-logo" />
          </div>
          <div>
            <div className="status-label">Current status</div>
            <h1 className="status-title">{status.title}</h1>
            <p className="status-desc">{status.description}</p>
          </div>
        </div>
        <div className="status-hero-right">
          <div className="meta-item">
            <div className="meta-icon-box">
              <img src="clock.png" alt="" className="meta-icon" />
            </div>
            <div className="meta-text">
              <span className="meta-label">Last update</span>
              <span className="meta-value">{lastUpdate}</span>
            </div>
          </div>
          <div className="meta-item">
            <div className="meta-icon-box">
              <img src="right.png" alt="Location" className="meta-icon" />
            </div>
            <div className="meta-text">
              <span className="meta-label">Location</span>
              <span className="meta-value">Atrium</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stat-cards">
        {/*Temperature (Atrium) */}
        <div className="stat-card">
          <div className="stat-card-left">
            <div className="stat-card-label">Temperature (Atrium)</div>
            <div className="stat-card-value">
              {latestAtrium.temperature.toFixed(1)} °C
            </div>
            <span className="pill" style={{ background: status.color }}>
              {status.title}
            </span>
          </div>
          <div className="stat-card-right">
            <img
              src="warm_temp.png"
              alt="Temperature"
              className="stat-card-icon"
            />
          </div>
        </div>

        {/* Outdoor Temp */}
        <div className="stat-card">
          <div className="stat-card-left">
            <div className="stat-card-label">Outdoor Temp.</div>
            <div className="stat-card-value">
              {latestOutside
                ? `${latestOutside.temperature.toFixed(1)} °C`
                : "—"}
            </div>
          </div>
          <div className="stat-card-right">
            <img
              src="cold_temp.png"
              alt="Outdoor Temp"
              className="stat-card-icon"
            />
          </div>
        </div>

        {/*  Brightness */}
        <div className="stat-card">
          <div className="stat-card-left">
            <div className="stat-card-label">Brightness</div>
            <div className="stat-card-value">
              {latestAtrium.brightness ?? "—"}
            </div>
          </div>
          <div className="stat-card-right">
            <img
              src={BRIGHTNESS_ICONS[latestAtrium.brightness ?? ""] || "sun.png"}
              alt={latestAtrium.brightness || "Brightness"}
              className="stat-card-icon"
            />
          </div>
        </div>

        {/* Noise Level */}
        <div className="stat-card">
          <div className="stat-card-left">
            <div className="stat-card-label">Noise Level</div>
            <div className="stat-card-value">{latestAtrium.noise ?? "—"}</div>
          </div>
          <div className="stat-card-right">
            <img
              src={NOISE_ICONS[latestAtrium.noise ?? ""] || "mild_noise.png"}
              alt={latestAtrium.noise || "Noise Level"}
              className="stat-card-icon"
            />
          </div>
        </div>
      </div>
    </>
  );
}
