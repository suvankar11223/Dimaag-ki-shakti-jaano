from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.routers.prediction import router as prediction_router
from app.schemas import HealthResponse

STATIC_DIR = Path(__file__).resolve().parent / "static"

app = FastAPI(
    title="Mental Health Pulse",
    description="A student wellness estimate from the project's trained regression model.",
    version="1.0.0",
)
app.include_router(prediction_router)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", include_in_schema=False)
def home() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/health", response_model=HealthResponse, tags=["health"])
def health() -> HealthResponse:
    return HealthResponse()
