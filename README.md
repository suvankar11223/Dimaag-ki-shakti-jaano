# Dimaag-ki-shakti-jaano

## Mental Health Pulse

A FastAPI application and responsive form for the project's student wellness model. The site and prediction API are served from the same origin.

## Run on Windows

Use Python 3.11 and run these commands from this project directory:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

Open `http://127.0.0.1:8000`. Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

The model was serialized with scikit-learn 1.6.1, so `requirements.txt` pins that version. Keep `Mental_Health_Model.pkl` in the project root.

The trained model is included in this repository. The source CSV and notebook are intentionally not included; the notebook contains embedded dataset output. This project is an educational demo and does not diagnose mental-health conditions or replace professional care.

## Project layout

```text
app/
  main.py                 FastAPI setup, health endpoint, and static site
  routers/prediction.py   Prediction HTTP routes
  schemas.py              Input validation and response schemas
  services/predictor.py   Model loading, country grouping, and inference
  static/                 HTML, CSS, and browser-side JavaScript
main.py                    Compatibility entry point for `uvicorn main:app`
requirements.txt           Runtime dependencies
```

## Prediction API

`POST /api/predict` accepts `age`, `gender`, optional `country`, `academic_level`, `most_used_platform`, `purpose_of_use`, `avg_daily_usage_hours`, `daily_unlocks`, `study_hours`, `physical_activity_hours`, `sleep_hours_per_night`, and `stress_level`. The response contains `predicted_mental_health_score`.

Country values outside the model's training groups are mapped to `Other`. The input categories match the fitted model's encoder; unsupported categories are rejected instead of silently passing to the model. The result is a statistical estimate, not a clinical diagnosis.
