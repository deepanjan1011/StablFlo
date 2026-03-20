# StablFlo Core Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all stubs with real implementations — sklearn ML models, Razorpay payout integration, and zone-change endpoint — in priority order.

**Architecture:** ML models are trained once via a training script on synthetic-but-realistic Indian weather/income data, serialized with joblib, and loaded at startup. Razorpay uses their Python SDK in test mode (real API calls, no actual money). Zone change stores a `pending_zone_id` on the Rider and applies it at next policy creation.

**Tech Stack:** scikit-learn, numpy, pandas, joblib, razorpay (Python SDK), FastAPI, SQLAlchemy, PostgreSQL (Supabase)

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `backend/requirements.txt` | Add scikit-learn, numpy, pandas, joblib, razorpay |
| Create | `backend/ml/training_data.py` | Generates synthetic training dataset |
| Create | `backend/ml/train_models.py` | Trains + serializes both models |
| Create | `backend/ml/models/` | Directory for .joblib files (git-ignored) |
| Modify | `backend/ml/estimators.py` | Load real models, fall back to heuristic |
| Modify | `backend/services/payments.py` | Real Razorpay SDK call |
| Modify | `backend/db/models.py` | Add `pending_zone_id` to Rider |
| Modify | `backend/schemas.py` | Add `ZoneChangeRequest` schema |
| Modify | `backend/main.py` | Add `PATCH /riders/{id}/zone` endpoint |

---

## Task 1: Add ML + Razorpay dependencies

**Files:**
- Modify: `backend/requirements.txt`

- [ ] **Step 1: Update requirements.txt**

Replace contents of `backend/requirements.txt` with:

```
fastapi>=0.103.0
uvicorn>=0.23.2
sqlalchemy>=2.0.20
psycopg2-binary>=2.9.7
pydantic>=2.3.0
pydantic-settings>=2.0.3
python-dotenv>=1.0.0
requests>=2.31.0
scikit-learn>=1.4.0
numpy>=1.26.0
pandas>=2.1.0
joblib>=1.3.0
razorpay>=1.4.0
```

- [ ] **Step 2: Install into the venv**

```bash
cd backend && source venv/bin/activate && pip install scikit-learn numpy pandas joblib razorpay
```

Expected: All packages install without errors. Confirm with `pip show scikit-learn`.

- [ ] **Step 3: Create models directory, package init, and gitignore**

```bash
mkdir -p backend/ml/models
touch backend/ml/__init__.py
touch backend/ml/models/.gitkeep
echo "*.joblib" >> backend/.gitignore
```

- [ ] **Step 4: Commit**

```bash
git add backend/requirements.txt backend/.gitignore backend/ml/__init__.py backend/ml/models/.gitkeep
git commit -m "chore: add scikit-learn, numpy, pandas, joblib, razorpay dependencies"
```

---

## Task 2: Synthetic training data generator

**Files:**
- Create: `backend/ml/training_data.py`

The models need training data. We don't have real historical data, so we generate realistic synthetic samples based on known Indian climate patterns for the 3 zones.

- [ ] **Step 1: Create `backend/ml/training_data.py`**

```python
"""
Generates synthetic training data based on real Indian climate patterns.
Bangalore (low risk), Hyderabad (moderate), Chennai (high risk / coastal).
"""
import numpy as np
import pandas as pd

RNG = np.random.default_rng(42)


def generate_weather_samples(n: int = 5000) -> pd.DataFrame:
    """
    Features: rain_mm, temp_c, aqi, zone_risk_tier (0/1/2), hour_of_day
    Target (premium): risk_multiplier (1.0 – 2.5)
    """
    rows = []
    for _ in range(n):
        zone_tier = RNG.integers(0, 3)          # 0=Bangalore, 1=Hyderabad, 2=Chennai
        hour = RNG.integers(6, 23)

        # Chennai gets heavier rain; Bangalore moderate; Hyderabad dry
        rain_base = [2.0, 1.0, 5.0][zone_tier]
        rain_mm = float(np.clip(RNG.exponential(rain_base), 0, 80))

        temp_base = [26.0, 32.0, 34.0][zone_tier]
        temp_c = float(np.clip(RNG.normal(temp_base, 4.0), 15, 48))

        aqi_base = [80, 130, 110][zone_tier]
        aqi = float(np.clip(RNG.normal(aqi_base, 40), 10, 500))

        # Ground-truth multiplier: what a domain expert would charge
        multiplier = 1.0
        if rain_mm > 40:
            multiplier += 0.8
        elif rain_mm > 20:
            multiplier += 0.5
        elif rain_mm > 5:
            multiplier += 0.2

        if temp_c > 42:
            multiplier += 0.6
        elif temp_c > 38:
            multiplier += 0.3

        if aqi > 350:
            multiplier += 0.5
        elif aqi > 200:
            multiplier += 0.2

        multiplier += zone_tier * 0.1          # zone base risk
        multiplier += RNG.normal(0, 0.05)      # noise
        multiplier = float(np.clip(multiplier, 1.0, 2.5))

        rows.append({
            "rain_mm": rain_mm,
            "temp_c": temp_c,
            "aqi": aqi,
            "zone_tier": zone_tier,
            "hour": hour,
            "risk_multiplier": multiplier,
        })
    return pd.DataFrame(rows)


def generate_income_loss_samples(n: int = 5000) -> pd.DataFrame:
    """
    Features: event_type_enc (0/1/2), severity, rain_mm, temp_c, aqi
    Target: income_loss_pct (0.0 – 0.8)
    """
    event_map = {"rain": 0, "heat": 1, "aqi": 2}
    rows = []
    for _ in range(n):
        event_type = RNG.choice(["rain", "heat", "aqi"])
        severity = float(RNG.uniform(1.0, 2.0))

        rain_mm = float(RNG.exponential(10)) if event_type == "rain" else float(RNG.exponential(1))
        temp_c = float(RNG.normal(44, 2)) if event_type == "heat" else float(RNG.normal(30, 4))
        aqi = float(RNG.normal(380, 40)) if event_type == "aqi" else float(RNG.normal(100, 40))

        # Base loss by event type
        base = {"rain": 0.45, "heat": 0.30, "aqi": 0.35}[event_type]
        loss_pct = base * severity
        loss_pct += RNG.normal(0, 0.03)
        loss_pct = float(np.clip(loss_pct, 0.05, 0.80))

        rows.append({
            "event_type_enc": event_map[event_type],
            "severity": severity,
            "rain_mm": rain_mm,
            "temp_c": temp_c,
            "aqi": aqi,
            "income_loss_pct": loss_pct,
        })
    return pd.DataFrame(rows)
```

- [ ] **Step 2: Quick sanity check**

```bash
cd backend && source venv/bin/activate && python -c "
from ml.training_data import generate_weather_samples, generate_income_loss_samples
w = generate_weather_samples(100)
i = generate_income_loss_samples(100)
print('weather cols:', list(w.columns))
print('income cols:', list(i.columns))
print('risk_multiplier range:', w.risk_multiplier.min(), '-', w.risk_multiplier.max())
print('income_loss_pct range:', i.income_loss_pct.min(), '-', i.income_loss_pct.max())
"
```

Expected output:
```
weather cols: ['rain_mm', 'temp_c', 'aqi', 'zone_tier', 'hour', 'risk_multiplier']
income cols: ['event_type_enc', 'severity', 'rain_mm', 'temp_c', 'aqi', 'income_loss_pct']
risk_multiplier range: 1.0 - 2.5
income_loss_pct range: ~0.05 - ~0.80
```

- [ ] **Step 3: Commit**

```bash
git add backend/ml/training_data.py
git commit -m "feat: add synthetic training data generator for Indian climate patterns"
```

---

## Task 3: Train and serialize ML models

**Files:**
- Create: `backend/ml/train_models.py`
- Creates: `backend/ml/models/risk_profiler.joblib`
- Creates: `backend/ml/models/income_loss_estimator.joblib`

- [ ] **Step 1: Create `backend/ml/train_models.py`**

```python
"""
Run once to train and serialize both ML models.
Usage: cd backend && python -m ml.train_models
"""
import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from ml.training_data import generate_weather_samples, generate_income_loss_samples

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)


def train_risk_profiler():
    print("Training Risk Profiler (RandomForest)...")
    df = generate_weather_samples(8000)
    features = ["rain_mm", "temp_c", "aqi", "zone_tier", "hour"]
    X, y = df[features].values, df["risk_multiplier"].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=10,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    print(f"  MAE:  {mean_absolute_error(y_test, preds):.4f}")
    print(f"  R²:   {r2_score(y_test, preds):.4f}")

    path = os.path.join(MODELS_DIR, "risk_profiler.joblib")
    joblib.dump({"model": model, "features": features}, path)
    print(f"  Saved → {path}")
    return model


def train_income_loss_estimator():
    print("Training Income Loss Estimator (GradientBoosting)...")
    df = generate_income_loss_samples(8000)
    features = ["event_type_enc", "severity", "rain_mm", "temp_c", "aqi"]
    X, y = df[features].values, df["income_loss_pct"].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=5,
        random_state=42,
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    print(f"  MAE:  {mean_absolute_error(y_test, preds):.4f}")
    print(f"  R²:   {r2_score(y_test, preds):.4f}")

    path = os.path.join(MODELS_DIR, "income_loss_estimator.joblib")
    joblib.dump({"model": model, "features": features}, path)
    print(f"  Saved → {path}")
    return model


if __name__ == "__main__":
    train_risk_profiler()
    print()
    train_income_loss_estimator()
    print("\nAll models trained and serialized.")
```

- [ ] **Step 2: Run training**

```bash
cd backend && source venv/bin/activate && python -m ml.train_models
```

Expected:
```
Training Risk Profiler (RandomForest)...
  MAE:  ~0.03–0.06
  R²:   ~0.90–0.97
  Saved → backend/ml/models/risk_profiler.joblib
Training Income Loss Estimator (GradientBoosting)...
  MAE:  ~0.01–0.04
  R²:   ~0.95–0.99
  Saved → backend/ml/models/income_loss_estimator.joblib
```

If R² < 0.85, something is wrong with the data generator. Re-check `training_data.py`.

- [ ] **Step 3: Commit**

```bash
git add backend/ml/train_models.py
git commit -m "feat: add train_models script — RandomForest + GradientBoosting for premium & income loss"
```

---

## Task 4: Wire real models into estimators.py

**Files:**
- Modify: `backend/ml/estimators.py`

The function signatures must stay identical — `main.py` calls them and must not change.

- [ ] **Step 1: Replace `backend/ml/estimators.py`**

```python
"""
ML-based estimators. Loads serialized sklearn models on import.
Falls back to heuristic if model files are not found (e.g., first run before training).
"""
import os
import joblib
import numpy as np

_MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

def _load(filename: str):
    path = os.path.join(_MODELS_DIR, filename)
    if os.path.exists(path):
        return joblib.load(path)
    return None

_risk_profiler = _load("risk_profiler.joblib")
_income_estimator = _load("income_loss_estimator.joblib")

# Zone name → tier index (matches training data encoding)
_ZONE_TIER = {
    "bangalore": 0,
    "hyderabad": 1,
    "chennai": 2,
}


def calculate_risk_premium(zone_base_premium: int, weather_data: dict, aqi_data: dict) -> int:
    """
    Uses trained RandomForestRegressor to predict a risk multiplier,
    then applies it to the zone base premium.
    Falls back to heuristic if the model hasn't been trained yet.
    """
    rain = 0.0
    temp = 25.0
    aqi = 100.0

    if weather_data and not weather_data.get("error"):
        rain = float(weather_data.get("rain_mm_1h", 0))
        temp = float(weather_data.get("temp_c", 25))

    if aqi_data and not aqi_data.get("error"):
        try:
            aqi = float(aqi_data.get("aqi", 100))
        except (ValueError, TypeError):
            aqi = 100.0

    if _risk_profiler is not None:
        city = weather_data.get("city", "").lower() if weather_data else ""
        zone_tier = _ZONE_TIER.get(city, 1)
        import datetime
        hour = datetime.datetime.utcnow().hour
        features = np.array([[rain, temp, aqi, zone_tier, hour]])
        multiplier = float(np.clip(_risk_profiler["model"].predict(features)[0], 1.0, 2.5))
    else:
        # Heuristic fallback
        multiplier = 1.0
        if rain > 10:
            multiplier += 0.5
        elif rain > 2:
            multiplier += 0.2
        if temp > 40:
            multiplier += 0.4
        if aqi > 300:
            multiplier += 0.3
        multiplier = min(multiplier, 2.5)

    return int(zone_base_premium * multiplier)


def estimate_income_loss(rider_avg_daily_income: int, event_type: str, severity: float) -> int:
    """
    Uses trained GradientBoostingRegressor to predict income loss percentage.
    Falls back to heuristic if the model hasn't been trained yet.
    """
    event_map = {"rain": 0, "heat": 1, "aqi": 2}

    if _income_estimator is not None:
        event_enc = float(event_map.get(event_type, 0))
        # Approximate raw sensor values from severity for feature vector
        rain_mm = severity * 20 if event_type == "rain" else 1.0
        temp_c = severity * 42 if event_type == "heat" else 28.0
        aqi_val = severity * 350 if event_type == "aqi" else 100.0
        features = np.array([[event_enc, float(severity), rain_mm, temp_c, aqi_val]])
        loss_pct = float(np.clip(_income_estimator["model"].predict(features)[0], 0.05, 0.80))
    else:
        # Heuristic fallback
        base_loss_pct = 0.4
        type_mult = {"rain": 1.2, "heat": 0.8}.get(event_type, 1.0)
        loss_pct = min(base_loss_pct * type_mult * severity, 0.80)

    return int(min(rider_avg_daily_income * loss_pct, rider_avg_daily_income * 0.8))
```

- [ ] **Step 2: Smoke-test both functions**

```bash
cd backend && source venv/bin/activate && python -c "
from ml.estimators import calculate_risk_premium, estimate_income_loss

# Simulate Chennai heavy rain
weather = {'city': 'Chennai', 'rain_mm_1h': 45, 'temp_c': 31}
aqi = {'city': 'Chennai', 'aqi': 120}
premium = calculate_risk_premium(40, weather, aqi)
print(f'Chennai heavy rain premium: ₹{premium} (base ₹40, expected ~₹50-100)')

# Simulate Hyderabad heatwave
weather2 = {'city': 'Hyderabad', 'rain_mm_1h': 0, 'temp_c': 45}
aqi2 = {'city': 'Hyderabad', 'aqi': 180}
premium2 = calculate_risk_premium(30, weather2, aqi2)
print(f'Hyderabad heatwave premium: ₹{premium2} (base ₹30, expected ~₹40-75)')

# Income loss
loss = estimate_income_loss(1000, 'rain', 1.5)
print(f'Rain event income loss: ₹{loss} (expected ₹300-700)')

loss2 = estimate_income_loss(1000, 'heat', 1.2)
print(f'Heat event income loss: ₹{loss2} (expected ₹200-600)')
"
```

Expected: All 4 values within the stated ranges. If any is 0 or unreasonably high, check the feature vector construction.

- [ ] **Step 3: Restart uvicorn and verify premium calculation on policy creation**

```bash
# Restart the backend server, then create a test policy via curl:
curl -s -X POST http://127.0.0.1:8000/policies/ \
  -H "Content-Type: application/json" \
  -d '{"rider_id": 1, "duration_days": 7}' | python -m json.tool
```

Expected: `premium_paid` is a non-trivial integer (not just the base_premium).

- [ ] **Step 4: Commit**

```bash
git add backend/ml/estimators.py
git commit -m "feat: replace heuristic stubs with trained sklearn models (RandomForest + GradientBoosting)"
```

---

## Task 5: Real Razorpay payout integration

**Files:**
- Modify: `backend/services/payments.py`
- Modify: `backend/.env` (verify keys are present)

Razorpay's Payouts API (`/v1/payouts`) requires a Fund Account and Contact. For test mode we create them inline. The flow: Create Contact → Create Fund Account → Create Payout.

- [ ] **Step 1: Check .env has the right keys**

Open `backend/.env` and verify:
```
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_ACCOUNT_NUMBER=...   # Required for Payouts API — your Razorpay X account number
```

If `RAZORPAY_ACCOUNT_NUMBER` is missing, add it. This is your Razorpay X (current account) number — find it in the Razorpay dashboard under Settings → Bank Accounts. The default fallback `7878780080316316` in the code is a placeholder; the real call will fail unless you supply your actual test account number.

- [ ] **Step 2: Replace `backend/services/payments.py`**

```python
"""
Razorpay Payouts integration.
Uses Razorpay X (current account) to initiate UPI payouts.
In test mode, uses Razorpay's sandbox — no real money moves.
"""
import os
import requests
from requests.auth import HTTPBasicAuth

_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
_ACCOUNT_NUMBER = os.getenv("RAZORPAY_ACCOUNT_NUMBER", "7878780080316316")
_BASE = "https://api.razorpay.com/v1"
_AUTH = HTTPBasicAuth(_KEY_ID, _KEY_SECRET)


def _create_contact(upi_id: str, claim_id: int) -> str | None:
    """Create a Razorpay Contact and return the contact_id."""
    payload = {
        "name": f"Rider UPI {upi_id}",
        "type": "vendor",
        "reference_id": f"claim_{claim_id}",
        "email": "rider@stablflo.in",
        "contact": "9999999999",
    }
    try:
        r = requests.post(f"{_BASE}/contacts", json=payload, auth=_AUTH, timeout=10)
        r.raise_for_status()
        return r.json().get("id")
    except Exception as e:
        print(f"[PAYOUT] Contact creation failed: {e}")
        return None


def _create_fund_account(contact_id: str, upi_id: str) -> str | None:
    """Create a Fund Account for the contact and return fund_account_id."""
    payload = {
        "contact_id": contact_id,
        "account_type": "vpa",
        "vpa": {"address": upi_id},
    }
    try:
        r = requests.post(f"{_BASE}/fund_accounts", json=payload, auth=_AUTH, timeout=10)
        r.raise_for_status()
        return r.json().get("id")
    except Exception as e:
        print(f"[PAYOUT] Fund account creation failed: {e}")
        return None


def initiate_payout(rider_upi: str, amount: int, claim_id: int) -> dict:
    """
    Initiates a UPI payout via Razorpay X.
    Amount is in INR (converted to paise internally).
    Returns dict with status and transaction_id.
    """
    if not _KEY_ID or not _KEY_SECRET or _KEY_ID.startswith("rzp_test_testkey"):
        # Placeholder keys — simulate without hitting API
        print(f"[PAYOUT] SIMULATED — ₹{amount} to {rider_upi} for Claim #{claim_id}")
        return {"status": "simulated", "transaction_id": f"txn_sim_{claim_id}"}

    contact_id = _create_contact(rider_upi, claim_id)
    if not contact_id:
        return {"status": "failed", "error": "contact_creation_failed"}

    fund_account_id = _create_fund_account(contact_id, rider_upi)
    if not fund_account_id:
        return {"status": "failed", "error": "fund_account_creation_failed"}

    payload = {
        "account_number": _ACCOUNT_NUMBER,
        "fund_account_id": fund_account_id,
        "amount": amount * 100,          # paise
        "currency": "INR",
        "mode": "UPI",
        "purpose": "payout",
        "queue_if_low_balance": True,
        "reference_id": f"stablflo_claim_{claim_id}",
        "narration": f"StablFlo payout Claim#{claim_id}",
    }
    try:
        r = requests.post(f"{_BASE}/payouts", json=payload, auth=_AUTH, timeout=15)
        r.raise_for_status()
        data = r.json()
        txn_id = data.get("id", f"txn_{claim_id}")
        print(f"[PAYOUT] SUCCESS — ₹{amount} to {rider_upi}, txn: {txn_id}")
        return {"status": "success", "transaction_id": txn_id}
    except requests.HTTPError as e:
        error_body = e.response.json() if e.response else {}
        print(f"[PAYOUT] FAILED — {error_body}")
        return {"status": "failed", "error": str(error_body)}
    except Exception as e:
        print(f"[PAYOUT] EXCEPTION — {e}")
        return {"status": "failed", "error": str(e)}
```

- [ ] **Step 3: Test with placeholder keys (should simulate)**

```bash
cd backend && source venv/bin/activate && python -c "
from services.payments import initiate_payout
result = initiate_payout('test@upi', 500, 999)
print(result)
"
```

Expected with placeholder keys: `{'status': 'simulated', 'transaction_id': 'txn_sim_999'}`

- [ ] **Step 4: Commit**

```bash
git add backend/services/payments.py
git commit -m "feat: replace mock payout with real Razorpay X UPI integration (graceful sim fallback)"
```

---

## Task 6: Zone change endpoint

**Files:**
- Modify: `backend/db/models.py` — add `pending_zone_id` to Rider
- Modify: `backend/schemas.py` — add `ZoneChangeRequest`
- Modify: `backend/main.py` — add `PATCH /riders/{id}/zone`

- [ ] **Step 1: Add `pending_zone_id` to Rider model in `backend/db/models.py`**

Find the `Rider` class and add one line after `upi_id`:

```python
pending_zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
```

- [ ] **Step 2: Update `Rider` schema and add `ZoneChangeRequest` in `backend/schemas.py`**

The `Rider` response schema must include `pending_zone_id` or FastAPI will silently omit the field. Find the `Rider` class (the response model, not `RiderBase` or `RiderCreate`) and add the field:

```python
class Rider(RiderBase):
    id: int
    pending_zone_id: int | None = None   # ← add this line

    class Config:
        from_attributes = True
```

Then add at the end of the file:

```python
class ZoneChangeRequest(BaseModel):
    zone_id: int
```

- [ ] **Step 3: Add endpoint to `backend/main.py`**

Add after `read_rider`:

```python
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
```

Then update `create_policy` in `backend/main.py`. The function currently looks like:

```python
@app.post("/policies/", response_model=schemas.Policy)
def create_policy(policy: schemas.PolicyCreate, db: Session = Depends(get_db)):
    rider = db.query(models.Rider).filter(models.Rider.id == policy.rider_id).first()
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")

    zone = db.query(models.Zone).filter(models.Zone.id == rider.zone_id).first()
```

Insert the pending zone change block **between** the rider null-check and the `zone = db.query(...)` line, so the zone fetch uses the updated `zone_id`:

```python
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
```

- [ ] **Step 4: Drop and recreate the Rider table (dev only — Supabase has no existing rider data we care about)**

Since SQLAlchemy won't auto-migrate, the easiest path in dev is to let it add the column via `Base.metadata.create_all` with `checkfirst=True`. However, that won't add columns to existing tables. Run this once:

```bash
cd backend && source venv/bin/activate && python -c "
from db.database import engine
from sqlalchemy import text
with engine.connect() as conn:
    conn.execute(text('ALTER TABLE riders ADD COLUMN IF NOT EXISTS pending_zone_id INTEGER REFERENCES zones(id)'))
    conn.commit()
print('Column added.')
"
```

Expected: `Column added.`

- [ ] **Step 5: Test the endpoint**

```bash
# Schedule a zone change for rider 1 to zone 2
curl -s -X PATCH http://127.0.0.1:8000/riders/1/zone \
  -H "Content-Type: application/json" \
  -d '{"zone_id": 2}' | python -m json.tool
```

Expected: Rider object returned with `pending_zone_id: 2`.

- [ ] **Step 6: Wire up frontend API call**

In `frontend/src/lib/api.ts`, add:

```typescript
export async function requestZoneChange(riderId: number, zoneId: number) {
  const res = await fetch(`${API_BASE}/riders/${riderId}/zone`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ zone_id: zoneId }),
  });
  if (!res.ok) throw new Error("Failed to request zone change");
  return res.json();
}
```

In `frontend/src/lib/PoliciesView.tsx`:

a) Add `riderId: number` to the `PoliciesViewProps` interface.

b) Import `requestZoneChange`:
```typescript
import { requestZoneChange } from "@/lib/api";
```

c) Change `handleScheduleZoneChange` from a sync function to async and call the API:
```typescript
async function handleScheduleZoneChange() {
  if (!selectedNewZone) return;
  const zone = zones.find((z) => z.id.toString() === selectedNewZone);
  if (zone) {
    await requestZoneChange(riderId, zone.id);
    setZoneChangeScheduled(zone.name);
  }
}
```

In `frontend/src/app/page.tsx`, pass `riderId` as a prop when rendering `PoliciesView`:
```tsx
<PoliciesView
  activePolicy={activePolicy}
  allPolicies={allPolicies}
  zones={zones}
  currentZone={selectedZone}
  riderId={riderId ?? 0}
/>
```

- [ ] **Step 7: Commit**

```bash
git add backend/db/models.py backend/schemas.py backend/main.py frontend/src/lib/api.ts frontend/src/lib/PoliciesView.tsx frontend/src/app/page.tsx
git commit -m "feat: add zone change endpoint + apply at next billing cycle"
```

---

## Task 7: Fraud Detector (Isolation Forest)

**Files:**
- Create: `backend/ml/fraud_detector.py`
- Modify: `backend/main.py` — call fraud check before approving claims

This catches anomalous claims: duplicate triggers in the same zone within a short window, or payout amounts wildly out of range.

- [ ] **Step 1: Create `backend/ml/fraud_detector.py`**

```python
"""
Isolation Forest-based fraud detector.
Scores each claim as normal (0) or anomalous (1).
Trained on synthetic normal claim patterns; anomalies are detected at inference time.
"""
import os
import numpy as np
import joblib
from sklearn.ensemble import IsolationForest

_MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
_MODEL_PATH = os.path.join(_MODELS_DIR, "fraud_detector.joblib")


def _generate_normal_claims(n: int = 3000) -> np.ndarray:
    """Synthetic normal claim feature matrix."""
    rng = np.random.default_rng(42)
    # Features: [payout_amount, severity, hour_of_day, days_since_policy_start, claims_last_24h]
    payout = rng.normal(400, 150, n).clip(50, 900)
    severity = rng.uniform(1.0, 1.8, n)
    hour = rng.integers(6, 22, n).astype(float)
    days_since = rng.uniform(0, 7, n)
    claims_24h = rng.integers(0, 2, n).astype(float)   # 0 or 1 is normal
    return np.column_stack([payout, severity, hour, days_since, claims_24h])


def train_fraud_detector():
    os.makedirs(_MODELS_DIR, exist_ok=True)
    X = _generate_normal_claims()
    model = IsolationForest(n_estimators=200, contamination=0.03, random_state=42)
    model.fit(X)
    joblib.dump(model, _MODEL_PATH)
    print(f"Fraud detector trained and saved → {_MODEL_PATH}")
    return model


def _load_model():
    if os.path.exists(_MODEL_PATH):
        return joblib.load(_MODEL_PATH)
    return train_fraud_detector()


_model = _load_model()


def is_fraudulent(
    payout_amount: float,
    severity: float,
    hour_of_day: int,
    days_since_policy_start: float,
    claims_last_24h: int,
) -> bool:
    """
    Returns True if the claim looks anomalous.
    Isolation Forest: predict returns -1 for anomaly, 1 for normal.
    """
    features = np.array([[payout_amount, severity, float(hour_of_day),
                          days_since_policy_start, float(claims_last_24h)]])
    result = _model.predict(features)[0]
    return result == -1
```

- [ ] **Step 2: Wire into the monitoring loop in `main.py`**

Add import at the top:

```python
from ml.fraud_detector import is_fraudulent
```

Inside the monitoring loop, after computing `payout_amount`, add a fraud check before creating the claim:

```python
# Calculate fraud signals
policy_start = active_policy.start_date
days_since_start = (datetime.utcnow() - policy_start).days
hour_now = datetime.utcnow().hour
recent_claims = db.query(models.Claim).filter(
    models.Claim.rider_id == rider.id,
    models.Claim.timestamp >= datetime.utcnow() - timedelta(hours=24)
).count()

if is_fraudulent(payout_amount, severity, hour_now, days_since_start, recent_claims):
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
```

- [ ] **Step 3: Test fraud detection**

```bash
cd backend && source venv/bin/activate && python -c "
from ml.fraud_detector import is_fraudulent
# Normal claim
print('Normal:', is_fraudulent(400, 1.3, 14, 3.0, 0))   # expect False
# Anomalous: massive payout, many recent claims
print('Fraud:', is_fraudulent(9999, 2.0, 3, 0.1, 15))   # expect True
"
```

- [ ] **Step 4: Commit**

```bash
git add backend/ml/fraud_detector.py backend/main.py
git commit -m "feat: add Isolation Forest fraud detector — flags anomalous claims before payout"
```

---

## Verification

After all tasks are complete, do a full end-to-end smoke test:

```bash
# 1. Start backend
cd backend && source venv/bin/activate && uvicorn main:app --reload

# 2. In a second terminal — register a rider and create policy
curl -s -X POST http://127.0.0.1:8000/riders/ \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+91 9999900001", "platform_id": "test_smoke", "zone_id": 3, "upi_id": "test@upi"}' | python -m json.tool

curl -s -X POST http://127.0.0.1:8000/policies/ \
  -H "Content-Type: application/json" \
  -d '{"rider_id": <id_from_above>, "duration_days": 7}' | python -m json.tool

# 3. Schedule a zone change
curl -s -X PATCH http://127.0.0.1:8000/riders/<id>/zone \
  -H "Content-Type: application/json" \
  -d '{"zone_id": 1}' | python -m json.tool

# 4. Verify premium is non-trivial (ML model used)
# premium_paid should not just be the base_premium

# 5. Watch the monitor loop output — should see [MONITOR] lines every 15s
```

All passing = Tasks 1–7 complete.
