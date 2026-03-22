import os
import asyncio
import json
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

from db.database import engine, get_db, SessionLocal, Base
from db import models
import schemas
from services.weather_cache import get_cached_weather as get_current_weather, get_cached_aqi as get_current_aqi
from services.payments import initiate_payout, charge_subscription
from ml.estimators import calculate_risk_premium, estimate_income_loss
from ml.fraud_detector import is_fraudulent

Base.metadata.create_all(bind=engine)

# --- Firebase Admin initialization ---
_sa_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
if not _sa_json:
    raise RuntimeError("FIREBASE_SERVICE_ACCOUNT env var is missing — backend cannot start")
try:
    _cred = credentials.Certificate(json.loads(_sa_json))
    firebase_admin.initialize_app(_cred)
except (json.JSONDecodeError, ValueError) as e:
    raise RuntimeError(f"FIREBASE_SERVICE_ACCOUNT is malformed: {e}")

_ADMIN_SECRET_KEY = os.environ.get("ADMIN_SECRET_KEY", "")


async def get_verified_phone(authorization: str = Header(...)) -> str:
    try:
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        token = authorization[7:]
        decoded = firebase_auth.verify_id_token(token)
        raw_phone = decoded["phone_number"]
        if not raw_phone.startswith("+91"):
            raise HTTPException(status_code=400, detail="Only Indian (+91) phone numbers are supported")
        return raw_phone[3:]  # strip +91 → "9876543210"
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def assert_owns_rider(rider_id: int, verified_phone: str, db: Session):
    rider = db.query(models.Rider).filter(models.Rider.id == rider_id).first()
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")
    if rider.phone_number != verified_phone:
        raise HTTPException(status_code=403, detail="Forbidden")
    return rider


async def require_admin_key(x_admin_key: str = Header(..., alias="X-Admin-Key")) -> None:
    if not _ADMIN_SECRET_KEY or x_admin_key != _ADMIN_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Invalid admin key")


MONITOR_INTERVAL = int(os.getenv("MONITOR_INTERVAL_SECONDS", "15"))  # 900 for prod
MONITOR_BATCH_SIZE = int(os.getenv("MONITOR_BATCH_SIZE", "50"))


def batch_zones(zones, batch_size):
    """Yield successive batches from a list of zones."""
    for i in range(0, len(zones), batch_size):
        yield zones[i:i + batch_size]


async def trigger_monitoring_loop():
    while True:
        db = None
        try:
            print(f"[MONITOR] Running trigger monitoring loop...")
            db = SessionLocal()

            zones = db.query(models.Zone).filter(models.Zone.status == "active").all()
            print(f"[MONITOR] Processing {len(zones)} active zones in batches of {MONITOR_BATCH_SIZE}")

            for batch in batch_zones(zones, MONITOR_BATCH_SIZE):
                for zone in batch:
                    weather = get_current_weather(zone.city)
                    aqi = get_current_aqi(zone.city)

                    trigger_event = None
                    severity = 1.0

                    if not weather.get("error"):
                        rain = weather.get("rain_mm_1h", 0)
                        temp = weather.get("temp_c", 0)
                        if rain > 60:
                            trigger_event = 'rain'
                            severity = min(rain / 60.0, 2.0)
                        elif temp > 44:
                            trigger_event = 'heat'
                            severity = min(temp / 44.0, 1.5)

                    if not trigger_event and not aqi.get("error"):
                        aqi_val = aqi.get("aqi", 0)
                        try:
                            aqi_val = int(aqi_val)
                            if aqi_val > 400:
                                trigger_event = 'aqi'
                                severity = min(aqi_val / 400.0, 1.5)
                        except (ValueError, TypeError):
                            pass

                    if trigger_event:
                        print(f"[TRIGGER] {trigger_event.upper()} detected in {zone.name}!")
                        riders = db.query(models.Rider).filter(models.Rider.zone_id == zone.id).all()

                        for rider in riders:
                            active_policy = db.query(models.Policy).filter(
                                models.Policy.rider_id == rider.id,
                                models.Policy.is_active == True
                            ).order_by(models.Policy.id.desc()).first()

                            if active_policy:
                                now = datetime.utcnow()

                                cooldown_claim = db.query(models.Claim).filter(
                                    models.Claim.rider_id == rider.id,
                                    models.Claim.trigger_type == trigger_event,
                                    models.Claim.timestamp >= now - timedelta(hours=12),
                                    models.Claim.status.in_(["approved", "paid"])
                                ).first()

                                if cooldown_claim:
                                    continue

                                estimated_loss = estimate_income_loss(rider.average_daily_income, trigger_event, severity)
                                payout_amount = min(estimated_loss, active_policy.max_coverage)

                                if payout_amount <= 0:
                                    continue

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

                                active_policy.max_coverage -= payout_amount
                                db.add(active_policy)

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

                # Small delay between batches to spread API load
                await asyncio.sleep(1)

        except Exception as e:
            print(f"[MONITOR ERROR] {e}")
        finally:
            if db:
                db.close()

        from services.weather_cache import get_cache_stats
        print(f"[MONITOR] Cache stats: {get_cache_stats()}")
        await asyncio.sleep(MONITOR_INTERVAL)

async def renewal_job():
    """
    Daily background job: scans for all active policies whose end_date has
    passed, deactivates them, recalculates next week's dynamic premium,
    charges the rider's Razorpay mandate, and creates a fresh 7-day policy.

    Runs every 60 seconds in development so you can test without waiting a week.
    In production, swap asyncio.sleep(60) → asyncio.sleep(86400).
    """
    while True:
        db = None
        try:
            now = datetime.utcnow()
            print(f"[RENEWAL] Scanning for expired policies at {now.isoformat()}Z...")
            db = SessionLocal()

            expiring_policies = db.query(models.Policy).filter(
                models.Policy.is_active == True,
                models.Policy.end_date <= now
            ).all()

            if not expiring_policies:
                print("[RENEWAL] No expiring policies found.")

            for policy in expiring_policies:
                rider = db.query(models.Rider).filter(models.Rider.id == policy.rider_id).first()
                if not rider:
                    continue

                # --- Deactivate old policy ---
                policy.is_active = False
                db.add(policy)
                print(f"[RENEWAL] Expired policy #{policy.id} for rider #{rider.id}")

                # --- Apply pending zone change at billing cycle boundary ---
                if rider.pending_zone_id:
                    rider.zone_id = rider.pending_zone_id
                    rider.pending_zone_id = None
                    db.add(rider)
                    print(f"[RENEWAL] Zone change applied for rider #{rider.id} → zone #{rider.zone_id}")

                zone = db.query(models.Zone).filter(models.Zone.id == rider.zone_id).first()
                if not zone:
                    continue

                # --- Recalculate next week's premium dynamically ---
                weather = get_current_weather(zone.city)
                aqi = get_current_aqi(zone.city)
                personalized_max_coverage = rider.average_daily_income * 3
                personalized_base_premium = int(personalized_max_coverage * (zone.base_premium / 1000.0))
                new_premium = calculate_risk_premium(personalized_base_premium, weather, aqi)

                print(f"[RENEWAL] Rider #{rider.id}: new premium=₹{new_premium}, max_coverage=₹{personalized_max_coverage}")

                # --- Charge rider's Razorpay mandate ---
                charge_result = charge_subscription(
                    rider.subscription_id,
                    new_premium * 100,  # paise
                    f"renewal_policy_{policy.id}_rider_{rider.id}"
                )
                print(f"[RENEWAL] Charge result: {charge_result}")

                # --- Create new 7-day policy ---
                new_policy = models.Policy(
                    rider_id=rider.id,
                    start_date=now,
                    end_date=now + timedelta(days=7),
                    premium_paid=new_premium,
                    max_coverage=personalized_max_coverage,
                    subscription_id=rider.subscription_id,
                    is_active=True
                )
                db.add(new_policy)
                print(f"[RENEWAL] New policy created for rider #{rider.id}, valid until {new_policy.end_date.isoformat()}Z")

            db.commit()
        except Exception as e:
            print(f"[RENEWAL ERROR] {e}")
        finally:
            if db:
                db.close()

        # Dev: check every 60 seconds. Prod: 86400 (daily)
        await asyncio.sleep(60)

@asynccontextmanager
async def lifespan(app: FastAPI):
    monitor_task = asyncio.create_task(trigger_monitoring_loop())
    renewal_task = asyncio.create_task(renewal_job())
    yield
    monitor_task.cancel()
    renewal_task.cancel()

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
def create_zone(
    zone: schemas.ZoneCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin_key)
):
    db_zone = models.Zone(**zone.model_dump())
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    return db_zone

@app.get("/zones/", response_model=list[schemas.Zone])
def read_zones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Zone).offset(skip).limit(limit).all()

@app.get("/zones/{zone_id}/risk")
def get_zone_risk(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(models.Zone).filter(models.Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    from ml.estimators import calculate_risk_premium
    weather = get_current_weather(zone.city)
    aqi = get_current_aqi(zone.city)
    
    risk_premium = calculate_risk_premium(100, weather, aqi)
    multiplier = risk_premium / 100.0
    
    return {"multiplier": multiplier}

@app.post("/riders/", response_model=schemas.Rider)
def create_rider(
    rider: schemas.RiderCreate,
    db: Session = Depends(get_db),
    verified_phone: str = Depends(get_verified_phone)
):
    rider.phone_number = verified_phone  # override with token-verified phone
    existing = db.query(models.Rider).filter(models.Rider.phone_number == rider.phone_number).first()
    if existing:
        existing.average_daily_income = rider.average_daily_income
        existing.zone_id = rider.zone_id
        existing.upi_id = rider.upi_id
        db.commit()
        db.refresh(existing)
        return existing
    db_rider = models.Rider(**rider.model_dump())
    db.add(db_rider)
    db.commit()
    db.refresh(db_rider)
    return db_rider

@app.get("/riders/{rider_id}", response_model=schemas.Rider)
def read_rider(
    rider_id: int,
    db: Session = Depends(get_db),
    verified_phone: str = Depends(get_verified_phone)
):
    return assert_owns_rider(rider_id, verified_phone, db)

@app.patch("/riders/{rider_id}/zone", response_model=schemas.Rider)
def request_zone_change(
    rider_id: int,
    body: schemas.ZoneChangeRequest,
    db: Session = Depends(get_db),
    verified_phone: str = Depends(get_verified_phone)
):
    rider = assert_owns_rider(rider_id, verified_phone, db)
    zone = db.query(models.Zone).filter(models.Zone.id == body.zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    rider.pending_zone_id = body.zone_id
    db.commit()
    db.refresh(rider)
    return rider

@app.post("/policies/", response_model=schemas.Policy)
def create_policy(
    policy: schemas.PolicyCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin_key)
):
    rider = db.query(models.Rider).filter(models.Rider.id == policy.rider_id).first()
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")

    # If rider already has an active policy, return it
    existing_policy = db.query(models.Policy).filter(
        models.Policy.rider_id == policy.rider_id,
        models.Policy.is_active == True
    ).order_by(models.Policy.id.desc()).first()
    
    if existing_policy:
        return existing_policy

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

@app.post("/payment/create-subscription", response_model=schemas.SubscriptionCreateResponse)
def create_subscription_endpoint(
    rider_id: int,
    db: Session = Depends(get_db),
    verified_phone: str = Depends(get_verified_phone)
):
    rider = assert_owns_rider(rider_id, verified_phone, db)
    zone = db.query(models.Zone).filter(models.Zone.id == rider.zone_id).first()
    weather = get_current_weather(zone.city)
    aqi = get_current_aqi(zone.city)
    personalized_max_coverage = rider.average_daily_income * 3
    personalized_base_premium = int(personalized_max_coverage * (zone.base_premium / 1000.0))
    premium = calculate_risk_premium(personalized_base_premium, weather, aqi)
    from services.payments import create_subscription
    try:
        sub_data = create_subscription(premium * 100, f"StablFlo Premium - {zone.name}")
        return sub_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/payment/verify-subscription", response_model=schemas.Policy)
def verify_subscription_endpoint(
    data: schemas.SubscriptionVerify,
    db: Session = Depends(get_db),
    verified_phone: str = Depends(get_verified_phone)
):
    from services.payments import verify_subscription_signature
    is_valid = verify_subscription_signature(
        data.razorpay_payment_id,
        data.razorpay_subscription_id,
        data.razorpay_signature
    )
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid signature")
    rider = assert_owns_rider(data.rider_id, verified_phone, db)
    zone = db.query(models.Zone).filter(models.Zone.id == rider.zone_id).first()
    weather = get_current_weather(zone.city)
    aqi = get_current_aqi(zone.city)
    personalized_max_coverage = rider.average_daily_income * 3
    personalized_base_premium = int(personalized_max_coverage * (zone.base_premium / 1000.0))
    premium = calculate_risk_premium(personalized_base_premium, weather, aqi)
    existings = db.query(models.Policy).filter(
        models.Policy.rider_id == rider.id,
        models.Policy.is_active == True
    ).all()
    for existing in existings:
        existing.is_active = False
    rider.subscription_id = data.razorpay_subscription_id
    db.add(rider)
    db_policy = models.Policy(
        rider_id=rider.id,
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=7),
        premium_paid=premium,
        max_coverage=personalized_max_coverage,
        subscription_id=data.razorpay_subscription_id,
        is_active=True
    )
    db.add(db_policy)
    db.commit()
    db.refresh(db_policy)
    return db_policy

@app.get("/claims/rider/{rider_id}", response_model=list[schemas.Claim])
def read_claims(
    rider_id: int,
    db: Session = Depends(get_db),
    verified_phone: str = Depends(get_verified_phone)
):
    assert_owns_rider(rider_id, verified_phone, db)
    return db.query(models.Claim).filter(models.Claim.rider_id == rider_id).all()

@app.get("/policies/rider/{rider_id}", response_model=list[schemas.Policy])
def read_policies(
    rider_id: int,
    db: Session = Depends(get_db),
    verified_phone: str = Depends(get_verified_phone)
):
    assert_owns_rider(rider_id, verified_phone, db)
    return db.query(models.Policy).filter(models.Policy.rider_id == rider_id).order_by(models.Policy.id.desc()).all()

@app.post("/admin/simulate_event/{rider_id}", response_model=schemas.Claim)
def simulate_event(
    rider_id: int,
    trigger_event: str,
    severity: float,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin_key)
):
    """God mode endpoint to forcefully trigger an ML payout for a specific rider"""
    rider = db.query(models.Rider).filter(models.Rider.id == rider_id).first()
    if not rider: raise HTTPException(status_code=404, detail="Rider not found")
    
    active_policy = db.query(models.Policy).filter(
        models.Policy.rider_id == rider.id,
        models.Policy.is_active == True
    ).order_by(models.Policy.id.desc()).first()
    if not active_policy: raise HTTPException(status_code=400, detail="No active policy found")
        
    estimated_loss = estimate_income_loss(rider.average_daily_income, trigger_event, severity)
    payout_amount = min(estimated_loss, active_policy.max_coverage)

    if payout_amount <= 0:
        raise HTTPException(status_code=400, detail="Max coverage exhausted")

    # Deduct coverage for simulated events as well
    active_policy.max_coverage -= payout_amount
    db.add(active_policy)

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

@app.post("/admin/simulate_renewal/{rider_id}")
def simulate_renewal(
    rider_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin_key)
):
    """
    God mode: immediately expires the rider's active policy and runs the
    weekly renewal pipeline (premium recalc + mandate charge + new policy).
    Use this to test auto-renewal without waiting 7 days.
    """
    rider = db.query(models.Rider).filter(models.Rider.id == rider_id).first()
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")

    active_policy = db.query(models.Policy).filter(
        models.Policy.rider_id == rider.id,
        models.Policy.is_active == True
    ).order_by(models.Policy.id.desc()).first()
    if not active_policy:
        raise HTTPException(status_code=400, detail="No active policy found")

    # Force-expire the current policy
    active_policy.is_active = False
    active_policy.end_date = datetime.utcnow() - timedelta(seconds=1)
    db.add(active_policy)

    # Apply pending zone change if any
    if rider.pending_zone_id:
        rider.zone_id = rider.pending_zone_id
        rider.pending_zone_id = None
        db.add(rider)

    zone = db.query(models.Zone).filter(models.Zone.id == rider.zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    # Recalculate next week's premium dynamically
    weather = get_current_weather(zone.city)
    aqi = get_current_aqi(zone.city)
    personalized_max_coverage = rider.average_daily_income * 3
    personalized_base_premium = int(personalized_max_coverage * (zone.base_premium / 1000.0))
    new_premium = calculate_risk_premium(personalized_base_premium, weather, aqi)

    # Charge the mandate (simulated in dev)
    charge_result = charge_subscription(
        rider.subscription_id,
        new_premium * 100,
        f"renewal_policy_{active_policy.id}_rider_{rider.id}"
    )

    # Create new 7-day policy
    now = datetime.utcnow()
    new_policy = models.Policy(
        rider_id=rider.id,
        start_date=now,
        end_date=now + timedelta(days=7),
        premium_paid=new_premium,
        max_coverage=personalized_max_coverage,
        subscription_id=rider.subscription_id,
        is_active=True
    )
    db.add(new_policy)
    db.commit()
    db.refresh(new_policy)

    return {
        "renewed": True,
        "expired_policy_id": active_policy.id,
        "new_policy_id": new_policy.id,
        "new_premium": new_premium,
        "max_coverage": personalized_max_coverage,
        "new_end_date": new_policy.end_date.isoformat() + "Z",
        "charge_result": charge_result
    }

@app.get("/admin/cache-stats")
def cache_stats(_: None = Depends(require_admin_key)):
    """View weather/AQI cache statistics."""
    from services.weather_cache import get_cache_stats
    return get_cache_stats()


@app.post("/admin/clear-cache")
def clear_cache(_: None = Depends(require_admin_key)):
    """Force-clear all weather/AQI caches."""
    from services.weather_cache import clear_all_caches
    clear_all_caches()
    return {"cleared": True}
