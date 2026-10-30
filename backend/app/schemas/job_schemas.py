"""Pydantic schemas for processing jobs, celestial sources, and results."""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class CelestialSourceSchema(BaseModel):
    id: int
    catalog_label: int
    x: float = Field(..., description="Pixel X coordinate (centroid)")
    y: float = Field(..., description="Pixel Y coordinate (centroid)")
    flux: float = Field(..., description="Integrated instrumental flux (background-subtracted)")
    instrumental_magnitude: Optional[float] = Field(None, description="Uncalibrated instrumental magnitude")
    fwhm_pixels: float = Field(..., description="Full width at half maximum in pixels")
    semimajor_pixels: float
    semiminor_pixels: float
    eccentricity: float
    classification: str = Field(..., description="point_candidate, extended_candidate, or candidate_source")
    is_point_candidate: bool
    is_extended_candidate: bool
    bbox: List[int] = Field(..., description="[ymin, xmin, ymax, xmax]")


class JobCreateResponse(BaseModel):
    job_id: str
    status: str
    operation: str
    created_at: str
    message: str


class JobStatusResponse(BaseModel):
    job_id: str
    image_id: str
    status: str = Field(..., description="queued, processing, completed, or failed")
    stage: str
    operation: str
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    duration_seconds: Optional[float] = None
    error: Optional[str] = None


class JobResultsResponse(BaseModel):
    job_id: str
    image_id: str
    status: str
    operation: str
    duration_seconds: float
    original_dimensions: Dict[str, int]
    restored_dimensions: Optional[Dict[str, int]] = None
    format: str
    method: str
    settings: Dict[str, Any]
    restored_image_available: bool
    sources: Optional[List[CelestialSourceSchema]] = None
    source_count: Optional[int] = None
    point_candidate_count: Optional[int] = None
    extended_candidate_count: Optional[int] = None
    background_mean: Optional[float] = None
    background_median: Optional[float] = None
    background_rms: Optional[float] = None
    urls: Dict[str, str] = Field(default_factory=dict)
