from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, UserRole
from app.schemas.user import UserCreate
from app.utils.auth import hash_password, verify_password


async def get_user_by_email(db: AsyncSession, email: str) -> User:
    """Get user by email."""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_phone(db: AsyncSession, phone: str) -> User:
    """Get user by phone."""
    result = await db.execute(select(User).where(User.phone == phone))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: int) -> User:
    """Get user by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, user: UserCreate) -> User:
    """Create a new user."""
    db_user = User(
        email=user.email,
        phone=user.phone,
        full_name=user.full_name,
        hashed_password=hash_password(user.password),
        role=UserRole.USER,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def update_user_profile(
    db: AsyncSession,
    user_id: int,
    full_name: str = None,
    phone: str = None,
    bio: str = None,
    profile_picture: str = None,
) -> User:
    """Update user profile."""
    user = await get_user_by_id(db, user_id)
    if user:
        if full_name is not None:
            user.full_name = full_name
        if phone is not None:
            user.phone = phone
        if bio is not None:
            user.bio = bio
        if profile_picture is not None:
            user.profile_picture = profile_picture
        await db.commit()
        await db.refresh(user)
    return user


async def change_user_password(db: AsyncSession, user_id: int, current_password: str, new_password: str) -> bool:
    """Change user password. Returns False if current password is wrong."""
    user = await get_user_by_id(db, user_id)
    if not user or not verify_password(current_password, user.hashed_password):
        return False
    user.hashed_password = hash_password(new_password)
    await db.commit()
    return True


async def deactivate_user(db: AsyncSession, user_id: int) -> User | None:
    """Soft-delete user account."""
    user = await get_user_by_id(db, user_id)
    if user:
        user.is_active = False
        user.email = f"deleted_{user_id}_{user.email}"
        await db.commit()
        await db.refresh(user)
    return user
