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

@app.get("/db-test")
async def test_db_connection():
    """Test database connectivity."""
    try:
        from app.core.database import AsyncSessionLocal
        from sqlalchemy import text
        
        async with AsyncSessionLocal() as session:
            # Test connection
            result = await session.execute(text("SELECT version()"))
            version = result.scalar()
            
            # Test table existence
            tables = await session.execute(text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'public'"
            ))
            table_names = [row[0] for row in tables.fetchall()]
            
            return {
                "status": "connected",
                "version": version,
                "tables": table_names[:10],  # Show first 10 tables
                "database_url_prefix": settings.database_url[:30] + "..."
            }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "error_type": type(e).__name__
        }
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.get("/routes")
async def list_routes():
    """List all registered routes for debugging."""
    routes = []
    for route in app.routes:
        routes.append({
            "path": route.path,
            "name": route.name,
            "methods": list(route.methods) if hasattr(route, 'methods') else []
        })
    return {"routes": routes}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)