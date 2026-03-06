import joblib
import numpy as np
import pandas as pd
import os

_model = None
_feature_columns = None

FEATURE_ORDER = [
    "age", "sex", "height_cm", "weight_kg", "waist_cm", "BMI", "WHR",
    "physical_activity", "sleep_hours", "stress_level",
    "family_history_heart", "family_history_diab",
    "smoking_status", "fried_food", "chest_discomfort",
    "salt_intake", "sugar_intake", "water_intake", "excessive_thirst",
]

# Map frontend field names → model feature names
_INPUT_TO_MODEL = {
    "physical_activity": "physical_activity_level",
    "family_history_diab": "family_history_diabetes",
    "fried_food": "fried_food_consumption",
    "salt_intake": "salt_intake_level",
    "sugar_intake": "sugar_intake_level",
    "water_intake": "water_intake_liters",
    "excessive_thirst": "excessive_thirst_fatigue",
}


def load_model():
    global _model, _feature_columns

    model_path = os.getenv("MODEL_PATH", "../ml/gradient_boosting_model.pkl")

    candidates = [
        model_path,
        os.path.join(os.path.dirname(__file__), "../../../ml/gradient_boosting_model.pkl"),
        os.path.join(os.path.dirname(__file__), "../models/gradient_boosting_model.pkl"),
    ]

    for path in candidates:
        resolved = os.path.normpath(path)
        if os.path.exists(resolved):
            data = joblib.load(resolved)
            _model = data["model"]
            _feature_columns = data.get("feature_columns", FEATURE_ORDER)
            print(f"Model loaded from {resolved}")
            print(f"  Features ({len(_feature_columns)}): {_feature_columns}")
            return

    raise FileNotFoundError(
        f"gradient_boosting_model.pkl not found. Searched: "
        f"{[os.path.normpath(p) for p in candidates]}"
    )


def predict_risks(inputs: dict) -> dict:
    if _model is None:
        load_model()

    cols = _feature_columns if _feature_columns else FEATURE_ORDER

    # Build reverse map: model_col → input_key
    reverse = {v: k for k, v in _INPUT_TO_MODEL.items()}

    features = []
    for col in cols:
        # Try exact match first, then reverse-mapped frontend name
        if col in inputs:
            features.append(float(inputs[col]))
        elif col in reverse and reverse[col] in inputs:
            features.append(float(inputs[reverse[col]]))
        else:
            features.append(0.0)

    X = pd.DataFrame([features], columns=cols)
    preds = _model.predict(X)[0]

    # Model outputs: [heart_risk_percent, diabetes_risk_percent, obesity_risk_percent]
    heart = int(np.clip(round(preds[0]), 0, 95))
    diabetes = int(np.clip(round(preds[1]), 0, 95))
    obesity = int(np.clip(round(preds[2]), 0, 95))

    return {"heartRisk": heart, "diabetesRisk": diabetes, "obesityRisk": obesity}
