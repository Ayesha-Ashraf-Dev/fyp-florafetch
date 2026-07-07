from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas import PlantResponse, PlantListResponse, PlantCreate, PlantUpdate
from app.crud.plant import (
    resolve_plant,
    get_all_plants,
    get_plants_by_category,
    search_plants,
    create_plant,
    update_plant_by_identifier,
    delete_plant,
)
from app.crud import get_user_by_id, get_plant
from app.utils.auth import get_current_user
from app.models.user import UserRole

router = APIRouter(prefix="/api/plants", tags=["Plants"])


@router.get("", response_model=list[PlantListResponse])
async def get_plants(
    category: str = Query(None),
    search: str = Query(None),
    sort: str = Query("newest"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Get all plants with optional filtering and sorting."""
    if search:
        plants = await search_plants(db, search, skip, limit, sort)
    elif category:
        plants = await get_plants_by_category(db, category, skip, limit, sort)
    else:
        plants = await get_all_plants(db, skip, limit, sort)
    return plants


@router.get("/{identifier}", response_model=PlantResponse)
async def get_plant_detail(identifier: str, db: AsyncSession = Depends(get_db)):
    """Get plant details by slug or ID."""
    plant = await resolve_plant(db, identifier)
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found",
        )
    return plant


@router.post("", response_model=PlantResponse, status_code=status.HTTP_201_CREATED)
async def create_plant_endpoint(
    plant: PlantCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new plant (admin only)."""
    user = await get_user_by_id(db, current_user["user_id"])
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create plants",
        )

    db_plant = await create_plant(db, plant)
    return db_plant


@router.put("/{identifier}", response_model=PlantResponse)
async def update_plant_endpoint(
    identifier: str,
    plant_update: PlantUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a plant (admin only)."""
    user = await get_user_by_id(db, current_user["user_id"])
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update plants",
        )

    db_plant = await update_plant_by_identifier(db, identifier, plant_update)
    if not db_plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found",
        )
    return db_plant


@router.delete("/{identifier}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plant_endpoint(
    identifier: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a plant (admin only)."""
    user = await get_user_by_id(db, current_user["user_id"])
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete plants",
        )

    plant = await resolve_plant(db, identifier)
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found",
        )

    success = await delete_plant(db, plant.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found",
        )
