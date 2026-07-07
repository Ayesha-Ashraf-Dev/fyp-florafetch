from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ReviewCreate(BaseModel):
    plant_id: int
    order_id: int
    rating: float  # 1-5
    title: str
    comment: str
    plant_health_rating: float  # 1-5
    images: Optional[str] = None


class ReviewUpdate(BaseModel):
    rating: Optional[float] = None
    title: Optional[str] = None
    comment: Optional[str] = None
    plant_health_rating: Optional[float] = None


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    plant_id: int
    order_id: int
    rating: float
    title: str
    comment: str
    plant_health_rating: float
    images: Optional[str] = None
    is_approved: bool
    admin_response: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReviewListResponse(BaseModel):
    id: int
    user_id: int
    rating: float
    title: str
    comment: str
    plant_health_rating: float
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True
