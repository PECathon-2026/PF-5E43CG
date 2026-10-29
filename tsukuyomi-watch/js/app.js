/* ===================================================
   Tsukuyomi Watchtower — Master Application Orchestrator
   =================================================== */

(function () {
    'use strict';

    // ---- DOM Elements ----
    const landingPage         = document.getElementById('landingPage');
    const heroExploreBtn      = document.getElementById('heroExploreBtn');
    const heroDiscoverBtn     = document.getElementById('heroDiscoverBtn');
    const gateReturnBtn       = document.getElementById('gateReturnBtn');
    const returnLandingBtn    = document.getElementById('returnLandingBtn');
    const petalToggleBtn      = document.getElementById('petalToggleBtn');

    // Live Sky Preview on Landing Page
    const heroSkyCloud        = document.getElementById('heroSkyCloud');
    const heroSkyVis          = document.getElementById('heroSkyVis');
    const heroSkyHumid        = document.getElementById('heroSkyHumid');
    const heroSkyScore        = document.getElementById('heroSkyScore');

    // Location Controls
    const cityInput           = document.getElementById('cityInput');
    const searchBtn           = document.getElementById('searchBtn');
    const geoBtn              = document.getElementById('geoBtn');
    const suggestions         = document.getElementById('suggestions');
    const locBadge            = document.getElementById('locBadge');
    const badgeName           = document.getElementById('badgeName');
    const badgeCoords         = document.getElementById('badgeCoords');
    const badgeElev           = document.getElementById('badgeElev');
    const badgeRegion         = document.getElementById('badgeRegion');

    // Night Honor Score & Breakdown Elements
    const secScore            = document.getElementById('sec-score');
    const ringFill            = document.getElementById('ringFill');
    const ringNum             = document.getElementById('ringNum');
    const ringRank            = document.getElementById('ringRank');
    const ringRankDesc        = document.getElementById('ringRankDesc');
    const dataCompletenessEl  = document.getElementById('dataCompleteness');

    // 7 Factor Progress Bars
    const barCloud            = document.getElementById('barCloud');
    const scoreCloud          = document.getElementById('scoreCloud');
    const rawCloud            = document.getElementById('rawCloud');

    const barBortle           = document.getElementById('barBortle');
    const scoreBortle         = document.getElementById('scoreBortle');
    const rawBortle           = document.getElementById('rawBortle');

    const barVis              = document.getElementById('barVis');
    const scoreVis            = document.getElementById('scoreVis');
    const rawVis              = document.getElementById('rawVis');

    const barHumidity         = document.getElementById('barHumidity');
    const scoreHumidity       = document.getElementById('scoreHumidity');
    const rawHumidity         = document.getElementById('rawHumidity');

    const barWind             = document.getElementById('barWind');
    const scoreWind           = document.getElementById('scoreWind');
    const rawWind             = document.getElementById('rawWind');

    const barMoon             = document.getElementById('barMoon');
    const scoreMoon           = document.getElementById('scoreMoon');
    const rawMoon             = document.getElementById('rawMoon');

    const barLocation         = document.getElementById('barLocation');
    const scoreLocation       = document.getElementById('scoreLocation');
    const rawLocation         = document.getElementById('rawLocation');

    // Insights & Forecast Window
    const positiveList        = document.getElementById('positiveList');
    const negativeList        = document.getElementById('negativeList');
    const recommendationBox   = document.getElementById('recommendationBox');
    const forecastWindowText  = document.getElementById('forecastWindowText');
    const formulaSummary      = document.getElementById('formulaSummary');

    // 12 Weather Metric Badges
    const mCloud              = document.getElementById('mCloud');
    const mHumid              = document.getElementById('mHumid');
    const mVis                = document.getElementById('mVis');
    const mTemp               = document.getElementById('mTemp');
    const mWind               = document.getElementById('mWind');
    const mPrecip             = document.getElementById('mPrecip');
    const mDew                = document.getElementById('mDew');
    const mElev               = document.getElementById('mElev');
    const mLightPoll          = document.getElementById('mLightPoll');
    const mBortleTitle        = document.getElementById('mBortleTitle');
    const mMoon               = document.getElementById('mMoon');
    const mMoonDetail         = document.getElementById('mMoonDetail');
    const mDay                = document.getElementById('mDay');
    const mWmo                = document.getElementById('mWmo');

    // Map & Spots Elements
    const secMap              = document.getElementById('sec-map');
    const secSpots            = document.getElementById('sec-spots');
    const spotsLoader         = document.getElementById('spotsLoader');
    const spotsGrid           = document.getElementById('spotsGrid');
    const spotDetailCloseBtn  = document.getElementById('spotDetailCloseBtn');
    const spotDetailPanel     = document.getElementById('spotDetailPanel');

    // State
    let currentLat = 35.3606;
    let currentLon = 138.7274;
    let debounceTimer = null;
    let petalsEnabled = true;

    // ---- App Initialization ----
    function init() {
        // 1. Initialize 3D Starfield & Tilt
        if (typeof StarfieldEngine !== 'undefined') {
            StarfieldEngine.init('celestialCanvas');
        }

        // 2. Initialize Moon Phase
        if (typeof MoonPhase !== 'undefined') {
            MoonPhase.render();
        }

        // 3. Initialize Leaflet Scroll Map with click handler
        if (typeof MapManager !== 'undefined') {
            MapManager.init('map', handleMapClick);
        }

        // 4. Wire Landing Page Navigation
        if (heroExploreBtn) {
            heroExploreBtn.addEventListener('click', () => {
                enterDashboard();
            });
        }

        if (heroDiscoverBtn) {
            heroDiscoverBtn.addEventListener('click', () => {
                enterDashboard();
                handleGeolocation();
            });
        }

        if (gateReturnBtn) {
            gateReturnBtn.addEventListener('click', returnToLanding);
        }
        if (returnLandingBtn) {
            returnLandingBtn.addEventListener('click', returnToLanding);
        }

        // 5. Category Preview Cards on Landing Page
        document.querySelectorAll('.sanctuary-preview-card').forEach(card => {
            card.addEventListener('click', () => {
                const filter = card.getAttribute('data-filter') || 'all';
                enterDashboard();
                if (typeof MapManager !== 'undefined') {
                    MapManager.setFilter(filter);
                }
                const mapSec = document.getElementById('sec-map');
                if (mapSec) mapSec.scrollIntoView({ behavior: 'smooth' });
            });
        });

        // 6. Map Filter Buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-filter') || 'all';
                if (typeof MapManager !== 'undefined') {
                    MapManager.setFilter(filter);
                }
            });
        });

        // 7. Spot Detail Drawer Close Button
        if (spotDetailCloseBtn && spotDetailPanel) {
            spotDetailCloseBtn.addEventListener('click', () => {
                spotDetailPanel.classList.remove('open');
            });
        }

        // 8. Petal Toggle Button
        if (petalToggleBtn) {
            petalToggleBtn.addEventListener('click', () => {
                petalsEnabled = !petalsEnabled;
                const container = document.getElementById('petals-container');
                if (container) {
                    container.style.display = petalsEnabled ? 'block' : 'none';
                }
                petalToggleBtn.textContent = petalsEnabled ? '🌸 Petals: ON' : '🌸 Petals: OFF';
            });
        }

        // 9. Search & Autocomplete
        if (searchBtn) searchBtn.addEventListener('click', handleSearch);
        if (cityInput) {
            cityInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') handleSearch();
            });
            cityInput.addEventListener('input', handleAutocomplete);
        }
        if (geoBtn) geoBtn.addEventListener('click', handleGeolocation);

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-wrap') && suggestions) {
                suggestions.style.display = 'none';
            }
        });

        window.addEventListener('resize', () => {
            if (typeof MapManager !== 'undefined') MapManager.invalidateSize();
        });

        // 10. Initial Celestial Bastion: Mount Fuji (35.3606, 138.7274)
        selectLocation(35.3606, 138.7274, 'Mount Fuji (富士山), Japan', {
            type: 'peak',
            category: 'natural',
            city: 'Fujinomiya',
            country: 'Japan'
        });
    }

    function enterDashboard() {
        if (!landingPage) return;
        landingPage.classList.add('fade-out');

        setTimeout(() => {
            if (typeof MapManager !== 'undefined') {
                MapManager.invalidateSize();
            }
        }, 300);

        setTimeout(() => {
            if (typeof MapManager !== 'undefined') {
                MapManager.invalidateSize();
            }
            const dashboardTop = document.getElementById('sec-location');
            if (dashboardTop) {
                dashboardTop.scrollIntoView({ behavior: 'smooth' });
            }
        }, 850);
    }

    function returnToLanding() {
        if (!landingPage) return;
        landingPage.classList.remove('fade-out');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ---- Geocoding ----
    async function geocode(query) {
        const params = new URLSearchParams({
            q: query,
            format: 'json',
            limit: '5',
            addressdetails: '1'
        });
        const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
        const resp = await fetch(url, {
            headers: { 'User-Agent': 'TsukuyomiWatchtowerHackathon/2.0' }
        });
        if (!resp.ok) throw new Error('Geocoding request failed');
        return resp.json();
    }

    async function reverseGeocode(lat, lon) {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
        try {
            const resp = await fetch(url, {
                headers: { 'User-Agent': 'TsukuyomiWatchtowerHackathon/2.0' }
            });
            if (!resp.ok) return null;
            return await resp.json();
        } catch {
            return null;
        }
    }

    function handleAutocomplete() {
        clearTimeout(debounceTimer);
        const query = cityInput ? cityInput.value.trim() : '';

        if (query.length < 2) {
            if (suggestions) suggestions.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const results = await geocode(query);
                renderSuggestions(results);
            } catch {
                if (suggestions) suggestions.style.display = 'none';
            }
        }, 350);
    }

    function renderSuggestions(results) {
        if (!suggestions) return;
        if (!results || results.length === 0) {
            suggestions.style.display = 'none';
            return;
        }

        suggestions.innerHTML = results.map((r, i) => `
            <li class="suggestion-item" data-index="${i}">
                <strong>${escapeHtml(r.display_name.split(',')[0])}</strong>
                <span class="sub-text">${escapeHtml(r.display_name.split(',').slice(1, 3).join(','))}</span>
            </li>
        `).join('');

        suggestions.style.display = 'block';

        suggestions.querySelectorAll('.suggestion-item').forEach((item, idx) => {
            item.addEventListener('click', () => {
                const r = results[idx];
                const name = r.display_name.split(',')[0];
                cityInput.value = name;
                suggestions.style.display = 'none';
                selectLocation(parseFloat(r.lat), parseFloat(r.lon), name, r.address);
            });
        });
    }

    async function handleSearch() {
        const query = cityInput ? cityInput.value.trim() : '';
        if (!query) return;

        searchBtn.disabled = true;
        searchBtn.innerHTML = '<span>⏳</span> Searching…';

        try {
            const results = await geocode(query);
            if (results && results.length > 0) {
                const top = results[0];
                const name = top.display_name.split(',')[0];
                selectLocation(parseFloat(top.lat), parseFloat(top.lon), name, top.address);
                if (suggestions) suggestions.style.display = 'none';
            } else {
                alert('No stargazing location found with that name. Try a city, mountain peak, or national park.');
            }
        } catch (err) {
            console.error('Search failed:', err);
            alert('Location search encountered an error. Please try again.');
        } finally {
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<span>🔍</span> Search Vantage';
        }
    }

    function handleGeolocation() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        geoBtn.disabled = true;
        geoBtn.innerHTML = '<span>⏳</span> Locating…';

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                let placeName = 'Your Location';
                let address = {};

                try {
                    const geoData = await reverseGeocode(lat, lon);
                    if (geoData && geoData.address) {
                        address = geoData.address;
                        placeName = address.city || address.town || address.village || address.suburb || 'Your Observation Post';
                    }
                } catch { /* proceed with fallback */ }

                selectLocation(lat, lon, placeName, address);
                geoBtn.disabled = false;
                geoBtn.innerHTML = '<span>📍</span> Detect Current Position';
            },
            (err) => {
                console.warn('Geolocation failed:', err);
                alert('Unable to acquire GPS coordinates. Please search by city name.');
                geoBtn.disabled = false;
                geoBtn.innerHTML = '<span>📍</span> Detect Current Position';
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }

    async function handleMapClick(lat, lon) {
        let placeName = `Observation Bastion [${lat.toFixed(3)}°, ${lon.toFixed(3)}°]`;
        let address = {};

        try {
            const geoData = await reverseGeocode(lat, lon);
            if (geoData && geoData.address) {
                address = geoData.address;
                placeName = address.city || address.town || address.village || address.natural || 'Selected Bastion';
            }
        } catch { /* fallback */ }

        selectLocation(lat, lon, placeName, address);
    }

    // ---- Main Pipeline: Location Selected ----
    async function selectLocation(lat, lon, name, address = {}) {
        currentLat = lat;
        currentLon = lon;

        // 1. Reveal Active Sections
        if (locBadge) locBadge.removeAttribute('hidden');
        if (secScore) secScore.removeAttribute('hidden');
        if (secMap) secMap.removeAttribute('hidden');
        if (secSpots) secSpots.removeAttribute('hidden');

        // 2. Update Location Badge
        if (badgeName) badgeName.textContent = name;
        if (badgeCoords) badgeCoords.textContent = `${Number(lat).toFixed(4)}°N, ${Number(lon).toFixed(4)}°E`;
        if (badgeElev) badgeElev.textContent = 'Measuring elevation…';
        if (badgeRegion) badgeRegion.textContent = address.city || address.country || 'Selected Vantage';

        // 3. Update Map
        if (typeof MapManager !== 'undefined') {
            MapManager.setUserLocation(lat, lon, name);
            MapManager.invalidateSize();
        }

        // 4. Reset spots & events UI with loading animation
        if (spotsGrid) spotsGrid.innerHTML = '';
        if (spotsLoader) spotsLoader.style.display = 'block';

        const eventsGrid = document.getElementById('eventsGrid');
        const eventsLoader = document.getElementById('eventsLoader');
        if (eventsGrid) eventsGrid.innerHTML = '';
        if (eventsLoader) eventsLoader.style.display = 'block';

        // 5. Fetch Open-Meteo Weather & Calculate 7-Factor Night Honor Score
        try {
            const weather = await WeatherAPI.fetchCurrent(lat, lon);

            if (weather.elevation != null && badgeElev) {
                badgeElev.textContent = `${weather.elevation} m Elevation`;
            }

            const lp = LightPollution.estimate(lat, lon, address, weather.elevation);
            const moonIllum = (typeof MoonPhase !== 'undefined') ? MoonPhase.calculate() * 100 : 50;
            const placeType = address.type || address.category || 'sanctuary';

            // Master 7-Factor Score calculation
            const scoreData = Scoring.calculate(weather, lp, moonIllum, placeType);

            // Update UI with full transparency & insights
            updateScoreUI(weather, lp, scoreData);

            // Update Live Sky Preview on Landing Page
            updateHeroSkyPreview(weather, scoreData);

        } catch (err) {
            console.error('Weather fetching failed:', err);
            if (ringNum) ringNum.textContent = '??';
            if (ringRank) ringRank.textContent = 'Weather Unavailable';
        }

        // 6. Fetch Expanded Datasets of Sanctuaries & Upcoming Celestial Events
        try {
            const allItems = await SpotsFinder.findSpots(lat, lon);
            const spotsOnly = (typeof SpotsFinder.getSpotsOnly === 'function')
                ? SpotsFinder.getSpotsOnly()
                : allItems.filter(s => !s.isEvent);
            const eventsOnly = (typeof SpotsFinder.getEventsOnly === 'function')
                ? SpotsFinder.getEventsOnly()
                : allItems.filter(s => s.isEvent);

            renderSpots(spotsOnly);
            renderEvents(eventsOnly);

            if (typeof MapManager !== 'undefined') {
                MapManager.addSpots(allItems);
                MapManager.invalidateSize();
            }
        } catch (err) {
            console.error('Spots & events search failed:', err);
            if (spotsLoader) spotsLoader.innerHTML = '<p style="color:#c13628;">Could not load nearby spots. Please try again.</p>';
            if (eventsLoader) eventsLoader.innerHTML = '<p style="color:#c13628;">Could not load upcoming events. Please try again.</p>';
        }
    }

    function updateHeroSkyPreview(weather, scoreData) {
        if (heroSkyCloud) heroSkyCloud.textContent = `${weather.cloud_cover}%`;
        if (heroSkyVis) heroSkyVis.textContent = `${Math.round((weather.visibility || 24000) / 1000)} km`;
        if (heroSkyHumid) heroSkyHumid.textContent = `${weather.humidity}%`;
        if (heroSkyScore) heroSkyScore.textContent = `${scoreData.finalScore}/100 (${scoreData.rank})`;
    }

    // ---- Update the Night Honor Score & Transparent Breakdown ----
    function updateScoreUI(weather, lp, score) {
        // 1. Ring Gauge (Circumference: 2 * PI * 100 = 628)
        const circumference = 2 * Math.PI * 100;
        const offset = circumference - (score.finalScore / 100) * circumference;
        if (ringFill) {
            ringFill.style.strokeDashoffset = offset;
            ringFill.style.stroke = score.color;
        }

        if (ringNum) animateNumber(ringNum, score.finalScore, 1000);

        if (ringRank) {
            ringRank.textContent = score.rank;
            ringRank.style.color = '#ffffff';
        }
        if (ringRankDesc) {
            ringRankDesc.textContent = score.rankDesc;
        }

        // Data completeness badge
        if (dataCompletenessEl) {
            dataCompletenessEl.textContent = `Data Completeness: ${score.dataCompletenessPct}% (${score.availableFactorsCount}/${score.totalFactorsCount} Factors Verified)`;
        }

        // 2. 7-Factor Gold Progress Bars
        const bd = score.breakdown;
        updateBar(barCloud, scoreCloud, rawCloud, bd.cloudCover);
        updateBar(barBortle, scoreBortle, rawBortle, bd.lightPollution);
        updateBar(barVis, scoreVis, rawVis, bd.visibility);
        updateBar(barHumidity, scoreHumidity, rawHumidity, bd.humidity);
        updateBar(barWind, scoreWind, rawWind, bd.wind);
        updateBar(barMoon, scoreMoon, rawMoon, bd.moon);
        updateBar(barLocation, scoreLocation, rawLocation, bd.location);

        // 3. Positive & Negative Contributors
        if (positiveList) {
            positiveList.innerHTML = score.positiveContributors.length > 0
                ? score.positiveContributors.map(c => `<li><span class="bullet-pos">✦</span> ${escapeHtml(c)}</li>`).join('')
                : '<li><span>✦</span> Favorable baseline atmospheric conditions across factors.</li>';
        }
        if (negativeList) {
            negativeList.innerHTML = score.negativeContributors.length > 0
                ? score.negativeContributors.map(c => `<li><span class="bullet-neg">✕</span> ${escapeHtml(c)}</li>`).join('')
                : '<li><span class="bullet-pos">✓</span> Minimal limiting factors detected.</li>';
        }

        // 4. Actionable Recommendations
        if (recommendationBox) {
            recommendationBox.innerHTML = score.recommendations.map(r => `<p>💡 ${escapeHtml(r)}</p>`).join('');
        }

        // 5. Forecast Viewing Window Tonight
        if (forecastWindowText) {
            forecastWindowText.textContent = weather.bestWindow
                ? `${weather.bestWindow.windowText} — ${weather.bestWindow.recommendation}`
                : 'Consistent conditions projected throughout nocturnal hours.';
        }

        // 6. Formula Calculation Summary
        if (formulaSummary) {
            formulaSummary.innerHTML = `
                <strong>Explainable Calculation:</strong>
                Sum of (${score.availableFactorsCount} weighted subscores) =
                <strong>${score.finalScore} / 100 (${score.rank})</strong>
                &bull; Retrieved: ${new Date(score.timestamp).toLocaleTimeString()}
            `;
        }

        // 7. 12 Weather Metric Cards
        if (mCloud) mCloud.textContent = `${weather.cloud_cover}%`;
        if (mHumid) mHumid.textContent = `${weather.humidity}%`;
        if (mVis) mVis.textContent = `${Math.round(weather.visibility / 1000)} km`;
        if (mLightPoll) mLightPoll.textContent = `Class ${score.subscores.lightPollution != null ? lp.bortle : '—'}`;
        if (mBortleTitle) mBortleTitle.textContent = lp.short || 'Bortle Scale';
        if (mTemp) mTemp.textContent = `${weather.temperature}°C`;
        if (mWind) mWind.textContent = `${weather.wind_speed} km/h`;
        if (mPrecip) mPrecip.textContent = `${weather.precipitation} mm`;
        if (mDew) mDew.textContent = `${weather.dew_point}°C`;
        if (mElev) mElev.textContent = weather.elevation != null ? `${weather.elevation} m` : '—';

        if (typeof MoonPhase !== 'undefined') {
            const moon = MoonPhase.render();
            if (mMoon) mMoon.textContent = `${moon.name}`;
            if (mMoonDetail) mMoonDetail.textContent = `${moon.illum}% Illumination`;
        }

        if (mDay) mDay.textContent = weather.is_night ? '🌙 Midnight' : '☀️ Daylight';
        if (mWmo) mWmo.textContent = weather.weather_desc;
    }

    function updateBar(barEl, scoreEl, rawEl, factorObj) {
        if (!factorObj) return;
        if (barEl) barEl.style.width = `${factorObj.rawScore ?? 0}%`;
        if (scoreEl) scoreEl.textContent = `${factorObj.pointsEarned.toFixed(1)} / ${factorObj.maxPoints.toFixed(1)} pts`;
        if (rawEl) rawEl.textContent = `(${factorObj.unitDisplay})`;
    }

    function animateNumber(element, target, duration = 900) {
        const start = performance.now();
        const initial = parseInt(element.textContent, 10) || 0;

        function step(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 2);
            const current = Math.round(initial + (target - initial) * eased);
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }
        requestAnimationFrame(step);
    }

    // ---- Render Recommended Spots Cards with Map Synchronization ----
    function renderSpots(spots) {
        if (!spotsLoader || !spotsGrid) return;
        spotsLoader.style.display = 'none';

        if (!spots || spots.length === 0) {
            spotsGrid.innerHTML = '<p class="no-spots">No celestial observing bastions found nearby. Try another vantage point.</p>';
            return;
        }

        spotsGrid.innerHTML = spots.map((spot, i) => {
            const color = Scoring.getColor(spot.score);
            const distLabel = spot.distance < 1 ? '<1 km' : `${spot.distance.toFixed(1)} km`;

            return `
                <div class="spot-card" data-index="${i}">
                    <div class="spot-card-top">
                        <div>
                            <div class="spot-name">⛩️ #${i + 1} ${escapeHtml(spot.name)}</div>
                            <div class="spot-type-tag">${escapeHtml(spot.typeLabel)} &bull; ${distLabel} away</div>
                        </div>
                        <div class="spot-score-pill" style="border-color:${color};">${spot.score} / 100</div>
                    </div>
                    <div class="spot-desc">
                        ${escapeHtml(spot.reason)}
                    </div>
                    <div class="spot-card-bottom">
                        <span>Sky: ${escapeHtml(spot.lightPollution ? spot.lightPollution.short : 'Rural')} &bull; Cloud: ${spot.weather ? spot.weather.cloud_cover : 0}%</span>
                        <span class="spot-btn-view">Inspect Sanctuary &rarr;</span>
                    </div>
                </div>
            `;
        }).join('');

        // Wire click & hover synchronization
        spotsGrid.querySelectorAll('.spot-card').forEach((card, idx) => {
            const targetSpot = spots[idx];
            card.addEventListener('click', () => {
                if (typeof MapManager !== 'undefined') {
                    MapManager.showSpotDetailPanel(targetSpot);
                }
            });
        });

        // Trigger 3D Card tilt for dynamically added spot cards
        if (typeof StarfieldEngine !== 'undefined') {
            StarfieldEngine.init3DCardTilt();
        }
    }

    // ---- Render Upcoming Celestial Events & Star Gatherings ----
    function renderEvents(events) {
        const eventsLoader = document.getElementById('eventsLoader');
        const eventsGrid = document.getElementById('eventsGrid');
        if (!eventsLoader || !eventsGrid) return;
        eventsLoader.style.display = 'none';

        if (!events || events.length === 0) {
            eventsGrid.innerHTML = '<p class="no-spots">No upcoming celestial events recorded for this regional quadrant.</p>';
            return;
        }

        eventsGrid.innerHTML = events.map((ev, i) => {
            const distLabel = ev.distance < 1 ? '<1 km' : `${ev.distance.toFixed(1)} km`;
            let iconEmoji = '☄️';
            if (ev.type === 'planet') iconEmoji = '🪐';
            else if (ev.type === 'satellite') iconEmoji = '🛰️';
            else if (ev.type === 'starparty' || ev.type === 'observatory') iconEmoji = '🔭';
            else if (ev.type === 'deepsky') iconEmoji = '🌌';

            return `
                <div class="event-card" data-event-index="${i}">
                    <div class="event-card-header">
                        <div class="event-badge">${escapeHtml(ev.badge)}</div>
                        <div class="event-score-pill">Sky Honor: ${ev.score}/100</div>
                    </div>
                    <div class="event-card-body">
                        <div class="event-title">${iconEmoji} ${escapeHtml(ev.name)}</div>
                        <div class="event-meta-row">
                            <span class="event-time">📅 ${escapeHtml(ev.dateText)}</span>
                            <span class="event-hours">⏰ ${escapeHtml(ev.timeWindow)}</span>
                        </div>
                        <div class="event-host">📍 Host Vantage: <strong>${escapeHtml(ev.hostLocation)}</strong> (${distLabel} away)</div>
                        <div class="event-gear">🔭 Recommended Equipment: <span>${escapeHtml(ev.gearRecommended)}</span></div>
                        <div class="event-desc">${escapeHtml(ev.description)}</div>
                    </div>
                    <div class="event-card-footer">
                        <span class="event-target-tip">🎯 Azimuth: ${escapeHtml(ev.optimalSkyAzimuth)}</span>
                        <span class="event-view-link">Inspect on Map &rarr;</span>
                    </div>
                </div>
            `;
        }).join('');

        // Wire click synchronization with map and detail drawer
        eventsGrid.querySelectorAll('.event-card').forEach((card, idx) => {
            const targetEvent = events[idx];
            card.addEventListener('click', () => {
                if (typeof MapManager !== 'undefined') {
                    MapManager.showSpotDetailPanel(targetEvent);
                }
            });
        });

        if (typeof StarfieldEngine !== 'undefined') {
            StarfieldEngine.init3DCardTilt();
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
