from sqlalchemy import Float, Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from database import Base
from datetime import datetime


class Reading(Base):
    __tablename__ = "readings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    measured_at: Mapped[datetime] = mapped_column(DateTime, index=True, nullable=False)
    location: Mapped[str] = mapped_column(String, index=True, nullable=False)
    temperature: Mapped[float] = mapped_column(Float, nullable=False)
    brightness: Mapped[str] = mapped_column(String, nullable=True)
    noise: Mapped[str] = mapped_column(String, nullable=True)


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, index=True, nullable=False)
    location: Mapped[str] = mapped_column(String, index=True, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    comment: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, default="open", nullable=False)
