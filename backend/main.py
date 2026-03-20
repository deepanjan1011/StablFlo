import os
import asyncio
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

from db.database import engine, get_db, SessionLocal, Base
from db import models
import schemas
from services.weather import get_current_weather
from services.aqi import get_current_aqi
from services.payments import initiate_payout
from ml.estimators import calculate_risk_premium, estimate_income_loss
from ml.fraud_detector import is_fraudulent

Base.metadata.create_all(bind=engine)

async def trigger_monitoring_loop():
    while True:
        try:
            print("[MONITOR] Running trigger monitoring loop...")
            db = SessionLocal()
            
            zones = db.query(models.Zone).filter(models.Zone.status == "active").all()
            for zone in zones:
                weather = get_current_weather(zone.city)
                aqi = get_current_aqi(zone.city)
                
                trigger_event = None
                severity = 1.0
                
                if not weather.get("error"):
                    rain = weather.get("rain_mm_1h", 0)
                    temp = weather.get("temp_c", 0)
                    if rain > 40: 
                        trigger_event = 'rain'
                        severity = min(rain / 40.0, 2.0)
                    elif temp > 42:
                        trigger_event = 'heat'
                        severity = min(temp / 42.0, 1.5)
                        
                if not trigger_event and not aqi.get("error"):
                    aqi_val = aqi.get("aqi", 0)
                    try:
                        aqi_val = int(aqi_val)
                        if aqi_val > 350:
                            trigger_event = 'aqi'
                            severity = min(aqi_val / 350.0, 1.5)
                    except (ValueError, TypeError):
                        pass

                if trigger_event:
                    print(f"[TRIGGER] {trigger_event.upper()} detected in {zone.name}!")
                    riders = db.query(models.Rider).filter(models.Rider.zone_id == zone.id).all()
                    
                    for rider in riders:
                        active_policy = db.query(models.Policy).filter(
                            models.Policy.rider_id == rider.id,
                            models.Policy.is_active == True
                        ).first()
                        
                        if active_policy:
                            estimated_loss = estimate_income_loss(rider.average_daily_income, trigger_event, severity)
                            payout_amount = min(estimated_loss, active_policy.max_coverage)

                            # Fraud detection
                            now = datetime.utcnow()
                            days_since_start = max(0, (now - active_policy.start_date).days)
                            hour_now = now.hour
                            recent_claims_count = db.query(models.Claim).filter(
                                models.Claim.rider_id == rider.id,
                                models.Claim.timestamp >= now - timedelta(hours=24)
                            ).count()

                            if is_fraudulent(payout_amount, severity, hour_now, days_since_start, recent_claims_count):
                                print(f"[FRAUD] Anomalous claim flagged for rider {rider.id} — skipping payout")
                                flagged_claim = models.Claim(
                                    rider_id=rider.id,
                                    trigger_type=trigger_event,
                                    amount=payout_amount,
                                    status="flagged",
                                )
                                db.add(flagged_claim)
                                db.commit()
                                continue

                            new_claim = models.Claim(
                                rider_id=rider.id,
                                trigger_type=trigger_event,
                                amount=payout_amount,
                                status="approved"
                            )
                            db.add(new_claim)
                            db.commit()
                            db.refresh(new_claim)

                            initiate_payout(rider.upi_id, payout_amount, new_claim.id)

                            new_claim.status = "paid"
                            db.commit()

            db.close()
        except Exception as e:
            print(f"[MONITOR ERROR] {e}")
        
        # Test frequency: 15 seconds instead of real 15 min
        await asyncio.sleep(15)

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(trigger_monitoring_loop())
    yield
    task.cancel()

app = FastAPI(title="StablFlo API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to StablFlo API"}

@app.post("/zones/", response_model=schemas.Zone)
def create_zone(zone: schemas.ZoneCreate, db: Session = Depends(get_db)):
    db_zone = models.Zone(**zone.model_dump())
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    return db_zone

@app.get("/zones/", response_model=list[schemas.Zone])
def read_zones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Zone).offset(skip).limit(limit).all()

@app.post("/riders/", response_model=schemas.Rider)
def create_rider(rider: schemas.RiderCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Rider).filter(models.Rider.phone_number == rider.phone_number).first()
    if existing:
        return existing
    db_rider = models.Rider(**rider.model_dump())
    db.add(db_rider)
    db.commit()
    db.refresh(db_rider)
    return db_rider

@app.get("/riders/{rider_id}", response_model=schemas.Rider)
def read_rider(rider_id: int, db: Session = Depends(get_db)):
    db_rider = db.query(models.Rider).filter(models.Rider.id == rider_id).first()
    if db_rider is None:
        raise HTTPException(status_code=404, detail="Rider not found")
    return db_rider

@app.patch("/riders/{rider_id}/zone", response_model=schemas.Rider)
def request_zone_change(rider_id: int, body: schemas.ZoneChangeRequest, db: Session = Depends(get_db)):
    rider = db.query(models.Rider).filter(models.Rider.id == rider_id).first()
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")
    zone = db.query(models.Zone).filter(models.Zone.id == body.zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    rider.pending_zone_id = body.zone_id
    db.commit()
    db.refresh(rider)
    return rider

@app.post("/policies/", response_model=schemas.Policy)
def create_policy(policy: schemas.PolicyCreate, db: Session = Depends(get_db)):
    rider = db.query(models.Rider).filter(models.Rider.id == policy.rider_id).first()
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")

    # Apply pending zone change at the start of a new billing cycle
    if rider.pending_zone_id:
        rider.zone_id = rider.pending_zone_id
        rider.pending_zone_id = None
        db.commit()

    zone = db.query(models.Zone).filter(models.Zone.id == rider.zone_id).first()
    
    # Calculate premium using real data
    weather = get_current_weather(zone.city)
    aqi = get_current_aqi(zone.city)
    premium = calculate_risk_premium(zone.base_premium, weather, aqi)
    
    db_policy = models.Policy(
        rider_id=rider.id,
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=policy.duration_days),
        premium_paid=premium,
        max_coverage=zone.base_premium * 50, # Exactly maps 20->1000, 30->1500, 40->2000 max payouts
        is_active=True
    )
    db.add(db_policy)
    db.commit()
    db.refresh(db_policy)
    return db_policy

@app.get("/claims/rider/{rider_id}", response_model=list[schemas.Claim])
def read_claims(rider_id: int, db: Session = Depends(get_db)):
    return db.query(models.Claim).filter(models.Claim.rider_id == rider_id).all()

@app.get("/policies/rider/{rider_id}", response_model=list[schemas.Policy])
def read_policies(rider_id: int, db: Session = Depends(get_db)):
    return db.query(models.Policy).filter(models.Policy.rider_id == rider_id).order_by(models.Policy.id.desc()).all()

@app.post("/admin/simulate_event/{rider_id}", response_model=schemas.Claim)
def simulate_event(rider_id: int, trigger_event: str, severity: float, db: Session = Depends(get_db)):
    """God mode endpoint to forcefully trigger an ML payout for a specific rider"""
    rider = db.query(models.Rider).filter(models.Rider.id == rider_id).first()
    if not rider: raise HTTPException(status_code=404, detail="Rider not found")
    
    active_policy = db.query(models.Policy).filter(
        models.Policy.rider_id == rider.id,
        models.Policy.is_active == True
    ).first()
    if not active_policy: raise HTTPException(status_code=400, detail="No active policy found")
        
    estimated_loss = estimate_income_loss(rider.average_daily_income, trigger_event, severity)
    payout_amount = min(estimated_loss, active_policy.max_coverage)

    new_claim = models.Claim(
        rider_id=rider.id,
        trigger_type=trigger_event,
        amount=payout_amount,
        status="approved"
    )
    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)

    initiate_payout(rider.upi_id, payout_amount, new_claim.id)
    new_claim.status = "paid"
    db.commit()
    db.refresh(new_claim)
    return new_claim
