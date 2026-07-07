# FloraFetch - Online Plant Store Platform

A complete web-based platform for online sale and distribution of plant species with real-time inventory tracking, detailed care guides, and efficient order fulfillment.

## Features

### User Features
- **User Registration & Authentication**: Secure email/phone-based registration with JWT tokens
- **Profile Management**: Save multiple delivery addresses, track purchase history
- **Plant Catalog**: Browse plants by category (Indoor, Outdoor, Succulents, Flowering, Medicinal)
- **Plant Search & Filters**: Search by name, filter by care requirements, price range, pet-friendly status
- **Shopping Cart**: Add plants to cart with quantity management
- **Checkout Process**: Multiple delivery address support, special delivery instructions
- **Payment**: Cash on Delivery (COD) option
- **Order Tracking**: Real-time order status updates (Confirmed → Plant Selection → In Transit → Delivered)
- **Reviews & Feedback**: Add reviews with photos and health ratings for received plants

### Admin Features
- **Product Management**: Add, edit, delete plants with detailed metadata (care requirements, images, pricing)
- **Order Management**: View and update order statuses
- **Review Moderation**: Approve reviews and provide expert responses
- **Inventory Management**: Track and manage plant stock

## Project Structure

```
florafetch/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # Configuration and settings
│   │   │   └── database.py        # Database setup and session management
│   │   ├── models/                # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── plant.py
│   │   │   ├── cart.py
│   │   │   ├── order.py
│   │   │   ├── address.py
│   │   │   └── review.py
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   ├── routes/                # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── plants.py
│   │   │   ├── cart.py
│   │   │   ├── orders.py
│   │   │   ├── address.py
│   │   │   └── reviews.py
│   │   ├── crud/                  # Database operations
│   │   ├── utils/                 # Utilities (auth, helpers)
│   │   └── main.py               # FastAPI app initialization
│   ├── requirements.txt           # Python dependencies
│   └── main.py                    # Entry point
├── frontend/
│   ├── public/
│   │   ├── index.html             # Shop page
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── cart.html
│   │   ├── checkout.html
│   │   ├── orders.html
│   │   └── product.html           # Product details
│   └── src/
│       ├── css/
│       │   └── style.css          # Global styles
│       └── js/
│           ├── api.js             # API client
│           ├── index.js           # Shop page logic
│           ├── cart.js
│           ├── checkout.js
│           ├── orders.js
│           └── product.js
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- PostgreSQL
- Node.js (optional, for frontend development)

### Backend Setup

1. **Create Python Virtual Environment**
   ```bash
   cd backend
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**
   
   Update `.env` file in the backend root:
   ```
   DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/florafetch_db
   SECRET_KEY=your-secret-key-min-32-chars
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   CORS_ORIGINS=http://localhost:3000
   ```

4. **Create PostgreSQL Database**
   ```bash
   createdb florafetch_db
   ```

5. **Run Database Migrations**
   ```bash
   # Using alembic
   alembic upgrade head
   ```

6. **Seed Sample Data (Optional)**
   ```bash
   python seed_data.py
   ```

7. **Start Backend Server**
   ```bash
   python main.py
   # or
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   Server will run at: `http://localhost:8000`
   API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to Frontend**
   ```bash
   cd frontend
   ```

2. **Update API URL** (if needed)
   
   Edit `frontend/src/js/api.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:8000/api';
   ```

3. **Serve Frontend**
   
   Using Python:
   ```bash
   python -m http.server 3000 --directory public
   ```
   
   Or using Node.js with http-server:
   ```bash
   npm install -g http-server
   http-server public -p 3000
   ```

4. **Access Frontend**
   
   Navigate to: `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile

### Plants
- `GET /api/plants` - List all plants (with filtering & search)
- `GET /api/plants/{id}` - Get plant details
- `POST /api/plants` - Create plant (admin only)
- `PUT /api/plants/{id}` - Update plant (admin only)
- `DELETE /api/plants/{id}` - Delete plant (admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/{id}` - Update cart item quantity
- `DELETE /api/cart/items/{id}` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Addresses
- `GET /api/addresses` - List user's addresses
- `POST /api/addresses` - Create new address
- `GET /api/addresses/{id}` - Get address
- `PUT /api/addresses/{id}` - Update address
- `DELETE /api/addresses/{id}` - Delete address

### Orders
- `GET /api/orders` - List user's orders
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}/status` - Update order status (admin only)

### Reviews
- `GET /api/reviews/plant/{id}` - Get plant reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews` - Get user's reviews
- `GET /api/reviews/{id}` - Get review
- `PUT /api/reviews/{id}` - Update review
- `DELETE /api/reviews/{id}` - Delete review
- `POST /api/reviews/{id}/approve` - Approve review (admin only)
- `POST /api/reviews/{id}/admin-response` - Add admin response (admin only)

## Testing

### Sample Login Credentials

After seeding data, use these credentials:

**Regular User**
- Email: `user@example.com`
- Password: `password123`

**Admin User**
- Email: `admin@example.com`
- Password: `admin123`

### Manual Testing Flow

1. Register a new account
2. Browse plants on the shop page
3. Add plants to cart
4. Go to checkout and add delivery address
5. Place order with COD payment
6. Track order status
7. Leave review for received plants

## Technologies Used

### Backend
- **FastAPI**: Modern async Python web framework
- **SQLAlchemy**: ORM for database operations
- **PostgreSQL**: Relational database
- **asyncpg**: Async PostgreSQL driver
- **Pydantic**: Data validation
- **JWT**: Authentication tokens
- **Alembic**: Database migrations

### Frontend
- **HTML5**: Markup
- **CSS3**: Styling with flexbox and grid
- **Vanilla JavaScript**: No framework dependencies
- **Fetch API**: HTTP requests

## Database Schema

### Users
- ID, Email, Phone, Full Name, Hashed Password, Role, Is Active, Profile Picture, Bio
- Timestamps: Created At, Updated At

### Plants
- ID, Name, Botanical Name, Description, Category, Price, Size, Stock
- Care Info: Sunlight, Watering Frequency, Soil Type, Temperature Range, Humidity
- Attributes: Pet Friendly, Low Maintenance, Growth Rate
- Images, Active Status, Timestamps

### Orders
- ID, Order Number, User ID, Address ID, Status, Total Price
- Delivery Date, Special Instructions
- Payment: Method (COD), Status
- Timestamps

### Cart & Cart Items
- Cart: User ID, Total Price
- Cart Items: Cart ID, Plant ID, Quantity, Price

### Addresses
- ID, User ID, Label, Street, City, State, Postal Code, Country, Phone, Is Default

### Reviews
- ID, User ID, Plant ID, Order ID
- Rating, Title, Comment, Plant Health Rating
- Images, Is Approved, Admin Response

## Error Handling

The API returns appropriate HTTP status codes:
- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- CORS protection
- Input validation with Pydantic
- Role-based access control (User/Admin)
- Async database operations for better security

## Future Enhancements

- Payment gateway integration (Stripe, PayPal, etc.)
- Email notifications for orders and reviews
- Plant care reminders and notifications
- Wishlist feature
- Plant subscription service
- Advanced analytics dashboard
- AI-based plant recommendations
- Live chat support
- Mobile app

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify DATABASE_URL in .env file
- Check database credentials

### CORS Errors
- Update CORS_ORIGINS in .env file
- Restart backend server

### API Not Responding
- Check if backend server is running on port 8000
- Verify API_BASE_URL in frontend code
- Check network connectivity

## License

MIT License

## Support

For issues and questions, please contact: support@florafetch.com
