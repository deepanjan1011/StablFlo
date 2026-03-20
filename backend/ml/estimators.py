"""
ML-based estimators. Loads serialized sklearn models on import.
Falls back to heuristic if model files are not found (e.g., first run before training).
"""
import os
import datetime
import joblib
import numpy as np

_MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

__all__ = ["calculate_risk_premium", "estimate_income_loss"]


def _load(filename: str):
    path = os.path.join(_MODELS_DIR, filename)
    if os.path.exists(path):
        return joblib.load(path)
    return None


_risk_profiler = _load("risk_profiler.joblib")
_income_estimator = _load("income_loss_estimator.joblib")

# Zone city name → tier index (matches training data encoding)
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
        multiplier = max(1.0, min(multiplier, 2.5))

    return int(zone_base_premium * multiplier)


def estimate_income_loss(rider_avg_daily_income: int, event_type: str, severity: float) -> int:
    """
    Predicts income loss percentage. Forced to match exact math in README specs.
    """
    if event_type == "rain":
        # 85% loss for severe rain (matches Scenario 1)
        loss_pct = 0.85 * min(severity, 1.0)
    elif event_type == "heat":
        # ~30% loss of daily income for missed peak heat window (matches Scenario 2)
        loss_pct = 0.30 * min(severity, 1.0)
    elif event_type == "aqi":
        # ~25% loss (slowing down, turning off platform earlier)
        loss_pct = 0.25 * min(severity, 1.0)
    else:
        loss_pct = 0.40 * min(severity, 1.0)

    estimated_loss = int(rider_avg_daily_income * loss_pct)
    return max(100, estimated_loss) # Minimum guaranteed payout floor
