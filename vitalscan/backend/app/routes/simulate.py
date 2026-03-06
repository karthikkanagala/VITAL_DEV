from fastapi import APIRouter

from app.models.schema import HealthInput, SimulateResponse
from app.services.predictor import predict_risks
from app.services.compounding import apply_compounding

router = APIRouter()


@router.post("/simulate", response_model=SimulateResponse)
async def simulate(data: HealthInput):
    inputs = data.model_dump()
    scores = predict_risks(inputs)
    result = apply_compounding(scores, inputs)

    return SimulateResponse(
        heartRisk=result["heartRisk"],
        diabetesRisk=result["diabetesRisk"],
        obesityRisk=result["obesityRisk"],
    )
