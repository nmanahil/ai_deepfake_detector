from pydantic import BaseModel, Field


class PredictionResult(BaseModel):
    label: str  # "real" or "fake"
    confidence: float = Field(ge=0.0, le=1.0)
    # Raw per-class scores keyed by label — retained for future explainability
    scores: dict[str, float]
