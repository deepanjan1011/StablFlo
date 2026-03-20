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
