from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.contact import ContactMessageCreate, ContactMessageResponse, ContactMessageUpdate
from app.crud.contact import (
    create_contact_message,
    get_all_contact_messages,
    get_contact_message,
    mark_message_read,
    get_unread_count,
)
from app.crud import get_user_by_id
from app.models.user import UserRole
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/contact", tags=["Contact"])


@router.post("", response_model=ContactMessageResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact_message(
    data: ContactMessageCreate,
    db: AsyncSession = Depends(get_db),
):
    """Submit a contact form message (public)."""
    return await create_contact_message(db, data)


@router.get("", response_model=list[ContactMessageResponse])
async def get_contact_messages(
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Get all contact messages (admin only)."""
    user = await get_user_by_id(db, current_user["user_id"])
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view contact messages",
        )
    return await get_all_contact_messages(db, skip, limit)


@router.get("/unread-count")
async def unread_contact_count(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get unread message count (admin only)."""
    user = await get_user_by_id(db, current_user["user_id"])
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    count = await get_unread_count(db)
    return {"count": count}


@router.patch("/{message_id}", response_model=ContactMessageResponse)
async def update_contact_message(
    message_id: int,
    update: ContactMessageUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark a contact message as read/unread (admin only)."""
    user = await get_user_by_id(db, current_user["user_id"])
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    if update.is_read is not None:
        msg = await mark_message_read(db, message_id, update.is_read)
    else:
        msg = await get_contact_message(db, message_id)

    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    return msg
