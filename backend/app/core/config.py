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
    
    # Database
    database_url: str = ""
    
    # JWT Settings - ADD THESE THREE LINES
    secret_key: str = ""  # This maps to SECRET_KEY in your .env
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # CORS
    cors_origins: str = "http://localhost:3000"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # Cloudinary
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Database URL handling
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
        
        # Load JWT settings from environment - ADD THESE LINES
        self.secret_key = os.getenv("SECRET_KEY", "fallback-secret-key-change-me")
        self.jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        self.refresh_token_expire_days = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
        self.cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000")
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.cloudinary_cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "")
        self.cloudinary_api_key = os.getenv("CLOUDINARY_API_KEY", "")
        self.cloudinary_api_secret = os.getenv("CLOUDINARY_API_SECRET", "")

settings = Settings()