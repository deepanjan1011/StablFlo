from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Zones ---
class ZoneBase(BaseModel):
    name: str
    city: str
    base_premium: int

class ZoneCreate(ZoneBase):
    pass

class Zone(ZoneBase):
    id: int
    status: str
    
    class Config:
        from_attributes = True

# --- Riders ---
class RiderBase(BaseModel):
    phone_number: str
    platform_id: str
    zone_id: int
    upi_id: str

class RiderCreate(RiderBase):
    pass

class Rider(RiderBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Policies ---
class PolicyCreate(BaseModel):
    rider_id: int
    duration_days: int = 7

class Policy(BaseModel):
    id: int
    rider_id: int
    start_date: datetime
    end_date: datetime
    premium_paid: int
    max_coverage: int
    is_active: bool

    class Config:
        from_attributes = True

# --- Claims ---
class ClaimCreate(BaseModel):
    rider_id: int
    trigger_type: str
    amount: int

class Claim(BaseModel):
    id: int
    rider_id: int
    trigger_type: str
    amount: int
    timestamp: datetime
    status: str

    class Config:
        from_attributes = True
