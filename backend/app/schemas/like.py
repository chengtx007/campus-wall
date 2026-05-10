from pydantic import BaseModel, Field


class LikeCreate(BaseModel):
    fingerprint: str = Field(..., min_length=1)


class LikeToggleResponse(BaseModel):
    liked: bool
    like_count: int
