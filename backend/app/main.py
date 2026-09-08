import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.api.routes_video import router as video_router
from app.api.routes_camera import router as camera_router

app = FastAPI(
    title="OmniSight AI - Object Detection API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(video_router, prefix="/api/v1")
app.include_router(camera_router, prefix="/api/v1")

# Mount temp folder for static video serving
temp_base_dir = os.path.dirname(settings.INPUT_DIR)
os.makedirs(temp_base_dir, exist_ok=True)
app.mount("/temp", StaticFiles(directory=temp_base_dir), name="temp")


@app.get("/health")
def health_check():
    return {"status": "running", "service": "OmniSight AI API"}