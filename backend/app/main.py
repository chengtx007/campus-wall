import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine, run_migration
from app.routers import posts, uploads, admin


@asynccontextmanager
async def lifespan(_: FastAPI):
    run_migration(engine)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(posts.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "校园墙 API", "docs": "/docs", "health": "/health", "posts": "/api/posts"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
