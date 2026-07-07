from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewUpdate


async def get_review(db: AsyncSession, review_id: int) -> Review:
    """Get review by ID."""
    result = await db.execute(select(Review).where(Review.id == review_id))
    return result.scalar_one_or_none()


async def get_plant_reviews(db: AsyncSession, plant_id: int, skip: int = 0, limit: int = 100) -> list:
    """Get approved reviews for a plant."""
    result = await db.execute(
        select(Review)
        .where(and_(Review.plant_id == plant_id, Review.is_approved == True))
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def get_user_reviews(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100) -> list:
    """Get all reviews by a user."""
    result = await db.execute(
        select(Review)
        .where(Review.user_id == user_id)
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def create_review(db: AsyncSession, user_id: int, review: ReviewCreate) -> Review:
    """Create a new review."""
    db_review = Review(**review.dict(), user_id=user_id, is_approved=False)
    db.add(db_review)
    await db.commit()
    await db.refresh(db_review)
    return db_review


async def update_review(db: AsyncSession, review_id: int, review_update: ReviewUpdate) -> Review:
    """Update review."""
    db_review = await get_review(db, review_id)
    if db_review:
        update_data = review_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_review, field, value)
        await db.commit()
        await db.refresh(db_review)
    return db_review


async def delete_review(db: AsyncSession, review_id: int) -> bool:
    """Delete review."""
    db_review = await get_review(db, review_id)
    if db_review:
        await db.delete(db_review)
        await db.commit()
        return True
    return False


async def approve_review(db: AsyncSession, review_id: int) -> Review:
    """Approve a review (admin)."""
    db_review = await get_review(db, review_id)
    if db_review:
        db_review.is_approved = True
        await db.commit()
        await db.refresh(db_review)
    return db_review


async def add_admin_response(db: AsyncSession, review_id: int, response: str) -> Review:
    """Add admin response to review."""
    db_review = await get_review(db, review_id)
    if db_review:
        db_review.admin_response = response
        await db.commit()
        await db.refresh(db_review)
    return db_review


async def get_pending_reviews(db: AsyncSession, skip: int = 0, limit: int = 100) -> list:
    """Get all pending reviews (admin)."""
    result = await db.execute(
        select(Review)
        .where(Review.is_approved == False)
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()
