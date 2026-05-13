from datetime import datetime

from pydantic import BaseModel, EmailStr, model_validator


class UserRegister(BaseModel):
    username: str  # unique
    nickname: str
    password: str
    phone: str | None = None
    email: EmailStr | None = None

    @model_validator(mode="after")
    def check_contact(self):
        if not self.phone and not self.email:
            raise ValueError("手机号和邮箱至少填写一个")
        return self


class UserLogin(BaseModel):
    account: str  # username or phone or email
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    nickname: str
    phone: str | None = None
    email: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
