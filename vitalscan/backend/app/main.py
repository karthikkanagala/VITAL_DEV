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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router, prefix="/api")
app.include_router(simulate_router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "model": "loaded"}
