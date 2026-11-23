from fastapi import APIRouter

from app.schemas import PredictionResponse, StudentInput
from app.services.predictor import predict_mental_health_score

router = APIRouter()


@router.post("/api/predict", response_model=PredictionResponse)
@router.post("/predict", response_model=PredictionResponse, include_in_schema=False)
def predict(data: StudentInput) -> PredictionResponse:
    score = predict_mental_health_score(data)
    return PredictionResponse(predicted_mental_health_score=score)
