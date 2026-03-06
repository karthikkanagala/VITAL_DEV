# VitalScan — Lifestyle Risk Intelligence Platform

## Overview

India's first unified early-risk detection platform for heart disease, type-2 diabetes, and obesity. No lab tests. 2-minute assessment. Free.

## Team

- **Project:** VitalScan
- **Team:** APEXRush
- **Team Lead:** Ram Karthik Kanagala
- **Version:** v2.0 — 2026

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS      |
| Animations | Framer Motion + Three.js            |
| Charts     | Recharts                            |
| PDF        | html2canvas + jsPDF                 |
| Backend    | FastAPI (Python 3.11)               |
| ML Model   | HistGradientBoostingClassifier      |
| Database   | PostgreSQL 15                       |
| Cache      | Redis 7                             |

---

## Model Files (Already Trained)

| File                                    | Purpose              |
|-----------------------------------------|----------------------|
| ml/gradient_boosting_model.pkl          | Trained model        |
| ml/gradient_training.py                 | Training script      |
| ml/cleaning_dataset.py                  | Data cleaning script |
| ml/vitalscan_cleaned_dataset.csv        | Cleaned data         |
| ml/vitalscan_transformed_dataset.csv    | Transformed data     |

---

## Model Performance

| Metric    | Value                |
|-----------|----------------------|
| Algorithm | HistGradientBoosting |
| MAE       | 4.6573               |
| RMSE      | 7.0464               |
| R²        | 0.8178 (81.78%)      |

---

## Inputs (19 fields)

```
age, sex, height_cm, weight_kg, waist_cm, BMI, WHR,
physical_activity, sleep_hours, stress_level,
family_history_heart, family_history_diab, smoking_status,
fried_food, chest_discomfort, salt_intake, sugar_intake,
water_intake, excessive_thirst
```

---

## Quick Start

### Frontend

```bash
cd frontend && npm install && npm run dev
```

### Backend

```bash
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Docker (All-in-One)

```bash
docker-compose up --build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Endpoints

| Method | Endpoint         | Description                        |
|--------|------------------|------------------------------------|
| POST   | `/api/predict`   | Full risk prediction               |
| POST   | `/api/simulate`  | Real-time slider updates           |
| GET    | `/api/health`    | Server health check                |

---

## PDF Report

- **Template:** `frontend/public/reportTemplate.html`
- **Generator:** `frontend/src/utils/generateReport.js`
- **Method:** html2canvas screenshot → jsPDF

---

## Project Structure

```
vitalscan/
├── frontend/                React + Vite app
│   ├── public/
│   │   └── reportTemplate.html
│   └── src/
│       ├── components/      UI components
│       ├── context/         React context
│       ├── hooks/           Custom hooks
│       ├── pages/           Route pages
│       └── utils/           API + PDF generator
├── backend/                 FastAPI server
│   └── app/
│       ├── routes/          API endpoints
│       ├── services/        Business logic
│       ├── models/          Schema + ML model
│       └── database/        PostgreSQL ORM
├── ml/                      Model training scripts
├── docker-compose.yml       Docker orchestration
└── README.md
```

---

## Disclaimer

VitalScan is an **educational awareness tool only**. It is not a clinical diagnostic system. Predictions are based on statistical models and do not constitute medical advice. Always consult a qualified healthcare provider for medical decisions.
