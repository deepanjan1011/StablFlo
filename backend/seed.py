import os
from sqlalchemy.orm import Session
from db.database import engine, SessionLocal, Base
from db.models import Zone, Rider, Policy, Claim

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if zones already exist
    existing_zones = db.query(Zone).count()
    if existing_zones > 0:
        print("Database already seeded with zones.")
        db.close()
        return

    print("Seeding initial zones into the database...")
    
    zones_to_add = [
        Zone(name="Bangalore Low-Risk", city="Bangalore", base_premium=20, status="active"),
        Zone(name="Hyderabad Moderate-Risk", city="Hyderabad", base_premium=30, status="active"),
        Zone(name="Chennai High-Risk", city="Chennai", base_premium=40, status="active")
    ]
    
    db.add_all(zones_to_add)
    db.commit()
    print("Successfully seeded 3 delivery zones.")
    db.close()

if __name__ == "__main__":
    seed_data()
