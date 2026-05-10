from datetime import datetime

from pydantic import BaseModel, Field


class ReportCreate(BaseModel):
    reason: str = Field(..., min_length=1, max_length=500)
    fingerprint: str = Field(..., min_length=1)


class ReportRead(BaseModel):
    id: int
    post_id: int
    reason: str
    fingerprint: str
    created_at: datetime
    resolved: bool
    resolved_at: datetime | None = None
    resolved_by: str | None = None

    model_config = {"from_attributes": True}
