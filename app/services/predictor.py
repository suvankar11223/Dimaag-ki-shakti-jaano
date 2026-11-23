from math import isfinite
from pathlib import Path

import joblib
import pandas as pd

from app.schemas import StudentInput

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = PROJECT_ROOT / "Mental_Health_Model.pkl"

MODEL_INPUT_COLUMNS = [
    "Study_Hours",
    "Avg_Daily_Usage_Hours",
    "Age",
    "Daily_Unlocks",
    "Physical_Activity_Hours",
    "Sleep_Hours_Per_Night",
    "Stress_Level",
    "Gender",
    "Academic_Level",
    "Most_Used_Platform",
    "Purpose_Of_Use",
    "Grouped_country",
]

TRAINING_COUNTRIES = {
    "australia": "Australia",
    "canada": "Canada",
    "france": "France",
    "germany": "Germany",
    "india": "India",
    "mexico": "Mexico",
    "other": "Other",
    "turkey": "Turkey",
    "uk": "UK",
    "usa": "USA",
}

if not MODEL_PATH.is_file():
    raise FileNotFoundError(f"Trained model file was not found: {MODEL_PATH}")

model = joblib.load(MODEL_PATH)


def predict_mental_health_score(data: StudentInput) -> float:
    country = TRAINING_COUNTRIES.get(data.country.casefold(), "Other")
    input_row = pd.DataFrame(
        [
            {
                "Study_Hours": data.study_hours,
                "Avg_Daily_Usage_Hours": data.avg_daily_usage_hours,
                "Age": data.age,
                "Daily_Unlocks": data.daily_unlocks,
                "Physical_Activity_Hours": data.physical_activity_hours,
                "Sleep_Hours_Per_Night": data.sleep_hours_per_night,
                "Stress_Level": data.stress_level,
                "Gender": data.gender,
                "Academic_Level": data.academic_level,
                "Most_Used_Platform": data.most_used_platform,
                "Purpose_Of_Use": data.purpose_of_use,
                "Grouped_country": country,
            }
        ],
        columns=MODEL_INPUT_COLUMNS,
    )
    prediction = model.predict(input_row)
    if len(prediction) != 1:
        raise RuntimeError("The model returned an unexpected number of predictions.")
    score = float(prediction[0])
    if not isfinite(score):
        raise RuntimeError("The model returned a non-finite prediction.")
    return score
