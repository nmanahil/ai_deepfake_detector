import logging
from transformers import pipeline, Pipeline  # type: ignore[attr-defined]
from app.ml.base import MediaAnalyzer
from app.ml.preprocessing import decode_image
from app.schemas.prediction import PredictionResult
from app.core.exceptions import ModelInferenceError

logger = logging.getLogger(__name__)

# Model: dima806/deepfake_vs_real_image_detection
# Chosen because:
#   - Purpose-built binary classifier (fake vs real) fine-tuned on a ViT-base backbone
#   - Actively maintained, >1 M downloads, strong community validation on HF Hub
#   - Outputs "Fake" / "Real" labels directly — no label remapping needed
#   - CPU-compatible with no quantisation required for a portfolio workload
_MODEL_ID = "dima806/deepfake_vs_real_image_detection"


class ImageAnalyzer(MediaAnalyzer):
    def __init__(self, model_id: str = _MODEL_ID) -> None:
        logger.info("Loading model %s — this may take a moment on first run.", model_id)
        self._pipe: Pipeline = pipeline(
            "image-classification",
            model=model_id,
            device=-1,  # CPU
        )
        logger.info("Model loaded successfully.")

    def analyze(self, media: bytes) -> PredictionResult:
        image = decode_image(media)
        try:
            raw: list[dict[str, float]] = self._pipe(image)  # type: ignore[assignment]
        except Exception as exc:
            raise ModelInferenceError(f"Inference error: {exc}") from exc

        scores = {item["label"].lower(): float(item["score"]) for item in raw}
        # Normalise label to "fake" / "real"
        top = max(scores, key=lambda k: scores[k])
        label = "fake" if "fake" in top else "real"
        return PredictionResult(label=label, confidence=scores[top], scores=scores)
