from app.routes.auth import router as auth_router
from app.routes.plants import router as plants_router
from app.routes.cart import router as cart_router
from app.routes.address import router as address_router
from app.routes.orders import router as orders_router
from app.routes.reviews import router as reviews_router
from app.routes.contact import router as contact_router
from app.routes.upload import router as upload_router

__all__ = [
    "auth_router",
    "plants_router",
    "cart_router",
    "address_router",
    "orders_router",
    "reviews_router",
    "contact_router",
    "upload_router",
]
