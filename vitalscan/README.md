# VitalScan — Lifestyle Risk Intelligence Platform

> India's first unified early-risk detection platform for heart disease, type-2 diabetes, and obesity — no lab tests, 2-minute assessment, free.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Environment Setup](#environment-setup)
7. [Running the App](#running-the-app)
   - [Option A — Local Development](#option-a--local-development)
   - [Option B — Docker (All-in-One)](#option-b--docker-all-in-one)
8. [Deploying to Render](#deploying-to-render)
9. [API Reference](#api-reference)
10. [ML Model](#ml-model)
11. [Authentication & Data Security](#authentication--data-security)
12. [Team](#team)

---

## Overview

VitalScan analyzes 19 lifestyle and biometric inputs and predicts percentage risk scores for:

- ❤️  Heart disease
- 🩸  Type-2 diabetes
- ⚖️  Obesity

Results include risk scores, contributing factors, a personalised action plan, and a downloadable PDF report. Users with risk ≥ 70 % automatically trigger emergency alerts to their saved contacts.

---

## Features

| Feature | Description |
|---|---|
| **3-model risk prediction** | Heart, diabetes, and obesity risks in one call |
| **Auto-fill forms** | Profile and last assessment data pre-populate the form |
| **Real-time simulation** | Drag sliders to instantly recalculate risk (no page reload) |
| **PDF report** | Full health report generated client-side via jsPDF |
| **Dashboard** | Personal history, trend analysis, profile, settings |
| **Emergency alerts** | EmailJS emails sent to contacts when risk ≥ 70 % |
| **AES-256 encryption** | All Firestore health data encrypted before write |
| **Dark / Light theme** | System-aware with manual toggle |
| **Demo mode** | Try the full app without signing in |
| **Firebase Auth** | Email/password + Google OAuth |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Routing | React Router v6 (nested Outlet pattern) |
| Animations | Framer Motion + Three.js / React Three Fiber |
| Charts | Recharts |
| PDF | html2canvas + jsPDF + jsPDF-AutoTable |
| Backend | FastAPI (Python 3.11) |
| ML Model | HistGradientBoostingClassifier (scikit-learn) |
| Auth & DB | Firebase Auth + Firestore |
| Email | EmailJS (welcome, results, emergency, diet plan) |
| Encryption | CryptoJS AES-256 |
| Cache (optional) | Redis 7 |

---

## Project Structure

```
vitalscan/
├── frontend/                    # React + Vite SPA
│   ├── public/
│   │   └── reportTemplate.html  # PDF report base template
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Navbar, Footer
│   │   │   ├── results/         # Dashboard charts & risk panels
│   │   │   ├── form/            # Assessment form fields
│   │   │   └── ui/              # ThemeToggle, shared UI
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Firebase auth state
│   │   │   ├── AppContext.jsx   # Global form / results state
│   │   │   └── ThemeContext.jsx # Dark / light mode
│   │   ├── hooks/
│   │   │   └── useRiskPrediction.js  # Calls /api/predict
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── AssessmentPage.jsx
│   │   │   ├── ResultsPage.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── DashboardPage.jsx       # Sidebar + <Outlet />
│   │   │   └── dashboard/
│   │   │       ├── DashboardOverview.jsx
│   │   │       ├── DashboardAssessmentForm.jsx
│   │   │       ├── DashboardResultsView.jsx
│   │   │       ├── UserProfilePage.jsx
│   │   │       ├── EmergencyContactsPage.jsx
│   │   │       ├── PreviousAssessmentsPage.jsx
│   │   │       └── SettingsPage.jsx
│   │   ├── services/
│   │   │   ├── firestoreService.js  # Firestore CRUD (try/catch wrapped)
│   │   │   ├── emailService.js      # EmailJS helpers
│   │   │   └── encryption.js        # AES-256 encrypt/decrypt
│   │   └── utils/
│   │       ├── validateForm.js      # 17-field form validation
│   │       ├── riskCalculator.js    # Client-side BMI / WHtR helpers
│   │       └── generateReport.js    # jsPDF report builder
│   ├── .env                     # Firebase + EmailJS keys (see below)
│   ├── vite.config.js           # Dev proxy → backend:8002
│   └── package.json
│
├── backend/                     # FastAPI ML API
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, lifespan loader
│   │   ├── routes/
│   │   │   ├── predict.py       # POST /api/predict
│   │   │   └── simulate.py      # POST /api/simulate
│   │   ├── services/
│   │   │   ├── predictor.py     # Model load + predict_risks()
│   │   │   ├── compounding.py   # Risk compounding logic
│   │   │   └── action_plan.py   # Personalised recommendations
│   │   └── models/
│   │       └── schema.py        # Pydantic request / response models
│   ├── .env                     # MODEL_PATH, REDIS_URL
│   ├── requirements.txt
│   └── Dockerfile
│
├── ml/                          # Model training artefacts
│   ├── gradient_boosting_model.pkl      # Pre-trained model (used by backend)
│   ├── gradient_training.py             # Training script
│   ├── train_model.py
│   ├── model_eval.py
│   ├── cleaning_dataset.py
│   ├── vitalscan_cleaned_dataset.csv
│   └── vitalscan_transformed_dataset.csv.xls
│
└── docker-compose.yml
```

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 18 + | `node --version` |
| npm | 9 + | bundled with Node |
| Python | 3.11 + | `python --version` |
| pip | latest | `pip --version` |
| Docker + Docker Compose | any | optional, for Docker mode only |

---

## Environment Setup

### Frontend — `frontend/.env`

Create `vitalscan/frontend/.env` and fill in your Firebase and EmailJS credentials:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:xxxxxxxxxxxx

# AES-256 encryption key for Firestore data
VITE_ENCRYPTION_KEY=YourSecretEncryptionKey

# EmailJS
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_GREETING_TEMPLATE=template_xxxxxxx
VITE_EMAILJS_EMERGENCY_TEMPLATE=template_xxxxxxx
```

### Backend — `backend/.env`

```env
MODEL_PATH=../ml/gradient_boosting_model.pkl
REDIS_URL=redis://localhost:6379
```

> **Note:** `MODEL_PATH` is relative to the `backend/` directory. If you run uvicorn from a different working directory, use an absolute path.

---

## Running the App

### Option A — Local Development

Run the backend and frontend in **two separate terminals**.

#### Terminal 1 — Backend

```bash
# From the project root
cd vitalscan/backend

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the API server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8002 --reload
```

The API will be available at `http://127.0.0.1:8002`.
Auto-docs: `http://127.0.0.1:8002/docs`

> **Important:** The Vite dev proxy in `vite.config.js` forwards `/api/*` requests to `http://localhost:8002`. Make sure the backend is running on port **8002** when using `npm run dev`.

#### Terminal 2 — Frontend

```bash
# From the project root
cd vitalscan/frontend

# Install dependencies (first time only)
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

#### Verify the connection

```bash
# Should return {"status":"ok","model":"loaded"}
curl http://127.0.0.1:8002/api/health
```

---

### Option B — Docker (All-in-One)

Requires Docker Desktop to be running.

```bash
# From the project root (where docker-compose.yml lives)
cd vitalscan

# Build and start all services (frontend + backend + postgres + redis)
docker-compose up --build

# To run in the background
docker-compose up --build -d

# Stop everything
docker-compose down
```

| Service  | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

> When using Docker, the backend runs on port **8000** (not 8002). The Vite proxy in `vite.config.js` targets `8002` for local dev — Docker Compose sets `VITE_API_URL` directly instead.

---

### Production Build

```bash
cd vitalscan/frontend
npm run build
# Output: dist/  — serve with any static host or nginx
```

---

## API Reference

All endpoints are prefixed with `/api`.

### `POST /api/predict`

Full multi-disease risk prediction.

**Request body** (JSON):

```json
{
  "age": 35,
  "sex": 1,
  "height_cm": 175,
  "weight_kg": 85,
  "waist_cm": 95,
  "BMI": 27.8,
  "WHR": 0.54,
  "physical_activity": 1,
  "sleep_hours": 6.5,
  "stress_level": 2,
  "family_history_heart": 1,
  "family_history_diab": 0,
  "smoking_status": 2,
  "fried_food": 2,
  "chest_discomfort": 1,
  "salt_intake": 2,
  "sugar_intake": 1,
  "water_intake": 1,
  "excessive_thirst": 0
}
```

**Field reference:**

| Field | Type | Values |
|---|---|---|
| `sex` | int | `0` = Female, `1` = Male |
| `physical_activity` | int | `0` Sedentary · `1` Light · `2` Moderate · `3` Active |
| `stress_level` | int | `0` Low · `1` Moderate · `2` High |
| `smoking_status` | int | `0` Never · `1` Former · `2` Current |
| `fried_food`, `salt_intake`, `sugar_intake` | int | `0` Low · `1` Moderate · `2` High |
| `water_intake` | int | `0` <1 L · `1` 1–2 L · `2` 3–4 L · `3` >4 L |
| `chest_discomfort`, `excessive_thirst` | int | `0` Never · `1` Sometimes · `2` Often |
| `family_history_heart`, `family_history_diab` | int | `0` No · `1` Yes |

**Response body:**

```json
{
  "heartRisk": 62,
  "diabetesRisk": 38,
  "obesityRisk": 45,
  "heartFactors": ["Current Smoker", "High Stress", "Family History"],
  "diabetesFactors": ["Excessive Sugar", "Low Water Intake"],
  "obesityFactors": ["High BMI", "Sedentary Lifestyle"],
  "actionPlan": { ... }
}
```

---

### `POST /api/simulate`

Lightweight endpoint for real-time slider updates. Accepts the same body as `/predict` but returns only the three risk scores (no factors / action plan) for faster response.

---

### `GET /api/health`

```json
{ "status": "ok", "model": "loaded" }
```

---

## ML Model

| Item | Detail |
|---|---|
| Algorithm | `HistGradientBoostingClassifier` (scikit-learn) |
| Trained model | `ml/gradient_boosting_model.pkl` |
| MAE | 4.66 |
| RMSE | 7.05 |
| R² | 0.8178 (81.78 %) |
| Input features | 19 |

To retrain the model from scratch:

```bash
cd vitalscan/ml
python gradient_training.py
# Outputs: gradient_boosting_model.pkl
```

---

## Deploying to Render

VitalScan ships with a `render.yaml` blueprint that creates both services in one click.

### One-click Blueprint Deploy

1. Push this repo to GitHub (make sure `render.yaml` is at the root of the `vitalscan/` folder, or the repo root).
2. In the [Render dashboard](https://dashboard.render.com/) → **New → Blueprint** → connect the repo.
3. Render auto-detects `render.yaml` and creates both services.

### Step-by-step (manual)

#### 1 — Backend Web Service

| Field | Value |
|---|---|
| Runtime | Python 3 |
| Root directory | `backend` |
| Build command | `pip install -r requirements.txt && python ../ml/gradient_training.py` |
| Start command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health check path | `/api/health` |

Add these environment variables in the Render dashboard:

| Key | Value |
|---|---|
| `MODEL_PATH` | `../ml/gradient_boosting_model.pkl` |
| `CORS_ORIGINS` | `https://<your-frontend>.onrender.com` |
| `REDIS_URL` | *(optional)* your Redis instance URL |

#### 2 — Frontend Static Site

| Field | Value |
|---|---|
| Root directory | `frontend` |
| Build command | `npm install && npm run build` |
| Publish directory | `dist` |

Add these environment variables (all from your local `frontend/.env`):

| Key | Description |
|---|---|
| `VITE_API_URL` | `https://<your-backend>.onrender.com/api` |
| `VITE_FIREBASE_API_KEY` | Firebase project key |
| `VITE_FIREBASE_AUTH_DOMAIN` | e.g. `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_ENCRYPTION_KEY` | AES-256 encryption key |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service ID |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public key |
| `VITE_EMAILJS_GREETING_TEMPLATE` | Welcome email template ID |
| `VITE_EMAILJS_EMERGENCY_TEMPLATE` | Emergency alert template ID |

#### 3 — After both services are live

1. Copy the backend URL (e.g. `https://vitalscan-api.onrender.com`).
2. Update `VITE_API_URL` in the frontend service env to `https://vitalscan-api.onrender.com/api`.
3. Update `CORS_ORIGINS` in the backend service env to `https://vitalscan.onrender.com`.
4. Trigger a **Manual Deploy** on both services to pick up the updated env vars.

> **Free tier cold starts:** Render's free web services spin down after 15 min of inactivity. The first request after a cold start may take ~30 s while the model loads. Upgrade to a paid plan to keep the backend always-on.

---

## Authentication & Data Security

- **Firebase Auth** — email/password and Google OAuth
- **Firestore** — all health data (profile, assessments, emergency contacts) is **AES-256 encrypted** client-side before writing to Firestore; decrypted on read
- **Encryption key** — stored in `VITE_ENCRYPTION_KEY` and never leaves the user's browser
- **Emergency alerts** — if any risk score reaches ≥ 70 %, EmailJS sends an alert to all saved emergency contacts automatically

---

## Team

| Role | Name |
|---|---|
| Project Lead | Ram Karthik Kanagala |
| Team | APEXRush |
| Version | v2.0 — 2026 |

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
