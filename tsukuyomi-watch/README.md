# 🌙 Tsukuyomi Watch: The Watchtower
### *The Samurai's Celestial Guide to Night-Sky Sanctuaries*
**Built for PECathon 2026**

---

## ⛩️ Project Overview

**Tsukuyomi Watchtower** is an immersive stargazing discovery platform and celestial intelligence engine that unites ancient Japanese astronomy, Edo-period cartography, and modern geospatial telemetry. 

Named in honor of **Tsukuyomi-no-Mikoto** (月読の命) — the Shinto deity of the moon and the night sky — Watchtower helps stargazers, astrophotographers, and nature lovers discover prime dark-sky sanctuaries near them. It calculates an explainable, 7-factor **Night Honor Score** in real time by synthesizing live meteorological data, lunar phase ephemeris, topographic elevation, and artificial night-light radiance proxies.

---

## ✨ Key Features & Architecture

### 1. The Samurai’s Front Landing Page
- **Cinematic Presentation:** Ink-wash (*sumi-e*) gradients, vermilion torii silhouettes, drifting cherry blossom (*sakura*) petals, and a glowing lunar orb.
- **Dual Action Pathways:**
  - `Explore the Night Sky`: Instantly transitions to the tactical celestial dashboard.
  - `Discover Nearby Sanctuaries`: Initiates browser geolocation with a graceful fallback to detect prime stargazing spots nearby.
- **Live Sky Preview Badge:** Shows live cloud cover, atmospheric visibility, Bortle scale estimate, and current Night Honor Score before entering the dashboard.
- **Interactive Storytelling:** "The Art of Stargazing", "Choose Your Sanctuary", and "Your Night, Measured" narrative sections with responsive 3D card tilt physics.
- **Accessibility:** Toggleable sakura petals, keyboard-navigable controls, and complete respect for `prefers-reduced-motion`.

### 2. Ancient Edo Scroll Map (Leaflet Integration)
- **Authentic Cartographic Frame:** Styled with weathered parchment borders, an Edo-period eight-point compass rose, and an interactive moon-phase calendar.
- **Restored Layer Hierarchy (3 Basemaps + NASA Scientific Overlay):**
  1. **Esri Satellite (Antique Brown Terrain Scroll):** High-resolution orbital topography rendered with warm antique Japanese parchment relief shading.
  2. **Standard Cartography (OpenStreetMap - Edo Cartography):** Clean street, settlement, and navigation view in Japanese ink-wash style.
  3. **Topographic Contours (OpenTopoMap):** Elevation contours, ridges, and mountainous terrain details.
  4. **NASA VIIRS Nighttime Lights (Black Marble):** Scientific overlay from NASA EOSDIS GIBS representing artificial surface light emissions.
- **Illustrated SVG Map Markers:**
  - ⛩️ **Torii Gate / Shrines:** Cultural spots, tranquil temples, and peaceful gardens.
  - 🏯 **Pagoda / Heritage:** Historic watchtowers and heritage sanctuaries.
  - 🏔️ **Mountain Peaks:** Elevated viewpoints above low-lying atmospheric turbulence.
  - 🌲 **Forest & Parks:** Protected woodlands, lakeshores, and tranquil open fields.
  - ⭐ **Celestial Star:** Algorithmic top recommendation for the current night.
- **Slide-Out Spot Drawer:** Deep-dive panel displaying coordinates, distance, elevation, live weather metrics, Night Honor Score breakdown, and driving/hiking recommendations.
- **Geographic Honesty:** Respects real-world geography. For locations outside Japan (e.g., India, Europe, Americas), markers maintain artistic Japanese iconography while POIs display authentic regional names (nature reserves, hill ridges, observatories).

### 3. The 7-Factor Night Honor Score (0–100)
Every location is evaluated against a mathematically rigorous, fully explainable algorithm with normalized weights:

$$\text{Night Honor Score} = \sum_{i=1}^{7} (W_i \times S_i)$$

| Factor | Weight ($W_i$) | Ideal Condition | Evaluation Logic |
| :--- | :---: | :--- | :--- |
| **Cloud Cover** | **30%** | 0% (Clear Sky) | Non-linear penalty: $S_{\text{cloud}} = \max(0, 100 - (\text{cloud}\%)^{1.15})$ |
| **Light Pollution** | **25%** | Bortle Class 1 | $S_{\text{light}} = \frac{9 - \text{Bortle}}{8} \times 100$ (Calibrated with SQM mag/arcsec²) |
| **Atmospheric Visibility** | **15%** | $\ge 25\text{ km}$ | $S_{\text{vis}} = \min(100, \frac{\text{vis\_km}}{25} \times 100)$ |
| **Relative Humidity** | **10%** | $\le 40\%$ | Dew point suppression penalty: higher humidity reduces transparency |
| **Wind Velocity** | **5%** | Calm ($< 5\text{ km/h}$) | Minimizes telescope vibration and atmospheric scintillation |
| **Moon Illumination** | **10%** | New Moon (0%) | Accounts for lunar brightness washing out deep-sky objects |
| **Elevation Advantage** | **5%** | $\ge 1,500\text{ m}$ | Thinner air mass and reduced boundary-layer aerosols |

#### Dynamic Re-Normalization
If any telemetry variable is temporarily unavailable, the scoring engine calculates:

$$W_{\text{active}} = \sum W_{\text{available}}$$

$$S_{\text{final}} = \frac{\sum (W_i \times S_i)}{W_{\text{active}}}$$

This guarantees that missing data never artificially depresses a location's score, and the UI marks the telemetry completeness accordingly.

---

## 🛰️ Transparent Data Attribution & Scientific Disclosures

Watchtower integrates strictly documented, open-access public APIs and scientific feeds without requiring private keys for standard operation:

1. **Weather & Atmospheric Telemetry:** [Open-Meteo API](https://open-meteo.com/) — High-resolution hourly cloud cover, humidity, visibility, wind speed, and temperature.
2. **Geocoding & Spatial POI Discovery:** [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) — Respects Nominatim usage policies with custom identifying User-Agent headers.
3. **NASA Earth Science Tile Service:** [NASA EOSDIS GIBS](https://www.earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs) — Global Imagery Browse Services (WMTS EPSG:3857).
   > **Scientific Disclosure:** The NASA VIIRS Nighttime Lights layer displays artificial surface light radiance ($nW \cdot cm^{-2} \cdot sr^{-1}$) observed from low Earth orbit. While a strong empirical proxy for ambient urbanization, it is not an instant measurement of zenith night-sky brightness or atmospheric skyglow. Tsukuyomi Watchtower combines this satellite surface proxy with mathematical Bortle/SQM atmospheric models for holistic sky-clarity estimation.
4. **Elevation Profiles:** OpenTopoMap / Open-Meteo Elevation SRTM 90m dataset.

---

## 📁 Repository Structure

```
tsukuyomi-watch/
├── index.html              # Main HTML markup (Landing Page + Tactical Dashboard)
├── styles.css              # Master styling (Japanese ink-wash, katana borders, parchment map)
├── css/
│   └── style.css           # Backup/modular stylesheet reference
├── js/
│   ├── app.js              # Master application controller & event orchestrator
│   ├── map.js              # Leaflet scroll map, layer switcher, markers & slide drawer
│   ├── scoring.js          # 7-factor Night Honor Scoring engine & unit test logic
│   ├── weather.js          # Open-Meteo telemetry & 24-hr hourly forecast parser
│   ├── lightpollution.js   # Bortle/SQM estimator & NASA VIIRS layer configuration
│   ├── spots.js            # POI sanctuary search, fallback engine & score evaluator
│   ├── starfield.js        # Celestial canvas (shooting stars, twinkles & 3D tilt)
│   ├── petals.js           # Falling cherry blossom petal physics & toggle control
│   └── moon.js             # Astronomical lunar phase, illumination & age calculator
├── tests/
│   ├── scoring.test.html   # In-browser unit test runner with visual assertions
│   └── test-scoring.ps1    # Automated PowerShell CLI test runner
├── .env.example            # Environment configuration template
├── serve.ps1               # Lightweight native PowerShell HTTP server (zero dependencies)
└── README.md               # Complete project documentation & guide
```

---

## 🚀 Quick Start & Installation

### Option A: Native PowerShell (Windows Recommended — No Node/Python Required)
Tsukuyomi Watch includes a built-in static web server written in pure PowerShell using `System.Net.HttpListener`:

```powershell
# From the project root directory:
.\serve.ps1
```
Open your browser and navigate to: **`http://localhost:8080/`**

### Option B: Node.js (npx serve)
```bash
npx serve -l 8080 .
```

### Option C: Python 3
```bash
python -m http.server 8080
```

---

## 🧪 Running Scoring Unit Tests

### Automated PowerShell Test Runner
Validate scoring calculations, weight re-normalization, and edge cases directly from the terminal:
```powershell
powershell -ExecutionPolicy Bypass -File .\tests\test-scoring.ps1
```
*Expected Output:*
```
=== TSUKUYOMI WATCH: 7-FACTOR SCORING ENGINE TEST SUITE ===
[PASS] Test 1: Ideal celestial conditions should score near 100 (Actual: 99.1)
[PASS] Test 2: Catastrophic overcast storm should score very low (Actual: 4.8)
[PASS] Test 3: Moderate conditions produce proportional intermediate score (Actual: 51.5)
[PASS] Test 4: Missing factors dynamically re-normalize weights (Actual: 54.3)
[PASS] Test 5: Recommendation strings and positive/negative drivers generated
All 5 unit tests passed successfully!
```

### Browser-Based Test Suite
You can also launch the visual unit test dashboard in any browser:
```
http://localhost:8080/tests/scoring.test.html
```

---

## 🏯 Design Palette & Typography

- **Midnight Navy:** `#0a0e17` & `#070b12`
- **Charcoal Black:** `#12151c` & `#1a1e28`
- **Vermilion Torii Red:** `#c83232` & `#e04b4b`
- **Imperial Gold:** `#d4af37` & `#f3e5ab`
- **Parchment Rice Paper:** `#f4eedb`
- **Bamboo Green (High Honor):** `#48bb78`
- **Japanese Brush Font:** `Cinzel Decorative` & `Cinzel` via Google Fonts
- **Clean Readability Font:** `Noto Sans JP` via Google Fonts

---

## 📜 License & Acknowledgements

Created for **PECathon 2026**.  
Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, [CARTO](https://carto.com/), [OpenTopoMap](https://opentopomap.org/), [Esri](https://www.arcgis.com/), and [NASA EOSDIS GIBS](https://earthdata.nasa.gov/).  
Weather data by [Open-Meteo](https://open-meteo.com/) under CC BY 4.0.

