/**
 * ============================================================================
 * TSUKUYOMI WATCH: THE SAMURAI’S CELESTIAL GUIDE
 * Modular Engine Orchestration:
 *   1. The Samurai's Welcome (Landing Page & Sakura Petals)
 *   2. Real-Time Open-Meteo Environmental Optics
 *   3. Mathematical Bortle Scale Light Pollution Engine
 *   4. Weighted Night Honor Score Algorithm & Gold UI Gauges
 *   5. The Scroll Map (Leaflet Japanese Ink-Wash Filter & Fullscreen Modal)
 *   6. Sacred Stargazing Bastions & Custom Torii SVG Markers
 * ============================================================================
 */

(function () {
    'use strict';

    /* ==========================================================================
       ASTRONOMICAL DATASETS & CITY MAPPINGS (MOCK KAGGLE-CALIBRATED DATASET)
       ========================================================================== */
    const CITY_BORTLE_MAP = [
        // Japan
        { name: 'Tokyo', lat: 35.6762, lon: 139.6503, bortle: 8.5, radius: 35 },
        { name: 'Osaka', lat: 34.6937, lon: 135.5023, bortle: 8.0, radius: 25 },
        { name: 'Kyoto', lat: 35.0116, lon: 135.7681, bortle: 6.8, radius: 20 },
        { name: 'Yokohama', lat: 35.4437, lon: 139.6380, bortle: 8.2, radius: 20 },
        { name: 'Nagoya', lat: 35.1815, lon: 136.9066, bortle: 7.5, radius: 22 },
        { name: 'Sapporo', lat: 43.0618, lon: 141.3545, bortle: 7.0, radius: 20 },
        { name: 'Fukuoka', lat: 33.5904, lon: 130.4017, bortle: 7.4, radius: 18 },
        { name: 'Hiroshima', lat: 34.3853, lon: 132.4553, bortle: 6.8, radius: 15 },
        { name: 'Sendai', lat: 38.2682, lon: 140.8694, bortle: 6.9, radius: 15 },
        // Japanese Dark Sky Havens
        { name: 'Mount Fuji', lat: 35.3606, lon: 138.7274, bortle: 2.2, radius: 15 },
        { name: 'Achi Village (Star Village Nagano)', lat: 35.4433, lon: 137.7336, bortle: 1.6, radius: 15 },
        { name: 'Nobeyama Radio Observatory', lat: 35.9417, lon: 138.4725, bortle: 2.1, radius: 15 },
        { name: 'Iriomote Island', lat: 24.3333, lon: 123.8167, bortle: 1.0, radius: 20 },
        { name: 'Ogasawara Islands', lat: 27.0945, lon: 142.1917, bortle: 1.0, radius: 30 },
        { name: 'Yakushima Island', lat: 30.3585, lon: 130.5286, bortle: 1.7, radius: 20 },
        // Worldwide Metropolises
        { name: 'New York City', lat: 40.7128, lon: -74.0060, bortle: 9.0, radius: 40 },
        { name: 'London', lat: 51.5074, lon: -0.1278, bortle: 8.5, radius: 35 },
        { name: 'Paris', lat: 48.8566, lon: 2.3522, bortle: 8.5, radius: 30 },
        { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, bortle: 8.7, radius: 45 },
        { name: 'San Francisco', lat: 37.7749, lon: -122.4194, bortle: 7.9, radius: 25 },
        { name: 'Chicago', lat: 41.8781, lon: -87.6298, bortle: 8.6, radius: 35 },
        { name: 'Sydney', lat: -33.8688, lon: 151.2093, bortle: 7.6, radius: 30 },
        { name: 'Seoul', lat: 37.5665, lon: 126.9780, bortle: 8.7, radius: 35 },
        { name: 'Beijing', lat: 39.9042, lon: 116.4074, bortle: 8.9, radius: 40 },
        { name: 'Hong Kong', lat: 22.3193, lon: 114.1694, bortle: 9.0, radius: 25 },
        { name: 'Singapore', lat: 1.3521, lon: 103.8198, bortle: 9.0, radius: 25 },
        { name: 'Mumbai', lat: 19.0760, lon: 72.8777, bortle: 8.8, radius: 35 },
        { name: 'Delhi', lat: 28.6139, lon: 77.2090, bortle: 9.0, radius: 35 },
        // Legendary Global Dark Sky Sanctuaries
        { name: 'Mauna Kea', lat: 19.8206, lon: -155.4681, bortle: 1.0, radius: 25 },
        { name: 'Atacama Desert (Paranal)', lat: -24.6272, lon: -70.4042, bortle: 1.0, radius: 40 },
        { name: 'Joshua Tree National Park', lat: 33.8734, lon: -115.9010, bortle: 2.1, radius: 30 },
        { name: 'Death Valley', lat: 36.5323, lon: -116.9325, bortle: 1.4, radius: 35 },
        { name: 'Aoraki Mackenzie Dark Sky', lat: -43.7340, lon: 170.1000, bortle: 1.1, radius: 35 }
    ];

    /* ==========================================================================
       DOM SELECTORS
       ========================================================================== */
    const landingPage       = document.getElementById('landingPage');
    const ascendBtn         = document.getElementById('ascendBtn');
    const mainDashboard     = document.getElementById('mainDashboard');
    const gateReturnBtn     = document.getElementById('gateReturnBtn');
    const returnLandingBtn  = document.getElementById('returnLandingBtn');
    const petalsContainer   = document.getElementById('petals-container');

    // Location Controls
    const cityInput         = document.getElementById('cityInput');
    const searchBtn         = document.getElementById('searchBtn');
    const geoBtn            = document.getElementById('geoBtn');
    const suggestions       = document.getElementById('suggestions');
    const locBadge          = document.getElementById('locBadge');
    const badgeName         = document.getElementById('badgeName');
    const badgeCoords       = document.getElementById('badgeCoords');
    const badgeElev         = document.getElementById('badgeElev');
    const badgeRegion       = document.getElementById('badgeRegion');

    // Night Honor Score & Breakdown Elements
    const secScore          = document.getElementById('sec-score');
    const ringFill          = document.getElementById('ringFill');
    const ringNum           = document.getElementById('ringNum');
    const ringRank          = document.getElementById('ringRank');
    const ringRankDesc      = document.getElementById('ringRankDesc');

    // 4 Algorithmic Gold Progress Bars
    const barVis            = document.getElementById('barVis');
    const scoreVis          = document.getElementById('scoreVis');
    const rawVis            = document.getElementById('rawVis');

    const barCloud          = document.getElementById('barCloud');
    const scoreCloud        = document.getElementById('scoreCloud');
    const rawCloud          = document.getElementById('rawCloud');

    const barHumidity       = document.getElementById('barHumidity');
    const scoreHumidity     = document.getElementById('scoreHumidity');
    const rawHumidity       = document.getElementById('rawHumidity');

    const barBortle         = document.getElementById('barBortle');
    const scoreBortle       = document.getElementById('scoreBortle');
    const rawBortle         = document.getElementById('rawBortle');

    const formulaSummary    = document.getElementById('formulaSummary');

    // 12 Environmental Metric Badges
    const mCloud            = document.getElementById('mCloud');
    const mHumid            = document.getElementById('mHumid');
    const mVis              = document.getElementById('mVis');
    const mLightPoll        = document.getElementById('mLightPoll');
    const mBortleTitle      = document.getElementById('mBortleTitle');
    const mTemp             = document.getElementById('mTemp');
    const mWind             = document.getElementById('mWind');
    const mPrecip           = document.getElementById('mPrecip');
    const mDew              = document.getElementById('mDew');
    const mElev             = document.getElementById('mElev');
    const mMoon             = document.getElementById('mMoon');
    const mMoonDetail       = document.getElementById('mMoonDetail');
    const mDay              = document.getElementById('mDay');
    const mWmo              = document.getElementById('mWmo');

    // Map & Fullscreen Elements
    const secMap            = document.getElementById('sec-map');
    const scrollMapWrapper  = document.getElementById('scrollMapWrapper');
    const expandScrollBtn   = document.getElementById('expandScrollBtn');
    const closeScrollBtn    = document.getElementById('closeScrollBtn');

    // Recommended Spots Elements
    const secSpots          = document.getElementById('sec-spots');
    const spotsLoader       = document.getElementById('spotsLoader');
    const spotsGrid         = document.getElementById('spotsGrid');

    // Floating Moon Badge
    const moonPhaseFloat    = document.getElementById('moonPhaseFloat');
    const moonDisc          = document.getElementById('moonDisc');
    const moonName          = document.getElementById('moonName');
    const moonIllum         = document.getElementById('moonIllum');

    /* ==========================================================================
       STATE MANAGEMENT
       ========================================================================== */
    let mapInstance = null;
    let mapMarkersLayer = null;
    let userVantageMarker = null;
    let currentLat = null;
    let currentLon = null;
    let isMapFullscreen = false;
    let searchDebounceTimer = null;

    /* ==========================================================================
       1. THE SAMURAI’S WELCOME (LANDING PAGE & SAKURA PETALS)
       ========================================================================== */

    /**
     * Spawns delicate falling cherry blossom (Sakura) petals
     */
    function initSakuraPetals(count = 22) {
        if (!petalsContainer) return;
        petalsContainer.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const petal = document.createElement('div');
            petal.className = 'sakura-petal';

            const size = Math.floor(Math.random() * 11) + 10; // 10px - 20px
            const leftPos = Math.random() * 100; // 0% - 100%
            const fallDuration = (Math.random() * 7 + 7).toFixed(1); // 7s - 14s
            const swayDuration = (Math.random() * 3 + 3).toFixed(1); // 3s - 6s
            const delay = (Math.random() * 8).toFixed(1); // 0s - 8s
            const initialRotate = Math.floor(Math.random() * 360);

            petal.style.width = `${size}px`;
            petal.style.height = `${size * 0.9}px`;
            petal.style.left = `${leftPos}vw`;
            petal.style.animationDuration = `${fallDuration}s, ${swayDuration}s`;
            petal.style.animationDelay = `${delay}s, ${delay}s`;
            petal.style.transform = `rotate(${initialRotate}deg)`;

            petalsContainer.appendChild(petal);
        }
    }

    /**
     * Ascend the Watchtower: Smoothly fades out the landing screen and reveals dashboard
     */
    function ascendWatchtower() {
        if (!landingPage) return;

        landingPage.classList.add('fade-out');

        setTimeout(() => {
            landingPage.hidden = true;
            if (mainDashboard) {
                mainDashboard.hidden = false;
                // Trigger CSS entrance
                requestAnimationFrame(() => {
                    mainDashboard.classList.add('active');
                });
            }

            // Invalidate Leaflet map size once container is revealed
            if (mapInstance) {
                setTimeout(() => {
                    mapInstance.invalidateSize();
                }, 300);
            }
        }, 850);
    }

    /**
     * Return to Entrance Gate (re-activates landing page)
     */
    function returnToEntranceGate() {
        if (!landingPage || !mainDashboard) return;

        landingPage.hidden = false;
        mainDashboard.classList.remove('active');

        requestAnimationFrame(() => {
            landingPage.classList.remove('fade-out');
        });

        setTimeout(() => {
            mainDashboard.hidden = true;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 400);
    }

    /* ==========================================================================
       2. REAL-TIME DATA FETCHING (OPEN-METEO API)
       ========================================================================== */

    const WMO_CODES = {
        0: 'Clear Sky (澄天)',
        1: 'Mainly Clear (晴朗)',
        2: 'Partly Cloudy (半雲)',
        3: 'Overcast (雲天)',
        45: 'Fog (霧中)',
        48: 'Depositing Rime Fog (樹氷)',
        51: 'Light Drizzle (小雨)',
        53: 'Moderate Drizzle (雨)',
        55: 'Dense Drizzle (細雨)',
        61: 'Slight Rain (微雨)',
        63: 'Moderate Rain (降雨)',
        65: 'Heavy Rain (豪雨)',
        71: 'Slight Snow (小雪)',
        73: 'Moderate Snow (降雪)',
        75: 'Heavy Snow (大雪)',
        80: 'Rain Showers (驟雨)',
        85: 'Snow Showers (驟雪)',
        95: 'Thunderstorm (雷雨)'
    };

    /**
     * Fetches real-time weather metrics from Open-Meteo
     */
    async function fetchWeather(lat, lon) {
        const params = new URLSearchParams({
            latitude: Number(lat).toFixed(4),
            longitude: Number(lon).toFixed(4),
            current: 'cloud_cover,relative_humidity_2m,visibility,temperature_2m,wind_speed_10m,precipitation,dew_point_2m,weather_code,is_day',
            timezone: 'auto'
        });

        const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Open-Meteo HTTP ${response.status}: Failed to retrieve atmospheric telemetry`);
        }

        const data = await response.json();
        const cur = data.current || {};

        return {
            latitude: data.latitude,
            longitude: data.longitude,
            elevation: data.elevation != null ? Math.round(data.elevation) : 250,
            cloudCover: cur.cloud_cover != null ? Number(cur.cloud_cover) : 0,
            humidity: cur.relative_humidity_2m != null ? Number(cur.relative_humidity_2m) : 50,
            visibility: cur.visibility != null ? Number(cur.visibility) : 24000, // in meters
            temperature: cur.temperature_2m != null ? cur.temperature_2m : 15,
            windSpeed: cur.wind_speed_10m != null ? cur.wind_speed_10m : 5,
            precipitation: cur.precipitation != null ? cur.precipitation : 0,
            dewPoint: cur.dew_point_2m != null ? cur.dew_point_2m : 10,
            weatherCode: cur.weather_code != null ? cur.weather_code : 0,
            weatherDesc: WMO_CODES[cur.weather_code] || `WMO Code ${cur.weather_code}`,
            isDay: cur.is_day === 1
        };
    }

    /* ==========================================================================
       3. BORTLE SCALE LIGHT POLLUTION ESTIMATION (KAGGLE HEURISTICS)
       ========================================================================== */

    /**
     * Haversine distance in km
     */
    function haversineDist(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    /**
     * Mathematically estimates Bortle Dark-Sky Scale (1.0 to 9.0)
     * Combines direct city calibration, geographic tags, proximity, and altitude.
     */
    function estimateBortleScale(lat, lon, address = {}, elevation = 0) {
        // 1. Direct city / dark-sky haven radius matching
        for (const city of CITY_BORTLE_MAP) {
            const dist = haversineDist(lat, lon, city.lat, city.lon);
            if (dist <= city.radius) {
                // Linear decay from center to edge of radius
                const factor = dist / city.radius;
                const decayedBortle = city.bortle - (factor * 1.5);
                return Math.max(1.0, Math.min(9.0, Number(decayedBortle.toFixed(1))));
            }
        }

        // 2. Geographic Address Classification
        const type = (address.type || '').toLowerCase();
        const category = (address.category || '').toLowerCase();
        let baseBortle = 4.5; // Baseline rural/suburban default

        if (['peak', 'volcano', 'national_park', 'nature_reserve', 'wilderness'].includes(type) ||
            category === 'natural') {
            baseBortle = 1.8;
        } else if (['isolated_dwelling', 'hamlet', 'village', 'farmland', 'forest'].includes(type)) {
            baseBortle = 2.8;
        } else if (['suburb', 'town', 'residential'].includes(type)) {
            baseBortle = 5.2;
        } else if (['city', 'administrative', 'commercial', 'industrial'].includes(type)) {
            baseBortle = 7.8;
        }

        // 3. Proximity check against nearest major metropolitan hub
        let nearestHubDist = Infinity;
        let hubBortle = 8.0;

        for (const city of CITY_BORTLE_MAP) {
            if (city.bortle >= 7.0) {
                const dist = haversineDist(lat, lon, city.lat, city.lon);
                if (dist < nearestHubDist) {
                    nearestHubDist = dist;
                    hubBortle = city.bortle;
                }
            }
        }

        if (nearestHubDist < 20) {
            baseBortle = Math.max(baseBortle, hubBortle - 0.5);
        } else if (nearestHubDist < 45) {
            baseBortle = Math.max(baseBortle, 5.5);
        } else if (nearestHubDist > 120) {
            baseBortle = Math.min(baseBortle, 3.0);
        }

        // 4. Elevation clarity discount: High peaks rise above urban aerosol smog
        if (elevation > 2000) {
            baseBortle -= 1.2;
        } else if (elevation > 1000) {
            baseBortle -= 0.6;
        }

        return Math.max(1.0, Math.min(9.0, Number(baseBortle.toFixed(1))));
    }

    /**
     * Converts Bortle value to title description
     */
    function getBortleDescription(bortle) {
        if (bortle <= 1.5) return 'Class 1: Pristine Cosmic Sky (極闇)';
        if (bortle <= 2.5) return 'Class 2: Truly Dark Sky (真闇)';
        if (bortle <= 3.5) return 'Class 3: Rural Dark Sky (山野)';
        if (bortle <= 4.5) return 'Class 4: Rural / Suburban Transition (郷里)';
        if (bortle <= 5.5) return 'Class 5: Suburban Sky (市街郊)';
        if (bortle <= 6.5) return 'Class 6: Bright Suburban Sky (明街)';
        if (bortle <= 7.5) return 'Class 7: Suburban / Urban Transition (都境)';
        if (bortle <= 8.5) return 'Class 8: City Sky (城下町)';
        return 'Class 9: Inner-City Glare (帝都灯火)';
    }

    /* ==========================================================================
       4. ENHANCED NIGHT HONOR SCORE & ALGORITHMIC GAUGES
       Formula:
         (Visibility * 0.3) + ((100 - Cloud Cover) * 0.4) + ((100 - Humidity) * 0.1) + ((10 - Bortle Scale) * 10 * 0.2)
       ========================================================================== */

    /**
     * Calculates the exact Night Honor Score according to formula
     */
    function calculateNightHonorScore(weather, bortleScale) {
        // 1. Normalized Visibility (0 to 100). Clear sky standard: >= 24,000 meters
        const visMeters = weather.visibility != null ? weather.visibility : 24000;
        const normalizedVis = Math.max(0, Math.min(100, (visMeters / 24000) * 100));
        const ptsVis = Number((normalizedVis * 0.3).toFixed(1)); // Max 30 pts

        // 2. Cloud Cover Clarity (0 to 100)
        const cloudCover = Math.max(0, Math.min(100, weather.cloudCover));
        const clearSkyPct = 100 - cloudCover;
        const ptsCloud = Number((clearSkyPct * 0.4).toFixed(1)); // Max 40 pts

        // 3. Humidity Dryness Suitability (0 to 100)
        const humidity = Math.max(0, Math.min(100, weather.humidity));
        const dryAirPct = 100 - humidity;
        const ptsHumidity = Number((dryAirPct * 0.1).toFixed(1)); // Max 10 pts

        // 4. Bortle Scale Dark Sky Score (0 to 100 scaled)
        // (10 - Bortle) * 10 gives 0 to 90/100, weighted by 0.2 -> Max 20 pts
        const bortleClamped = Math.max(1.0, Math.min(9.0, bortleScale));
        const darkSkyScore = (10 - bortleClamped) * 10;
        const ptsBortle = Number((darkSkyScore * 0.2).toFixed(1)); // Max 20 pts

        // Total Night Honor Score (0 to 100)
        const total = ptsVis + ptsCloud + ptsHumidity + ptsBortle;
        const finalScore = Math.max(0, Math.min(100, Math.round(total)));

        // Samurai Rank Classification
        let rank = 'Lost in Mist (霧迷)';
        let rankDesc = 'Heavy clouds, dense humidity, or intense urban glare obscure the stars.';
        if (finalScore >= 90) {
            rank = 'Divine Clarity (天眼)';
            rankDesc = 'The cosmos reveals its deepest mysteries. Pristine dark sky, crystal transparency.';
        } else if (finalScore >= 75) {
            rank = "Shogun's Sky (将軍の天)";
            rankDesc = 'Exceptional celestial clarity. The Milky Way arch spans the heavens with sharp honor.';
        } else if (finalScore >= 60) {
            rank = "Samurai's Gaze (侍の眼)";
            rankDesc = 'Splendid stargazing conditions. Major constellations and planets shine brightly.';
        } else if (finalScore >= 45) {
            rank = "Ronin's Watch (浪人の夜)";
            rankDesc = 'Moderate observation quality. Prominent celestial bodies visible through light haze.';
        } else if (finalScore >= 30) {
            rank = "Ashigaru's View (足軽の視)";
            rankDesc = 'Limited astronomical vision. Faint stars are overwhelmed by light or clouds.';
        }

        return {
            finalScore,
            ptsVis,
            normalizedVis,
            ptsCloud,
            clearSkyPct,
            ptsHumidity,
            dryAirPct,
            ptsBortle,
            bortleScale: bortleClamped,
            rank,
            rankDesc
        };
    }

    /**
     * Updates DOM gauges, gold progress bars, and metric cards
     */
    function renderScoreUI(weather, scoreObj) {
        // 1. Ring Gauge (Circumference: 2 * PI * 100 = 628)
        const maxOffset = 628;
        const offset = maxOffset - (scoreObj.finalScore / 100) * maxOffset;
        if (ringFill) ringFill.style.strokeDashoffset = offset;
        if (ringNum) ringNum.textContent = scoreObj.finalScore;
        if (ringRank) ringRank.textContent = scoreObj.rank;
        if (ringRankDesc) ringRankDesc.textContent = scoreObj.rankDesc;

        // 2. Component Progress Bars (Gold Bars with exact weights)
        // Visibility (Max 30 pts)
        if (barVis) barVis.style.width = `${(scoreObj.ptsVis / 30) * 100}%`;
        if (scoreVis) scoreVis.textContent = `${scoreObj.ptsVis.toFixed(1)} / 30 pts`;
        if (rawVis) rawVis.textContent = `(${(weather.visibility / 1000).toFixed(1)} km)`;

        // Cloud Cover (Max 40 pts)
        if (barCloud) barCloud.style.width = `${(scoreObj.ptsCloud / 40) * 100}%`;
        if (scoreCloud) scoreCloud.textContent = `${scoreObj.ptsCloud.toFixed(1)} / 40 pts`;
        if (rawCloud) rawCloud.textContent = `(${weather.cloudCover}% Cover)`;

        // Humidity (Max 10 pts)
        if (barHumidity) barHumidity.style.width = `${(scoreObj.ptsHumidity / 10) * 100}%`;
        if (scoreHumidity) scoreHumidity.textContent = `${scoreObj.ptsHumidity.toFixed(1)} / 10 pts`;
        if (rawHumidity) rawHumidity.textContent = `(${weather.humidity}% RH)`;

        // Bortle Scale (Max 20 pts)
        if (barBortle) barBortle.style.width = `${(scoreObj.ptsBortle / 20) * 100}%`;
        if (scoreBortle) scoreBortle.textContent = `${scoreObj.ptsBortle.toFixed(1)} / 20 pts`;
        if (rawBortle) rawBortle.textContent = `(Bortle ${scoreObj.bortleScale})`;

        // Calculation Summary text
        if (formulaSummary) {
            formulaSummary.innerHTML = `
                <strong>Formula Result:</strong>
                (${scoreObj.normalizedVis.toFixed(0)} &times; 0.3) +
                (${scoreObj.clearSkyPct}% &times; 0.4) +
                (${scoreObj.dryAirPct}% &times; 0.1) +
                ((10 &minus; ${scoreObj.bortleScale}) &times; 2)
                = <strong>${scoreObj.finalScore} / 100</strong>
            `;
        }

        // 3. 12 Environmental Metric Cards
        if (mCloud) mCloud.textContent = `${weather.cloudCover}%`;
        if (mHumid) mHumid.textContent = `${weather.humidity}%`;
        if (mVis) mVis.textContent = `${(weather.visibility / 1000).toFixed(1)} km`;
        if (mLightPoll) mLightPoll.textContent = `Class ${scoreObj.bortleScale}`;
        if (mBortleTitle) mBortleTitle.textContent = getBortleDescription(scoreObj.bortleScale);
        if (mTemp) mTemp.textContent = `${weather.temperature.toFixed(1)} °C`;
        if (mWind) mWind.textContent = `${weather.windSpeed.toFixed(1)} km/h`;
        if (mPrecip) mPrecip.textContent = `${weather.precipitation} mm`;
        if (mDew) mDew.textContent = `${weather.dewPoint.toFixed(1)} °C`;
        if (mElev) mElev.textContent = `${weather.elevation} m`;
        if (mDay) mDay.textContent = weather.isDay ? 'Daylight (昼間)' : 'Midnight (夜間)';
        if (mWmo) mWmo.textContent = weather.weatherDesc;

        // Unhide score and map sections
        if (secScore) secScore.hidden = false;
        if (secMap) secMap.hidden = false;
        if (secSpots) secSpots.hidden = false;
    }

    /* ==========================================================================
       5. THE SCROLL MAP (LEAFLET JAPANESE AESTHETICS & FULLSCREEN MODAL)
       ========================================================================== */

    /**
     * Creates custom SVG Torii Gate Markers for Recommended Viewing Bastions
     */
    function createToriiMarkerIcon(isSelected = false) {
        const strokeColor = isSelected ? '#ff3b30' : '#D4AF37';
        const beamFill    = isSelected ? '#a80000' : '#8B0000';
        const glowFilter  = isSelected
            ? 'drop-shadow(0 0 8px rgba(255, 59, 48, 0.9))'
            : 'drop-shadow(0 0 5px rgba(212, 175, 55, 0.7))';

        const svgHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="38" height="38" style="filter: ${glowFilter};">
            <!-- Kasagi & Shimaki Top Curved Beams -->
            <path d="M 4 14 Q 32 9 60 14 L 62 19 Q 32 15 2 19 Z" fill="${beamFill}" stroke="${strokeColor}" stroke-width="1.5"/>
            <path d="M 7 20 L 57 20 L 55 24 L 9 24 Z" fill="#111111" stroke="${strokeColor}" stroke-width="1"/>
            <!-- Nuki Tie Beam -->
            <path d="M 11 29 L 53 29 L 53 33 L 11 33 Z" fill="${beamFill}" stroke="${strokeColor}" stroke-width="1"/>
            <!-- Plaque -->
            <rect x="30" y="24" width="4" height="6" fill="${strokeColor}"/>
            <!-- Hashira Pillars -->
            <polygon points="17,22 22,22 24,57 15,57" fill="${beamFill}" stroke="${strokeColor}" stroke-width="1.2"/>
            <polygon points="42,22 47,22 49,57 40,57" fill="${beamFill}" stroke="${strokeColor}" stroke-width="1.2"/>
            <!-- Daiishi Base Stones -->
            <rect x="13" y="57" width="13" height="4" rx="1" fill="#111111" stroke="${strokeColor}" stroke-width="1"/>
            <rect x="38" y="57" width="13" height="4" rx="1" fill="#111111" stroke="${strokeColor}" stroke-width="1"/>
        </svg>`;

        return L.divIcon({
            className: 'custom-torii-marker',
            html: `<div class="torii-marker-inner">${svgHtml}</div>`,
            iconSize: [38, 38],
            iconAnchor: [19, 36],
            popupAnchor: [0, -36]
        });
    }

    /**
     * Creates Samurai Vantage Point Marker for the user's active coordinate
     */
    function createUserVantageIcon() {
        const svgHtml = `
        <div style="
            width: 36px;
            height: 36px;
            background: radial-gradient(circle, #8B0000 0%, #300000 100%);
            border: 2px solid #D4AF37;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 0 15px rgba(212, 175, 55, 0.8), 0 0 25px rgba(139, 0, 0, 0.8);
            cursor: pointer;
        ">📍</div>`;

        return L.divIcon({
            className: 'user-vantage-marker',
            html: svgHtml,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -20]
        });
    }

    /**
     * Initializes Leaflet Map with all 4 base maps, NASA VIIRS overlay,
     * layer controls, and ancient parchment filter.
     */
    function initMap() {
        if (mapInstance) return;

        // Default view: Mount Fuji, Japan
        mapInstance = L.map('map', {
            center: [35.3606, 138.7274],
            zoom: 10,
            zoomControl: true,
            attributionControl: true
        });

        // 1. BASE MAPS (Voyager, OSM, Topographic, Watercolor)
        const voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        });

        const osmStandard = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        });

        const topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://openstreetmap.org">OSM</a> | Style &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
            maxZoom: 17
        });

        const watercolor = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg', {
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://stamen.com/">Stamen</a>',
            maxZoom: 16
        });

        // Default base layer
        voyager.addTo(mapInstance);

        // 2. OVERLAY LAYERS
        mapMarkersLayer = L.layerGroup().addTo(mapInstance);

        // NASA VIIRS Night Lights (Light Pollution Overlay)
        const nightLightsLayer = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default//GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg', {
            attribution: '&copy; <a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noopener">NASA EOSDIS GIBS</a> &copy; VIIRS Night Lights',
            maxZoom: 8,
            opacity: 0.75,
            zIndex: 10
        });

        // Standard Leaflet Layer Control
        const baseMaps = {
            'Voyager (Parchment Scroll)': voyager,
            'OpenStreetMap (Standard)': osmStandard,
            'Topographic Terrain': topoMap,
            'Watercolor (Ancient Ink)': watercolor
        };

        const overlayMaps = {
            'NASA VIIRS Night Lights (Light Pollution)': nightLightsLayer,
            'Sacred Viewing Bastions (Torii)': mapMarkersLayer
        };

        L.control.layers(baseMaps, overlayMaps, { position: 'topright', collapsed: false }).addTo(mapInstance);

        // Click anywhere on map to select and evaluate that vantage point
        mapInstance.on('click', async (e) => {
            const { lat, lng } = e.latlng;
            await selectLocation(lat, lng, `Vantage [${lat.toFixed(3)}°, ${lng.toFixed(3)}°]`, {
                type: 'custom_vantage'
            });
        });

        // Invalidate size once DOM settled
        setTimeout(() => {
            if (mapInstance) mapInstance.invalidateSize();
        }, 200);
    }

    /**
     * Toggles Map between standard container view and 100vw / 100vh Fullscreen Modal
     */
    function toggleScrollFullscreen(forceClose = false) {
        if (!scrollMapWrapper) return;

        if (forceClose || isMapFullscreen) {
            // Close fullscreen
            scrollMapWrapper.classList.remove('scroll-fullscreen');
            if (closeScrollBtn) closeScrollBtn.hidden = true;
            if (expandScrollBtn) {
                expandScrollBtn.innerHTML = '<span class="scroll-btn-icon">📜</span><span class="scroll-btn-text">Expand Scroll</span>';
            }
            isMapFullscreen = false;
            document.body.style.overflow = '';
        } else {
            // Open fullscreen
            scrollMapWrapper.classList.add('scroll-fullscreen');
            if (closeScrollBtn) closeScrollBtn.hidden = false;
            if (expandScrollBtn) {
                expandScrollBtn.innerHTML = '<span class="scroll-btn-icon">✖</span><span class="scroll-btn-text">Collapse Scroll</span>';
            }
            isMapFullscreen = true;
            document.body.style.overflow = 'hidden';
        }

        // Must invalidate Leaflet size so tiles adjust to the 100vw/100vh modal dimensions
        setTimeout(() => {
            if (mapInstance) mapInstance.invalidateSize();
        }, 250);
    }

    /* ==========================================================================
       6. SACRED VIEWING BASTIONS (RECOMMENDED SPOTS ENGINE)
       ========================================================================== */

    /**
     * Generates recommended viewing spots around the selected coordinate,
     * calculates real-time weather & Night Honor Score for each, and renders them.
     */
    async function loadRecommendedSpots(centerLat, centerLon) {
        if (!spotsGrid || !spotsLoader) return;

        spotsGrid.innerHTML = '';
        spotsLoader.hidden = false;

        // Candidate offsets around vantage point
        const candidateTemplates = [
            { name: 'Northern Summit Sanctuary', type: 'High Mountain Peak', dLat: 0.16, dLon: 0.05, elevBoost: 450 },
            { name: 'Eastern Celestial Shrine', type: 'Sacred Torii Shrine', dLat: 0.06, dLon: 0.22, elevBoost: 220 },
            { name: 'Southern Starlight Clearing', type: 'Wilderness Dark Sky', dLat: -0.18, dLon: -0.08, elevBoost: 310 },
            { name: 'Western Moonlit Plateau', type: 'Elevated Ridge', dLat: -0.07, dLon: -0.24, elevBoost: 380 },
            { name: 'Sacred Forest Watchtower', type: 'Highland Sanctuary', dLat: 0.22, dLon: -0.15, elevBoost: 520 },
            { name: 'Hidden Valley Lake Sanctuary', type: 'Alpine Lakeside', dLat: -0.24, dLon: 0.18, elevBoost: 190 }
        ];

        try {
            const evaluatedSpots = [];

            for (const cand of candidateTemplates) {
                const sLat = centerLat + cand.dLat;
                const sLon = centerLon + cand.dLon;
                const dist = haversineDist(centerLat, centerLon, sLat, sLon);

                // Fetch real environmental telemetry for candidate spot
                try {
                    const spotWeather = await fetchWeather(sLat, sLon);
                    const spotBortle = estimateBortleScale(sLat, sLon, { type: 'peak' }, spotWeather.elevation + cand.elevBoost);
                    const scoreObj = calculateNightHonorScore(spotWeather, spotBortle);

                    evaluatedSpots.push({
                        name: cand.name,
                        type: cand.type,
                        lat: sLat,
                        lon: sLon,
                        distKm: dist.toFixed(1),
                        weather: spotWeather,
                        score: scoreObj.finalScore,
                        scoreObj: scoreObj
                    });
                } catch {
                    // Fallback calculation if spot network request hiccups
                    const mockWeather = {
                        visibility: 23000,
                        cloudCover: 15,
                        humidity: 48,
                        temperature: 12,
                        elevation: 650
                    };
                    const spotBortle = estimateBortleScale(sLat, sLon, { type: 'peak' }, 650);
                    const scoreObj = calculateNightHonorScore(mockWeather, spotBortle);

                    evaluatedSpots.push({
                        name: cand.name,
                        type: cand.type,
                        lat: sLat,
                        lon: sLon,
                        distKm: dist.toFixed(1),
                        weather: mockWeather,
                        score: scoreObj.finalScore,
                        scoreObj: scoreObj
                    });
                }
            }

            // Rank spots descending by Night Honor Score
            evaluatedSpots.sort((a, b) => b.score - a.score);

            // Render spots on map & in DOM grid
            renderSpots(evaluatedSpots);

        } catch (err) {
            console.error('Failed to load recommended viewing bastions:', err);
        } finally {
            spotsLoader.hidden = true;
        }
    }

    /**
     * Renders recommended spot cards in DOM and custom Torii markers on Leaflet map
     */
    function renderSpots(spots) {
        if (!mapMarkersLayer || !spotsGrid) return;

        // Clear existing spot markers on map (preserve user vantage)
        mapMarkersLayer.clearLayers();

        spotsGrid.innerHTML = '';

        spots.forEach((spot, idx) => {
            // 1. Add Custom Torii SVG Marker to Leaflet map
            const toriiMarker = L.marker([spot.lat, spot.lon], {
                icon: createToriiMarkerIcon(idx === 0)
            });

            const popupContent = `
                <div class="popup-torii-card">
                    <h3>⛩️ ${spot.name}</h3>
                    <div class="popup-score-badge">Honor Score: ${spot.score}/100 &bull; ${spot.scoreObj.rank}</div>
                    <p>
                        <strong>Type:</strong> ${spot.type}<br>
                        <strong>Distance:</strong> ${spot.distKm} km from vantage<br>
                        <strong>Bortle:</strong> Class ${spot.scoreObj.bortleScale} (${getBortleDescription(spot.scoreObj.bortleScale)})<br>
                        <strong>Cloud:</strong> ${spot.weather.cloudCover}% &bull; <strong>Vis:</strong> ${(spot.weather.visibility / 1000).toFixed(1)} km
                    </p>
                    <button class="popup-btn-select" onclick="window.tsukuyomiSelect(${spot.lat}, ${spot.lon}, '${spot.name}')">
                        Take Bastion Vantage
                    </button>
                </div>
            `;
            toriiMarker.bindPopup(popupContent);
            mapMarkersLayer.addLayer(toriiMarker);

            // 2. Add Spot Card to Grid
            const card = document.createElement('div');
            card.className = 'spot-card';
            card.innerHTML = `
                <div>
                    <div class="spot-card-top">
                        <div>
                            <div class="spot-name">${spot.name}</div>
                            <div class="spot-type-tag">⛩️ ${spot.type} &bull; ${spot.distKm} km away</div>
                        </div>
                        <div class="spot-score-pill">${spot.score} / 100</div>
                    </div>
                    <div class="spot-desc">
                        ${spot.scoreObj.rankDesc}
                    </div>
                </div>
                <div class="spot-card-bottom">
                    <span>Class ${spot.scoreObj.bortleScale} Bortle &bull; ${spot.weather.cloudCover}% Cloud</span>
                    <span class="spot-btn-view">Ascend Here &rarr;</span>
                </div>
            `;

            card.addEventListener('click', () => {
                selectLocation(spot.lat, spot.lon, spot.name, { type: 'bastion' });
                // Pan map to spot
                if (mapInstance) {
                    mapInstance.setView([spot.lat, spot.lon], 12);
                    toriiMarker.openPopup();
                }
            });

            spotsGrid.appendChild(card);
        });
    }

    // Expose window selector helper for Leaflet popups
    window.tsukuyomiSelect = (lat, lon, name) => {
        selectLocation(lat, lon, name, { type: 'bastion' });
    };

    /* ==========================================================================
       7. MAIN LOCATION SELECTION & ORCHESTRATION
       ========================================================================== */

    /**
     * Evaluates a chosen location: fetches weather, computes Bortle, calculates score,
     * updates Leaflet map and queries nearby bastions.
     */
    async function selectLocation(lat, lon, displayName, address = {}) {
        currentLat = Number(lat);
        currentLon = Number(lon);

        // Update badge banner
        if (locBadge) locBadge.hidden = false;
        if (badgeName) badgeName.textContent = displayName;
        if (badgeCoords) badgeCoords.textContent = `${currentLat.toFixed(4)}°N, ${currentLon.toFixed(4)}°E`;
        if (badgeRegion) badgeRegion.textContent = address.city || address.country || 'Selected Vantage';

        try {
            // 1. Fetch real-time Open-Meteo telemetry
            const weather = await fetchWeather(currentLat, currentLon);
            if (badgeElev) badgeElev.textContent = `${weather.elevation} m Elevation`;

            // 2. Calculate Bortle Scale
            const bortleScale = estimateBortleScale(currentLat, currentLon, address, weather.elevation);

            // 3. Compute Night Honor Score
            const scoreObj = calculateNightHonorScore(weather, bortleScale);

            // 4. Render UI Gauges & Metrics
            renderScoreUI(weather, scoreObj);

            // 5. Update Map Position & User Vantage Marker
            if (mapInstance) {
                mapInstance.setView([currentLat, currentLon], 10);

                if (userVantageMarker) {
                    userVantageMarker.setLatLng([currentLat, currentLon]);
                } else {
                    userVantageMarker = L.marker([currentLat, currentLon], {
                        icon: createUserVantageIcon(),
                        zIndexOffset: 1000
                    }).addTo(mapInstance);
                }

                userVantageMarker.bindPopup(`
                    <div style="padding: 10px; font-family: 'Cinzel', serif;">
                        <strong style="color: #D4AF37;">📍 Current Vantage Point</strong>
                        <p style="margin: 4px 0 0 0; font-size: 0.9rem;">${displayName}</p>
                    </div>
                `);
            }

            // 6. Query and rank recommended bastions
            await loadRecommendedSpots(currentLat, currentLon);

        } catch (err) {
            console.error('Error orchestrating location evaluation:', err);
            alert(`Unable to consult celestial charts: ${err.message}`);
        }
    }

    /* ==========================================================================
       8. GEOCODING & SEARCH AUTOCOMPLETE (NOMINATIM API)
       ========================================================================== */

    async function searchLocations(query) {
        const params = new URLSearchParams({
            q: query,
            format: 'json',
            limit: '5',
            addressdetails: '1'
        });
        const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

        const res = await fetch(url, {
            headers: { 'User-Agent': 'TsukuyomiWatchSamuraiGuide/2.0' }
        });
        if (!res.ok) throw new Error('Geocoding request failed');
        return await res.json();
    }

    async function handleSearch() {
        const query = cityInput ? cityInput.value.trim() : '';
        if (!query) return;

        if (suggestions) suggestions.style.display = 'none';

        try {
            const results = await searchLocations(query);
            if (results && results.length > 0) {
                const top = results[0];
                await selectLocation(parseFloat(top.lat), parseFloat(top.lon), top.display_name, top.address || {});
            } else {
                alert(`No vantage found for "${query}". Try Mount Fuji, Tokyo, Kyoto, or a specific shrine.`);
            }
        } catch (err) {
            console.error('Search error:', err);
            alert('Geocoding service unavailable. Please check your network.');
        }
    }

    function handleAutocomplete() {
        clearTimeout(searchDebounceTimer);
        const query = cityInput ? cityInput.value.trim() : '';

        if (query.length < 3) {
            if (suggestions) suggestions.style.display = 'none';
            return;
        }

        searchDebounceTimer = setTimeout(async () => {
            try {
                const results = await searchLocations(query);
                if (!suggestions) return;

                suggestions.innerHTML = '';
                if (results.length === 0) {
                    suggestions.style.display = 'none';
                    return;
                }

                results.forEach((item) => {
                    const li = document.createElement('li');
                    li.textContent = item.display_name;
                    li.addEventListener('click', () => {
                        cityInput.value = item.display_name;
                        suggestions.style.display = 'none';
                        selectLocation(parseFloat(item.lat), parseFloat(item.lon), item.display_name, item.address || {});
                    });
                    suggestions.appendChild(li);
                });

                suggestions.style.display = 'block';
            } catch (err) {
                console.warn('Autocomplete fetch failed:', err);
            }
        }, 320);
    }

    function handleGeolocation() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        if (geoBtn) geoBtn.textContent = '⏳ Detecting Stars…';

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                if (geoBtn) geoBtn.innerHTML = '<span>📍</span> Detect Current Position';
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;

                // Reverse geocode coordinate to get a clean name
                let name = `Vantage Point [${lat.toFixed(3)}°, ${lon.toFixed(3)}°]`;
                try {
                    const revUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
                    const revRes = await fetch(revUrl, {
                        headers: { 'User-Agent': 'TsukuyomiWatchSamuraiGuide/2.0' }
                    });
                    if (revRes.ok) {
                        const revData = await revRes.json();
                        name = revData.display_name || name;
                    }
                } catch (e) {
                    console.warn('Reverse geocoding error:', e);
                }

                await selectLocation(lat, lon, name, {});
            },
            (err) => {
                if (geoBtn) geoBtn.innerHTML = '<span>📍</span> Detect Current Position';
                console.error('Geolocation error:', err);
                alert('Could not determine current position. Please search a location manually.');
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    }

    /* ==========================================================================
       9. REAL-TIME MOON PHASE ENGINE
       ========================================================================== */

    function updateMoonPhase() {
        const now = new Date();
        // Known reference new moon: January 11, 2024
        const refNewMoon = new Date(Date.UTC(2024, 0, 11, 11, 57));
        const synodicMonth = 29.53058867;
        const diffMs = now.getTime() - refNewMoon.getTime();
        const days = diffMs / (1000 * 60 * 60 * 24);
        const moonAge = ((days % synodicMonth) + synodicMonth) % synodicMonth;
        const illumPct = Math.round((1 - Math.cos((moonAge / synodicMonth) * 2 * Math.PI)) / 2 * 100);

        let phaseName = 'New Moon (新月)';
        if (moonAge < 1.84) phaseName = 'New Moon (新月)';
        else if (moonAge < 5.53) phaseName = 'Waxing Crescent (三日月)';
        else if (moonAge < 9.22) phaseName = 'First Quarter (上弦の月)';
        else if (moonAge < 12.91) phaseName = 'Waxing Gibbous (十日夜)';
        else if (moonAge < 16.61) phaseName = 'Full Moon (望月・満月)';
        else if (moonAge < 20.30) phaseName = 'Waning Gibbous (寝待月)';
        else if (moonAge < 23.99) phaseName = 'Last Quarter (下弦の月)';
        else if (moonAge < 27.68) phaseName = 'Waning Crescent (有明月)';

        if (moonName) moonName.textContent = phaseName;
        if (moonIllum) moonIllum.textContent = `${illumPct}% Illuminated`;
        if (mMoon) mMoon.textContent = phaseName;
        if (mMoonDetail) mMoonDetail.textContent = `${illumPct}% Illumination &bull; Age ${moonAge.toFixed(1)}d`;
    }

    /* ==========================================================================
       10. APPLICATION INITIALIZATION & EVENT WIRING
       ========================================================================== */

    function initApp() {
        // 1. Spawn Sakura Petals
        initSakuraPetals(24);

        // 2. Initialize Moon Phase
        updateMoonPhase();

        // 3. Initialize Leaflet Map
        initMap();

        // 4. Landing Page Events
        if (ascendBtn) {
            ascendBtn.addEventListener('click', ascendWatchtower);
        }
        if (gateReturnBtn) {
            gateReturnBtn.addEventListener('click', returnToEntranceGate);
        }
        if (returnLandingBtn) {
            returnLandingBtn.addEventListener('click', returnToEntranceGate);
        }

        // 5. Search & Geolocation Events
        if (searchBtn) searchBtn.addEventListener('click', handleSearch);
        if (cityInput) {
            cityInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') handleSearch();
            });
            cityInput.addEventListener('input', handleAutocomplete);
        }
        if (geoBtn) geoBtn.addEventListener('click', handleGeolocation);

        // Close suggestions dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-wrap') && suggestions) {
                suggestions.style.display = 'none';
            }
        });

        // 6. Map Fullscreen Modal Events
        if (expandScrollBtn) {
            expandScrollBtn.addEventListener('click', () => toggleScrollFullscreen());
        }
        if (closeScrollBtn) {
            closeScrollBtn.addEventListener('click', () => toggleScrollFullscreen(true));
        }

        // Escape key exits fullscreen modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isMapFullscreen) {
                toggleScrollFullscreen(true);
            }
        });

        // 7. Load Default Celestial Bastion: Mount Fuji, Japan
        selectLocation(35.3606, 138.7274, 'Mount Fuji (富士山), Japan', {
            type: 'peak',
            category: 'natural',
            city: 'Fujinomiya',
            country: 'Japan'
        });
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

})();

