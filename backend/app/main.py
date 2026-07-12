from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import Settings, get_settings
from app.core.logging import configure_logging
from app.api.routes import health


def create_app() -> FastAPI:
    settings: Settings = get_settings()
    configure_logging(settings)

    application = FastAPI(title="Deepfake Detector", docs_url="/docs")

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(health.router)

    return application


app = create_app()
