<div align="center">

<br>

# 🧠 Mental Health Pulse

**Your habits, decoded.**
Estimate a student's well-being score from sleep, screen time, stress, and daily routine.

<br>

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.6.1-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)

[Quick Start](#-quick-start) · [How It Works](#-how-it-works) · [API](#-api) · [Structure](#-structure)

<br>

<img width="2520" height="1314" alt="image" src="https://github.com/user-attachments/assets/9f452ad1-7fe4-484d-9598-ca935fe80a93" />


</div>

---

## 💡 How It Works

| 1️⃣ Answer | 2️⃣ Predict | 3️⃣ Understand |
|:---:|:---:|:---:|
| Fill a short form about your daily habits | A trained ML model analyzes your inputs | Get an instant well-being score |

The website and the API are served from the **same origin**. No extra setup, no CORS headaches.

> **Note:** This is an educational demo. It gives a statistical estimate, not a clinical diagnosis, and does not replace professional care.

---

## 🚀 Quick Start

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

Then open **http://127.0.0.1:8000** and explore the interactive docs at **/docs**.

<sub>The model was trained with scikit-learn 1.6.1 (pinned in `requirements.txt`). Keep `Mental_Health_Model.pkl` in the project root.</sub>

---

## 🔌 API

`POST /api/predict` → returns `{ "predicted_mental_health_score": <number> }`

<details>
<summary><b>View input fields</b></summary>

<br>

| Field | Description |
|---|---|
| `age`, `gender` | Basic profile |
| `country` *(optional)* | Unknown values are grouped as `Other` |
| `academic_level` | Education level |
| `most_used_platform`, `purpose_of_use` | Social media habits |
| `avg_daily_usage_hours`, `daily_unlocks` | Screen usage |
| `study_hours`, `physical_activity_hours`, `sleep_hours_per_night` | Daily routine |
| `stress_level` | Self-reported stress |

Unsupported categories are **rejected**, never silently passed to the model.

</details>

---

## 🗂 Structure

<details>
<summary><b>View project layout</b></summary>

```text
app/
├── main.py                  # FastAPI setup, health check, static site
├── routers/prediction.py    # Prediction routes
├── schemas.py               # Validation & response models
├── services/predictor.py    # Model loading & inference
└── static/                  # HTML, CSS, JavaScript
main.py                      # Entry point for `uvicorn main:app`
requirements.txt             # Dependencies
```

</details>

---

<div align="center">

<sub>Built to make mental wellness easier to understand. 💙</sub>

</div>
