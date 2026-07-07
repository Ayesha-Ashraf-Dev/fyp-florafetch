from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool
from app.core.config import settings
import re

def clean_database_url(url: str) -> str:
    """Clean database URL for asyncpg compatibility."""
    if not url:
        return url
    
    # Remove sslmode from URL if present
    if "sslmode=" in url:
        if "?" in url:
            base, params = url.split("?", 1)
            params_list = [p for p in params.split("&") if not p.startswith("sslmode=")]
            url = base + ("?" + "&".join(params_list) if params_list else "")
        elif "&" in url:
            parts = url.split("&")
            url = "&".join([p for p in parts if not p.startswith("sslmode=")])
    
    # Convert to asyncpg format
    if url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://")
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://")
    
    return url

# Clean the URL
database_url = clean_database_url(settings.database_url)

print(f"📊 Database URL: {database_url[:40]}...")

# Create engine with asyncpg-compatible settings
engine = create_async_engine(
    database_url,
    echo=False,
    poolclass=NullPool,
    pool_pre_ping=True,
    # For asyncpg, SSL is enabled differently
    connect_args={
        "ssl": True,  # Enable SSL for Neon
        "server_settings": {
            "application_name": "florafetch-vercel"
        }
    }
)

AsyncSessionLocal = async_sessionmaker(
    engine, 
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()