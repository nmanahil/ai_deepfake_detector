import io
from unittest.mock import MagicMock
import pytest
from fastapi.testclient import TestClient
from PIL import Image
from app.main import app
from app.schemas.prediction import PredictResponse
from app.services.prediction_service import get_prediction_service

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _png_bytes(size: int = 100) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (size, size), color=(100, 150, 200)).save(buf, format="PNG")
    return buf.getvalue()


_MOCK_RESPONSE = PredictResponse(
    id=1,
    label="real",
    confidence=0.92,
    explanation="Likely real (92.0% confidence)",
    heatmap_b64=None,
)


@pytest.fixture()
def client() -> TestClient:
    """TestClient with PredictionService dependency overridden to avoid model loading."""
    mock_service = MagicMock()
    mock_service.predict.return_value = _MOCK_RESPONSE
    app.dependency_overrides[get_prediction_service] = lambda: mock_service
    yield TestClient(app)
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_predict_valid_image_returns_200(client: TestClient) -> None:
    response = client.post(
        "/predict",
        files={"file": ("test.png", _png_bytes(), "image/png")},
    )
    assert response.status_code == 200


def test_predict_response_has_expected_schema(client: TestClient) -> None:
    response = client.post(
        "/predict",
        files={"file": ("test.png", _png_bytes(), "image/png")},
    )
    body = response.json()
    assert body["label"] in {"real", "fake"}
    assert 0.0 <= body["confidence"] <= 1.0
    assert "explanation" in body
    assert "heatmap_b64" in body


def test_predict_non_image_returns_422(client: TestClient) -> None:
    response = client.post(
        "/predict",
        files={"file": ("doc.pdf", b"%PDF-fake", "application/pdf")},
    )
    assert response.status_code == 422


def test_predict_oversized_file_returns_413(client: TestClient) -> None:
    from app.core.config import get_settings
    settings = get_settings()
    oversized = b"x" * (settings.max_upload_size_mb * 1024 * 1024 + 1)
    response = client.post(
        "/predict",
        files={"file": ("big.png", oversized, "image/png")},
    )
    assert response.status_code == 413


def test_predict_corrupt_image_returns_422(client: TestClient) -> None:
    from app.core.exceptions import InvalidImageError
    from app.services.prediction_service import get_prediction_service as gps

    mock_service = MagicMock()
    mock_service.predict.side_effect = InvalidImageError("corrupt")
    app.dependency_overrides[gps] = lambda: mock_service

    response = client.post(
        "/predict",
        files={"file": ("bad.png", b"not-an-image", "image/png")},
    )
    assert response.status_code == 422
    app.dependency_overrides.clear()
