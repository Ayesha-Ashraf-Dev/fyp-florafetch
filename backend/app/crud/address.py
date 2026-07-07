from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from app.models.address import Address
from app.schemas.address import AddressCreate, AddressUpdate


async def get_address(db: AsyncSession, address_id: int) -> Address:
    """Get address by ID."""
    result = await db.execute(select(Address).where(Address.id == address_id))
    return result.scalar_one_or_none()


async def get_user_addresses(db: AsyncSession, user_id: int) -> list:
    """Get all addresses for a user."""
    result = await db.execute(
        select(Address).where(Address.user_id == user_id).order_by(Address.is_default.desc())
    )
    return result.scalars().all()


async def create_address(db: AsyncSession, user_id: int, address: AddressCreate) -> Address:
    """Create a new address."""
    # If this is the default address, unset other defaults
    if address.is_default:
        default_addresses = (await db.execute(
            select(Address).where(and_(Address.user_id == user_id, Address.is_default == True))
        )).scalars().all()
        for addr in default_addresses:
            addr.is_default = False

    # Map frontend field names to database field names
    db_address = Address(
        user_id=user_id,
        label="Home",  # Default label
        street_address=address.street,
        city=address.city,
        state=address.state,
        postal_code=address.zip_code,
        country=address.country or "Pakistan",
        phone="",  # Optional phone field
        is_default=address.is_default or False,
    )
    db.add(db_address)
    await db.commit()
    await db.refresh(db_address)
    return db_address


async def update_address(db: AsyncSession, address_id: int, address_update: AddressUpdate) -> Address:
    """Update address."""
    db_address = await get_address(db, address_id)
    if db_address:
        # Handle default address logic
        if address_update.is_default and not db_address.is_default:
            default_addresses = (await db.execute(
                select(Address).where(and_(Address.user_id == db_address.user_id, Address.is_default == True))
            )).scalars().all()
            for addr in default_addresses:
                addr.is_default = False

        update_data = address_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_address, field, value)
        await db.commit()
        await db.refresh(db_address)
    return db_address


async def delete_address(db: AsyncSession, address_id: int) -> bool:
    """Delete address."""
    db_address = await get_address(db, address_id)
    if db_address:
        await db.delete(db_address)
        await db.commit()
        return True
    return False
