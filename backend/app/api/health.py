"""Health check API endpoint."""

from fastapi import APIRouter
from backend.app.config import settings
from ai.restoration.model_loader import model_loader

router = APIRouter()


@router.get("/health", tags=["Health"])
async def get_health():
    """Return backend health, version, and server-side processing capabilities."""
    ai_status = model_loader.get_status()
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.app_version,
        "server_side_processing": True,
        "modules": {
            "spirit_lens": "active",
            "dashboard": "standby",
            "watchtower": "standby",
            "celestial_scroll": "standby"
        },
        "capabilities": {
            "classical_restoration": True,
            "photutils_source_detection": True,
            "astropy_fits_support": True,
            "ai_neural_model_loaded": ai_status["loaded"],
            "max_upload_size_mb": settings.max_upload_size_bytes // (1024 * 1024),
            "max_dimensions": f"{settings.max_image_dimension}x{settings.max_image_dimension}"
        }
    }
