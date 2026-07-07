from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import traceback
from app.core.config import settings
from app.core.database import engine, Base
import app.models  # noqa: F401 — register all models with Base.metadata
from app.routes import (
    auth_router,
    plants_router,
    cart_router,
    address_router,
    orders_router,
    reviews_router,
    contact_router,
    upload_router,
)

app = FastAPI(
    title="FloraFetch API",
    description="A web-based platform for online sale and distribution of plant species",
    version="1.0.0",
)

# CORS middleware - Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ADD THIS ---
@app.exception_handler(Exception)
async def debug_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__, "path": str(request.url)},
    )
# ----------------

# Include routers
app.include_router(auth_router)
app.include_router(plants_router)
app.include_router(cart_router)
app.include_router(address_router)
app.include_router(orders_router)
app.include_router(reviews_router)
app.include_router(contact_router)
app.include_router(upload_router)


@app.on_event("startup")
async def ensure_tables():
    """Create missing tables and backfill plant slugs."""
    from sqlalchemy import text
    from app.core.database import AsyncSessionLocal
    from app.crud.plant import backfill_plant_slugs

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(text(
            "ALTER TABLE plants ADD COLUMN IF NOT EXISTS slug VARCHAR(255)"
        ))
        await conn.execute(text(
            "CREATE UNIQUE INDEX IF NOT EXISTS ix_plants_slug ON plants (slug)"
        ))

    async with AsyncSessionLocal() as db:
        await backfill_plant_slugs(db)


@app.get("/")
async def root():
    """Welcome endpoint."""
    return {
        "message": "Welcome to FloraFetch API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)