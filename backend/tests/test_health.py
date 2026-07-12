from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_returns_200_with_expected_shape() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "environment" in body
