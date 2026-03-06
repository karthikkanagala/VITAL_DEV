"""
Evaluate the trained VitalScan model on the test set.
"""

import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report,
    roc_auc_score,
    confusion_matrix,
)


def evaluate():
    csv_path = Path(__file__).parent / "cleaned.csv"
    model_path = Path(__file__).parent.parent / "backend" / "app" / "models" / "vitalscan_model.pkl"

    if not csv_path.exists():
        print("No cleaned.csv found. Run train_model.py first.")
        return

    if not model_path.exists():
        print("No model found. Run train_model.py first.")
        return

    df = pd.read_csv(csv_path)
    model = joblib.load(model_path)

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

    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    y_pred = model.predict(X_test)
    y_proba = np.column_stack([
        est.predict_proba(X_test)[:, 1] for est in model.estimators_
    ])

    for i, name in enumerate(target_cols):
        print(f"\n{'='*50}")
        print(f"  {name.upper()}")
        print(f"{'='*50}")
        print(classification_report(y_test[:, i], y_pred[:, i]))

        auc = roc_auc_score(y_test[:, i], y_proba[:, i])
        print(f"  ROC AUC: {auc:.4f}")

        cm = confusion_matrix(y_test[:, i], y_pred[:, i])
        print(f"  Confusion Matrix:\n{cm}\n")


if __name__ == "__main__":
    evaluate()
