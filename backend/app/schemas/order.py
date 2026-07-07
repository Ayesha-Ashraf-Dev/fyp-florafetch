from pydantic import BaseModel, model_validator
from typing import Optional, List, Any
from datetime import datetime


class OrderItemResponse(BaseModel):
    id: int
    plant_id: int
    quantity: int
    price: float
    created_at: datetime

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    address_id: int
    delivery_date: Optional[datetime] = None
    special_instructions: Optional[str] = None
    payment_method: Optional[str] = "cod"


class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: int
    address_id: int
    status: str
    total_price: float
    delivery_date: Optional[datetime] = None
    special_instructions: Optional[str] = None
    payment_method: str
    payment_status: str
    items: List[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime

    @model_validator(mode="before")
    @classmethod
    def serialize_order(cls, data: Any) -> Any:
        if hasattr(data, "order_items"):
            status_val = data.status.value if hasattr(data.status, "value") else str(data.status)
            return {
                "id": data.id,
                "order_number": data.order_number,
                "user_id": data.user_id,
                "address_id": data.address_id,
                "status": status_val,
                "total_price": data.total_price,
                "delivery_date": data.delivery_date,
                "special_instructions": data.special_instructions,
                "payment_method": data.payment_method,
                "payment_status": data.payment_status,
                "items": data.order_items or [],
                "created_at": data.created_at,
                "updated_at": data.updated_at,
            }
        if isinstance(data, dict):
            if "order_items" in data and "items" not in data:
                data["items"] = data.pop("order_items")
            if "status" in data and hasattr(data["status"], "value"):
                data["status"] = data["status"].value
        return data

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str
    admin_notes: Optional[str] = None


class OrderListResponse(BaseModel):
    id: int
    order_number: str
    status: str
    total_price: float
    item_count: int = 0
    created_at: datetime
    updated_at: datetime

    @model_validator(mode="before")
    @classmethod
    def serialize_order_list(cls, data: Any) -> Any:
        if hasattr(data, "order_items"):
            status_val = data.status.value if hasattr(data.status, "value") else str(data.status)
            return {
                "id": data.id,
                "order_number": data.order_number,
                "status": status_val,
                "total_price": data.total_price,
                "item_count": len(data.order_items or []),
                "created_at": data.created_at,
                "updated_at": data.updated_at,
            }
        if isinstance(data, dict):
            if "status" in data and hasattr(data["status"], "value"):
                data["status"] = data["status"].value
        return data

    class Config:
        from_attributes = True
