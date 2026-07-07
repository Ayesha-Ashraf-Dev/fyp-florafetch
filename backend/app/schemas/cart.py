from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CartItemCreate(BaseModel):
    plant_id: int
    quantity: int


class CartItemUpdate(BaseModel):
    quantity: int


class PlantInCart(BaseModel):
    id: int
    name: str
    botanical_name: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    stock: int

    class Config:
        from_attributes = True


class CartItemResponse(BaseModel):
    id: int
    plant_id: int
    quantity: int
    price: float
    plant: Optional[PlantInCart] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: int
    user_id: int
    total_price: float
    items: List[CartItemResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
