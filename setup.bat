@echo off
REM FloraFetch Setup Script for Windows

echo.
echo === FloraFetch Setup ===
echo.

echo Step 1: Setting up Backend
cd backend

REM Create virtual environment
echo Creating Python virtual environment...
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo [OK] Backend setup complete
echo.

echo Step 2: Configuring Database
REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file with default values...
    (
        echo # Database
        echo DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/florafetch_db
        echo TEST_DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/florafetch_test
        echo.
        echo # Security
        echo SECRET_KEY=your-super-secret-key-change-this-to-a-long-random-string
        echo ACCESS_TOKEN_EXPIRE_MINUTES=30
        echo REFRESH_TOKEN_EXPIRE_DAYS=7
        echo.
        echo # CORS
        echo CORS_ORIGINS=http://localhost:3000,http://localhost:8000
        echo.
        echo # Redis
        echo REDIS_URL=redis://localhost:6379/0
        echo.
        echo # AWS S3
        echo AWS_ACCESS_KEY_ID=your-key
        echo AWS_SECRET_ACCESS_KEY=your-secret
        echo AWS_S3_BUCKET=florafetch-images
        echo AWS_REGION=ap-south-1
        echo.
        echo # Email
        echo SENDGRID_API_KEY=your-sendgrid-key
        echo FROM_EMAIL=noreply@florafetch.com
    ) > .env
    echo [OK] .env file created
) else (
    echo [OK] .env file already exists
)

echo.
echo Step 3: Seeding Sample Data
echo Seeding database with sample plants and users...
python seed_data.py
echo [OK] Sample data loaded
echo.

echo.
echo === Backend Setup Complete! ===
echo.
echo To start the backend server, run:
echo   python main.py
echo   or
echo   uvicorn app.main:app --reload --port 8000
echo.

echo === Frontend Setup ===
echo.
echo The frontend is ready to use at: frontend/public/index.html
echo Serve it with Python:
echo   cd ..\frontend
echo   python -m http.server 3000 --directory public
echo.

echo === Setup complete! Visit http://localhost:3000 ===
echo.
pause
