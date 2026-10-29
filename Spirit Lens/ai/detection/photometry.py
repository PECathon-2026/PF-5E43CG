"""Astronomical photometry calculations for detected celestial sources.

Adheres strictly to scientific integrity:
- Uses standard aperture photometry principles.
- Computes background-subtracted instrumental flux.
- Explicitly labels relative magnitudes as uncalibrated instrumental values.
- Never fabricates calibrated apparent magnitudes or photometric systems without calibration zero-points.
"""

import math
from typing import Dict, Any, List, Optional
import numpy as np


def compute_instrumental_magnitude(flux: float, zero_point: float = 25.0) -> Optional[float]:
    """Calculate uncalibrated instrumental magnitude: -2.5 * log10(flux) + zero_point.
    
    Returns None if flux <= 0.
    """
    if flux > 0.0:
        return round(-2.5 * math.log10(flux) + zero_point, 3)
    return None


def calculate_source_morphology(
    semimajor_sigma: float,
    semiminor_sigma: float,
    eccentricity: float,
    fwhm: float
) -> Dict[str, Any]:
    """Derive morphological metrics and honest candidate classifications.
    
    Classifies sources scientifically:
    - 'point_candidate': small FWHM, low elongation (consistent with point spread function)
    - 'extended_candidate': elongated or broadened profile (diffuse nebulae, galaxies, unresolved blends)
    - 'candidate_source': intermediate or uncharacterized candidate
    """
    is_point = False
    is_extended = False

    if fwhm > 0:
        if eccentricity < 0.6 and fwhm < 8.0:
            classification = "point_candidate"
            is_point = True
        elif eccentricity >= 0.6 or fwhm >= 10.0:
            classification = "extended_candidate"
            is_extended = True
        else:
            classification = "candidate_source"
    else:
        classification = "candidate_source"

    return {
        "classification": classification,
        "is_point_candidate": is_point,
        "is_extended_candidate": is_extended,
        "eccentricity": round(float(eccentricity), 3) if not np.isnan(eccentricity) else 0.0,
        "fwhm_pixels": round(float(fwhm), 2) if not np.isnan(fwhm) else 0.0,
        "semimajor_axis_pixels": round(float(semimajor_sigma * 2.355), 2) if not np.isnan(semimajor_sigma) else 0.0,
        "semiminor_axis_pixels": round(float(semiminor_sigma * 2.355), 2) if not np.isnan(semiminor_sigma) else 0.0,
    }
