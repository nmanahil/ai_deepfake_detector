from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import Settings, get_settings
from app.core.logging import configure_logging
from app.api.routes import health, predict, history
from app.db.models import Base
from app.db.session import engine


def create_app() -> FastAPI:
    settings: Settings = get_settings()
    configure_logging(settings)

    # Create tables if they don't exist (Alembic can take over later)
    Base.metadata.create_all(bind=engine)

    application = FastAPI(title="Deepfake Detector", docs_url="/docs")

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(health.router)
    application.include_router(predict.router)
    application.include_router(history.router)

    return application


app = create_app()
