"""
Train VitalScan health risk prediction model.
Uses HistGradientBoostingClassifier from scikit-learn.
Generates synthetic data if cleaned.csv is not present.
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
from pathlib import Path


def generate_synthetic_data(n=5000, seed=42):
    rng = np.random.RandomState(seed)

    age = rng.randint(18, 90, n)
    gender = rng.randint(0, 2, n)
    height_cm = rng.normal(170, 12, n).clip(140, 210)
    weight_kg = rng.normal(78, 18, n).clip(40, 180)
    bmi = weight_kg / (height_cm / 100) ** 2

    systolic_bp = rng.normal(125, 18, n).clip(80, 220)
    diastolic_bp = rng.normal(80, 12, n).clip(50, 140)
    cholesterol_total = rng.normal(200, 40, n).clip(100, 400)
    hdl = rng.normal(55, 15, n).clip(20, 100)
    ldl = rng.normal(120, 35, n).clip(40, 300)
    triglycerides = rng.normal(150, 60, n).clip(50, 600)
    blood_glucose = rng.normal(100, 25, n).clip(60, 350)
    hba1c = rng.normal(5.5, 0.9, n).clip(4.0, 13.0)

    smoking = rng.binomial(1, 0.2, n)
    alcohol_weekly = rng.poisson(4, n).clip(0, 40)
    exercise_hours = rng.exponential(3, n).clip(0, 20)
    family_diabetes = rng.binomial(1, 0.25, n)
    family_heart = rng.binomial(1, 0.2, n)
    family_stroke = rng.binomial(1, 0.15, n)
    stress_level = rng.randint(1, 11, n)

    diabetes_score = (
        (blood_glucose > 126).astype(float) * 3
        + (hba1c > 6.5).astype(float) * 3
        + (bmi > 30).astype(float) * 2
        + family_diabetes * 1.5
        + (age > 45).astype(float) * 1
        + (exercise_hours < 2).astype(float) * 1
    )
    diabetes_label = (diabetes_score + rng.normal(0, 1, n) > 4).astype(int)

    heart_score = (
        (systolic_bp > 140).astype(float) * 2.5
        + (cholesterol_total > 240).astype(float) * 2
        + (hdl < 40).astype(float) * 1.5
        + smoking * 2
        + family_heart * 1.5
        + (stress_level > 7).astype(float) * 1
        + (bmi > 30).astype(float) * 1.5
    )
    heart_label = (heart_score + rng.normal(0, 1.2, n) > 4.5).astype(int)

    stroke_score = (
        (systolic_bp > 140).astype(float) * 2.5
        + smoking * 2
        + (age > 55).astype(float) * 1.5
        + family_stroke * 1.5
        + (alcohol_weekly > 14).astype(float) * 1.5
        + (bmi > 30).astype(float) * 1
    )
    stroke_label = (stroke_score + rng.normal(0, 1.1, n) > 4).astype(int)

    df = pd.DataFrame({
        "age": age, "gender": gender, "bmi": np.round(bmi, 1),
        "systolic_bp": systolic_bp.astype(int),
        "diastolic_bp": diastolic_bp.astype(int),
        "cholesterol_total": np.round(cholesterol_total, 1),
        "hdl": np.round(hdl, 1), "ldl": np.round(ldl, 1),
        "triglycerides": np.round(triglycerides, 1),
        "blood_glucose": np.round(blood_glucose, 1),
        "hba1c": np.round(hba1c, 1),
        "smoking": smoking, "alcohol_weekly": alcohol_weekly,
        "exercise_hours_weekly": np.round(exercise_hours, 1),
        "family_diabetes": family_diabetes,
        "family_heart": family_heart,
        "family_stroke": family_stroke,
        "stress_level": stress_level,
        "diabetes": diabetes_label,
        "heart_disease": heart_label,
        "stroke": stroke_label,
    })
    return df


def train():
    csv_path = Path(__file__).parent / "cleaned.csv"
    if csv_path.exists():
        df = pd.read_csv(csv_path)
        print(f"Loaded {len(df)} records from cleaned.csv")
    else:
        print("No cleaned.csv found, generating synthetic data...")
        df = generate_synthetic_data(5000)
        df.to_csv(csv_path, index=False)
        print(f"Generated {len(df)} synthetic records -> cleaned.csv")

    feature_cols = [
        "age", "gender", "bmi", "systolic_bp", "diastolic_bp",
        "cholesterol_total", "hdl", "ldl", "triglycerides",
        "blood_glucose", "hba1c", "smoking", "alcohol_weekly",
        "exercise_hours_weekly", "family_diabetes", "family_heart",
        "family_stroke", "stress_level",
    ]
    target_cols = ["diabetes", "heart_disease", "stroke"]

    X = df[feature_cols].values
    y = df[target_cols].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    base_clf = HistGradientBoostingClassifier(
        max_iter=200,
        max_depth=6,
        learning_rate=0.1,
        random_state=42,
    )
    model = MultiOutputClassifier(base_clf)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    for i, name in enumerate(target_cols):
        print(f"\n=== {name.upper()} ===")
        print(classification_report(y_test[:, i], y_pred[:, i]))

    model_dir = Path(__file__).parent.parent / "backend" / "app" / "models"
    model_dir.mkdir(parents=True, exist_ok=True)
    model_path = model_dir / "vitalscan_model.pkl"
    joblib.dump(model, model_path)
    print(f"\nModel saved to {model_path}")

    return model


if __name__ == "__main__":
    train()
