from datetime import datetime
from pydantic import BaseModel, Field


class PredictionResult(BaseModel):
    label: str  # "real" or "fake"
    confidence: float = Field(ge=0.0, le=1.0)
    # Raw per-class scores keyed by label — retained for future explainability
    scores: dict[str, float]
    # Base64-encoded PNG heatmap overlay; None when include_explanation=False
    heatmap_b64: str | None = None


class PredictResponse(BaseModel):
    """API response schema for POST /predict."""

    id: int
    label: str
    confidence: float = Field(ge=0.0, le=1.0)
    explanation: str
    heatmap_b64: str | None = None


class PredictionRecordSchema(BaseModel):
    """Serialised view of a persisted PredictionRecord."""

    id: int
    created_at: datetime
    filename: str
    label: str
    confidence: float
    explanation: str
    heatmap_path: str | None = None

    model_config = {"from_attributes": True}


class HistoryResponse(BaseModel):
    total: int
    items: list[PredictionRecordSchema]
