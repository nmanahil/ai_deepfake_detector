import base64
import logging
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.db.repository import PredictionRepository
from app.db.session import get_db
from app.schemas.prediction import HistoryResponse, PredictionRecordSchema

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/history", tags=["history"])

# Jinja2 env — templates live next to the app package
_TEMPLATES_DIR = Path(__file__).resolve().parents[2] / "templates"
_jinja_env = Environment(
    loader=FileSystemLoader(str(_TEMPLATES_DIR)),
    autoescape=select_autoescape(["html"]),
)


@router.get("", response_model=HistoryResponse)
def list_history(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
) -> HistoryResponse:
    repo = PredictionRepository(db)
    return HistoryResponse(
        total=repo.count(),
        items=[PredictionRecordSchema.model_validate(r) for r in repo.get_all(limit, offset)],
    )


@router.get("/{record_id}", response_model=PredictionRecordSchema)
def get_record(
    record_id: int,
    db: Session = Depends(get_db),
) -> PredictionRecordSchema:
    repo = PredictionRepository(db)
    record = repo.get_by_id(record_id)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found.")
    return PredictionRecordSchema.model_validate(record)


@router.get("/{record_id}/report", response_class=HTMLResponse)
def download_report(
    record_id: int,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> HTMLResponse:
    # HTML chosen over PDF: zero extra dependencies, inline-CSS renders cleanly
    # in browser and can be printed to PDF natively. A PDF lib (weasyprint/reportlab)
    # would add ~50 MB of dependencies for no functional gain in a portfolio context.
    repo = PredictionRepository(db)
    record = repo.get_by_id(record_id)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found.")

    heatmap_b64: str | None = None
    if record.heatmap_path:
        heatmap_file = Path(record.heatmap_path)
        if heatmap_file.exists():
            heatmap_b64 = base64.b64encode(heatmap_file.read_bytes()).decode()

    template = _jinja_env.get_template("report.html")
    html = template.render(
        record=record,
        heatmap_b64=heatmap_b64,
        generated_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
    )
    return HTMLResponse(
        content=html,
        headers={"Content-Disposition": f'attachment; filename="report_{record_id}.html"'},
    )
