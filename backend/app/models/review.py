from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from app.core.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plant_id = Column(Integer, ForeignKey("plants.id", ondelete="CASCADE"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    
    # Review content
    rating = Column(Float, nullable=False)  # 1-5
    title = Column(String(255), nullable=False)
    comment = Column(Text, nullable=False)
    plant_health_rating = Column(Float, nullable=False)  # 1-5, health on arrival
    
    # Images
    images = Column(Text, nullable=True)  # JSON string of image URLs
    
    # Admin control
    is_approved = Column(Boolean, default=False)
    admin_response = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
