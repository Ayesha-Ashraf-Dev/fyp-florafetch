from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PlantBase(BaseModel):
    name: str
    botanical_name: str
    description: str
    category: str
    price: float
    size: str
    stock: int
    sunlight_requirement: str
    watering_frequency: str
    soil_type: str
    temperature_min: float
    temperature_max: float
    humidity_level: str
    is_pet_friendly: bool = False
    is_low_maintenance: bool = False
    growth_rate: str


class PlantCreate(PlantBase):
    image_url: Optional[str] = None
    images: Optional[str] = None


class PlantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    sunlight_requirement: Optional[str] = None
    watering_frequency: Optional[str] = None
    is_active: Optional[bool] = None
    image_url: Optional[str] = None
    images: Optional[str] = None


class PlantResponse(PlantBase):
    id: int
    slug: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PlantListResponse(BaseModel):
    id: int
    slug: Optional[str] = None
    name: str
    botanical_name: str
    description: str
    category: str
    price: float
    size: str
    stock: int
    is_pet_friendly: bool
    is_low_maintenance: bool
    image_url: Optional[str] = None
    growth_rate: str

    class Config:
        from_attributes = True
