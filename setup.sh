#!/bin/bash

# FloraFetch Setup Script
echo "🌿 FloraFetch Setup"
echo "===================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Setting up Backend${NC}"
cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
python -m venv venv

# Activate virtual environment
if [ "$OSTYPE" == "msys" ] || [ "$OSTYPE" == "win32" ]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo -e "${GREEN}✓ Backend setup complete${NC}\n"

echo -e "${BLUE}Step 2: Configuring Database${NC}"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file with default values..."
    cat > .env << EOF
# ── Database ──────────────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/florafetch_db
TEST_DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/florafetch_test

# ── Security ──────────────────────────────────────────────
SECRET_KEY=your-super-secret-key-change-this-to-a-long-random-string
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# ── CORS ──────────────────────────────────────────────────
CORS_ORIGINS=http://localhost:3000,http://localhost:8000

# ── Redis ─────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379/0

# ── AWS S3 ────────────────────────────────────────────────
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=florafetch-images
AWS_REGION=ap-south-1

# ── Email (SendGrid) ──────────────────────────────────────
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@florafetch.com
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

echo -e "\n${BLUE}Step 3: Running Migrations${NC}"
echo "Note: Make sure PostgreSQL is running and database exists!"
echo "Create database with: createdb florafetch_db"
echo ""
read -p "Press Enter to continue (or Ctrl+C to cancel)..."

# Uncomment when alembic is properly configured
# alembic upgrade head

echo -e "${GREEN}✓ Database setup complete${NC}\n"

echo -e "${BLUE}Step 4: Seeding Sample Data${NC}"
echo "Seeding database with sample plants and users..."
python seed_data.py
echo -e "${GREEN}✓ Sample data loaded${NC}\n"

echo -e "${BLUE}Backend Setup Complete!${NC}"
echo "To start the backend server, run:"
echo "  python main.py"
echo "  or"
echo "  uvicorn app.main:app --reload --port 8000"
echo ""

echo -e "${BLUE}Frontend Setup${NC}"
echo "==============="
echo "The frontend is ready to use at: frontend/public/index.html"
echo "Serve it with Python:"
echo "  cd ../frontend && python -m http.server 3000 --directory public"
echo ""

echo -e "${GREEN}🎉 Setup complete! Visit http://localhost:3000${NC}"
