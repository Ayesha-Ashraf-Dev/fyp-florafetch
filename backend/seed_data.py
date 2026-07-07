#!/usr/bin/env python3
"""
Seed script to populate database with sample data for testing
Run: python seed_data.py
"""

import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine
from app.models import Base, User, Plant, UserRole
from app.utils.auth import hash_password

# Sample data
SAMPLE_USERS = [
    {
        "email": "user@example.com",
        "phone": "9876543210",
        "full_name": "John Doe",
        "password": "password123",
        "role": UserRole.USER,
    },
    {
        "email": "admin@example.com",
        "phone": "9876543211",
        "full_name": "Admin User",
        "password": "admin123",
        "role": UserRole.ADMIN,
    },
]

SAMPLE_PLANTS = [
    {
        "name": "Monstera Deliciosa",
        "botanical_name": "Rhaphidophora tetrasperma",
        "description": "Popular tropical plant with large, fenestrated leaves. Easy to care for and adds a dramatic flair to any room.",
        "category": "indoor",
        "price": 899.0,
        "size": "medium",
        "stock": 15,
        "sunlight_requirement": "bright, indirect light",
        "watering_frequency": "weekly",
        "soil_type": "well-draining potting mix",
        "temperature_min": 16.0,
        "temperature_max": 29.0,
        "humidity_level": "high",
        "is_pet_friendly": False,
        "is_low_maintenance": True,
        "growth_rate": "fast",
        "image_url": "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400",
    },
    {
        "name": "Snake Plant",
        "botanical_name": "Sansevieria trifasciata",
        "description": "Extremely hardy plant that can tolerate low light and irregular watering. Perfect for beginners!",
        "category": "indoor",
        "price": 449.0,
        "size": "small",
        "stock": 25,
        "sunlight_requirement": "low to bright indirect light",
        "watering_frequency": "biweekly",
        "soil_type": "well-draining cactus mix",
        "temperature_min": 10.0,
        "temperature_max": 35.0,
        "humidity_level": "low",
        "is_pet_friendly": False,
        "is_low_maintenance": True,
        "growth_rate": "slow",
        "image_url": "https://images.unsplash.com/photo-1616694342806-431e36752f10?w=400",
    },
    {
        "name": "Pothos",
        "botanical_name": "Epipremnum aureum",
        "description": "Trailing vine plant with heart-shaped leaves. Great for hanging baskets and terrariums.",
        "category": "indoor",
        "price": 299.0,
        "size": "small",
        "stock": 30,
        "sunlight_requirement": "bright, indirect light",
        "watering_frequency": "weekly",
        "soil_type": "well-draining potting mix",
        "temperature_min": 18.0,
        "temperature_max": 29.0,
        "humidity_level": "medium",
        "is_pet_friendly": False,
        "is_low_maintenance": True,
        "growth_rate": "fast",
        "image_url": "https://images.unsplash.com/photo-1543181286-2c816db7fd1b?w=400",
    },
    {
        "name": "Aloe Vera",
        "botanical_name": "Aloe barbadensis",
        "description": "Succulent with medicinal properties. Requires minimal water and can tolerate low light.",
        "category": "succulents",
        "price": 199.0,
        "size": "small",
        "stock": 20,
        "sunlight_requirement": "bright direct light",
        "watering_frequency": "monthly",
        "soil_type": "sandy, well-draining soil",
        "temperature_min": 13.0,
        "temperature_max": 27.0,
        "humidity_level": "low",
        "is_pet_friendly": True,
        "is_low_maintenance": True,
        "growth_rate": "medium",
        "image_url": "https://images.unsplash.com/photo-1599599810694-b3b41c5494d3?w=400",
    },
    {
        "name": "Jade Plant",
        "botanical_name": "Crassula ovata",
        "description": "Succulent tree-like plant symbolizing prosperity. Great for desks and shelves.",
        "category": "succulents",
        "price": 349.0,
        "size": "medium",
        "stock": 12,
        "sunlight_requirement": "bright direct light",
        "watering_frequency": "biweekly",
        "soil_type": "well-draining cactus mix",
        "temperature_min": 10.0,
        "temperature_max": 30.0,
        "humidity_level": "low",
        "is_pet_friendly": True,
        "is_low_maintenance": True,
        "growth_rate": "slow",
        "image_url": "https://images.unsplash.com/photo-1599599810694-b3b41c5494d3?w=400",
    },
    {
        "name": "Mint",
        "botanical_name": "Mentha piperita",
        "description": "Aromatic herb perfect for tea and cooking. Easy to grow and propagate.",
        "category": "medicinal",
        "price": 99.0,
        "size": "small",
        "stock": 40,
        "sunlight_requirement": "medium to bright light",
        "watering_frequency": "daily",
        "soil_type": "fertile, well-draining soil",
        "temperature_min": 15.0,
        "temperature_max": 30.0,
        "humidity_level": "medium",
        "is_pet_friendly": True,
        "is_low_maintenance": True,
        "growth_rate": "fast",
        "image_url": "https://images.unsplash.com/photo-1599599810694-b3b41c5494d3?w=400",
    },
    {
        "name": "Basil",
        "botanical_name": "Ocimum basilicum",
        "description": "Fragrant herb essential for Italian cooking. Grows rapidly in sunny locations.",
        "category": "medicinal",
        "price": 79.0,
        "size": "small",
        "stock": 50,
        "sunlight_requirement": "bright direct light",
        "watering_frequency": "daily",
        "soil_type": "moist, fertile soil",
        "temperature_min": 18.0,
        "temperature_max": 29.0,
        "humidity_level": "medium",
        "is_pet_friendly": True,
        "is_low_maintenance": True,
        "growth_rate": "fast",
        "image_url": "https://images.unsplash.com/photo-1599599810694-b3b41c5494d3?w=400",
    },
    {
        "name": "Sunflower",
        "botanical_name": "Helianthus annuus",
        "description": "Bright yellow flowering plant that loves the sun. Symbol of positivity and joy.",
        "category": "flowering",
        "price": 199.0,
        "size": "medium",
        "stock": 18,
        "sunlight_requirement": "direct sunlight",
        "watering_frequency": "twice-weekly",
        "soil_type": "well-draining garden soil",
        "temperature_min": 10.0,
        "temperature_max": 35.0,
        "humidity_level": "medium",
        "is_pet_friendly": True,
        "is_low_maintenance": False,
        "growth_rate": "fast",
        "image_url": "https://images.unsplash.com/photo-1599599810694-b3b41c5494d3?w=400",
    },
    {
        "name": "Tulips",
        "botanical_name": "Tulipa species",
        "description": "Beautiful spring flowers available in many colors. Perfect for gardens and bouquets.",
        "category": "flowering",
        "price": 149.0,
        "size": "small",
        "stock": 35,
        "sunlight_requirement": "direct sunlight",
        "watering_frequency": "twice-weekly",
        "soil_type": "well-draining garden soil",
        "temperature_min": 4.0,
        "temperature_max": 23.0,
        "humidity_level": "medium",
        "is_pet_friendly": False,
        "is_low_maintenance": False,
        "growth_rate": "medium",
        "image_url": "https://images.unsplash.com/photo-1599599810694-b3b41c5494d3?w=400",
    },
    {
        "name": "Orchid",
        "botanical_name": "Orchidaceae family",
        "description": "Elegant flowering plant with exotic blooms. Requires special care but rewards with beautiful flowers.",
        "category": "flowering",
        "price": 599.0,
        "size": "medium",
        "stock": 10,
        "sunlight_requirement": "bright, indirect light",
        "watering_frequency": "weekly",
        "soil_type": "orchid-specific bark mix",
        "temperature_min": 15.0,
        "temperature_max": 28.0,
        "humidity_level": "high",
        "is_pet_friendly": True,
        "is_low_maintenance": False,
        "growth_rate": "slow",
        "image_url": "https://images.unsplash.com/photo-1599599810694-b3b41c5494d3?w=400",
    },
    {
        "name": "Neem Tree",
        "botanical_name": "Azadirachta indica",
        "description": "Medicinal tree with natural pesticide properties. Great for outdoor gardens.",
        "category": "outdoor",
        "price": 799.0,
        "size": "large",
        "stock": 5,
        "sunlight_requirement": "direct sunlight",
        "watering_frequency": "weekly",
        "soil_type": "well-draining garden soil",
        "temperature_min": 20.0,
        "temperature_max": 40.0,
        "humidity_level": "medium",
        "is_pet_friendly": True,
        "is_low_maintenance": True,
        "growth_rate": "medium",
        "image_url": "https://images.unsplash.com/photo-1599599810694-b3b41c5494d3?w=400",
    },
]


async def seed_database():
    """Seed database with sample data"""
    try:
        # Create tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        async with AsyncSessionLocal() as session:
            # Add users
            print("Adding sample users...")
            for user_data in SAMPLE_USERS:
                # Check if user already exists
                result = await session.execute(
                    select(User).where(User.email == user_data["email"])
                )
                existing_user = result.scalar_one_or_none()

                if not existing_user:
                    password = user_data.pop("password")
                    user = User(
                        **user_data,
                        hashed_password=hash_password(password),
                    )
                    session.add(user)
                    print(f"  ✓ Created user: {user_data['email']}")
                else:
                    print(f"  ✓ User {user_data['email']} already exists")

            # Add plants
            print("\nAdding sample plants...")
            for plant_data in SAMPLE_PLANTS:
                # Check if plant already exists
                result = await session.execute(
                    select(Plant).where(Plant.name == plant_data["name"])
                )
                existing_plant = result.scalar_one_or_none()

                if not existing_plant:
                    plant = Plant(**plant_data)
                    session.add(plant)
                    print(f"  ✓ Created plant: {plant_data['name']}")
                else:
                    print(f"  ✓ Plant {plant_data['name']} already exists")

            await session.commit()
            print("\n✅ Database seeding completed successfully!")

    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(seed_database())
