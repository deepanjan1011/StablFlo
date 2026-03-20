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
