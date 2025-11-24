from pathlib import Path

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent.parent / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # JWT Settings
    cookie_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 1 day

    # CORS Settings
    cors_origins: list[str]

    secure_cookies: bool = True

    # Database Settings
    # Defaults to SQLite for development, but can be overridden via DATABASE_URL env var
    database_url: str = "sqlite:///./sql_app.db"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse comma-separated CORS origins string into a list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        if isinstance(v, list):
            return v
        return v

    @model_validator(mode="after")
    def validate_secret_key(self):
        """Ensure COOKIE_SECRET_KEY is changed from the default value."""
        default_secret = "your-secret-key-change-in-production"
        assert self.cookie_secret_key != default_secret, (
            "COOKIE_SECRET_KEY must be changed from the default value. Please set a secure random string in your .env file."
        )
        return self


# Create a singleton settings instance
settings = Settings()
