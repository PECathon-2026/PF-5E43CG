"""Service for formatting results and exporting astronomical catalogs."""

import io
import csv
import json
from typing import Dict, Any, List
from backend.app.services.storage_service import storage_service
from backend.app.core.errors import ResourceNotFoundError


class ResultService:
    def get_job_results(self, job_id: str) -> Dict[str, Any]:
        """Fetch completed job results and build safe API reference URLs."""
        job = storage_service.load_job_state(job_id)
        if job.get("status") != "completed":
            return {
                "job_id": job_id,
                "image_id": job.get("image_id"),
                "status": job.get("status"),
                "operation": job.get("operation"),
                "duration_seconds": job.get("duration_seconds", 0.0),
                "error": job.get("error"),
                "restored_image_available": False
            }

        image_id = job["image_id"]
        img_meta = storage_service.get_image_metadata(image_id)
        res_data = job.get("result_data", {})

        urls = {
            "original_image": f"/api/v1/images/{image_id}/original",
            "job_status": f"/api/v1/jobs/{job_id}",
            "results": f"/api/v1/jobs/{job_id}/results"
        }
        if job.get("restored_file"):
            urls["restored_image"] = f"/api/v1/jobs/{job_id}/restored"
        if res_data.get("sources") is not None:
            urls["catalog_csv"] = f"/api/v1/jobs/{job_id}/catalog.csv"
            urls["catalog_json"] = f"/api/v1/jobs/{job_id}/catalog.json"

        response_data = {
            "job_id": job_id,
            "image_id": image_id,
            "status": "completed",
            "operation": job.get("operation", "process"),
            "duration_seconds": job.get("duration_seconds", 0.0),
            "original_dimensions": {
                "width": img_meta.get("width", 0),
                "height": img_meta.get("height", 0)
            },
            "restored_dimensions": res_data.get("restored_metadata", {}).get("output_dimensions") or {
                "width": img_meta.get("width", 0),
                "height": img_meta.get("height", 0)
            },
            "format": img_meta.get("format", "UNKNOWN"),
            "method": res_data.get("restored_metadata", {}).get("method", "classical_astronomical_pipeline"),
            "settings": job.get("settings", {}),
            "restored_image_available": bool(job.get("restored_file")),
            "sources": res_data.get("sources"),
            "source_count": res_data.get("source_count"),
            "point_candidate_count": res_data.get("point_candidate_count"),
            "extended_candidate_count": res_data.get("extended_candidate_count"),
            "background_mean": res_data.get("background_mean"),
            "background_median": res_data.get("background_median"),
            "background_rms": res_data.get("background_rms"),
            "urls": urls
        }
        return response_data

    def generate_csv_catalog(self, job_id: str) -> str:
        """Generate CSV string of detected celestial sources."""
        job = storage_service.load_job_state(job_id)
        sources: List[Dict[str, Any]] = job.get("result_data", {}).get("sources", [])
        if not sources:
            # Return valid CSV header even if empty
            return "id,catalog_label,pixel_x,pixel_y,flux,instrumental_mag,fwhm_pixels,semimajor_pixels,semiminor_pixels,eccentricity,classification,is_point_candidate,is_extended_candidate,bbox_ymin,bbox_xmin,bbox_ymax,bbox_xmax\n"

        output = io.StringIO()
        fieldnames = [
            "id", "catalog_label", "pixel_x", "pixel_y", "flux",
            "instrumental_mag", "fwhm_pixels", "semimajor_pixels", "semiminor_pixels",
            "eccentricity", "classification", "is_point_candidate", "is_extended_candidate",
            "bbox_ymin", "bbox_xmin", "bbox_ymax", "bbox_xmax"
        ]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()

        for s in sources:
            bbox = s.get("bbox", [0, 0, 0, 0])
            writer.writerow({
                "id": s.get("id"),
                "catalog_label": s.get("catalog_label"),
                "pixel_x": s.get("x"),
                "pixel_y": s.get("y"),
                "flux": s.get("flux"),
                "instrumental_mag": s.get("instrumental_magnitude", ""),
                "fwhm_pixels": s.get("fwhm_pixels"),
                "semimajor_pixels": s.get("semimajor_pixels"),
                "semiminor_pixels": s.get("semiminor_pixels"),
                "eccentricity": s.get("eccentricity"),
                "classification": s.get("classification"),
                "is_point_candidate": s.get("is_point_candidate"),
                "is_extended_candidate": s.get("is_extended_candidate"),
                "bbox_ymin": bbox[0] if len(bbox) > 0 else 0,
                "bbox_xmin": bbox[1] if len(bbox) > 1 else 0,
                "bbox_ymax": bbox[2] if len(bbox) > 2 else 0,
                "bbox_xmax": bbox[3] if len(bbox) > 3 else 0,
            })
        return output.getvalue()

    def generate_json_catalog(self, job_id: str) -> Dict[str, Any]:
        """Generate JSON representation of catalog."""
        job = storage_service.load_job_state(job_id)
        res_data = job.get("result_data", {})
        return {
            "job_id": job_id,
            "image_id": job.get("image_id"),
            "catalog_name": "Tsukuyomi Watch Celestial Source Catalog",
            "source_count": res_data.get("source_count", 0),
            "point_candidate_count": res_data.get("point_candidate_count", 0),
            "extended_candidate_count": res_data.get("extended_candidate_count", 0),
            "background": {
                "mean": res_data.get("background_mean"),
                "median": res_data.get("background_median"),
                "rms": res_data.get("background_rms"),
            },
            "sources": res_data.get("sources", [])
        }


result_service = ResultService()
