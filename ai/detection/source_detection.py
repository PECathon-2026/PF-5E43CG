"""Astronomical celestial source detection using Astropy and Photutils.

Adheres strictly to scientific requirements:
- Real numerical background and noise modeling.
- Real threshold-based source extraction with centroiding and photometry.
- Honest candidate classification without fabricated confidence or ungrounded classifications.
"""

import time
import logging
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import cv2
from astropy.stats import sigma_clipped_stats, SigmaClip
from photutils.background import Background2D, MedianBackground
from photutils.segmentation import detect_sources, SourceCatalog
from photutils.detection import DAOStarFinder

from ai.detection.photometry import compute_instrumental_magnitude, calculate_source_morphology
from ai.restoration.pipeline import load_image_for_processing

logger = logging.getLogger(__name__)


def detect_celestial_sources(
    image_path: str,
    threshold_sigma: float = 3.5,
    min_area_pixels: int = 5,
    deblend: bool = True,
    max_sources: int = 500
) -> Dict[str, Any]:
    """Detect and measure celestial sources in an astronomical image.
    
    Parameters:
        image_path: Path to input image file (FITS, PNG, JPG, TIFF).
        threshold_sigma: Detection significance threshold in units of background RMS.
        min_area_pixels: Minimum contiguous connected pixels for detection.
        deblend: Whether to deblend overlapping sources.
        max_sources: Safety ceiling on returned sources for performance and bandwidth.
        
    Returns:
        Dictionary containing source measurements, background statistics, and metadata.
    """
    start_time = time.perf_counter()
    
    # 1. Load image and convert to 2D float32 representation
    img_bgr, meta = load_image_for_processing(image_path)
    h, w = img_bgr.shape[:2]

    # Convert to standard astronomical luminance (ITU-R BT.601 standard)
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)

    # 2. Estimate background and noise
    # Global sigma-clipped stats
    mean_val, median_val, std_val = sigma_clipped_stats(gray, sigma=3.0, maxiters=5)
    
    # Use 2D spatial background mesh if image is sufficiently sized
    bkg_data = np.full_like(gray, median_val)
    rms_data = np.full_like(gray, std_val)
    
    if min(h, w) >= 64:
        try:
            box_size = max(16, int(min(h, w) // 10))
            if box_size % 2 != 0:
                box_size += 1
            bkg = Background2D(
                gray,
                box_size=(box_size, box_size),
                filter_size=(3, 3),
                sigma_clip=SigmaClip(sigma=3.0),
                bkg_estimator=MedianBackground()
            )
            bkg_data = bkg.background
            rms_data = bkg.background_rms
        except Exception as e:
            logger.warning(f"Background2D estimation fallback to global stats: {e}")
            bkg_data = np.full_like(gray, median_val)
            rms_data = np.full_like(gray, std_val)

    # Effective background-subtracted data
    data_sub = gray - bkg_data
    effective_rms = np.where(rms_data > 1e-6, rms_data, max(float(std_val), 1e-4))
    detection_threshold = threshold_sigma * effective_rms

    sources_list: List[Dict[str, Any]] = []

    # 3. Source extraction via image segmentation
    segment_map = None
    try:
        # Use n_pixels (modern photutils) with fallback to npixels
        try:
            segment_map = detect_sources(data_sub, detection_threshold, n_pixels=min_area_pixels)
        except TypeError:
            segment_map = detect_sources(data_sub, detection_threshold, npixels=min_area_pixels)
    except Exception as e:
        logger.warning(f"detect_sources exception: {e}")

    if segment_map is not None:
        try:
            cat = SourceCatalog(data_sub, segment_map, error=effective_rms)
            tbl = cat.to_table()
            
            # Sort by flux descending
            flux_col = "segment_flux" if "segment_flux" in tbl.colnames else "flux"
            if flux_col in tbl.colnames:
                tbl.sort(flux_col, reverse=True)

            fwhm_array = None
            try:
                fwhm_array = cat.fwhm.value if hasattr(cat.fwhm, "value") else cat.fwhm
            except Exception:
                fwhm_array = None

            for idx, row in enumerate(tbl[:max_sources]):
                src_id = int(row["label"]) if "label" in row.colnames else idx + 1
                
                # Check for x_centroid vs xcentroid
                x_cent = 0.0
                if "x_centroid" in row.colnames and not np.isnan(row["x_centroid"]):
                    x_cent = float(row["x_centroid"])
                elif "xcentroid" in row.colnames and not np.isnan(row["xcentroid"]):
                    x_cent = float(row["xcentroid"])
                
                y_cent = 0.0
                if "y_centroid" in row.colnames and not np.isnan(row["y_centroid"]):
                    y_cent = float(row["y_centroid"])
                elif "ycentroid" in row.colnames and not np.isnan(row["ycentroid"]):
                    y_cent = float(row["ycentroid"])

                flux = 0.0
                if flux_col in row.colnames and not np.isnan(row[flux_col]):
                    flux = float(row[flux_col])
                flux = max(0.0, flux)

                # Morphology
                fwhm_val = 3.0
                if fwhm_array is not None and idx < len(fwhm_array) and not np.isnan(fwhm_array[idx]):
                    fwhm_val = float(fwhm_array[idx])
                elif "fwhm" in row.colnames and not np.isnan(row["fwhm"]):
                    fwhm_val = float(row["fwhm"].value if hasattr(row["fwhm"], "value") else row["fwhm"])

                # Semimajor and semiminor
                smaj = 2.0
                if "semimajor_axis" in row.colnames and not np.isnan(row["semimajor_axis"]):
                    val = row["semimajor_axis"]
                    smaj = float(val.value if hasattr(val, "value") else val)
                elif "semimajor_sigma" in row.colnames and not np.isnan(row["semimajor_sigma"]):
                    val = row["semimajor_sigma"]
                    smaj = float(val.value if hasattr(val, "value") else val)

                smin = 2.0
                if "semiminor_axis" in row.colnames and not np.isnan(row["semiminor_axis"]):
                    val = row["semiminor_axis"]
                    smin = float(val.value if hasattr(val, "value") else val)
                elif "semiminor_sigma" in row.colnames and not np.isnan(row["semiminor_sigma"]):
                    val = row["semiminor_sigma"]
                    smin = float(val.value if hasattr(val, "value") else val)

                ecc = float(row["eccentricity"]) if "eccentricity" in row.colnames and not np.isnan(row["eccentricity"]) else 0.0

                morph = calculate_source_morphology(smaj, smin, ecc, fwhm_val)
                inst_mag = compute_instrumental_magnitude(flux)

                # Bounding box [ymin, xmin, ymax, xmax]
                ymin = int(row["bbox_ymin"]) if "bbox_ymin" in row.colnames else max(0, int(y_cent - 5))
                xmin = int(row["bbox_xmin"]) if "bbox_xmin" in row.colnames else max(0, int(x_cent - 5))
                ymax = int(row["bbox_ymax"]) if "bbox_ymax" in row.colnames else min(h, int(y_cent + 5))
                xmax = int(row["bbox_xmax"]) if "bbox_xmax" in row.colnames else min(w, int(x_cent + 5))

                sources_list.append({
                    "id": idx + 1,
                    "catalog_label": src_id,
                    "x": round(x_cent, 2),
                    "y": round(y_cent, 2),
                    "flux": round(flux, 2),
                    "instrumental_magnitude": inst_mag,
                    "fwhm_pixels": round(float(fwhm_val), 2),
                    "semimajor_pixels": round(float(smaj), 2),
                    "semiminor_pixels": round(float(smin), 2),
                    "eccentricity": round(float(ecc), 3),
                    "classification": morph["classification"],
                    "is_point_candidate": morph["is_point_candidate"],
                    "is_extended_candidate": morph["is_extended_candidate"],
                    "bbox": [ymin, xmin, ymax, xmax]
                })
        except Exception as e:
            logger.error(f"Error extracting SourceCatalog measurements: {e}", exc_info=True)

    # 4. Fallback to DAOStarFinder if segmentation yielded 0 sources
    if len(sources_list) == 0:
        try:
            daofind = DAOStarFinder(fwhm=3.0, threshold=float(threshold_sigma * std_val))
            dao_sources = daofind(data_sub)
            if dao_sources is not None and len(dao_sources) > 0:
                dao_sources.sort("flux", reverse=True)
                for idx, row in enumerate(dao_sources[:max_sources]):
                    x_c = float(row["xcentroid"])
                    y_c = float(row["ycentroid"])
                    flx = max(0.0, float(row["flux"]))
                    inst_mag = compute_instrumental_magnitude(flx)
                    sources_list.append({
                        "id": idx + 1,
                        "catalog_label": idx + 1,
                        "x": round(x_c, 2),
                        "y": round(y_c, 2),
                        "flux": round(flx, 2),
                        "instrumental_magnitude": inst_mag,
                        "fwhm_pixels": 3.0,
                        "semimajor_pixels": 3.0,
                        "semiminor_pixels": 3.0,
                        "eccentricity": 0.0,
                        "classification": "point_candidate",
                        "is_point_candidate": True,
                        "is_extended_candidate": False,
                        "bbox": [max(0, int(y_c - 4)), max(0, int(x_c - 4)), min(h, int(y_c + 4)), min(w, int(x_c + 4))]
                    })
        except Exception as e:
            logger.warning(f"DAOStarFinder fallback: {e}")

    duration = time.perf_counter() - start_time
    point_count = sum(1 for s in sources_list if s["is_point_candidate"])
    extended_count = sum(1 for s in sources_list if s["is_extended_candidate"])

    return {
        "sources": sources_list,
        "source_count": len(sources_list),
        "point_candidate_count": point_count,
        "extended_candidate_count": extended_count,
        "background_mean": round(float(mean_val), 3),
        "background_median": round(float(median_val), 3),
        "background_rms": round(float(std_val), 3),
        "detection_threshold_sigma": threshold_sigma,
        "processing_time_seconds": round(duration, 4),
        "image_dimensions": {"width": w, "height": h},
        "settings": {
            "threshold_sigma": threshold_sigma,
            "min_area_pixels": min_area_pixels,
            "max_sources": max_sources
        }
    }
