# ==========================================================
# VitalScan Dataset Cleaning Pipeline
# ==========================================================

import pandas as pd
import numpy as np

# -------------------------------
# CONFIG
# -------------------------------
INPUT_FILE = "vitalscan_synthetic_dataset.xlsx"
OUTPUT_FILE = "vitalscan_cleaned_dataset.csv"


# ==========================================================
# 1. LOAD DATA
# ==========================================================

df = pd.read_excel(INPUT_FILE)

print("Initial Shape:", df.shape)


# ==========================================================
# 2. REMOVE DUPLICATES
# ==========================================================

duplicates = df.duplicated().sum()
print("Duplicate Rows Found:", duplicates)

df = df.drop_duplicates()

print("Shape After Removing Duplicates:", df.shape)


# ==========================================================
# 3. HANDLE MISSING VALUES
# ==========================================================

missing_summary = df.isnull().sum()
print("Missing Values Per Column:\n", missing_summary)

# Numeric columns → fill with median
numeric_cols = df.select_dtypes(include=np.number).columns
for col in numeric_cols:
    if df[col].isnull().sum() > 0:
        df[col].fillna(df[col].median(), inplace=True)

# Categorical columns → fill with mode
categorical_cols = df.select_dtypes(include="object").columns
for col in categorical_cols:
    if df[col].isnull().sum() > 0:
        df[col].fillna(df[col].mode()[0], inplace=True)

print("Missing Values After Cleaning:\n", df.isnull().sum())


# ==========================================================
# 4. OUTLIER DETECTION & CAPPING (IQR METHOD)
# ==========================================================

def cap_outliers_iqr(dataframe, column):
    Q1 = dataframe[column].quantile(0.25)
    Q3 = dataframe[column].quantile(0.75)
    IQR = Q3 - Q1

    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR

    dataframe[column] = np.where(
        dataframe[column] < lower_bound,
        lower_bound,
        np.where(dataframe[column] > upper_bound, upper_bound, dataframe[column])
    )


for col in numeric_cols:
    cap_outliers_iqr(df, col)

print("Outlier capping completed.")


# ==========================================================
# 5. VALIDATE LOGICAL RANGES
# ==========================================================

# Risk scores must be between 0 and 100
risk_columns = [
    "heart_risk_percent",
    "diabetes_risk_percent",
    "obesity_risk_percent"
]

for col in risk_columns:
    df[col] = np.clip(df[col], 0, 100)

# Sleep hours reasonable range
if "sleep_hours" in df.columns:
    df["sleep_hours"] = df["sleep_hours"].clip(3, 12)

# BMI sanity check
if "bmi" in df.columns:
    df["bmi"] = df["bmi"].clip(10, 60)

print("Logical range validation completed.")


# ==========================================================
# 6. FINAL VALIDATION CHECK
# ==========================================================

print("\nFINAL DATA CHECK")
print("Shape:", df.shape)
print("Missing Values:", df.isnull().sum().sum())
print("Duplicate Rows:", df.duplicated().sum())

print("\nDescriptive Statistics:")
print(df.describe())


# ==========================================================
# 7. SAVE CLEAN DATA
# ==========================================================

df.to_csv(OUTPUT_FILE, index=False)

print(f"\nCleaned dataset saved as: {OUTPUT_FILE}")