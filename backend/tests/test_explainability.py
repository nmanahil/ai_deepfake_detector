import base64
import io
import pytest
from PIL import Image
from transformers import AutoModelForImageClassification, AutoImageProcessor
from app.ml.explainability import generate_heatmap

_MODEL_ID = "dima806/deepfake_vs_real_image_detection"

# NOTE: Tests verify the attention rollout pipeline runs end-to-end on a
# synthetic solid-colour image. They do NOT validate heatmap accuracy.


@pytest.fixture(scope="module")
def model_and_processor() -> tuple:
    model = AutoModelForImageClassification.from_pretrained(
        _MODEL_ID,
        output_attentions=True,
        attn_implementation="eager",
    )
    model.eval()
    processor = AutoImageProcessor.from_pretrained(_MODEL_ID)
    return model, processor


@pytest.fixture(scope="module")
def synthetic_image() -> Image.Image:
    return Image.new("RGB", (224, 224), color=(120, 80, 200))


def test_heatmap_returns_nonempty_base64(model_and_processor, synthetic_image) -> None:
    model, processor = model_and_processor
    result = generate_heatmap(model, processor, synthetic_image)
    assert isinstance(result, str) and len(result) > 0


def test_heatmap_decodes_to_valid_png(model_and_processor, synthetic_image) -> None:
    model, processor = model_and_processor
    result = generate_heatmap(model, processor, synthetic_image)
    img_bytes = base64.b64decode(result)
    img = Image.open(io.BytesIO(img_bytes))
    assert img.format == "PNG"


def test_heatmap_output_matches_input_size(model_and_processor, synthetic_image) -> None:
    model, processor = model_and_processor
    result = generate_heatmap(model, processor, synthetic_image)
    img = Image.open(io.BytesIO(base64.b64decode(result)))
    assert img.size == synthetic_image.size


def test_analyzer_heatmap_present_when_requested() -> None:
    """Integration: ImageAnalyzer.analyze() populates heatmap_b64 when include_explanation=True."""
    import io as _io
    from app.ml.image_classifier import ImageAnalyzer

    buf = _io.BytesIO()
    Image.new("RGB", (224, 224), color=(100, 150, 200)).save(buf, format="PNG")
    analyzer = ImageAnalyzer()
    result = analyzer.analyze(buf.getvalue(), include_explanation=True)
    assert result.heatmap_b64 is not None and len(result.heatmap_b64) > 0


def test_analyzer_heatmap_absent_when_not_requested() -> None:
    """Integration: ImageAnalyzer.analyze() omits heatmap_b64 when include_explanation=False."""
    import io as _io
    from app.ml.image_classifier import ImageAnalyzer

    buf = _io.BytesIO()
    Image.new("RGB", (224, 224), color=(100, 150, 200)).save(buf, format="PNG")
    analyzer = ImageAnalyzer()
    result = analyzer.analyze(buf.getvalue(), include_explanation=False)
    assert result.heatmap_b64 is None
