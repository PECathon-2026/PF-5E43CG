"""Storage service for managing uploaded images, processed outputs, and metadata."""

import os
import json
import time
import uuid
from typing import Optional, Dict, Any, Tuple
import cv2
import numpy as np
from PIL import Image

from backend.app.config import settings
from backend.app.core.errors import ResourceNotFoundError, ImageValidationError
from backend.app.core.validation import sanitize_filename, validate_file_metadata, validate_image_content
from ai.restoration.pipeline import load_image_for_processing


class StorageService:
    def __init__(self):
        self.uploads_dir = settings.uploads_dir
        self.outputs_dir = settings.outputs_dir
        self.jobs_dir = settings.jobs_dir

    def save_upload(self, file_bytes: bytes, original_filename: str) -> Tuple[str, Dict[str, Any]]:
        """Validate and securely persist uploaded image."""
        clean_name = sanitize_filename(original_filename)
        validate_file_metadata(clean_name, len(file_bytes))

        image_id = str(uuid.uuid4())
        ext = os.path.splitext(clean_name)[1].lower()
        stored_filename = f"{image_id}{ext}"
        filepath = os.path.join(self.uploads_dir, stored_filename)

        # Write to disk safely
        with open(filepath, "wb") as f:
            f.write(file_bytes)

        # Validate content and read dimensions
        try:
            content_info = validate_image_content(filepath)
        except Exception:
            if os.path.exists(filepath):
                os.remove(filepath)
            raise

        # Generate a standard web-viewable PNG preview if it is FITS or TIFF
        preview_filename = f"{image_id}_preview.png"
        preview_path = os.path.join(self.uploads_dir, preview_filename)
        try:
            bgr, _ = load_image_for_processing(filepath)
            cv2.imwrite(preview_path, bgr)
        except Exception as e:
            # If preview fails, standard image is its own preview
            pass

        meta = {
            "image_id": image_id,
            "original_filename": clean_name,
            "stored_filename": stored_filename,
            "format": content_info["format"],
            "width": content_info["width"],
            "height": content_info["height"],
            "channels": content_info["channels"],
            "size_bytes": len(file_bytes),
            "uploaded_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "has_preview": os.path.exists(preview_path)
        }

        # Store image metadata
        meta_path = os.path.join(self.uploads_dir, f"{image_id}.json")
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)

        return image_id, meta

    def get_image_metadata(self, image_id: str) -> Dict[str, Any]:
        """Load stored image metadata."""
        self._validate_id(image_id)
        meta_path = os.path.join(self.uploads_dir, f"{image_id}.json")
        if not os.path.exists(meta_path):
            raise ResourceNotFoundError(f"Astronomical image ID '{image_id}' not found.")
        with open(meta_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def get_image_path(self, image_id: str, preview_if_available: bool = False) -> str:
        """Get absolute path to image, ensuring path traversal safety."""
        meta = self.get_image_metadata(image_id)
        
        if preview_if_available and meta.get("has_preview"):
            preview_path = os.path.join(self.uploads_dir, f"{image_id}_preview.png")
            if os.path.exists(preview_path):
                return self._safe_path(preview_path, self.uploads_dir)

        path = os.path.join(self.uploads_dir, meta["stored_filename"])
        return self._safe_path(path, self.uploads_dir)

    def get_restored_image_path(self, job_id: str) -> str:
        """Get path to restored output image."""
        self._validate_id(job_id)
        path = os.path.join(self.outputs_dir, f"{job_id}_restored.png")
        if not os.path.exists(path):
            raise ResourceNotFoundError(f"Restored image for job '{job_id}' does not exist.")
        return self._safe_path(path, self.outputs_dir)

    def save_job_state(self, job_id: str, state: Dict[str, Any]) -> None:
        """Persist job state to disk atomically."""
        self._validate_id(job_id)
        job_file = os.path.join(self.jobs_dir, f"{job_id}.json")
        temp_file = f"{job_file}.tmp"
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2)
        os.replace(temp_file, job_file)

    def load_job_state(self, job_id: str) -> Dict[str, Any]:
        """Load job state from disk."""
        self._validate_id(job_id)
        job_file = os.path.join(self.jobs_dir, f"{job_id}.json")
        if not os.path.exists(job_file):
            raise ResourceNotFoundError(f"Job ID '{job_id}' not found.")
        with open(job_file, "r", encoding="utf-8") as f:
            return json.load(f)

    def _validate_id(self, item_id: str) -> None:
        if not item_id or "/" in item_id or "\\" in item_id or ".." in item_id:
            raise ResourceNotFoundError("Invalid identifier format.")

    def _safe_path(self, target_path: str, base_dir: str) -> str:
        abs_target = os.path.abspath(target_path)
        abs_base = os.path.abspath(base_dir)
        if not abs_target.startswith(abs_base):
            raise ResourceNotFoundError("Access denied: path traversal prevented.")
        return abs_target


storage_service = StorageService()
