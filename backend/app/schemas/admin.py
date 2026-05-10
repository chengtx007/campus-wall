from pydantic import BaseModel, Field


class AdminLogin(BaseModel):
    token: str


class AdminPostAction(BaseModel):
    action: str = Field(..., pattern="^(approve|reject|delete)$")


class AdminResolveReport(BaseModel):
    resolved: bool = True
