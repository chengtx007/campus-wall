from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.auth import create_access_token, decode_access_token, hash_password, verify_password
from app.database import get_db
from app.main import limiter
from app.models.user import User
from app.schemas.auth import TokenResponse, UserLogin, UserRegister, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization:
        raise HTTPException(401, "未登录")
    token = authorization.removeprefix("Bearer ").strip()
    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(401, "登录已过期，请重新登录")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(401, "用户不存在")
    return user


@router.post("/register", response_model=TokenResponse, status_code=201)
@limiter.limit("3/minute")
def register(request: Request, payload: UserRegister, db: Session = Depends(get_db)) -> TokenResponse:
    # Check username uniqueness
    if db.scalar(select(User).where(User.username == payload.username)):
        raise HTTPException(409, "用户名已被注册")

    # Check phone uniqueness if provided
    if payload.phone and db.scalar(select(User).where(User.phone == payload.phone)):
        raise HTTPException(409, "手机号已被注册")

    # Check email uniqueness if provided
    if payload.email and db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(409, "邮箱已被注册")

    user = User(
        username=payload.username,
        nickname=payload.nickname,
        phone=payload.phone,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(request: Request, payload: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    # Find user by username, phone, or email
    user = db.scalar(
        select(User).where(
            or_(User.username == payload.account, User.phone == payload.account, User.email == payload.account)
        )
    )
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "账号或密码错误")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)
