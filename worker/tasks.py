"""Worker execution tasks for restoration and astronomical source detection."""

import os
import time
import logging
from typing import Dict, Any, Optional

from backend.app.config import settings
from backend.app.services.storage_service import storage_service
from ai.restoration.pipeline import run_restoration_pipeline
from ai.detection.source_detection import detect_celestial_sources

logger = logging.getLogger(__name__)


def process_job(job_id: str) -> None:
    """Execute processing for a job according to its operation."""
    try:
        job = storage_service.load_job_state(job_id)
    except Exception as e:
        logger.error(f"Cannot load job {job_id}: {e}")
        return

    image_id = job["image_id"]
    operation = job["operation"]
    job_settings = job.get("settings", {})

    job["status"] = "processing"
    job["stage"] = "Initializing server-side astronomical processor"
    job["started_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    storage_service.save_job_state(job_id, job)

    start_t = time.perf_counter()

    try:
        input_image_path = storage_service.get_image_path(image_id)
        result_data: Dict[str, Any] = {}
        restored_file = None

        if operation in ["restore", "combined"]:
            job["stage"] = "Executing classical astronomical restoration (denoising, CLAHE, unsharp mask)"
            storage_service.save_job_state(job_id, job)

            rest_settings = job_settings.get("restoration", job_settings)
            restored_path = os.path.join(settings.outputs_dir, f"{job_id}_restored.png")
            
            rest_meta = run_restoration_pipeline(
                input_path=input_image_path,
                output_path=restored_path,
                denoise_strength=rest_settings.get("denoise_strength", 15.0),
                contrast=rest_settings.get("contrast", 15.0),
                brightness=rest_settings.get("brightness", 0.0),
                sharpening=rest_settings.get("sharpening", 10.0),
                background_leveling=rest_settings.get("background_leveling", False)
            )
            restored_file = f"{job_id}_restored.png"
            result_data["restored_metadata"] = rest_meta

        if operation in ["detect", "combined"]:
            job["stage"] = "Modeling background noise & extracting celestial sources via Photutils"
            storage_service.save_job_state(job_id, job)

            det_settings = job_settings.get("detection", job_settings)
            # If combined, perform detection on restored output for maximum SNR!
            target_image = restored_path if operation == "combined" and os.path.exists(restored_path) else input_image_path

            det_results = detect_celestial_sources(
                image_path=target_image,
                threshold_sigma=det_settings.get("threshold_sigma", 3.5),
                min_area_pixels=det_settings.get("min_area_pixels", 5),
                max_sources=det_settings.get("max_sources", 300)
            )
            result_data.update(det_results)

        total_duration = time.perf_counter() - start_t

        job["status"] = "completed"
        job["stage"] = "Processing completed successfully"
        job["completed_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        job["duration_seconds"] = round(total_duration, 4)
        job["restored_file"] = restored_file
        job["result_data"] = result_data
        storage_service.save_job_state(job_id, job)
        logger.info(f"Job {job_id} ({operation}) finished successfully in {total_duration:.2f}s")

    except Exception as e:
        total_duration = time.perf_counter() - start_t
        logger.exception(f"Job {job_id} failed: {e}")
        job["status"] = "failed"
        job["stage"] = "Error encountered during astronomical processing"
        job["completed_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        job["duration_seconds"] = round(total_duration, 4)
        job["error"] = str(e)
        storage_service.save_job_state(job_id, job)
