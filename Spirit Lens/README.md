# TSUKUYOMI WATCH — SPIRIT LENS
### PECathon 2026 | PS-002: Advanced Astronomical Observation & Restoration Suite

> *"Unfurl the velvet tapestry of the cosmos, and let the quiet stars whisper their ancient, luminous secrets."*

---

## 1. Project Overview

**Tsukuyomi Watch — Spirit Lens** is a full-stack astronomical analysis instrument designed to restore degraded, noisy, or low-contrast deep-sky astronomical imagery, identify candidate celestial sources via precision numerical modeling, inspect physical and photometric properties interactively, and export verified astronomical catalogs (CSV & JSON).

The application is engineered strictly for **zero-cost software & free infrastructure**, requiring no paid APIs, no subscriptions, no paid cloud GPUs, and no local AI setup on client devices.

---

## 2. Key Features

- **Genuine Server-Side Processing**: Computational restoration and celestial source detection execute entirely on the server backend without burdening user client devices.
- **Scientific Astronomical Restoration**:
  - Edge-preserving Non-Local Means (NLM) Poisson and read denoising.
  - Adaptive Contrast Enhancement (CLAHE) revealing faint nebulae and star clusters without saturating star cores.
  - Stellar profile unsharp masking.
  - Morphological background gradient & skyglow leveling.
- **Photutils & Astropy Source Detection**:
  - 2D background and noise RMS modeling.
  - Threshold-based source extraction with centroiding and photometry.
  - Honest morphological classification: point-like candidates vs extended candidates.
  - Bounding boxes, full width at half maximum (FWHM), semimajor/semiminor axes, and eccentricity.
- **Interactive Split Comparison Chamber**:
  - Draggable split-curtain comparison divider with synchronized zoom and pan.
  - Scaled SVG overlay reticles mathematically locked to pixel centroids.
- **Scientific Data Ingestion & Export**:
  - Ingests PNG, JPEG, TIFF, and scientific Flexible Image Transport System (FITS) datasets.
  - Downloads restored output PNG images.
  - Exports standard astronomical source catalogs in CSV and JSON formats.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4 with custom Japanese celestial aesthetic tokens
- **Icons**: Lucide React
- **Visualization**: Interactive SVG overlay & Canvas-compatible responsive transforms

### Backend
- **Web Framework**: FastAPI & Uvicorn
- **Data Validation**: Pydantic v2
- **Image Processing**: OpenCV & Pillow
- **Astronomical Analysis**: Astropy & Photutils
- **Testing**: Pytest

---

## 4. Project Folder Structure

```
Pecathon 26/
├── frontend/                     # React 19 + TypeScript SPA
│   ├── public/
│   │   ├── images/               # Sample astronomical datasets (PNG, FITS)
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/           # Navbar, PageShell
│   │   │   ├── upload/           # ImageUploader
│   │   │   ├── restoration/      # RestorationControls, ImageComparison
│   │   │   ├── detection/        # DetectionControls, DetectionOverlay, SourceDetailsPanel
│   │   │   └── results/          # ResultsSummary
│   │   ├── pages/
│   │   │   └── SpiritLensPage.tsx# Master module page
│   │   ├── services/
│   │   │   └── imageApi.ts       # Centralized API client with polling & backoff
│   │   ├── types/
│   │   │   └── astronomy.ts      # TypeScript interfaces
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css             # Tailwind v4 theme & cosmic aesthetics
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
│
├── backend/                      # FastAPI Master Backend
│   ├── app/
│   │   ├── main.py               # Master API application entrypoint
│   │   ├── config.py             # Settings and resource bounds
│   │   ├── api/
│   │   │   ├── health.py         # /api/v1/health
│   │   │   ├── images.py         # /api/v1/images/*
│   │   │   └── jobs.py           # /api/v1/jobs/*
│   │   ├── schemas/              # Pydantic v2 data models
│   │   │   ├── image_schemas.py
│   │   │   └── job_schemas.py
│   │   ├── services/
│   │   │   ├── job_service.py    # Controlled job manager & queue
│   │   │   ├── storage_service.py# Secure file persistence & path traversal guards
│   │   │   └── result_service.py # Catalog CSV/JSON formatter
│   │   ├── core/
│   │   │   ├── validation.py     # Content validation & sanitization
│   │   │   └── errors.py         # Custom HTTP error handlers
│   │   └── utils/
│   │       └── image_utils.py
│   ├── requirements.txt
│   └── .env.example
│
├── worker/                       # Processing Worker Subsystem
│   ├── main.py                   # Standalone worker loop
│   ├── tasks.py                  # Job execution tasks
│   └── worker_config.py
│
├── ai/                           # Scientific Processing Pipelines
│   ├── restoration/
│   │   ├── classical_restoration.py # OpenCV CLAHE, NLM, unsharp mask
│   │   ├── model_loader.py       # Truthful AI model loader & validator
│   │   └── pipeline.py           # Unified loader for FITS, TIFF, PNG
│   └── detection/
│       ├── source_detection.py   # Astropy & Photutils 2D background + segmentation
│       └── photometry.py         # Aperture flux & morphological categorization
│
├── sample_data/                  # Synthetic & real deep sky datasets
│   ├── create_sample_fits.py     # Astropy synthetic field generator
│   ├── pleiades_field.fits       # Scientific FITS data
│   └── nebula_cluster.png        # Deep sky test image
├── tests/
│   └── test_backend.py           # Pytest automated test suite
├── docs/
│   └── architecture.md           # Architecture specification & scaling plan
├── .env.example
├── .gitignore
└── README.md
```

---

## 5. Prerequisites

- **Node.js**: v18+ (tested on v24.20.0)
- **Python**: 3.10+ (tested on Python 3.14.7)
- **npm**: 9+ (tested on 11.19.0)

---

## 6. Installation & Setup

### A. Clone and Setup Environment
```bash
# Clone or navigate to the project directory
cd "Pecathon 26"
```

### B. Backend Dependencies
```bash
# Optional: create and activate a virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt
```

### C. Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

---

## 7. Running the Application

### Option A: Standard Development Mode (Integrated Worker Pool)
In this mode, the master FastAPI server runs its own asynchronous bounded worker pool. This is the simplest way to run locally and on free-tier platforms.

**Terminal 1 — Master Backend API**:
```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — React Frontend**:
```bash
cd frontend
npm run dev
```

### Option B: Decoupled Multi-Process Mode (Separate Worker Process)
In this mode, heavy image processing is offloaded to a dedicated worker process running separately from the API server:

**Terminal 1 — Master Backend API**:
```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

**Terminal 2 — Standalone Processing Worker**:
```bash
python -m worker.main
```

**Terminal 3 — React Frontend**:
```bash
cd frontend
npm run dev
```

---

## 8. Local URLs

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Master Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive API Documentation (Swagger)**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **Alternative ReDoc Documentation**: [http://localhost:8000/api/redoc](http://localhost:8000/api/redoc)
- **Backend Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 9. Running Automated Tests

Run the automated Pytest test suite:
```bash
python -m pytest tests/ -v
```

All 9 integration and unit tests verify:
- Backend health endpoints and capability reporting.
- Image uploads with dimension and format validation.
- Rejection of corrupted files and invalid extensions.
- Classical astronomical restoration output generation.
- Photutils source detection with 2D background estimation.
- Empty astronomical field detection handling.
- End-to-end asynchronous job submission, polling, and catalog generation.
- Full scientific FITS file upload and extraction.

To test the frontend build:
```bash
cd frontend
npm run build
```

---

## 10. Sample Astronomical Imagery

The project includes test datasets ready for one-click evaluation:
1. In the web interface, click **"Load Astronomical Sample"** in the upload section.
2. Or use the generated sample files in `sample_data/`:
   - `sample_data/pleiades_field.fits`: Scientific FITS data with celestial headers.
   - `sample_data/nebula_cluster.png`: Deep-sky star cluster with nebulosity.

To regenerate fresh synthetic sample data:
```bash
python sample_data/create_sample_fits.py
```

---

## 11. Known Limitations & Free-Tier Hosting Guidance

- **In-Memory / File-Backed Queue**: The default job queue operates via file-backed atomic state files and an in-process thread pool. For clustered multi-node scaling, an external broker like Redis or RabbitMQ would be needed.
- **Scientific Magnitudes**: Magnitudes returned in the catalog are instrumental magnitudes (`-2.5 * log10(flux)`). Calibrated apparent/standard magnitudes require a photometric zero-point reference star, which is documented and maintained without fabricating calibration data.
- **Free-Tier Limits**:
  - Memory ceiling configured to 50 MB uploads and 8192×8192 pixel dimensions to prevent OOM errors on free hosting instances (e.g. Render, Railway, Hugging Face Spaces).
  - Background worker concurrency is bounded to 4 parallel jobs to protect shared CPU resources.
