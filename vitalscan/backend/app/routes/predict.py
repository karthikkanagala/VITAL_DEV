from fastapi import APIRouter

from app.models.schema import HealthInput, PredictResponse
from app.services.predictor import predict_risks
from app.services.compounding import apply_compounding
from app.services.action_plan import generate_actions

router = APIRouter()


def _label(score: int) -> str:
    if score < 45:
        return "LOW RISK"
    if score < 70:
        return "MODERATE"
    return "HIGH RISK"


def _heart_factors(inputs: dict) -> list[str]:
    factors = []
    if inputs.get("smoking_status", 0) == 2:
        factors.append("Current Smoker")
    elif inputs.get("smoking_status", 0) == 1:
        factors.append("Former Smoker")
    if inputs.get("stress_level", 0) == 2:
        factors.append("High Stress")
    if inputs.get("family_history_heart", 0) == 1:
        factors.append("Family History")
    if inputs.get("chest_discomfort", 0) >= 1:
        factors.append("Chest Discomfort")
    if inputs.get("salt_intake", 0) == 2:
        factors.append("High Salt Intake")
    if inputs.get("BMI", 0) >= 27.5:
        factors.append("Elevated BMI")
    if inputs.get("physical_activity", 0) <= 1:
        factors.append("Low Activity")
    if inputs.get("sleep_hours", 7) < 6:
        factors.append("Poor Sleep")
    return factors[:3]


def _diabetes_factors(inputs: dict) -> list[str]:
    factors = []
    if inputs.get("sugar_intake", 0) == 2:
        factors.append("High Sugar Intake")
    if inputs.get("family_history_diab", 0) == 1:
        factors.append("Family History")
    if inputs.get("excessive_thirst", 0) >= 1:
        factors.append("Excessive Thirst")
    if inputs.get("BMI", 0) >= 27.5:
        factors.append("Elevated BMI")
    if inputs.get("physical_activity", 0) <= 1:
        factors.append("Low Activity")
    if inputs.get("WHR", 0) > 0.5:
        factors.append("High WHtR")
    if inputs.get("sleep_hours", 7) < 6:
        factors.append("Poor Sleep")
    return factors[:3]


def _obesity_factors(inputs: dict) -> list[str]:
    factors = []
    if inputs.get("BMI", 0) >= 30:
        factors.append("Obese BMI")
    elif inputs.get("BMI", 0) >= 25:
        factors.append("Overweight BMI")
    if inputs.get("WHR", 0) > 0.5:
        factors.append("High WHtR")
    if inputs.get("fried_food", 0) == 2:
        factors.append("High Fried Food")
    if inputs.get("water_intake", 0) <= 1:
        factors.append("Low Water Intake")
    if inputs.get("physical_activity", 0) <= 1:
        factors.append("Low Activity")
    if inputs.get("sugar_intake", 0) == 2:
        factors.append("High Sugar")
    if inputs.get("sleep_hours", 7) < 6:
        factors.append("Poor Sleep")
    return factors[:3]


@router.post("/predict", response_model=PredictResponse)
async def predict(data: HealthInput):
    inputs = data.model_dump()

    scores = predict_risks(inputs)
    result = apply_compounding(scores, inputs)
    actions = generate_actions(result, inputs)

    return PredictResponse(
        heartRisk=result["heartRisk"],
        diabetesRisk=result["diabetesRisk"],
        obesityRisk=result["obesityRisk"],
        heartLabel=_label(result["heartRisk"]),
        diabetesLabel=_label(result["diabetesRisk"]),
        obesityLabel=_label(result["obesityRisk"]),
        bmi=round(inputs["BMI"], 1),
        compoundingAlert=result["compoundingAlert"],
        compoundingMessage=result["compoundingMessage"],
        heartFactors=_heart_factors(inputs),
        diabetesFactors=_diabetes_factors(inputs),
        obesityFactors=_obesity_factors(inputs),
        actionPlan=actions,
    )
