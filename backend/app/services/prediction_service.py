import base64
import logging
import uuid
from functools import lru_cache
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.exceptions import InvalidImageError, ModelInferenceError  # noqa: F401 — re-exported for route layer
from app.db.models import PredictionRecord
from app.db.repository import PredictionRepository
from app.ml.image_classifier import ImageAnalyzer
from app.schemas.prediction import PredictResponse

logger = logging.getLogger(__name__)


class PredictionService:
    def __init__(self, settings: Settings) -> None:
        # ImageAnalyzer loads the model once; PredictionService is cached so
        # this happens once per process, not per request.
        self._analyzer = ImageAnalyzer()
        self._reports_dir = Path(settings.reports_dir)
        self._reports_dir.mkdir(parents=True, exist_ok=True)

    def predict(
        self,
        image_bytes: bytes,
        filename: str,
        db: Session,
        include_explanation: bool = True,
    ) -> PredictResponse:
        result = self._analyzer.analyze(image_bytes, include_explanation=include_explanation)

        pct = round(result.confidence * 100, 1)
        explanation = f"Likely {result.label} ({pct}% confidence)"

        heatmap_path: str | None = None
        if result.heatmap_b64:
            heatmap_path = self._save_heatmap(result.heatmap_b64)

        repo = PredictionRepository(db)
        record = repo.save(
            PredictionRecord(
                filename=filename,
                label=result.label,
                confidence=result.confidence,
                explanation=explanation,
                heatmap_path=heatmap_path,
            )
        )

        return PredictResponse(
            id=record.id,
            label=result.label,
            confidence=result.confidence,
            explanation=explanation,
            heatmap_b64=result.heatmap_b64,
        )

    def _save_heatmap(self, heatmap_b64: str) -> str:
        """Decode base64 PNG and write to reports_dir; return the relative path."""
        name = f"{uuid.uuid4().hex}.png"
        path = self._reports_dir / name
        path.write_bytes(base64.b64decode(heatmap_b64))
        return str(path)


@lru_cache
def get_prediction_service() -> PredictionService:
    return PredictionService(settings=get_settings())
