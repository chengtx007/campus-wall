from datetime import datetime

from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    body: str = Field(..., min_length=1, max_length=2000)
    fingerprint: str = Field(..., min_length=1)


class CommentRead(BaseModel):
    id: int
    post_id: int
    body: str
    fingerprint: str
    created_at: datetime

    model_config = {"from_attributes": True}
