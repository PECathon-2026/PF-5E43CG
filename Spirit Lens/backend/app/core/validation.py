"""Validation helpers for file uploads and processing settings."""

import os
import re
from typing import Tuple, Dict, Any
from PIL import Image
from backend.app.config import settings
from backend.app.core.errors import ImageValidationError, PayloadTooLargeError


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal or special characters."""
    # Strip directory components
    base = os.path.basename(filename)
    # Remove all characters except alphanumeric, dash, underscore, dot
    clean = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", base)
    if not clean or clean.startswith("."):
        clean = f"image_{clean}"
    return clean[:120]


def validate_file_metadata(filename: str, file_size: int) -> str:
    """Validate filename extension and byte size."""
    if file_size > settings.max_upload_size_bytes:
        raise PayloadTooLargeError(
            f"File size ({file_size / (1024*1024):.1f} MB) exceeds maximum allowed size ({settings.max_upload_size_bytes / (1024*1024):.1f} MB)"
        )
    if file_size <= 0:
        raise ImageValidationError("Uploaded file is empty.")

    ext = os.path.splitext(filename)[1].lower()
    if ext not in settings.supported_extensions:
        raise ImageValidationError(
            f"Unsupported file format '{ext}'. Supported formats: {', '.join(settings.supported_extensions)}"
        )
    return ext


def validate_image_content(filepath: str) -> Dict[str, Any]:
    """Inspect and validate image content on disk.
    
    Verifies valid headers, non-corrupted data, and dimension limits.
    """
    ext = os.path.splitext(filepath)[1].lower()
    
    # Handle FITS
    if ext in [".fits", ".fit", ".fts"]:
        try:
            from astropy.io import fits
            with fits.open(filepath) as hdul:
                has_data = False
                w, h = 0, 0
                for hdu in hdul:
                    if hdu.data is not None and len(hdu.data.shape) >= 2:
                        has_data = True
                        h, w = hdu.data.shape[-2], hdu.data.shape[-1]
                        break
                if not has_data:
                    raise ImageValidationError("FITS file contains no 2D astronomical image data.")
                if w > settings.max_image_dimension or h > settings.max_image_dimension:
                    raise ImageValidationError(f"FITS dimensions ({w}x{h}) exceed maximum limit ({settings.max_image_dimension}px).")
                if (w * h) > settings.max_pixel_count:
                    raise ImageValidationError(f"FITS pixel count ({w*h}) exceeds maximum limit ({settings.max_pixel_count}).")
                return {"width": w, "height": h, "format": "FITS", "channels": 1}
        except ImageValidationError:
            raise
        except Exception as e:
            raise ImageValidationError(f"Invalid or corrupted FITS file: {str(e)}")

    # Standard formats via PIL
    try:
        with Image.open(filepath) as img:
            img.verify()  # checks integrity
        
        # Re-open to read dimensions (verify() closes or invalidates state in PIL)
        with Image.open(filepath) as img:
            w, h = img.size
            fmt = img.format or ext.lstrip(".").upper()
            channels = len(img.getbands())

        if w <= 0 or h <= 0:
            raise ImageValidationError("Image has invalid zero or negative dimensions.")
        if w > settings.max_image_dimension or h > settings.max_image_dimension:
            raise ImageValidationError(f"Image dimensions ({w}x{h}) exceed maximum allowed dimension ({settings.max_image_dimension}px).")
        if (w * h) > settings.max_pixel_count:
            raise ImageValidationError(f"Total pixel count ({w*h}) exceeds limit ({settings.max_pixel_count}).")

        return {"width": w, "height": h, "format": fmt, "channels": channels}
    except ImageValidationError:
        raise
    except Exception as e:
        raise ImageValidationError(f"Corrupted or unreadable image file: {str(e)}")
