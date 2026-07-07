import asyncio

import cloudinary
import cloudinary.uploader
from cloudinary.exceptions import Error as CloudinaryError
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def _ensure_configured():
    if not all([
        settings.cloudinary_cloud_name,
        settings.cloudinary_api_key,
        settings.cloudinary_api_secret,
    ]):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Image storage is not configured. Set Cloudinary environment variables.",
        )
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )


async def upload_image_to_cloudinary(file: UploadFile, folder: str = "florafetch/plants") -> str:
    """Upload a single image to Cloudinary and return its secure URL."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 5MB.",
        )

    _ensure_configured()

    def _upload():
        return cloudinary.uploader.upload(
            content,
            folder=folder,
            resource_type="image",
        )

    try:
        result = await asyncio.to_thread(_upload)
        return result["secure_url"]
    except CloudinaryError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {exc}",
        ) from exc


async def upload_images_to_cloudinary(files: list[UploadFile], folder: str = "florafetch/plants") -> list[str]:
    """Upload multiple images and return their secure URLs."""
    urls = []
    for file in files:
        urls.append(await upload_image_to_cloudinary(file, folder))
    return urls
