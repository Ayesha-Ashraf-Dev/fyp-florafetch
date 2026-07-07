from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, asc, desc
from app.models.plant import Plant
from app.schemas.plant import PlantCreate, PlantUpdate
from app.utils.helpers import generate_slug

SORT_OPTIONS = {
    "newest": desc(Plant.created_at),
    "oldest": asc(Plant.created_at),
    "price_low": asc(Plant.price),
    "price_high": desc(Plant.price),
    "name_asc": asc(Plant.name),
    "name_desc": desc(Plant.name),
}


def _apply_sort(query, sort: str = "newest"):
    order = SORT_OPTIONS.get(sort, SORT_OPTIONS["newest"])
    return query.order_by(order)


async def get_plant(db: AsyncSession, plant_id: int) -> Plant:
    """Get plant by ID."""
    result = await db.execute(select(Plant).where(Plant.id == plant_id))
    return result.scalar_one_or_none()


async def get_plant_by_slug(db: AsyncSession, slug: str) -> Plant:
    """Get plant by slug."""
    result = await db.execute(select(Plant).where(Plant.slug == slug))
    return result.scalar_one_or_none()


async def resolve_plant(db: AsyncSession, identifier: str) -> Plant | None:
    """Get plant by slug or numeric ID."""
    if identifier.isdigit():
        return await get_plant(db, int(identifier))
    plant = await get_plant_by_slug(db, identifier)
    if plant:
        return plant
    if identifier.rsplit("-", 1)[-1].isdigit():
        return await get_plant(db, int(identifier.rsplit("-", 1)[-1]))
    return None


async def get_plants_by_category(
    db: AsyncSession, category: str, skip: int = 0, limit: int = 100, sort: str = "newest"
) -> list:
    """Get plants by category."""
    query = _apply_sort(
        select(Plant).where(and_(Plant.category == category, Plant.is_active == True)),
        sort,
    )
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


async def get_all_plants(db: AsyncSession, skip: int = 0, limit: int = 100, sort: str = "newest") -> list:
    """Get all active plants."""
    query = _apply_sort(select(Plant).where(Plant.is_active == True), sort)
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


async def search_plants(
    db: AsyncSession, query_str: str, skip: int = 0, limit: int = 100, sort: str = "newest"
) -> list:
    """Search plants by name or botanical name."""
    query = _apply_sort(
        select(Plant).where(
            and_(
                or_(
                    Plant.name.ilike(f"%{query_str}%"),
                    Plant.botanical_name.ilike(f"%{query_str}%"),
                ),
                Plant.is_active == True,
            )
        ),
        sort,
    )
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


async def create_plant(db: AsyncSession, plant: PlantCreate) -> Plant:
    """Create a new plant."""
    data = plant.model_dump()
    db_plant = Plant(**data)
    db.add(db_plant)
    await db.flush()
    db_plant.slug = generate_slug(db_plant.name, db_plant.id)
    await db.commit()
    await db.refresh(db_plant)
    return db_plant


async def update_plant(db: AsyncSession, plant_id: int, plant_update: PlantUpdate) -> Plant:
    """Update plant."""
    db_plant = await get_plant(db, plant_id)
    if db_plant:
        update_data = plant_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_plant, field, value)
        if "name" in update_data:
            db_plant.slug = generate_slug(db_plant.name, db_plant.id)
        await db.commit()
        await db.refresh(db_plant)
    return db_plant


async def update_plant_by_identifier(
    db: AsyncSession, identifier: str, plant_update: PlantUpdate
) -> Plant | None:
    plant = await resolve_plant(db, identifier)
    if not plant:
        return None
    return await update_plant(db, plant.id, plant_update)


async def delete_plant(db: AsyncSession, plant_id: int) -> bool:
    """Soft delete plant."""
    db_plant = await get_plant(db, plant_id)
    if db_plant:
        db_plant.is_active = False
        await db.commit()
        return True
    return False


async def backfill_plant_slugs(db: AsyncSession) -> None:
    """Ensure every plant has a unique slug."""
    result = await db.execute(select(Plant))
    plants = result.scalars().all()
    changed = False
    for plant in plants:
        if not plant.slug:
            plant.slug = generate_slug(plant.name, plant.id)
            changed = True
    if changed:
        await db.commit()
