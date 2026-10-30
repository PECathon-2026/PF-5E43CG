"""Unified astronomical restoration pipeline.

Handles ordinary images (PNG, JPEG, WebP) and scientific formats (TIFF, FITS).
"""

import os
import time
import logging
from typing import Dict, Any, Tuple, Optional
import numpy as np
import cv2
from PIL import Image

try:
    from astropy.io import fits
    HAS_ASTROPY = True
except ImportError:
    HAS_ASTROPY = False

from ai.restoration.classical_restoration import restore_image_classical
from ai.restoration.model_loader import model_loader

logger = logging.getLogger(__name__)


def load_image_for_processing(filepath: str) -> Tuple[np.ndarray, Dict[str, Any]]:
    """Load image into BGR numpy array and extract format metadata.
    
    Supports FITS scientific data and standard visual formats.
    """
    ext = os.path.splitext(filepath)[1].lower()
    meta: Dict[str, Any] = {"original_format": ext.lstrip("."), "is_fits": False}

    if ext in [".fits", ".fit", ".fts"] and HAS_ASTROPY:
        with fits.open(filepath) as hdul:
            # Find primary or first image HDU
            data = None
            header_dict = {}
            for hdu in hdul:
                if hdu.data is not None and isinstance(hdu.data, np.ndarray) and len(hdu.data.shape) >= 2:
                    data = hdu.data.astype(np.float32)
                    header_dict = dict(hdu.header)
                    break
            
            if data is None:
                raise ValueError("No 2D image data found in FITS file")

            meta["is_fits"] = True
            meta["fits_header_keys"] = list(header_dict.keys())[:25]
            meta["bitpix"] = header_dict.get("BITPIX", None)
            meta["telescope"] = header_dict.get("TELESCOP", None)
            meta["instrument"] = header_dict.get("INSTRUME", None)
            meta["object"] = header_dict.get("OBJECT", None)

            # Handle 3D data cube (e.g. RGB or spectral channels)
            if len(data.shape) == 3:
                if data.shape[0] in [3, 4]: # (C, H, W)
                    data = np.transpose(data[:3], (1, 2, 0))
                else: # take first slice
                    data = data[0]

            # Robust astronomical normalization (sigma-clipped or min-max percentile)
            finite_data = data[np.isfinite(data)]
            if len(finite_data) == 0:
                raise ValueError("FITS data contains no finite values")
            
            p1, p99 = np.percentile(finite_data, (0.5, 99.5))
            if p99 > p1:
                norm_data = np.clip((data - p1) / (p99 - p1), 0.0, 1.0)
            else:
                norm_data = np.zeros_like(data, dtype=np.float32)
            
            img_u8 = (norm_data * 255.0).astype(np.uint8)
            if len(img_u8.shape) == 2:
                img_bgr = cv2.cvtColor(img_u8, cv2.COLOR_GRAY2BGR)
            else:
                img_bgr = cv2.cvtColor(img_u8, cv2.COLOR_RGB2BGR)
            
            meta["width"] = img_bgr.shape[1]
            meta["height"] = img_bgr.shape[0]
            meta["channels"] = 3
            return img_bgr, meta

    # Standard image formats (PNG, JPG, TIFF)
    # Using cv2.imdecode to safely support unicode paths on Windows
    with open(filepath, "rb") as f:
        bytes_data = np.frombuffer(f.read(), np.uint8)
    img_bgr = cv2.imdecode(bytes_data, cv2.IMREAD_COLOR)

    if img_bgr is None:
        # Fallback to PIL
        with Image.open(filepath) as pil_img:
            rgb = pil_img.convert("RGB")
            img_bgr = cv2.cvtColor(np.array(rgb), cv2.COLOR_RGB2BGR)

    if img_bgr is None:
        raise ValueError(f"Unable to decode image from {filepath}")

    h, w = img_bgr.shape[:2]
    meta["width"] = w
    meta["height"] = h
    meta["channels"] = 3
    return img_bgr, meta


def run_restoration_pipeline(
    input_path: str,
    output_path: str,
    denoise_strength: float = 15.0,
    contrast: float = 15.0,
    brightness: float = 0.0,
    sharpening: float = 10.0,
    background_leveling: bool = False
) -> Dict[str, Any]:
    """Execute complete restoration on input file and write output."""
    img_bgr, meta = load_image_for_processing(input_path)
    
    # Process
    restored_bgr, result_meta = restore_image_classical(
        img_bgr,
        denoise_strength=denoise_strength,
        contrast=contrast,
        brightness=brightness,
        sharpening=sharpening,
        background_leveling=background_leveling
    )

    # Save restored image as optimized PNG
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    success, encoded = cv2.imencode(".png", restored_bgr, [cv2.IMWRITE_PNG_COMPRESSION, 4])
    if not success:
        raise RuntimeError("Failed to encode restored image to PNG")
    with open(output_path, "wb") as f:
        f.write(encoded)

    result_meta["output_file_size_bytes"] = os.path.getsize(output_path)
    result_meta["original_metadata"] = meta
    return result_meta
