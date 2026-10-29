"""Automated test suite for Tsukuyomi Watch Spirit Lens backend and AI pipelines."""

import os
import sys
import io
import pytest
from fastapi.testclient import TestClient
import numpy as np
import cv2

# Ensure workspace root is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.main import app
from ai.restoration.pipeline import run_restoration_pipeline
from ai.detection.source_detection import detect_celestial_sources

client = TestClient(app)


def create_dummy_png_bytes(width=200, height=200, add_stars=True) -> bytes:
    img = np.zeros((height, width, 3), dtype=np.uint8)
    if add_stars:
        # Draw small star-like circles
        for x, y in [(50, 50), (100, 100), (150, 60), (80, 140)]:
            cv2.circle(img, (x, y), 3, (255, 255, 255), -1)
            cv2.circle(img, (x, y), 5, (100, 100, 100), 1)
    success, encoded = cv2.imencode(".png", img)
    return encoded.tobytes()


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["server_side_processing"] is True
    assert "capabilities" in data


def test_image_upload_valid():
    png_bytes = create_dummy_png_bytes()
    response = client.post(
        "/api/v1/images/upload",
        files={"file": ("test_starfield.png", png_bytes, "image/png")}
    )
    assert response.status_code == 201
    data = response.json()
    assert "image_id" in data
    assert data["width"] == 200
    assert data["height"] == 200


def test_image_upload_corrupted():
    corrupted_bytes = b"NOT_A_VALID_IMAGE_HEADER_12345"
    response = client.post(
        "/api/v1/images/upload",
        files={"file": ("corrupted.png", corrupted_bytes, "image/png")}
    )
    assert response.status_code in [400, 422]


def test_image_upload_unsupported_extension():
    response = client.post(
        "/api/v1/images/upload",
        files={"file": ("malicious.exe", b"fake binary", "application/octet-stream")}
    )
    assert response.status_code == 400


def test_restoration_pipeline_execution(tmp_path):
    png_bytes = create_dummy_png_bytes(100, 100)
    in_file = tmp_path / "in.png"
    out_file = tmp_path / "out.png"
    in_file.write_bytes(png_bytes)

    meta = run_restoration_pipeline(
        input_path=str(in_file),
        output_path=str(out_file),
        denoise_strength=10.0,
        contrast=20.0,
        brightness=5.0,
        sharpening=15.0
    )

    assert os.path.exists(out_file)
    assert meta["method"] == "classical_astronomical_pipeline"
    assert meta["output_dimensions"]["width"] == 100


def test_source_detection_with_stars(tmp_path):
    png_bytes = create_dummy_png_bytes(200, 200, add_stars=True)
    img_file = tmp_path / "stars.png"
    img_file.write_bytes(png_bytes)

    results = detect_celestial_sources(str(img_file), threshold_sigma=2.5, min_area_pixels=3)
    assert results["source_count"] >= 3
    assert len(results["sources"]) >= 3
    first_src = results["sources"][0]
    assert "x" in first_src
    assert "y" in first_src
    assert "flux" in first_src
    assert "classification" in first_src


def test_source_detection_empty_field(tmp_path):
    # Pure black image with noise
    img = np.random.normal(10, 0.5, (100, 100)).astype(np.float32)
    img_u8 = np.clip(img, 0, 255).astype(np.uint8)
    _, encoded = cv2.imencode(".png", img_u8)
    img_file = tmp_path / "blank.png"
    img_file.write_bytes(encoded.tobytes())

    results = detect_celestial_sources(str(img_file), threshold_sigma=10.0)
    assert results["source_count"] == 0
    assert len(results["sources"]) == 0


def test_end_to_end_job_lifecycle():
    png_bytes = create_dummy_png_bytes()
    upload_res = client.post(
        "/api/v1/images/upload",
        files={"file": ("e2e_field.png", png_bytes, "image/png")}
    )
    image_id = upload_res.json()["image_id"]

    # Trigger combined processing
    job_res = client.post(
        f"/api/v1/images/{image_id}/process",
        json={
            "restoration": {"denoise_strength": 12.0, "contrast": 10.0, "brightness": 0.0, "sharpening": 10.0, "background_leveling": False},
            "detection": {"threshold_sigma": 2.5, "min_area_pixels": 3, "max_sources": 50}
        }
    )
    assert job_res.status_code == 202
    job_id = job_res.json()["job_id"]

    # Poll status (in-process thread pool completes quickly)
    import time
    for _ in range(30):
        status_res = client.get(f"/api/v1/jobs/{job_id}")
        assert status_res.status_code == 200
        st = status_res.json()["status"]
        if st in ["completed", "failed"]:
            break
        time.sleep(0.2)

    assert st == "completed"

    # Verify results
    results_res = client.get(f"/api/v1/jobs/{job_id}/results")
    assert results_res.status_code == 200
    res_data = results_res.json()
    assert res_data["status"] == "completed"
    assert res_data["restored_image_available"] is True
    assert res_data["source_count"] > 0

    # Verify CSV catalog export
    csv_res = client.get(f"/api/v1/jobs/{job_id}/catalog.csv")
    assert csv_res.status_code == 200
    assert "pixel_x,pixel_y,flux" in csv_res.text

    # Verify JSON catalog export
    json_res = client.get(f"/api/v1/jobs/{job_id}/catalog.json")
    assert json_res.status_code == 200
    assert json_res.json()["source_count"] > 0


def test_fits_upload_and_detection():
    fits_sample = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sample_data", "pleiades_field.fits")
    if not os.path.exists(fits_sample):
        pytest.skip("Sample FITS file not found")

    with open(fits_sample, "rb") as f:
        fits_bytes = f.read()

    upload_res = client.post(
        "/api/v1/images/upload",
        files={"file": ("pleiades_field.fits", fits_bytes, "application/octet-stream")}
    )
    assert upload_res.status_code == 201
    image_id = upload_res.json()["image_id"]
    assert upload_res.json()["format"] == "FITS"

    # Test detection on scientific FITS data
    job_res = client.post(
        f"/api/v1/images/{image_id}/detect",
        json={"threshold_sigma": 3.0, "min_area_pixels": 4, "max_sources": 100}
    )
    assert job_res.status_code == 202
    job_id = job_res.json()["job_id"]

    import time
    for _ in range(30):
        st_res = client.get(f"/api/v1/jobs/{job_id}")
        if st_res.json()["status"] in ["completed", "failed"]:
            break
        time.sleep(0.2)

    assert st_res.json()["status"] == "completed"
    results = client.get(f"/api/v1/jobs/{job_id}/results").json()
    assert results["source_count"] > 10
    assert results["background_rms"] is not None

