"""Tsukuyomi Watch — Spirit Lens Master Backend API.

FastAPI application entrypoint providing modular astronomical image processing endpoints.
"""

import sys
import os
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure root workspace is on python sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app.config import settings
from backend.app.core.errors import AstronomicalProcessingError
from backend.app.api.health import router as health_router
from backend.app.api.images import router as images_router
from backend.app.api.jobs import router as jobs_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [MasterAPI] %(message)s"
)
logger = logging.getLogger("tsukuyomi_api")

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Scientific Astronomical Image Restoration and Source Detection Backend",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api/v1
app.include_router(health_router, prefix=settings.api_v1_prefix)
app.include_router(images_router, prefix=settings.api_v1_prefix)
app.include_router(jobs_router, prefix=settings.api_v1_prefix)


@app.exception_handler(AstronomicalProcessingError)
async def astronomical_error_handler(request: Request, exc: AstronomicalProcessingError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc), "error_type": "AstronomicalProcessingError"}
    )


@app.get("/")
async def root():
    return {
        "brand": "TSUKUYOMI WATCH",
        "module": "SPIRIT LENS",
        "tagline": "Unfurl the velvet tapestry of the cosmos, and let the quiet stars whisper their ancient, luminous secrets.",
        "api_v1": f"{settings.api_v1_prefix}/health",
        "documentation": "/api/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
