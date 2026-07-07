# backend/app/core/config.py
import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_ENV_FILE = _BACKEND_DIR / ".env"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )
    
    database_url: str = ""  # Will be set from environment
    
    # ... other settings ...

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # If database_url is not set, try alternative variables
        if not self.database_url:
            for var in ["DATABASE_URL", "POSTGRES_URL", "STORAGE_URL"]:
                url = os.getenv(var)
                if url:
                    self.database_url = url
                    break
        
        # Convert to asyncpg format if needed
        if self.database_url and self.database_url.startswith("postgres://"):
            self.database_url = self.database_url.replace("postgres://", "postgresql+asyncpg://")
        
        # Ensure SSL for Neon
        if self.database_url and "neon.tech" in self.database_url:
            if "sslmode" not in self.database_url:
                if "?" in self.database_url:
                    self.database_url += "&sslmode=require"
                else:
                    self.database_url += "?sslmode=require"

settings = Settings()