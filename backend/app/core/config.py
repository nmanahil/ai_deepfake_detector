import functools
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    log_level: str = "INFO"
    allowed_origins: list[str] = ["http://localhost:5173"]
    max_upload_size_mb: int = 10
    database_url: str = "sqlite:///./deepfake_detector.db"
    reports_dir: str = "reports"  # relative to the working directory (backend/)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_origins(cls, v: object) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v  # type: ignore[return-value]


@functools.lru_cache
def get_settings() -> Settings:
    return Settings()
