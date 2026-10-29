"""Generate realistic synthetic astronomical sample images (FITS and PNG).

Includes realistic stellar point spread functions (PSF), diffuse nebular emission,
and Poisson/Gaussian background noise for testing and demonstration.
"""

import os
import numpy as np
import cv2
from astropy.io import fits


def generate_astronomical_field(width: int = 512, height: int = 512, num_stars: int = 65) -> np.ndarray:
    """Create a realistic 2D astronomical field."""
    np.random.seed(42)
    
    # 1. Background gradient (simulating light pollution / sky glow)
    y, x = np.mgrid[0:height, 0:width]
    bkg = 25.0 + 12.0 * np.sin(x / width * np.pi) + 8.0 * np.cos(y / height * np.pi)
    
    # 2. Add Poisson/Gaussian noise
    noise = np.random.normal(0, 4.5, (height, width))
    image = bkg + noise

    # 3. Add diffuse nebular cloud (extended source)
    cx, cy = width * 0.45, height * 0.55
    r2 = ((x - cx) ** 2) / (60.0 ** 2) + ((y - cy) ** 2) / (35.0 ** 2)
    nebula = 45.0 * np.exp(-0.5 * r2)
    image += nebula

    # 4. Add point-like star candidates with 2D Gaussian profiles
    for _ in range(num_stars):
        sx = np.random.uniform(20, width - 20)
        sy = np.random.uniform(20, height - 20)
        # Power-law flux distribution (more faint stars, few bright stars)
        peak_intensity = np.random.pareto(a=1.8) * 80.0 + 30.0
        peak_intensity = min(peak_intensity, 1800.0)
        sigma = np.random.uniform(1.2, 2.5)  # FWHM ~ 2.8 - 5.8 px

        dist2 = (x - sx) ** 2 + (y - sy) ** 2
        star = peak_intensity * np.exp(-0.5 * dist2 / (sigma ** 2))
        image += star

    return np.clip(image, 0, None).astype(np.float32)


def create_sample_files(out_dir: str):
    os.makedirs(out_dir, exist_ok=True)
    
    data = generate_astronomical_field(512, 512, num_stars=70)
    
    # Save FITS
    fits_path = os.path.join(out_dir, "pleiades_field.fits")
    hdu = fits.PrimaryHDU(data)
    hdu.header["OBJECT"] = "Synthetic Deep Sky Field"
    hdu.header["TELESCOP"] = "Tsukuyomi 0.6m Observatory"
    hdu.header["INSTRUME"] = "Spirit Lens CCD"
    hdu.header["FILTER"] = "V-band"
    hdu.writeto(fits_path, overwrite=True)
    print(f"Created FITS sample: {fits_path}")

    # Save 8-bit visual PNG
    p1, p99 = np.percentile(data, (1, 99.8))
    norm = np.clip((data - p1) / (p99 - p1), 0.0, 1.0)
    img_u8 = (norm * 255.0).astype(np.uint8)
    # Colorize with subtle deep-sky midnight palette
    colored = cv2.applyColorMap(img_u8, cv2.COLORMAP_TWILIGHT)
    png_path = os.path.join(out_dir, "nebula_cluster.png")
    cv2.imwrite(png_path, colored)
    print(f"Created PNG sample: {png_path}")


if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    create_sample_files(current_dir)
