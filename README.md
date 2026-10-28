# comfortNU app 

A complete full-stack IoT-dashboard application designed to monitor, track, and analyze environmental metrics - including temperature, brightness, and noise levels-within an atrium. The system compares stored sensor readings with outdoor ambient conditions using a sleek, minimalist interface.
Link: https://comfort-nu-app.vercel.app/
---

## 🏗️ System Architecture & Tech Stack

This repository is organized as a monorepo containing both the frontend client and the backend server:

* **Frontend (`/client`):** React, TypeScript, Tailwind CSS, and Recharts. Designed with a clean, cool-toned aesthetic (grays, light blues, and indigos).
* **Backend (`/server`):** FastAPI (Python), SQLite (or PostgreSQL), and Pydantic. Handles data ingestion, calculates daily aggregates, and serves historical logs.

---

## 🚀 Key Features

* **Dual-Location Tracking:** Displays and contrasts real-time metrics for both the **Atrium** (indoor) and **Outside** environments.
* **Smart Analytics:** Automatically calculates daily minimum, maximum, and average metrics.
* **Chronological Charting:** Smooth, responsive line charts that handle multi-day filtering without timeline fragmentation or rendering glitches.
* **Comprehensive Metrics:** Monitors Temperature (°C), Brightness (Lux), and Noise Levels (dB).
* **Historical Logs & Reporting:** A dedicated "View History" tab to audit past readings and log maintenance or environment reports.

---

## 📁 Repository Structure

```text
├── server/                  # FastAPI Application
│   ├── app/
│   │   ├── main.py           # API Router & Entrypoint
│   │   ├── schemas.py        # Pydantic validation models
│   │   └── database.py       # DB connection and models
│   └── requirements.txt      # Python dependencies
│
└── client/                 # React SPA
    ├── src/
    │   ├── components/       # TemperatureChart, StatsCards, etc.
    │   ├── types/            # TypeScript interface definitions
    │   └── App.tsx           # Main application shell
    └── package.json          # Node dependencies
