from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, UniqueConstraint, func, text
from app.database import Base


class Like(Base):
    __tablename__ = "likes"
    __table_args__ = (
        UniqueConstraint("post_id", "fingerprint", name="uq_post_fingerprint"),
        Index(
            "uq_comment_fingerprint", "comment_id", "fingerprint",
            unique=True,
            sqlite_where=text("comment_id IS NOT NULL"),
        ),
    )

    id: int = Column(Integer, primary_key=True, autoincrement=True)
    post_id: int | None = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=True, index=True)
    comment_id: int | None = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id: int | None = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    fingerprint: str = Column(String(64), nullable=False)
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())
