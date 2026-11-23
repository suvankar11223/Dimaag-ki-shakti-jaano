from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class StudentInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    age: int = Field(gt=0, le=100)
    gender: Literal["Female", "Male"]
    country: str = Field(default="Other", max_length=60)
    academic_level: Literal["Graduate", "High School", "Undergraduate"]
    most_used_platform: Literal[
        "Facebook",
        "Instagram",
        "KakaoTalk",
        "LINE",
        "LinkedIn",
        "Snapchat",
        "TikTok",
        "Twitter",
        "VKontakte",
        "WeChat",
        "WhatsApp",
        "YouTube",
    ]
    purpose_of_use: Literal["Education", "Entertainment", "Networking", "News"]
    avg_daily_usage_hours: float = Field(gt=0, le=24)
    daily_unlocks: int = Field(gt=0, le=500)
    study_hours: float = Field(gt=0, le=24)
    physical_activity_hours: float = Field(ge=0, le=24)
    sleep_hours_per_night: float = Field(gt=0, le=24)
    stress_level: Literal["Low", "Medium", "High", "Very High"]

    @field_validator("country", mode="before")
    @classmethod
    def default_blank_country(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip():
            return "Other"
        return value


class PredictionResponse(BaseModel):
    predicted_mental_health_score: float


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    model_loaded: bool = True
