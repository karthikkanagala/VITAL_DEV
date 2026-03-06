# gradient_boosting_pipeline.py (FINAL FIXED VERSION)

import pandas as pd
import numpy as np
import joblib
import time

from sklearn.model_selection import train_test_split
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ==========================================================
# 1. Load Dataset
# ==========================================================

df = pd.read_csv("vitalscan_cleaned_dataset.csv")
print("Dataset Loaded:", df.shape)


# ==========================================================
# 2. Encode Categorical Column
# ==========================================================

if "sex" in df.columns:
    df["sex"] = df["sex"].map({"Male": 1, "Female": 0})
    if df["sex"].isnull().any():
        raise ValueError("Unexpected values in 'sex' column.")

print("Encoding Completed.")

# Ensure everything is numeric
object_cols = df.select_dtypes(include=["object"]).columns
if len(object_cols) > 0:
    raise ValueError(f"Non-numeric columns detected: {object_cols}")


# ==========================================================
# 3. Define Features & Targets
# ==========================================================

target_cols = [
    "heart_risk_percent",
    "diabetes_risk_percent",
    "obesity_risk_percent"
]

X = df.drop(columns=target_cols)
y = df[target_cols]

print("Feature Shape:", X.shape)
print("Target Shape:", y.shape)


# ==========================================================
# 4. Train / Validation / Test Split (70/15/15)
# ==========================================================

X_train, X_temp, y_train, y_temp = train_test_split(
    X, y,
    test_size=0.30,
    random_state=42
)

X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp,
    test_size=0.50,
    random_state=42
)

print("Train:", X_train.shape)
print("Validation:", X_val.shape)
print("Test:", X_test.shape)


# ==========================================================
# 5. Train Optimized Gradient Boosting
# ==========================================================

start_time = time.time()

base_model = HistGradientBoostingRegressor(
    max_iter=200,
    learning_rate=0.1,
    max_depth=6,
    random_state=42
)

model = MultiOutputRegressor(base_model)

model.fit(X_train, y_train)

end_time = time.time()

print(f"\nModel Training Completed in {end_time - start_time:.2f} seconds")


# ==========================================================
# 6. Evaluation
# ==========================================================

def compute_metrics(y_true, y_pred):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    mape = np.mean(np.abs((y_true - y_pred) / (y_true + 1e-8))) * 100
    return mae, rmse, r2, mape


val_preds = model.predict(X_val)
test_preds = model.predict(X_test)

val_mae, val_rmse, val_r2, val_mape = compute_metrics(y_val, val_preds)
test_mae, test_rmse, test_r2, test_mape = compute_metrics(y_test, test_preds)

print("\n==============================")
print("      VALIDATION METRICS      ")
print("==============================")
print(f"MAE  : {val_mae:.4f}")
print(f"RMSE : {val_rmse:.4f}")
print(f"R²   : {val_r2:.4f}")
print(f"MAPE : {val_mape:.4f}%")

print("\n==============================")
print("         TEST METRICS         ")
print("==============================")
print(f"MAE  : {test_mae:.4f}")
print(f"RMSE : {test_rmse:.4f}")
print(f"R²   : {test_r2:.4f}")
print(f"MAPE : {test_mape:.4f}%")


# ==========================================================
# 7. Save Model
# ==========================================================

joblib.dump(
    {
        "model": model,
        "feature_columns": X.columns.tolist()
    },
    "gradient_boosting_model.pkl"
)

print("\nModel saved as gradient_boosting_model.pkl")