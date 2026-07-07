from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas import OrderResponse, OrderCreate, OrderStatusUpdate, OrderListResponse
from app.crud import (
    get_order,
    resolve_order,
    get_user_orders,
    create_order,
    update_order_status,
    get_all_orders,
    get_cart,
    clear_cart,
    get_user_by_id,
    get_address,
)
from app.utils.auth import get_current_user
from app.models.user import UserRole

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.get("", response_model=list[OrderListResponse])
async def get_orders(
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Get orders - user gets their orders, admin gets all orders."""
    user = await get_user_by_id(db, current_user["user_id"])
    
    # If admin, get all orders
    if user and user.role == UserRole.ADMIN:
        orders = await get_all_orders(db, skip, limit)
    else:
        # Regular user gets their own orders
        orders = await get_user_orders(db, current_user["user_id"], skip, limit)
    
    return orders

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order_endpoint(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new order from cart."""
    # DEBUG: Log the user ID
    print(f"Creating order for user_id: {current_user['user_id']}")
    
    # Get user's cart
    cart = await get_cart(db, current_user["user_id"])
    
    # DEBUG: Log the cart
    print(f"Cart type: {type(cart)}")
    print(f"Cart content: {cart}")
    
    # Check if cart exists
    if not cart:
        print("Cart is None!")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart not found",
        )
    
    # Get cart items - cart is a dictionary from get_cart
    cart_items = cart.get('items', [])
    total_price = cart.get('total_price', 0)
    
    # DEBUG: Log items
    print(f"Cart items count: {len(cart_items)}")
    print(f"Cart items: {cart_items}")
    print(f"Total price: {total_price}")
    
    # Check if cart has items
    if not cart_items or len(cart_items) == 0:
        print("Cart items is empty!")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty",
        )

    # Verify address belongs to user
    address = await get_address(db, order_data.address_id)
    if not address or address.user_id != current_user["user_id"]:
        print(f"Address not found or doesn't belong to user. Address: {address}, User: {current_user['user_id']}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid address",
        )

    print("Creating order...")
    
    # Create order - pass the cart items (dictionaries)
    db_order = await create_order(
        db, 
        current_user["user_id"], 
        cart_items,  # These are dictionaries
        total_price, 
        order_data
    )

    # Clear cart
    await clear_cart(db, current_user["user_id"])
    print(f"Order created successfully: {db_order.id}")

    return db_order

@router.get("/{identifier}", response_model=OrderResponse)
async def get_order_endpoint(
    identifier: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get order by order number or ID."""
    order = await resolve_order(db, identifier)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    
    # Check permissions
    user = await get_user_by_id(db, current_user["user_id"])
    if order.user_id != current_user["user_id"] and (not user or user.role != UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order",
        )
    
    return order

@router.put("/{identifier}/status", response_model=OrderResponse)
async def update_order_status_endpoint(
    identifier: str,
    status_update: OrderStatusUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update order status (admin only)."""
    user = await get_user_by_id(db, current_user["user_id"])
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update order status",
        )

    existing = await resolve_order(db, identifier)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    order = await update_order_status(db, existing.id, status_update.status)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    return order