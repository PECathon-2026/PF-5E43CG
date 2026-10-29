# Tsukuyomi Watch — Sample Astronomical Data

This directory contains test datasets for verifying the Spirit Lens image processing and celestial source detection pipelines:

- `pleiades_field.fits`: Scientific Flexible Image Transport System (FITS) astronomical dataset generated via Astropy, containing realistic stellar point spread functions (PSF), Poisson/read noise, and background sky glow with FITS header metadata (`TELESCOP`, `INSTRUME`, `FILTER`, `OBJECT`).
- `nebula_cluster.png`: Deep-sky astronomical color image featuring a dense stellar field and diffuse nebulosity.

To regenerate or create new samples:
```bash
python sample_data/create_sample_fits.py
```
