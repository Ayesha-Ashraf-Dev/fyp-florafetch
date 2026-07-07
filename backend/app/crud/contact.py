from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.contact import ContactMessage
from app.schemas.contact import ContactMessageCreate


async def create_contact_message(db: AsyncSession, data: ContactMessageCreate) -> ContactMessage:
    msg = ContactMessage(
        name=data.name,
        email=data.email,
        subject=data.subject,
        message=data.message,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


async def get_all_contact_messages(db: AsyncSession, skip: int = 0, limit: int = 100) -> list:
    result = await db.execute(
        select(ContactMessage)
        .order_by(ContactMessage.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def get_contact_message(db: AsyncSession, message_id: int) -> ContactMessage | None:
    result = await db.execute(select(ContactMessage).where(ContactMessage.id == message_id))
    return result.scalar_one_or_none()


async def mark_message_read(db: AsyncSession, message_id: int, is_read: bool = True) -> ContactMessage | None:
    msg = await get_contact_message(db, message_id)
    if msg:
        msg.is_read = is_read
        await db.commit()
        await db.refresh(msg)
    return msg


async def get_unread_count(db: AsyncSession) -> int:
    result = await db.execute(
        select(ContactMessage).where(ContactMessage.is_read == False)  # noqa: E712
    )
    return len(result.scalars().all())
