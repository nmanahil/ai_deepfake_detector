import io
import pytest
from PIL import Image
from app.ml.image_classifier import ImageAnalyzer
from app.schemas.prediction import PredictionResult
from app.core.exceptions import InvalidImageError

# NOTE: These tests verify the inference pipeline runs end-to-end on synthetic
# solid-colour images. They do NOT validate real classification accuracy.


@pytest.fixture(scope="module")
def analyzer() -> ImageAnalyzer:
    return ImageAnalyzer()


def _png_bytes(color: tuple[int, int, int] = (200, 200, 200), size: int = 224) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (size, size), color=color).save(buf, format="PNG")
    return buf.getvalue()


def test_analyze_returns_prediction_result(analyzer: ImageAnalyzer) -> None:
    result = analyzer.analyze(_png_bytes())
    assert isinstance(result, PredictionResult)


def test_prediction_label_is_real_or_fake(analyzer: ImageAnalyzer) -> None:
    result = analyzer.analyze(_png_bytes())
    assert result.label in {"real", "fake"}


def test_confidence_is_between_0_and_1(analyzer: ImageAnalyzer) -> None:
    result = analyzer.analyze(_png_bytes())
    assert 0.0 <= result.confidence <= 1.0


def test_scores_dict_contains_expected_keys(analyzer: ImageAnalyzer) -> None:
    result = analyzer.analyze(_png_bytes())
    assert len(result.scores) >= 2
    assert all(isinstance(v, float) for v in result.scores.values())


def test_analyze_raises_on_corrupt_bytes(analyzer: ImageAnalyzer) -> None:
    with pytest.raises(InvalidImageError):
        analyzer.analyze(b"garbage")
