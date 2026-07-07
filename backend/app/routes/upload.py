from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import get_user_by_id
from app.models.user import UserRole
from app.utils.auth import get_current_user
from app.utils.cloudinary_storage import upload_images_to_cloudinary

router = APIRouter(prefix="/api/upload", tags=["Upload"])


@router.post("/images")
async def upload_images(
    files: Annotated[list[UploadFile], File()],
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload one or more images to Cloudinary (admin only)."""
    user = await get_user_by_id(db, current_user["user_id"])
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can upload images",
        )

    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided",
        )

    if len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 images per upload",
        )

    urls = await upload_images_to_cloudinary(files)
    return {"urls": urls, "image_url": urls[0] if urls else None}
