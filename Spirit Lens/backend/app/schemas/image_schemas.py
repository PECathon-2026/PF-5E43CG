"""Pydantic schemas for image uploads and metadata."""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class ImageUploadResponse(BaseModel):
    image_id: str = Field(..., description="Unique opaque identifier for uploaded image")
    original_filename: str
    format: str
    width: int
    height: int
    channels: int
    size_bytes: int
    uploaded_at: str
    message: str = "Image successfully validated and stored."


class RestorationSettings(BaseModel):
    denoise_strength: float = Field(15.0, ge=0.0, le=100.0, description="Denoising intensity")
    contrast: float = Field(15.0, ge=-50.0, le=100.0, description="Adaptive contrast factor")
    brightness: float = Field(0.0, ge=-100.0, le=100.0, description="Brightness shift")
    sharpening: float = Field(10.0, ge=0.0, le=100.0, description="Unsharp mask stellar profile sharpening")
    background_leveling: bool = Field(False, description="Level background gradients and skyglow")


class DetectionSettings(BaseModel):
    threshold_sigma: float = Field(3.5, ge=1.0, le=50.0, description="Detection threshold in units of background RMS")
    min_area_pixels: int = Field(5, ge=1, le=500, description="Minimum connected pixels for candidate source")
    max_sources: int = Field(300, ge=1, le=1000, description="Maximum number of sources to return")


class CombinedProcessRequest(BaseModel):
    restoration: Optional[RestorationSettings] = None
    detection: Optional[DetectionSettings] = None
