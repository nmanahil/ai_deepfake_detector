import logging
from functools import lru_cache
from app.ml.image_classifier import ImageAnalyzer
from app.schemas.prediction import PredictResponse
from app.core.exceptions import InvalidImageError, ModelInferenceError

logger = logging.getLogger(__name__)


class PredictionService:
    def __init__(self) -> None:
        # ImageAnalyzer loads the model once at construction; PredictionService
        # is itself cached via get_prediction_service() so this happens once
        # per process, not per request.
        self._analyzer = ImageAnalyzer()

    def predict(self, image_bytes: bytes, include_explanation: bool = True) -> PredictResponse:
        # InvalidImageError and ModelInferenceError propagate up to the route
        # handler which maps them to the correct HTTP status codes.
        result = self._analyzer.analyze(image_bytes, include_explanation=include_explanation)

        pct = round(result.confidence * 100, 1)
        explanation = f"Likely {result.label} ({pct}% confidence)"

        return PredictResponse(
            label=result.label,
            confidence=result.confidence,
            explanation=explanation,
            heatmap_b64=result.heatmap_b64,
        )


@lru_cache
def get_prediction_service() -> PredictionService:
    return PredictionService()
