import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

from app.services.predictor import load_model
from app.routes.predict import router as predict_router
from app.routes.simulate import router as simulate_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield


app = FastAPI(
    title="VitalScan API",
    description="Health Risk Prediction API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS_ORIGINS env var: comma-separated list of allowed origins.
# e.g. on Render: CORS_ORIGINS=https://vitalscan.onrender.com
_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router, prefix="/api")
app.include_router(simulate_router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "model": "loaded"}
