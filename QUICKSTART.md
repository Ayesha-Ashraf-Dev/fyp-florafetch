# FloraFetch - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Prerequisites
- Python 3.8+
- PostgreSQL
- A terminal/command prompt

### Step 1: Database Setup
```bash
# Create PostgreSQL database
createdb florafetch_db

# Or using psql
psql -U postgres
# Inside psql:
# CREATE DATABASE florafetch_db;
# \q (to exit)
```

### Step 2: Setup Backend

**On Windows (PowerShell):**
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python seed_data.py
python main.py
```

**On macOS/Linux:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed_data.py
python main.py
```

Backend will be available at: `http://localhost:8000`

### Step 3: Setup Frontend

**In another terminal:**

**On Windows (PowerShell):**
```powershell
cd frontend
python -m http.server 3000 --directory public
```

**On macOS/Linux:**
```bash
cd frontend
python -m http.server 3000 --directory public
```

Frontend will be available at: `http://localhost:3000`

## 📝 Test Credentials

After setup, you can login with:

**Regular User:**
- Email: `user@example.com`
- Password: `password123`

**Admin User:**
- Email: `admin@example.com`
- Password: `admin123`

## 🎯 Try It Out

1. **View API Docs**: Visit `http://localhost:8000/docs`
2. **Shop**: Visit `http://localhost:3000` and browse plants
3. **Register**: Create a new account
4. **Add to Cart**: Add plants to your cart
5. **Checkout**: Complete the checkout process
6. **Track Order**: Check your orders page

## 🔧 Configuration

Edit `backend/.env` to customize settings:

```env
# Database connection
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/florafetch_db

# JWT secret key (change this!)
SECRET_KEY=your-super-secret-key-min-32-chars

# Frontend URL for CORS
CORS_ORIGINS=http://localhost:3000
```

## 📚 File Structure

```
FloraFetch/
├── backend/              # FastAPI server
│   ├── app/
│   │   ├── models/      # Database models
│   │   ├── routes/      # API endpoints
│   │   ├── schemas/     # Request/response schemas
│   │   ├── crud/        # Database operations
│   │   └── utils/       # Utilities & auth
│   ├── main.py          # Entry point
│   ├── seed_data.py     # Sample data
│   └── requirements.txt  # Dependencies
│
└── frontend/            # HTML/CSS/JS
    ├── public/          # HTML pages
    └── src/
        ├── css/         # Styles
        └── js/          # JavaScript
```

## 🐛 Troubleshooting

### Port already in use?
```bash
# Change backend port
uvicorn app.main:app --reload --port 8001

# Change frontend port
python -m http.server 3001 --directory public
```

### CORS errors?
Update `CORS_ORIGINS` in `backend/.env`:
```env
CORS_ORIGINS=http://localhost:3001
```

### Database connection error?
1. Verify PostgreSQL is running
2. Check database name, user, and password in `.env`
3. Ensure database exists: `createdb florafetch_db`

### API not loading?
- Check backend is running on port 8000
- Check `API_BASE_URL` in `frontend/src/js/api.js`
- Check browser console for errors (F12)

## 📖 API Examples

### Register
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "phone": "9876543210",
    "full_name": "Test User",
    "password": "password123"
  }'
```

### Get Plants
```bash
curl http://localhost:8000/api/plants
curl http://localhost:8000/api/plants?category=indoor
curl http://localhost:8000/api/plants?search=monstera
```

### Add to Cart
```bash
curl -X POST http://localhost:8000/api/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"plant_id": 1, "quantity": 1}'
```

## 🎨 Frontend Pages

- **`index.html`** - Shop with plant listing and search
- **`product.html`** - Product details with reviews
- **`login.html`** - User login
- **`register.html`** - User registration
- **`cart.html`** - Shopping cart management
- **`checkout.html`** - Order placement with address
- **`orders.html`** - Order history and tracking

## 🔌 Key Features Implemented

✅ User authentication with JWT
✅ Product catalog with filters
✅ Shopping cart
✅ Order management with status tracking
✅ Delivery address management
✅ Plant reviews and ratings
✅ Admin panel endpoints (review moderation, order updates)
✅ COD payment support
✅ Detailed care instructions for plants

## 📱 Next Steps

1. **Customize Styling**: Edit `frontend/src/css/style.css`
2. **Add More Plants**: Use admin endpoints to add more products
3. **Configure Emails**: Add SendGrid API key to send order confirmations
4. **Deploy**: Deploy backend to cloud (Heroku, AWS, etc.)
5. **Mobile App**: Build mobile version with React Native or Flutter

## 📞 Support

For issues and questions:
1. Check the main `README.md`
2. Review API documentation at `http://localhost:8000/docs`
3. Check browser console for errors (F12)
4. Check backend logs for server errors

---

**Happy planting! 🌿**
