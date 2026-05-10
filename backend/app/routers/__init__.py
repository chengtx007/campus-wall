from app.routers.posts import router as posts_router
from app.routers.uploads import router as uploads_router
from app.routers.admin import router as admin_router

__all__ = ["posts", "uploads", "admin"]
