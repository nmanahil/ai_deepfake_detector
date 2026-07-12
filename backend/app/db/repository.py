from sqlalchemy.orm import Session
from app.db.models import PredictionRecord


class PredictionRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def save(self, record: PredictionRecord) -> PredictionRecord:
        self._db.add(record)
        self._db.commit()
        self._db.refresh(record)
        return record

    def get_all(self, limit: int = 20, offset: int = 0) -> list[PredictionRecord]:
        return (
            self._db.query(PredictionRecord)
            .order_by(PredictionRecord.created_at.desc(), PredictionRecord.id.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    def get_by_id(self, record_id: int) -> PredictionRecord | None:
        return self._db.get(PredictionRecord, record_id)

    def count(self) -> int:
        return self._db.query(PredictionRecord).count()
