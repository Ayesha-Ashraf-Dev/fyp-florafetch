from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class AddressBase(BaseModel):
    label: Optional[str] = "Home"
    street_address: str
    city: str
    state: str
    postal_code: str
    country: Optional[str] = "Pakistan"
    phone: Optional[str] = None
    is_default: Optional[bool] = False


class AddressCreate(BaseModel):
    street: str
    city: str
    state: str
    zip_code: str
    country: Optional[str] = "Pakistan"
    is_default: Optional[bool] = False


class AddressUpdate(BaseModel):
    label: Optional[str] = None
    street_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    phone: Optional[str] = None
    is_default: Optional[bool] = None


class AddressResponse(AddressBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
