# NU Atrium Comfort API

A FastAPI backend that tracks temperature, brightness, and noise readings for the NU Atrium (and outside conditions), and lets users submit and manage comfort reports (e.g. "too hot", "too noisy").

Reading data is originally sourced from an exported Telegram chat (`result.json`) containing sensor messages, parsed and seeded into a SQLite database.

## Tech stack

- **FastAPI** — web framework
- **SQLAlchemy 2.0** (async) — ORM
- **SQLite** via `aiosqlite` — database
- **Pydantic v2** / `pydantic-settings` — schemas & config
- **uvicorn** — ASGI server
- **uv** — dependency & environment management

## Project Structure

```
.
├── main.py          # FastAPI app, routes
├── models.py         # SQLAlchemy ORM models (Reading, Report)
├── schemas.py         # Pydantic request/response schemas
├── database.py         # Engine, session, Base
├── config.py          # App settings (env-driven)
├── seed.py           # Parses result.json and seeds the database
├── result.json         # Source data export (Telegram chat)
├── alldata.db          # SQLite database file
├── pyproject.toml       # Project metadata & dependencies
└── uv.lock            # Locked dependency versions
```

## Requirements

- Python >= 3.14
- [uv](https://docs.astral.sh/uv/) installed

## Setup

1. **Clone the repository and install dependencies:**

   ```bash
   uv sync
   ```

2. **(Optional) Configure environment variables**

   Create a `.env` file in the project root to override defaults:

   ```env
   DATABASE_URL=sqlite+aiosqlite:///./alldata.db
   FRONTEND_URL=http://localhost:5173
   ```

   | Variable       | Default                            | Description                   |
   | -------------- | ---------------------------------- | ----------------------------- |
   | `DATABASE_URL` | `sqlite+aiosqlite:///./alldata.db` | Async SQLAlchemy database URL |
   | `FRONTEND_URL` | `http://localhost:5173`            | Allowed origin for CORS       |

3. **Seed the database (optional)**

   If `result.json` is present and the `readings` table is empty, this will parse and import sensor readings:

   ```bash
   uv run seed.py
   ```

4. **Run the development server**

   ```bash
   uv run fastapi dev main.py
   ```

   The API will be available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

   On startup, the app automatically creates any missing database tables.

## API Reference

### Readings

| Method | Endpoint                     | Description                          |
| ------ | ---------------------------- | ------------------------------------ |
| GET    | `/api/readings`              | List readings, with optional filters |
| GET    | `/api/readings/{reading_id}` | Get a single reading by ID           |

**Query parameters for `GET /api/readings`:**

| Param        | Type                           | Description                              |
| ------------ | ------------------------------ | ---------------------------------------- |
| `location`   | string                         | Filter by `atrium` or `outside`          |
| `date_from`  | date (`YYYY-MM-DD`)            | Only readings on/after this date         |
| `date_to`    | date (`YYYY-MM-DD`)            | Only readings on/before this date        |
| `noise`      | string                         | Filter by noise level                    |
| `brightness` | string                         | Filter by brightness level               |
| `min_temp`   | float                          | Minimum temperature                      |
| `max_temp`   | float                          | Maximum temperature                      |
| `sort_by`    | `measured_at` \| `temperature` | Field to sort by (default `measured_at`) |
| `order`      | `asc` \| `desc`                | Sort direction (default `desc`)          |

### Summary

| Method | Endpoint       | Description                                                                                              |
| ------ | -------------- | -------------------------------------------------------------------------------------------------------- |
| GET    | `/api/summary` | Latest atrium/outside readings, min/max/avg atrium temperature, comfort status, and a comparison insight |

Comfort status is derived from the latest atrium temperature:

- `< 18.0°C` → Cold
- `18.0–25.0°C` → Ideal
- `> 25.0°C` → Hot / Humid

### Reports

| Method | Endpoint                   | Description                      |
| ------ | -------------------------- | -------------------------------- |
| POST   | `/api/reports`             | Create a new comfort report      |
| GET    | `/api/reports`             | List all reports (newest first)  |
| PUT    | `/api/reports/{report_id}` | Update a report (partial update) |
| DELETE | `/api/reports/{report_id}` | Delete a report                  |

**Report categories:** `too_hot`, `too_noisy`, `too_bright`, `too_dark`, `comfortable`, `other`

**Report status:** `open`, `resolved` (defaults to `open` on creation)

## Notes

- Data import (`seed.py`) parses Telegram-exported messages matching two formats: atrium readings (temperature, brightness, noise) and outside readings (temperature only). Messages that don't match either pattern are skipped.
- Seeding is idempotent — it only runs if the `readings` table is currently empty.
