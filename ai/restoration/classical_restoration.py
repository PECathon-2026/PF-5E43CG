"""Classical astronomical image restoration pipeline."""

import time
import logging
from typing import Dict, Any, Tuple, Optional
import numpy as np
import cv2
from PIL import Image

logger = logging.getLogger(__name__)


def apply_clahe(image: np.ndarray, clip_limit: float = 2.0, tile_grid_size: Tuple[int, int] = (8, 8)) -> np.ndarray:
    """Apply Contrast Limited Adaptive Histogram Equalization.
    
    CLAHE reveals faint nebular structures and star clusters without saturating
    bright star cores.
    """
    if len(image.shape) == 2:
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
        return clahe.apply(image)
    elif len(image.shape) == 3:
        # Convert to LAB color space and apply CLAHE to the L channel
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l_chan, a_chan, b_chan = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
        cl = clahe.apply(l_chan)
        merged = cv2.merge((cl, a_chan, b_chan))
        return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)
    return image


def apply_denoise(image: np.ndarray, strength: float = 10.0) -> np.ndarray:
    """Apply edge-preserving denoising suitable for astronomical images.
    
    Uses fastNlMeans or bilateral filtering based on strength to preserve point sources (stars)
    while smoothing stochastic Poisson/read noise.
    """
    if strength <= 0:
        return image
    
    h_param = float(np.clip(strength * 0.35, 1.0, 30.0))
    if len(image.shape) == 2:
        return cv2.fastNlMeansDenoising(image, None, h=h_param, templateWindowSize=7, searchWindowSize=21)
    else:
        return cv2.fastNlMeansDenoisingColored(image, None, h=h_param, hColor=h_param, templateWindowSize=7, searchWindowSize=21)


def apply_sharpening(image: np.ndarray, amount: float = 20.0) -> np.ndarray:
    """Apply subtle unsharp masking to enhance stellar profiles and filamentary details."""
    if amount <= 0:
        return image
    
    # Gaussian blur for unsharp mask
    gaussian = cv2.GaussianBlur(image, (0, 0), sigmaX=2.0)
    # Blend: original + (original - blur) * weight
    weight = float(np.clip(amount / 100.0, 0.0, 1.5))
    sharpened = cv2.addWeighted(image, 1.0 + weight, gaussian, -weight, 0)
    return np.clip(sharpened, 0, 255).astype(np.uint8)


def apply_brightness_contrast(image: np.ndarray, brightness: float = 0.0, contrast: float = 0.0) -> np.ndarray:
    """Adjust brightness and contrast with safe linear mapping and black-point protection."""
    if brightness == 0.0 and contrast == 0.0:
        return image
    
    # alpha: contrast factor [0.5, 2.5]
    alpha = float(1.0 + (contrast / 100.0))
    alpha = max(0.2, min(alpha, 3.0))
    # beta: brightness offset [-100, 100]
    beta = float(brightness * 1.28)
    
    adjusted = cv2.convertScaleAbs(image, alpha=alpha, beta=beta)
    return adjusted


def apply_background_leveling(image: np.ndarray, enabled: bool = False) -> np.ndarray:
    """Estimate and level background gradients (e.g. light pollution or skyglow)."""
    if not enabled:
        return image
    
    # Use morphological opening to approximate uneven background
    kernel_size = max(25, int(min(image.shape[:2]) * 0.05))
    if kernel_size % 2 == 0:
        kernel_size += 1
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
    
    if len(image.shape) == 2:
        bkg = cv2.morphologyEx(image, cv2.MORPH_OPEN, kernel)
        res = cv2.subtract(image, (bkg * 0.75).astype(np.uint8))
        return cv2.normalize(res, None, 0, 255, cv2.NORM_MINMAX)
    else:
        channels = cv2.split(image)
        leveled = []
        for ch in channels:
            bkg = cv2.morphologyEx(ch, cv2.MORPH_OPEN, kernel)
            sub = cv2.subtract(ch, (bkg * 0.75).astype(np.uint8))
            leveled.append(cv2.normalize(sub, None, 0, 255, cv2.NORM_MINMAX))
        return cv2.merge(leveled)


def restore_image_classical(
    image_bgr: np.ndarray,
    denoise_strength: float = 15.0,
    contrast: float = 15.0,
    brightness: float = 0.0,
    sharpening: float = 10.0,
    background_leveling: bool = False
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """Execute complete classical astronomical restoration pipeline.
    
    Returns:
        (restored_bgr, metadata)
    """
    start_time = time.perf_counter()
    h, w = image_bgr.shape[:2]
    
    processed = image_bgr.copy()
    
    # 1. Background leveling if requested
    if background_leveling:
        processed = apply_background_leveling(processed, enabled=True)
        
    # 2. Denoising
    if denoise_strength > 0:
        processed = apply_denoise(processed, strength=denoise_strength)
        
    # 3. Contrast via adaptive histogram equalization
    if contrast != 0:
        clip_limit = max(1.0, 1.0 + (contrast / 25.0))
        processed = apply_clahe(processed, clip_limit=clip_limit)
        
    # 4. Brightness adjustment
    if brightness != 0:
        processed = apply_brightness_contrast(processed, brightness=brightness, contrast=0)
        
    # 5. Unsharp masking for star profiles
    if sharpening > 0:
        processed = apply_sharpening(processed, amount=sharpening)
        
    duration = time.perf_counter() - start_time
    
    metadata = {
        "method": "classical_astronomical_pipeline",
        "label": "Classical Astronomical Image Processing",
        "duration_seconds": round(duration, 4),
        "input_dimensions": {"width": w, "height": h},
        "output_dimensions": {"width": w, "height": h},
        "settings": {
            "denoise_strength": denoise_strength,
            "contrast": contrast,
            "brightness": brightness,
            "sharpening": sharpening,
            "background_leveling": background_leveling,
        },
        "ai_model_used": False,
        "is_neural_network": False
    }
    
    return processed, metadata
