from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from app.models.order import Order, OrderItem, OrderStatus
from app.models.cart import CartItem
from app.schemas.order import OrderCreate
from app.utils.helpers import generate_order_number


async def get_order(db: AsyncSession, order_id: int) -> Order:
    """Get order by ID with items eagerly loaded."""
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.order_items))
    )
    return result.scalar_one_or_none()


async def get_order_by_number(db: AsyncSession, order_number: str) -> Order:
    """Get order by order number."""
    result = await db.execute(
        select(Order)
        .where(Order.order_number == order_number)
        .options(selectinload(Order.order_items))
    )
    return result.scalar_one_or_none()


async def resolve_order(db: AsyncSession, identifier: str) -> Order | None:
    """Get order by order number or numeric ID."""
    if identifier.isdigit():
        return await get_order(db, int(identifier))
    return await get_order_by_number(db, identifier)


async def get_user_orders(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100) -> list:
    """Get all orders for a user."""
    result = await db.execute(
        select(Order)
        .where(Order.user_id == user_id)
        .options(selectinload(Order.order_items))
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def create_order(
    db: AsyncSession,
    user_id: int,
    cart_items: list,
    total_price: float,
    order_data: OrderCreate
) -> Order:
    """Create a new order from cart."""
    print(f"Creating order with {len(cart_items)} items")
    
    order_number = generate_order_number()
    
    db_order = Order(
        order_number=order_number,
        user_id=user_id,
        address_id=order_data.address_id,
        status=OrderStatus.ORDER_CONFIRMED,
        total_price=total_price,
        delivery_date=order_data.delivery_date,
        special_instructions=order_data.special_instructions,
        payment_method=order_data.payment_method or "cod",
        payment_status="pending",
    )
    db.add(db_order)
    await db.flush()

    # Add order items from cart
    for cart_item in cart_items:
        # cart_item is a dictionary from get_cart
        print(f"Processing cart item: {cart_item}")
        
        plant_id = cart_item.get('plant_id')
        quantity = cart_item.get('quantity')
        price = cart_item.get('price')
        
        print(f"Plant ID: {plant_id}, Quantity: {quantity}, Price: {price}")
        
        order_item = OrderItem(
            order_id=db_order.id,
            plant_id=plant_id,
            quantity=quantity,
            price=price,
        )
        db.add(order_item)

    await db.commit()
    await db.refresh(db_order)
    return db_order

async def create_order(
    db: AsyncSession,
    user_id: int,
    cart_items: list,  # This will be a list of dictionaries
    total_price: float,
    order_data: OrderCreate
) -> Order:
    """Create a new order from cart."""
    order_number = generate_order_number()
    
    db_order = Order(
        order_number=order_number,
        user_id=user_id,
        address_id=order_data.address_id,
        status=OrderStatus.ORDER_CONFIRMED,
        total_price=total_price,
        delivery_date=order_data.delivery_date,
        special_instructions=order_data.special_instructions,
        payment_method="cod",
        payment_status="pending",
    )
    db.add(db_order)
    await db.flush()  # Flush to get the order ID

    # Add order items from cart
    for cart_item in cart_items:
        # Check if cart_item is a dictionary or object
        if isinstance(cart_item, dict):
            # It's a dictionary from get_cart()
            plant_id = cart_item.get('plant_id')
            quantity = cart_item.get('quantity')
            price = cart_item.get('price')
            
            # If plant data is nested, you might need to access it differently
            plant_data = cart_item.get('plant')
            if plant_data and isinstance(plant_data, dict):
                # Use plant data from the nested dict if needed
                pass
        else:
            # It's a SQLAlchemy model
            plant_id = cart_item.plant_id
            quantity = cart_item.quantity
            price = cart_item.price
        
        order_item = OrderItem(
            order_id=db_order.id,
            plant_id=plant_id,
            quantity=quantity,
            price=price,
        )
        db.add(order_item)

    await db.commit()
    await db.refresh(db_order)
    return db_order

async def update_order_status(db: AsyncSession, order_id: int, new_status: str) -> Order:
    """Update order status."""
    order = await get_order(db, order_id)
    if order:
        order.status = OrderStatus(new_status)
        await db.commit()
        return await get_order(db, order_id)
    return order


async def get_all_orders(db: AsyncSession, skip: int = 0, limit: int = 100) -> list:
    """Get all orders (admin)."""
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.order_items))
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()
