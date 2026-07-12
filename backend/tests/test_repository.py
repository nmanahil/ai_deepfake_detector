import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.db.models import Base, PredictionRecord
from app.db.repository import PredictionRepository


@pytest.fixture()
def db() -> Session:
    """In-memory SQLite session — isolated per test."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def _make_record(**kwargs) -> PredictionRecord:
    defaults = dict(filename="test.png", label="real", confidence=0.91, explanation="Likely real (91.0% confidence)")
    return PredictionRecord(**{**defaults, **kwargs})


def test_save_returns_record_with_id(db: Session) -> None:
    repo = PredictionRepository(db)
    record = repo.save(_make_record())
    assert record.id is not None
    assert record.id > 0


def test_get_by_id_returns_saved_record(db: Session) -> None:
    repo = PredictionRepository(db)
    saved = repo.save(_make_record(filename="photo.jpg", label="fake", confidence=0.87))
    fetched = repo.get_by_id(saved.id)
    assert fetched is not None
    assert fetched.filename == "photo.jpg"
    assert fetched.label == "fake"


def test_get_by_id_returns_none_for_missing(db: Session) -> None:
    repo = PredictionRepository(db)
    assert repo.get_by_id(9999) is None


def test_get_all_returns_records_newest_first(db: Session) -> None:
    repo = PredictionRepository(db)
    repo.save(_make_record(filename="a.png"))
    repo.save(_make_record(filename="b.png"))
    repo.save(_make_record(filename="c.png"))
    results = repo.get_all(limit=10, offset=0)
    assert len(results) == 3
    # newest first — c was inserted last
    assert results[0].filename == "c.png"


def test_get_all_respects_limit_and_offset(db: Session) -> None:
    repo = PredictionRepository(db)
    for i in range(5):
        repo.save(_make_record(filename=f"{i}.png"))
    page1 = repo.get_all(limit=2, offset=0)
    page2 = repo.get_all(limit=2, offset=2)
    assert len(page1) == 2
    assert len(page2) == 2
    assert {r.filename for r in page1}.isdisjoint({r.filename for r in page2})


def test_count_reflects_saved_records(db: Session) -> None:
    repo = PredictionRepository(db)
    assert repo.count() == 0
    repo.save(_make_record())
    repo.save(_make_record())
    assert repo.count() == 2
