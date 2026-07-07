from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, Enum
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class PlantCategory(str, enum.Enum):
    INDOOR = "indoor"
    OUTDOOR = "outdoor"
    SUCCULENTS = "succulents"
    FLOWERING = "flowering"
    MEDICINAL = "medicinal"


class Plant(Base):
    __tablename__ = "plants"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, nullable=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    botanical_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(PlantCategory), nullable=False, index=True)
    price = Column(Float, nullable=False)
    size = Column(String(50), nullable=False)  # small, medium, large
    stock = Column(Integer, default=0, nullable=False)
    
    # Plant care information
    sunlight_requirement = Column(String(100), nullable=False)  # low, medium, high, direct
    watering_frequency = Column(String(100), nullable=False)  # daily, twice-weekly, weekly, biweekly
    soil_type = Column(String(100), nullable=False)
    temperature_min = Column(Float, nullable=False)
    temperature_max = Column(Float, nullable=False)
    humidity_level = Column(String(100), nullable=False)  # low, medium, high
    
    # Additional attributes
    is_pet_friendly = Column(Boolean, default=False)
    is_low_maintenance = Column(Boolean, default=False)
    growth_rate = Column(String(50), nullable=False)  # slow, medium, fast
    
    # Images
    image_url = Column(String(500), nullable=True)
    images = Column(Text, nullable=True)  # JSON string of multiple images
    
    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
