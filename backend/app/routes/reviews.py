from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas import ReviewResponse, ReviewCreate, ReviewUpdate, ReviewListResponse
from app.crud import (
    get_review,
    get_plant_reviews,
    get_user_reviews,
    create_review,
    update_review,
    delete_review,
    approve_review,
    add_admin_response,
    get_pending_reviews,
    get_user_by_id,
)
from app.utils.auth import get_current_user
from app.models.user import UserRole

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


@router.get("/plant/{plant_id}", response_model=list[ReviewListResponse])
async def get_plant_reviews_endpoint(
    plant_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Get all approved reviews for a plant."""
    reviews = await get_plant_reviews(db, plant_id, skip, limit)
    return reviews


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review_endpoint(
    review: ReviewCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new review."""
    db_review = await create_review(db, current_user["user_id"], review)
    return db_review


@router.get("", response_model=list[ReviewListResponse])
async def get_user_reviews_endpoint(
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Get all reviews by current user."""
    reviews = await get_user_reviews(db, current_user["user_id"], skip, limit)
    return reviews


@router.get("/pending", response_model=list[ReviewListResponse], tags=["Admin"])
async def get_pending_reviews_endpoint(
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Get all pending reviews (admin only)."""
    user = await get_user_by_id(db, current_user["user_id"])
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view pending reviews",
        )

    reviews = await get_pending_reviews(db, skip, limit)
    return reviews


@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review_endpoint(
    review_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get review by ID."""
    review = await get_review(db, review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )
    return review


@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review_endpoint(
    review_id: int,
    review_update: ReviewUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update review (only owner can update)."""
    review = await get_review(db, review_id)
    if not review or review.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    updated_review = await update_review(db, review_id, review_update)
    return updated_review


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review_endpoint(
    review_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete review (only owner can delete)."""
    review = await get_review(db, review_id)
    if not review or review.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    await delete_review(db, review_id)


@router.post("/{review_id}/approve", response_model=ReviewResponse, tags=["Admin"])
async def approve_review_endpoint(
    review_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Approve a review (admin only)."""
    user = await get_user_by_id(db, current_user["user_id"])
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can approve reviews",
        )

    review = await approve_review(db, review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )
    return review


@router.post("/{review_id}/admin-response", response_model=ReviewResponse, tags=["Admin"])
async def add_admin_response_endpoint(
    review_id: int,
    response: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add admin response to review."""
    user = await get_user_by_id(db, current_user["user_id"])
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can add response",
        )

    review = await add_admin_response(db, review_id, response)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )
    return review


