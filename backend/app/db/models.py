from datetime import datetime
from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class PredictionRecord(Base):
    """Persisted result of a single /predict call."""

    __tablename__ = "prediction_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    label: Mapped[str] = mapped_column(String(16), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    # Path to the heatmap PNG on disk (relative to reports_dir).
    # Storing on disk rather than as a BLOB keeps the DB lightweight and
    # makes it trivial to serve the file directly or swap to S3 later.
    heatmap_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    explanation: Mapped[str] = mapped_column(String(512), nullable=False)
