from contextlib import asynccontextmanager
from datetime import datetime, date, time
from typing import Annotated, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import Base, engine, get_db
from seed import seed_readings
import models
import schemas


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await seed_readings()
    try:
        yield
    finally:
        await engine.dispose()


app = FastAPI(title="NU Atrium Comfort API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_origin_regex=r"https://comfort-nu.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


async def find_report(report_id: int, db: AsyncSession) -> models.Report:
    report = await db.get(models.Report, report_id)
    if report:
        return report

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Report not found",
    )


@app.get("/")
async def home():
    return {"message": "Welcome to the NU Atrium Comfort API!"}


@app.get("/api/readings", response_model=list[schemas.ReadingOut])
async def get_readings(
    db: Annotated[AsyncSession, Depends(get_db)],
    location: Optional[str] = Query(None, description="atrium или outside"),
    date_from: Optional[date] = Query(None, description="YYYY-MM-DD"),
    date_to: Optional[date] = Query(None, description="YYYY-MM-DD"),
    noise: Optional[str] = None,
    brightness: Optional[str] = None,
    min_temp: Optional[float] = None,
    max_temp: Optional[float] = None,
    sort_by: str = Query("measured_at", pattern="^(measured_at|temperature)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
):
    query = select(models.Reading)

    if location:
        query = query.where(models.Reading.location == location)
    if date_from:
        query = query.where(
            models.Reading.measured_at >= datetime.combine(date_from, time.min)
        )
    if date_to:
        query = query.where(
            models.Reading.measured_at <= datetime.combine(date_to, time.max)
        )
    if noise:
        query = query.where(models.Reading.noise == noise)
    if brightness:
        query = query.where(models.Reading.brightness == brightness)
    if min_temp is not None:
        query = query.where(models.Reading.temperature >= min_temp)
    if max_temp is not None:
        query = query.where(models.Reading.temperature <= max_temp)

    sort_column = (
        models.Reading.measured_at
        if sort_by == "measured_at"
        else models.Reading.temperature
    )
    query = query.order_by(asc(sort_column) if order == "asc" else desc(sort_column))

    result = await db.scalars(query)
    return result.all()


@app.get("/api/readings/{reading_id}", response_model=schemas.ReadingOut)
async def get_reading(reading_id: int, db: Annotated[AsyncSession, Depends(get_db)]):
    reading = await db.get(models.Reading, reading_id)
    if reading is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Reading not found"
        )
    return reading


@app.get("/api/summary", response_model=schemas.Summary)
async def get_summary(db: Annotated[AsyncSession, Depends(get_db)]):

    latest_atrium_query = (
        select(models.Reading)
        .where(models.Reading.location == "atrium")
        .order_by(desc(models.Reading.measured_at))
        .limit(1)
    )
    latest_atrium = await db.scalar(latest_atrium_query)

    latest_outside_query = (
        select(models.Reading)
        .where(models.Reading.location == "outside")
        .order_by(desc(models.Reading.measured_at))
        .limit(1)
    )
    latest_outside = await db.scalar(latest_outside_query)

    stats_query = select(
        func.min(models.Reading.temperature),
        func.max(models.Reading.temperature),
        func.avg(models.Reading.temperature),
    ).where(models.Reading.location == "atrium")

    stats_result = await db.execute(stats_query)
    min_temp, max_temp, avg_temp = stats_result.first()

    comfort_status = "None"

    if latest_atrium:
        temp = latest_atrium.temperature
        if temp < 18.0:
            comfort_status = "Cold 🥶"
        elif 18.0 <= temp <= 25.0:
            comfort_status = "Ideal 😌"
        else:
            comfort_status = "Hot / Humid 🥵"

    # insight
    if latest_atrium and latest_outside:
        diff = round(latest_atrium.temperature - latest_outside.temperature, 1)
        if diff > 0:
            insight = f"В атриуме на {diff}°C теплее, чем на улице"
        elif diff < 0:
            insight = f"В атриуме на {abs(diff)}°C холоднее, чем на улице"
        else:
            insight = "Температура в атриуме совпадает с уличной"
    else:
        insight = "Недостаточно данных для сравнения с улицей"

    return {
        "latest_atrium": latest_atrium,
        "latest_outside": latest_outside,
        "min_temp": round(min_temp, 1) if min_temp is not None else None,
        "max_temp": round(max_temp, 1) if max_temp is not None else None,
        "avg_temp": round(avg_temp, 1) if avg_temp is not None else None,
        "comfort_status": comfort_status,
        "insight": insight,
    }


@app.post(  # creating reports
    "/api/reports",
    response_model=schemas.ReportOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_report(
    report_data: schemas.ReportCreate, db: Annotated[AsyncSession, Depends(get_db)]
):

    new_report = models.Report(
        category=report_data.category,
        location=report_data.location,
        comment=report_data.comment,
        status="open",
        created_at=datetime.utcnow(),
    )

    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    return new_report


@app.get("/api/reports", response_model=list[schemas.ReportOut])
async def get_reports(db: Annotated[AsyncSession, Depends(get_db)]):
    query = select(models.Report).order_by(desc(models.Report.created_at))
    result = await db.scalars(query)
    return result.all()


@app.put("/api/reports/{report_id}", response_model=schemas.ReportOut)
async def update_report(
    report_id: int,
    report_data: schemas.ReportUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    report = await find_report(report_id, db)

    for field, value in report_data.model_dump(exclude_unset=True).items():
        setattr(report, field, value)

    await db.commit()
    await db.refresh(report)
    return report


@app.delete("/api/reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    report = await find_report(report_id, db)
    await db.delete(report)
    await db.commit()
