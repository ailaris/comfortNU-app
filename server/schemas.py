from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict, Field


class ReadingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    measured_at: datetime
    location: str = Field(min_length=1, max_length=50)
    temperature: float = Field(ge=-50.0, le=60.0)
    brightness: Optional[str] = Field(None, min_length=1, max_length=50)
    noise: Optional[str] = Field(None, min_length=1, max_length=50)


class Summary(BaseModel):
    latest_atrium: Optional[ReadingOut] = None
    latest_outside: Optional[ReadingOut] = None
    min_temp: Optional[float] = None
    max_temp: Optional[float] = None
    avg_temp: Optional[float] = None
    comfort_status: str
    insight: str


ReportCategory = Literal[
    "too_hot", "too_noisy", "too_bright", "too_dark", "comfortable", "other"
]
ReportStatus = Literal["open", "resolved"]


class ReportCreate(BaseModel):
    category: ReportCategory
    location: str
    comment: Optional[str] = None


class ReportUpdate(BaseModel):
    category: Optional[ReportCategory] = None
    comment: Optional[str] = None
    status: Optional[ReportStatus] = None


class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    category: str
    comment: Optional[str] = None
    status: str
