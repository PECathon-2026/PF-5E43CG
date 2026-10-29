"""Utility functions for astronomical image calculations and conversions."""

import numpy as np


def compute_snr_estimate(peak_intensity: float, background_median: float, background_rms: float) -> float:
    """Estimate source Signal-to-Noise Ratio (SNR)."""
    if background_rms <= 1e-6:
        return 0.0
    net_signal = max(0.0, peak_intensity - background_median)
    return round(float(net_signal / background_rms), 2)


def format_bytes_human(num_bytes: int) -> str:
    """Format bytes into readable MB/KB string."""
    for unit in ["B", "KB", "MB", "GB"]:
        if num_bytes < 1024.0:
            return f"{num_bytes:.1f} {unit}"
        num_bytes /= 1024.0
    return f"{num_bytes:.1f} TB"
