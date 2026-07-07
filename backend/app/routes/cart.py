from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas import CartResponse, CartItemCreate, CartItemUpdate
from app.crud import (
    get_cart,
    get_or_create_cart,
    add_to_cart,
    update_cart_item,
    remove_from_cart,
    clear_cart,
    get_plant,
)
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/cart", tags=["Cart"])


@router.get("", response_model=CartResponse)
async def get_user_cart(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user's cart."""
    # Ensure cart exists
    await get_or_create_cart(db, current_user["user_id"])
    # Fetch cart with relationships
    cart = await get_cart(db, current_user["user_id"])
    return cart


@router.post("/items", response_model=CartResponse)
async def add_item_to_cart(
    item: CartItemCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add item to cart."""
    # Check if plant exists
    plant = await get_plant(db, item.plant_id)
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found",
        )

    if plant.stock < item.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock",
        )

    cart_item = await add_to_cart(db, current_user["user_id"], item.plant_id, item.quantity)
    cart = await get_cart(db, current_user["user_id"])
    return cart


@router.put("/items/{item_id}", response_model=CartResponse)
async def update_item_quantity(
    item_id: int,
    item_update: CartItemUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update item quantity in cart."""
    cart_item = await update_cart_item(db, item_id, item_update.quantity)
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )
    cart = await get_cart(db, current_user["user_id"])
    return cart


@router.delete("/items/{item_id}", response_model=CartResponse)
async def remove_item_from_cart(
    item_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove item from cart."""
    success = await remove_from_cart(db, item_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )
    cart = await get_cart(db, current_user["user_id"])
    return cart


@router.delete("", response_model=CartResponse)
async def clear_user_cart(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Clear user's cart."""
    await clear_cart(db, current_user["user_id"])
    cart = await get_cart(db, current_user["user_id"])
    return cart
