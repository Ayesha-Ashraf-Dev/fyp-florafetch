import uuid
import re
from datetime import datetime


def generate_order_number() -> str:
    """Generate a unique order number."""
    return f"ORD-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"


def generate_slug(name: str, entity_id: int | None = None) -> str:
    """Generate a URL-friendly slug from a name."""
    slug = name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug).strip("-")
    if not slug:
        slug = "item"
    if entity_id is not None:
        slug = f"{slug}-{entity_id}"
    return slug[:200]


def calculate_cart_total(items: list) -> float:
    """Calculate total price of cart items."""
    return sum(item.price * item.quantity for item in items)
