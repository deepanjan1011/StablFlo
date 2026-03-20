"""
Isolation Forest-based fraud detector.
Trained on synthetic normal claim patterns at import time.
Flags anomalous claims before payout is initiated.
"""
import os
import numpy as np
import joblib
from sklearn.ensemble import IsolationForest

__all__ = ["is_fraudulent"]

_MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
_MODEL_PATH = os.path.join(_MODELS_DIR, "fraud_detector.joblib")


def _generate_normal_claims(n: int = 3000) -> np.ndarray:
    """
    Synthetic normal claim feature matrix.
    Features: [payout_amount, severity, hour_of_day, days_since_policy_start, claims_last_24h]
    """
    rng = np.random.default_rng(42)
    payout      = rng.normal(400, 150, n).clip(50, 900)
    severity    = rng.uniform(1.0, 1.8, n)
    hour        = rng.integers(6, 22, n).astype(float)
    days_since  = rng.uniform(0, 7, n)
    claims_24h  = rng.integers(0, 2, n).astype(float)   # 0 or 1 is normal
    return np.column_stack([payout, severity, hour, days_since, claims_24h])


def _train_and_save() -> IsolationForest:
    os.makedirs(_MODELS_DIR, exist_ok=True)
    X = _generate_normal_claims()
    model = IsolationForest(n_estimators=200, contamination=0.03, random_state=42)
    model.fit(X)
    joblib.dump(model, _MODEL_PATH)
    print(f"[FRAUD] Detector trained and saved → {_MODEL_PATH}")
    return model


def _load_model() -> IsolationForest:
    if os.path.exists(_MODEL_PATH):
        return joblib.load(_MODEL_PATH)
    return _train_and_save()


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
    Isolation Forest returns -1 for anomaly, 1 for normal.
    """
    features = np.array([[
        payout_amount,
        severity,
        float(hour_of_day),
        days_since_policy_start,
        float(claims_last_24h),
    ]])
    return int(_model.predict(features)[0]) == -1
