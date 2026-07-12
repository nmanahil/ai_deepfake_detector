import logging
from transformers import (  # type: ignore[attr-defined]
    pipeline,
    Pipeline,
    AutoModelForImageClassification,
    AutoImageProcessor,
    ViTForImageClassification,
    ViTImageProcessor,
)
from app.ml.base import MediaAnalyzer
from app.ml.preprocessing import decode_image
from app.ml.explainability import generate_heatmap
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
        # Pipeline for fast classification inference
        self._pipe: Pipeline = pipeline(
            "image-classification",
            model=model_id,
            device=-1,  # CPU
        )
        # Raw model + processor kept separately for attention rollout.
        # The pipeline wraps these internally but doesn't expose attentions,
        # so we load them once here rather than re-loading per request.
        # output_attentions=True must be set at load time for this checkpoint;
        # passing it only at forward-call time does not populate attentions.
        self._model: ViTForImageClassification = (
            AutoModelForImageClassification.from_pretrained(
                model_id,
                output_attentions=True,
                attn_implementation="eager",  # required for attention output on ViT
            )
        )
        self._model.eval()
        self._processor: ViTImageProcessor = AutoImageProcessor.from_pretrained(model_id)
        logger.info("Model loaded successfully.")

    def analyze(self, media: bytes, include_explanation: bool = True) -> PredictionResult:
        image = decode_image(media)
        try:
            raw: list[dict[str, float]] = self._pipe(image)  # type: ignore[assignment]
        except Exception as exc:
            raise ModelInferenceError(f"Inference error: {exc}") from exc

        scores = {item["label"].lower(): float(item["score"]) for item in raw}
        top = max(scores, key=lambda k: scores[k])
        label = "fake" if "fake" in top else "real"

        heatmap: str | None = None
        if include_explanation:
            try:
                heatmap = generate_heatmap(self._model, self._processor, image)
            except Exception as exc:
                # Explainability is best-effort — never fail the prediction over it
                logger.warning("Heatmap generation failed: %s", exc)

        return PredictionResult(
            label=label,
            confidence=scores[top],
            scores=scores,
            heatmap_b64=heatmap,
        )
