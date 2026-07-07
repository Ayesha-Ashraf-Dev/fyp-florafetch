from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas import AddressResponse, AddressCreate, AddressUpdate
from app.crud import (
    get_address,
    get_user_addresses,
    create_address,
    update_address,
    delete_address,
)
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/addresses", tags=["Addresses"])


@router.get("", response_model=list[AddressResponse])
async def get_user_addresses_endpoint(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all addresses for current user."""
    addresses = await get_user_addresses(db, current_user["user_id"])
    return addresses


@router.post("", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
async def create_address_endpoint(
    address: AddressCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new address."""
    db_address = await create_address(db, current_user["user_id"], address)
    return db_address


@router.get("/{address_id}", response_model=AddressResponse)
async def get_address_endpoint(
    address_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get address by ID."""
    db_address = await get_address(db, address_id)
    if not db_address or db_address.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )
    return db_address


@router.put("/{address_id}", response_model=AddressResponse)
async def update_address_endpoint(
    address_id: int,
    address_update: AddressUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update address."""
    db_address = await get_address(db, address_id)
    if not db_address or db_address.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )

    updated_address = await update_address(db, address_id, address_update)
    return updated_address


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address_endpoint(
    address_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete address."""
    db_address = await get_address(db, address_id)
    if not db_address or db_address.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )

    await delete_address(db, address_id)
