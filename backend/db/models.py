from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    city = Column(String)
    base_premium = Column(Integer)
    status = Column(String, default="active")
    
    riders = relationship("Rider", back_populates="zone")


class Rider(Base):
    __tablename__ = "riders"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, unique=True, index=True)
    platform_id = Column(String, unique=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"))
    upi_id = Column(String)
    
    zone = relationship("Zone", back_populates="riders")
    policies = relationship("Policy", back_populates="rider")
    claims = relationship("Claim", back_populates="rider")


class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    rider_id = Column(Integer, ForeignKey("riders.id"))
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime)
    premium_paid = Column(Integer)
    max_coverage = Column(Integer)
    is_active = Column(Boolean, default=True)

    rider = relationship("Rider", back_populates="policies")


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    rider_id = Column(Integer, ForeignKey("riders.id"))
    trigger_type = Column(String) # 'rain', 'heat', 'aqi'
    amount = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="pending") # 'approved', 'paid', 'rejected'

    rider = relationship("Rider", back_populates="claims")
