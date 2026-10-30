"""Application configuration settings for Tsukuyomi Watch master backend."""

import os
from typing import List
from pydantic import BaseModel, Field


class Settings(BaseModel):
    app_name: str = "Tsukuyomi Watch — Spirit Lens"
    app_version: str = "1.0.0"
    api_v1_prefix: str = "/api/v1"
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Allowed CORS Origins for local development
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    # Storage paths
    base_dir: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_dir: str = os.getenv("DATA_DIR", os.path.join(base_dir, "data"))
    uploads_dir: str = os.getenv("UPLOADS_DIR", os.path.join(base_dir, "data", "uploads"))
    outputs_dir: str = os.getenv("OUTPUTS_DIR", os.path.join(base_dir, "data", "outputs"))
    jobs_dir: str = os.getenv("JOBS_DIR", os.path.join(base_dir, "data", "jobs"))

    # Resource limits
    max_upload_size_bytes: int = int(os.getenv("MAX_UPLOAD_SIZE_BYTES", str(50 * 1024 * 1024)))  # 50 MB
    max_image_dimension: int = int(os.getenv("MAX_IMAGE_DIMENSION", "8192"))
    max_pixel_count: int = int(os.getenv("MAX_PIXEL_COUNT", str(67_108_864)))
    max_concurrent_jobs: int = int(os.getenv("MAX_CONCURRENT_JOBS", "4"))
    job_timeout_seconds: int = int(os.getenv("JOB_TIMEOUT_SECONDS", "120"))
    cleanup_retention_hours: int = int(os.getenv("CLEANUP_RETENTION_HOURS", "24"))

    # Supported formats
    supported_extensions: List[str] = [".png", ".jpg", ".jpeg", ".tif", ".tiff", ".fits", ".fit", ".fts", ".webp"]


settings = Settings()

# Ensure runtime directories exist
for p in [settings.data_dir, settings.uploads_dir, settings.outputs_dir, settings.jobs_dir]:
    os.makedirs(p, exist_ok=True)
