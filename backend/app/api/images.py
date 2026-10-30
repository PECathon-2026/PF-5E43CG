"""API endpoints for image uploading, retrieval, and job dispatching."""

import os
import mimetypes
from fastapi import APIRouter, UploadFile, File, Query, status
from fastapi.responses import FileResponse

from backend.app.schemas.image_schemas import (
    ImageUploadResponse,
    RestorationSettings,
    DetectionSettings,
    CombinedProcessRequest
)
from backend.app.schemas.job_schemas import JobCreateResponse
from backend.app.services.storage_service import storage_service
from backend.app.services.job_service import job_service

router = APIRouter()


@router.post("/images/upload", response_model=ImageUploadResponse, status_code=status.HTTP_201_CREATED, tags=["Images"])
async def upload_image(file: UploadFile = File(...)):
    """Upload and validate an astronomical image (PNG, JPEG, TIFF, FITS)."""
    file_bytes = await file.read()
    image_id, meta = storage_service.save_upload(
        file_bytes=file_bytes,
        original_filename=file.filename or "astronomy_image.png"
    )

    return ImageUploadResponse(
        image_id=image_id,
        original_filename=meta["original_filename"],
        format=meta["format"],
        width=meta["width"],
        height=meta["height"],
        channels=meta["channels"],
        size_bytes=meta["size_bytes"],
        uploaded_at=meta["uploaded_at"],
        message="Astronomical image successfully validated and stored."
    )


@router.get("/images/{image_id}/original", tags=["Images"])
async def get_original_image(
    image_id: str,
    preview: bool = Query(True, description="Return normalized PNG preview if image is FITS or TIFF")
):
    """Serve the original image (or normalized PNG visual representation for FITS data)."""
    path = storage_service.get_image_path(image_id, preview_if_available=preview)
    ext = os.path.splitext(path)[1].lower()
    media_type = mimetypes.guess_type(path)[0] or "application/octet-stream"
    if ext == ".png":
        media_type = "image/png"
    elif ext in [".jpg", ".jpeg"]:
        media_type = "image/jpeg"

    meta = storage_service.get_image_metadata(image_id)
    return FileResponse(
        path=path,
        media_type=media_type,
        filename=f"original_{meta.get('original_filename', 'image')}"
    )


@router.post("/images/{image_id}/restore", response_model=JobCreateResponse, status_code=status.HTTP_202_ACCEPTED, tags=["Restoration"])
async def create_restoration_job(image_id: str, settings: RestorationSettings):
    """Queue a server-side classical astronomical restoration job."""
    job_id = job_service.create_job(
        image_id=image_id,
        operation="restore",
        settings_dict=settings.model_dump()
    )
    status_dict = job_service.get_job_status(job_id)
    return JobCreateResponse(
        job_id=job_id,
        status=status_dict["status"],
        operation="restore",
        created_at=status_dict["created_at"],
        message="Astronomical restoration job accepted and queued."
    )


@router.post("/images/{image_id}/detect", response_model=JobCreateResponse, status_code=status.HTTP_202_ACCEPTED, tags=["Detection"])
async def create_detection_job(image_id: str, settings: DetectionSettings):
    """Queue a celestial source detection job."""
    job_id = job_service.create_job(
        image_id=image_id,
        operation="detect",
        settings_dict=settings.model_dump()
    )
    status_dict = job_service.get_job_status(job_id)
    return JobCreateResponse(
        job_id=job_id,
        status=status_dict["status"],
        operation="detect",
        created_at=status_dict["created_at"],
        message="Celestial source detection job accepted and queued."
    )


@router.post("/images/{image_id}/process", response_model=JobCreateResponse, status_code=status.HTTP_202_ACCEPTED, tags=["Combined Processing"])
async def create_combined_processing_job(image_id: str, req: CombinedProcessRequest):
    """Queue combined restoration and detection in a single workflow."""
    settings_dict = {
        "restoration": req.restoration.model_dump() if req.restoration else RestorationSettings().model_dump(),
        "detection": req.detection.model_dump() if req.detection else DetectionSettings().model_dump(),
    }
    job_id = job_service.create_job(
        image_id=image_id,
        operation="combined",
        settings_dict=settings_dict
    )
    status_dict = job_service.get_job_status(job_id)
    return JobCreateResponse(
        job_id=job_id,
        status=status_dict["status"],
        operation="combined",
        created_at=status_dict["created_at"],
        message="Combined restoration and source detection job queued."
    )
