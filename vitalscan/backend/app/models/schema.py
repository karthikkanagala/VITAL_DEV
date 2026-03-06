from pydantic import BaseModel, Field


class HealthInput(BaseModel):
    age: int = Field(..., ge=1, le=120)
    sex: int = Field(..., ge=0, le=1)
    height_cm: float = Field(..., ge=50, le=300)
    weight_kg: float = Field(..., ge=20, le=500)
    waist_cm: float = Field(..., ge=30, le=200)
    BMI: float = Field(..., ge=5, le=80)
    WHR: float = Field(..., ge=0.1, le=1.5)
    physical_activity: int = Field(..., ge=0, le=3)
    sleep_hours: float = Field(..., ge=0, le=24)
    stress_level: int = Field(..., ge=0, le=2)
    family_history_heart: int = Field(..., ge=0, le=1)
    family_history_diab: int = Field(..., ge=0, le=1)
    smoking_status: int = Field(..., ge=0, le=2)
    fried_food: int = Field(..., ge=0, le=2)
    chest_discomfort: int = Field(..., ge=0, le=2)
    salt_intake: int = Field(..., ge=0, le=2)
    sugar_intake: int = Field(..., ge=0, le=2)
    water_intake: int = Field(..., ge=0, le=3)
    excessive_thirst: int = Field(..., ge=0, le=2)


class PredictResponse(BaseModel):
    heartRisk: int
    diabetesRisk: int
    obesityRisk: int
    heartLabel: str
    diabetesLabel: str
    obesityLabel: str
    bmi: float
    compoundingAlert: bool
    compoundingMessage: str
    heartFactors: list[str]
    diabetesFactors: list[str]
    obesityFactors: list[str]
    actionPlan: list[str]


class SimulateResponse(BaseModel):
    heartRisk: int
    diabetesRisk: int
    obesityRisk: int
