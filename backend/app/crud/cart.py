from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.cart import Cart, CartItem
from app.models.plant import Plant
from app.utils.helpers import calculate_cart_total


async def get_or_create_cart(db: AsyncSession, user_id: int) -> Cart:
    """Get or create cart for user."""
    result = await db.execute(select(Cart).where(Cart.user_id == user_id))
    cart = result.scalar_one_or_none()
    if not cart:
        cart = Cart(user_id=user_id, total_price=0.0)
        db.add(cart)
        await db.commit()
        await db.refresh(cart)
    return cart


async def get_cart(db: AsyncSession, user_id: int):
    """Get user's cart with items and plant details."""
    # Get the cart
    cart_result = await db.execute(
        select(Cart).where(Cart.user_id == user_id)
    )
    cart = cart_result.scalar_one_or_none()
    
    if not cart:
        return None
    
    # Get all cart items
    items_result = await db.execute(
        select(CartItem).where(CartItem.cart_id == cart.id)
    )
    cart_items = items_result.scalars().all()
    
    # Get all plants in one query
    if cart_items:
        plant_ids = [item.plant_id for item in cart_items]
        plants_result = await db.execute(
            select(Plant).where(Plant.id.in_(plant_ids))
        )
        plants_dict = {plant.id: plant for plant in plants_result.scalars().all()}
        
        # Build cart items with plants included
        enriched_items = []
        for item in cart_items:
            # Create a dict with plant data - matching CartItemResponse schema
            item_dict = {
                'id': item.id,
                'plant_id': item.plant_id,
                'quantity': item.quantity,
                'price': item.price,
                'created_at': item.created_at,
                'updated_at': item.updated_at,
                'plant': plants_dict.get(item.plant_id),
            }
            enriched_items.append(item_dict)
        
        # Return enriched cart matching CartResponse schema
        return {
            'id': cart.id,
            'user_id': cart.user_id,
            'total_price': cart.total_price,
            'created_at': cart.created_at,
            'updated_at': cart.updated_at,
            'items': enriched_items
        }
    else:
        # Empty cart
        return {
            'id': cart.id,
            'user_id': cart.user_id,
            'total_price': cart.total_price,
            'created_at': cart.created_at,
            'updated_at': cart.updated_at,
            'items': []
        }


async def add_to_cart(db: AsyncSession, user_id: int, plant_id: int, quantity: int) -> CartItem:
    """Add item to cart."""
    cart = await get_or_create_cart(db, user_id)
    
    # Get plant to get price
    plant_result = await db.execute(select(Plant).where(Plant.id == plant_id))
    plant = plant_result.scalar_one_or_none()
    if not plant:
        return None

    # Check if item already in cart
    result = await db.execute(
        select(CartItem).where(and_(CartItem.cart_id == cart.id, CartItem.plant_id == plant_id))
    )
    cart_item = result.scalar_one_or_none()

    if cart_item:
        cart_item.quantity += quantity
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            plant_id=plant_id,
            quantity=quantity,
            price=plant.price,
        )
        db.add(cart_item)

    await db.commit()
    await db.refresh(cart_item)
    
    # Update cart total
    await update_cart_total(db, cart.id)
    
    return cart_item


async def update_cart_item(db: AsyncSession, item_id: int, quantity: int) -> CartItem:
    """Update cart item quantity."""
    result = await db.execute(select(CartItem).where(CartItem.id == item_id))
    cart_item = result.scalar_one_or_none()
    
    if cart_item:
        if quantity <= 0:
            await db.delete(cart_item)
            await db.commit()
            # Update cart total
            cart_result = await db.execute(select(Cart).where(Cart.id == cart_item.cart_id))
            cart = cart_result.scalar_one_or_none()
            if cart:
                await update_cart_total(db, cart.id)
            return None
        else:
            cart_item.quantity = quantity
            await db.commit()
            await db.refresh(cart_item)
            # Update cart total
            await update_cart_total(db, cart_item.cart_id)
    
    return cart_item


async def remove_from_cart(db: AsyncSession, item_id: int) -> bool:
    """Remove item from cart."""
    result = await db.execute(select(CartItem).where(CartItem.id == item_id))
    cart_item = result.scalar_one_or_none()
    
    if cart_item:
        cart_id = cart_item.cart_id
        await db.delete(cart_item)
        await db.commit()
        # Update cart total
        await update_cart_total(db, cart_id)
        return True
    return False


async def clear_cart(db: AsyncSession, user_id: int) -> bool:
    """Clear user's cart."""
    cart = await get_or_create_cart(db, user_id)
    result = await db.execute(select(CartItem).where(CartItem.cart_id == cart.id))
    cart_items = result.scalars().all()
    
    for item in cart_items:
        await db.delete(item)
    
    cart.total_price = 0.0
    await db.commit()
    return True


async def update_cart_total(db: AsyncSession, cart_id: int):
    """Update cart total price."""
    result = await db.execute(select(Cart).where(Cart.id == cart_id))
    cart = result.scalar_one_or_none()
    
    if cart:
        items_result = await db.execute(select(CartItem).where(CartItem.cart_id == cart_id))
        items = items_result.scalars().all()
        cart.total_price = sum(item.price * item.quantity for item in items)
        await db.commit()
        await db.refresh(cart)
