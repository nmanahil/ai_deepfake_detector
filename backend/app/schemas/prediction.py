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

    label: str
    confidence: float = Field(ge=0.0, le=1.0)
    explanation: str  # human-readable summary, e.g. "Likely fake (94.2% confidence)"
    heatmap_b64: str | None = None
