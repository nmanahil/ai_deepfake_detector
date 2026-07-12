from datetime import datetime, timezone
from unittest.mock import MagicMock
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db
from app.db.models import PredictionRecord


def _make_orm_record(**kwargs) -> PredictionRecord:
    r = PredictionRecord()
    r.id = kwargs.get("id", 1)
    r.created_at = kwargs.get("created_at", datetime(2024, 1, 1, tzinfo=timezone.utc))
    r.filename = kwargs.get("filename", "test.png")
    r.label = kwargs.get("label", "real")
    r.confidence = kwargs.get("confidence", 0.92)
    r.explanation = kwargs.get("explanation", "Likely real (92.0% confidence)")
    r.heatmap_path = kwargs.get("heatmap_path", None)
    return r


@pytest.fixture()
def client_with_db() -> TestClient:
    """Override get_db with a mock session backed by a fake repository."""
    mock_db = MagicMock()
    app.dependency_overrides[get_db] = lambda: mock_db
    yield TestClient(app), mock_db
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# GET /history
# ---------------------------------------------------------------------------

def test_list_history_returns_200(client_with_db) -> None:
    client, mock_db = client_with_db
    mock_db.query.return_value.count.return_value = 0
    mock_db.query.return_value.order_by.return_value.offset.return_value.limit.return_value.all.return_value = []
    response = client.get("/history")
    assert response.status_code == 200


def test_list_history_response_shape(client_with_db) -> None:
    client, mock_db = client_with_db
    record = _make_orm_record()
    mock_db.query.return_value.count.return_value = 1
    mock_db.query.return_value.order_by.return_value.offset.return_value.limit.return_value.all.return_value = [record]
    body = client.get("/history").json()
    assert body["total"] == 1
    assert len(body["items"]) == 1
    assert body["items"][0]["label"] == "real"


# ---------------------------------------------------------------------------
# GET /history/{id}
# ---------------------------------------------------------------------------

def test_get_record_returns_200_for_existing(client_with_db) -> None:
    client, mock_db = client_with_db
    mock_db.get.return_value = _make_orm_record(id=1)
    response = client.get("/history/1")
    assert response.status_code == 200
    assert response.json()["id"] == 1


def test_get_record_returns_404_for_missing(client_with_db) -> None:
    client, mock_db = client_with_db
    mock_db.get.return_value = None
    response = client.get("/history/999")
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# GET /history/{id}/report
# ---------------------------------------------------------------------------

def test_report_returns_html_for_existing(client_with_db) -> None:
    client, mock_db = client_with_db
    mock_db.get.return_value = _make_orm_record(id=1)
    response = client.get("/history/1/report")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "Analysis Report" in response.text


def test_report_returns_404_for_missing(client_with_db) -> None:
    client, mock_db = client_with_db
    mock_db.get.return_value = None
    response = client.get("/history/999/report")
    assert response.status_code == 404
