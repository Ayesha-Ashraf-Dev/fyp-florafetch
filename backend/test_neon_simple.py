# test_neon_simple.py
import asyncio
import os
from dotenv import load_dotenv

# Load .env
load_dotenv()

async def test_connection():
    """Simple test for Neon connection."""
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL not found in .env")
        return False
    
    print(f"🔗 URL: {database_url[:40]}...")
    
    # Clean URL (remove sslmode)
    if "sslmode=" in database_url:
        if "?" in database_url:
            base, params = database_url.split("?", 1)
            params_list = [p for p in params.split("&") if not p.startswith("sslmode=")]
            database_url = base + ("?" + "&".join(params_list) if params_list else "")
    
    # Add asyncpg
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")
    
    try:
        from sqlalchemy.ext.asyncio import create_async_engine
        from sqlalchemy import text
        
        # Create engine with SSL
        engine = create_async_engine(
            database_url,
            echo=False,
            connect_args={"ssl": True}
        )
        
        # Test connection
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"✅ Connected successfully!")
            print(f"📌 Version: {version}")
            
            result = await conn.execute(text("SELECT current_database()"))
            db_name = result.scalar()
            print(f"📌 Database: {db_name}")
            
        await engine.dispose()
        print("✅ Test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🧪 Testing Neon connection...")
    success = asyncio.run(test_connection())
    if success:
        print("\n✅ You can now run: uvicorn main:app --reload")
    else:
        print("\n❌ Please fix the connection issue before starting the app")