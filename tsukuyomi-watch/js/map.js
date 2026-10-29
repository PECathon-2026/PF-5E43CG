/* ===================================================
   The Scroll Map (Leaflet.js) — Ancient Japanese Celestial Cartography
   Features:
     - 4 Documented Base Maps:
         1. CARTO Voyager (Parchment Scroll)
         2. OpenStreetMap Standard
         3. OpenTopoMap (Topographic Contours & Relief)
         4. Esri World Imagery (Satellite Reference Imagery)
     - NASA VIIRS Nighttime Lights (Artificial Radiance Satellite Proxy)
     - Custom Illustrated SVG Markers:
         ⛩️ Torii Gate for shrines
         🏯 Pagoda for temples & heritage sites
         🏔️ Mountain silhouette for peaks & high elevations
         🌲 Pine Tree / Lantern for parks, forests & nature reserves
         ⭐ Golden Celestial Star for top candidate stargazing locations
     - Marker Legend
     - Detailed slide-out / modal information panel
     - List / Map synchronization
     - "Recenter on Me" & "Find Best Nearby Spot"
     - "Expand Scroll" 100vw / 100vh modal with "✕" close button
   =================================================== */

const MapManager = (() => {
    'use strict';

    let map = null;
    let markersLayer = null;
    let userMarker = null;
    let nightLightsLayer = null;
    let onMapClickCallback = null;
    let currentSpots = [];
    let activeFilter = 'all';
    let isFullscreen = false;

    // --- Custom Illustrated SVG Marker Icons ---

    function createToriiIcon() {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="36" height="36" style="filter: drop-shadow(0 0 7px rgba(212,175,55,0.8));">
            <path d="M 4 14 Q 32 9 60 14 L 62 19 Q 32 15 2 19 Z" fill="#8B0000" stroke="#D4AF37" stroke-width="1.6"/>
            <path d="M 7 20 L 57 20 L 55 24 L 9 24 Z" fill="#111111" stroke="#D4AF37" stroke-width="1"/>
            <path d="M 11 29 L 53 29 L 53 33 L 11 33 Z" fill="#8B0000" stroke="#D4AF37" stroke-width="1"/>
            <rect x="30" y="24" width="4" height="6" fill="#D4AF37"/>
            <polygon points="17,22 22,22 24,57 15,57" fill="#8B0000" stroke="#D4AF37" stroke-width="1.2"/>
            <polygon points="42,22 47,22 49,57 40,57" fill="#8B0000" stroke="#D4AF37" stroke-width="1.2"/>
            <rect x="13" y="57" width="13" height="4" rx="1" fill="#111111" stroke="#D4AF37" stroke-width="1"/>
            <rect x="38" y="57" width="13" height="4" rx="1" fill="#111111" stroke="#D4AF37" stroke-width="1"/>
        </svg>`;
        return makeDivIcon(svg);
    }

    function createPagodaIcon() {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="36" height="36" style="filter: drop-shadow(0 0 7px rgba(212,175,55,0.8));">
            <!-- Spire -->
            <line x1="32" y1="4" x2="32" y2="14" stroke="#ffd700" stroke-width="2"/>
            <!-- Tier 1 Roof -->
            <path d="M 14 22 Q 32 14 50 22 L 46 26 L 18 26 Z" fill="#8B0000" stroke="#D4AF37" stroke-width="1.2"/>
            <!-- Tier 2 Roof -->
            <path d="M 10 34 Q 32 25 54 34 L 50 38 L 14 38 Z" fill="#8B0000" stroke="#D4AF37" stroke-width="1.2"/>
            <!-- Tier 3 Base Roof -->
            <path d="M 6 46 Q 32 36 58 46 L 54 50 L 10 50 Z" fill="#8B0000" stroke="#D4AF37" stroke-width="1.2"/>
            <!-- Foundation Wall & Door -->
            <rect x="20" y="50" width="24" height="11" fill="#111111" stroke="#D4AF37" stroke-width="1.2"/>
            <rect x="28" y="54" width="8" height="7" fill="#D4AF37"/>
        </svg>`;
        return makeDivIcon(svg);
    }

    function createMountainIcon() {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="36" height="36" style="filter: drop-shadow(0 0 7px rgba(212,175,55,0.8));">
            <!-- Rear peak -->
            <polygon points="42,16 60,54 24,54" fill="#1c252f" stroke="#D4AF37" stroke-width="1.2"/>
            <!-- Front main peak -->
            <polygon points="22,12 44,56 0,56" fill="#11161d" stroke="#D4AF37" stroke-width="1.4"/>
            <!-- Snowcap -->
            <polygon points="22,12 28,24 22,21 16,24" fill="#f5eedb"/>
            <polygon points="42,16 46,24 42,22 38,24" fill="#f5eedb"/>
        </svg>`;
        return makeDivIcon(svg);
    }

    function createPineIcon() {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="36" height="36" style="filter: drop-shadow(0 0 7px rgba(78,154,81,0.8));">
            <!-- Pine needles tiers -->
            <polygon points="32,8 44,22 20,22" fill="#2d5a31" stroke="#D4AF37" stroke-width="1"/>
            <polygon points="32,18 48,34 16,34" fill="#244b27" stroke="#D4AF37" stroke-width="1"/>
            <polygon points="32,28 54,48 10,48" fill="#1b391d" stroke="#D4AF37" stroke-width="1"/>
            <!-- Trunk -->
            <rect x="28" y="48" width="8" height="11" fill="#4a2e18" stroke="#D4AF37" stroke-width="1"/>
        </svg>`;
        return makeDivIcon(svg);
    }

    function createStarIconSvg() {
        return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="40" height="40" style="filter: drop-shadow(0 0 10px rgba(255,215,0,0.95));">
            <!-- Halo circle -->
            <circle cx="32" cy="32" r="27" fill="rgba(139,0,0,0.6)" stroke="#ffd700" stroke-width="1.8"/>
            <!-- 8-point celestial star -->
            <polygon points="32,7 37,23 54,23 41,34 46,51 32,41 18,51 23,34 10,23 27,23" fill="#ffd700" stroke="#8B0000" stroke-width="1.2"/>
        </svg>`;
    }

    function createStarIcon(isTop = false) {
        return makeDivIcon(createStarIconSvg(), isTop);
    }

    function createUserIcon() {
        const html = `
        <div class="user-pulse-marker">
            <span class="user-pulse-ring"></span>
            <span class="user-pulse-ring delay"></span>
            <span class="user-pulse-dot">📍</span>
        </div>`;
        return L.divIcon({
            className: 'user-marker-container',
            html: html,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18]
        });
    }

    function createMeteorIcon() {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="40" height="40" style="filter: drop-shadow(0 0 10px rgba(255,100,50,0.95));">
            <defs>
                <linearGradient id="meteorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.1"/>
                    <stop offset="60%" stop-color="#ff6600" stop-opacity="0.85"/>
                    <stop offset="100%" stop-color="#ffd700" stop-opacity="1"/>
                </linearGradient>
            </defs>
            <line x1="8" y1="8" x2="40" y2="40" stroke="url(#meteorGrad)" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="18" y1="6" x2="44" y2="32" stroke="rgba(255,215,0,0.7)" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="44" cy="44" r="13" fill="#8B0000" stroke="#ffd700" stroke-width="2"/>
            <circle cx="44" cy="44" r="7" fill="#ff4500"/>
            <circle cx="44" cy="44" r="3.5" fill="#ffffff"/>
            <text x="44" y="47" font-size="11" text-anchor="middle" fill="#fff">☄</text>
        </svg>`;
        return makeDivIcon(svg, false, 'event-marker-pin');
    }

    function createPlanetIcon() {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="40" height="40" style="filter: drop-shadow(0 0 10px rgba(212,175,55,0.95));">
            <ellipse cx="32" cy="32" rx="27" ry="9" fill="none" stroke="#ffd700" stroke-width="2.2" transform="rotate(-24, 32, 32)"/>
            <circle cx="32" cy="32" r="16" fill="#8B0000" stroke="#ffd700" stroke-width="1.8"/>
            <circle cx="32" cy="32" r="11" fill="#b8860b"/>
            <ellipse cx="32" cy="32" rx="27" ry="9" fill="none" stroke="#ffd700" stroke-width="1.5" stroke-dasharray="20 40" transform="rotate(-24, 32, 32)"/>
        </svg>`;
        return makeDivIcon(svg, false, 'event-marker-pin');
    }

    function createTelescopeIcon() {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="38" height="38" style="filter: drop-shadow(0 0 9px rgba(78,180,255,0.95));">
            <circle cx="32" cy="32" r="22" fill="#0c182b" stroke="#4eb4ff" stroke-width="2"/>
            <text x="32" y="39" font-size="20" text-anchor="middle">🔭</text>
        </svg>`;
        return makeDivIcon(svg, false, 'event-marker-pin');
    }

    function createSatelliteIcon() {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="38" height="38" style="filter: drop-shadow(0 0 9px rgba(255,215,0,0.95));">
            <circle cx="32" cy="32" r="22" fill="#1b1226" stroke="#ffd700" stroke-width="2"/>
            <text x="32" y="39" font-size="20" text-anchor="middle">🛰️</text>
        </svg>`;
        return makeDivIcon(svg, false, 'event-marker-pin');
    }

    function makeDivIcon(svgHtml, isTop = false, extraClass = '') {
        const topClass = isTop ? 'top-celestial-pin' : '';
        const combinedClass = `custom-scroll-marker ${topClass} ${extraClass}`.trim();
        return L.divIcon({
            className: combinedClass,
            html: `<div class="marker-bounce ${topClass}">${svgHtml}</div>`,
            iconSize: [38, 38],
            iconAnchor: [19, 36],
            popupAnchor: [0, -36]
        });
    }

    function getMarkerIconForSpot(spot, index) {
        if (spot.isEvent || spot.category === 'event') {
            if (spot.type === 'meteor') return createMeteorIcon();
            if (spot.type === 'planet') return createPlanetIcon();
            if (spot.type === 'satellite') return createSatelliteIcon();
            if (spot.type === 'starparty' || spot.type === 'observatory') return createTelescopeIcon();
            return createMeteorIcon();
        }
        if (index === 0) return createStarIcon(true);
        const type = (spot.type || '').toLowerCase();
        if (type.includes('shrine')) return createToriiIcon();
        if (type.includes('temple') || type.includes('monastery')) return createPagodaIcon();
        if (type.includes('peak') || type.includes('mountain') || type.includes('hill')) return createMountainIcon();
        if (type.includes('park') || type.includes('forest') || type.includes('reserve') || type.includes('lake')) return createPineIcon();
        return createStarIcon(false);
    }

    /**
     * Initializes Leaflet Map with all 4 base maps, NASA VIIRS overlay,
     * layer controls, click handler, and filter synchronizer.
     */
    function init(containerId = 'map', onClickCoord = null) {
        if (map) {
            map.remove();
            map = null;
        }

        onMapClickCallback = onClickCoord;

        // Default view: Mount Fuji (35.3606, 138.7274)
        map = L.map(containerId, {
            center: [35.3606, 138.7274],
            zoom: 10,
            zoomControl: true,
            attributionControl: true
        });

        // 1. BASE MAPS (100% Free, Zero API Keys, No Watermarks)
        // 100% Free, Zero-Key, High-Res Orbital Satellite Layer with Antique Brown Terrain Filter
        const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community (Satellite Reference Imagery)',
            maxZoom: 18
        });

        const osmStandard = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        });

        const topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://openstreetmap.org">OSM</a> | Style &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
            maxZoom: 17
        });

        // Default: Esri Satellite with Antique Brown Terrain Scroll Filter (Zero watermark & no API key required)
        esriSatellite.addTo(map);

        // 2. OVERLAY LAYERS
        markersLayer = L.layerGroup().addTo(map);

        // NASA VIIRS Nighttime Lights Overlay (Proxy for Artificial Surface Light)
        const viirsConfig = (typeof LightPollution !== 'undefined' && LightPollution.getTileLayerConfig)
            ? LightPollution.getTileLayerConfig()
            : {
                url: 'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default//GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg',
                options: {
                    attribution: '&copy; NASA EOSDIS GIBS VIIRS Nighttime Lights (Artificial Radiance Proxy)',
                    maxZoom: 8,
                    opacity: 0.72,
                    zIndex: 10
                }
            };

        nightLightsLayer = L.tileLayer(viirsConfig.url, viirsConfig.options);

        // Layer Control (Zero API Keys required across all options)
        const baseMaps = {
            'Esri Satellite (Brown Terrain Scroll)': esriSatellite,
            'OpenStreetMap (Edo Cartography)': osmStandard,
            'Topographic Terrain (Contours)': topoMap
        };

        const overlayMaps = {
            'NASA VIIRS Night Lights (Radiance Proxy)': nightLightsLayer,
            'Stargazing Sanctuaries (Markers)': markersLayer
        };

        L.control.layers(baseMaps, overlayMaps, { position: 'topright', collapsed: false }).addTo(map);

        // Dynamic Aesthetic Layer Filter:
        // Automatically selects the best visual treatment for each layer:
        // - Satellite: Antique Japanese brown topographical terrain scroll (zero green, rich earth/mountain tones)
        // - OpenStreetMap: Deep Japanese ink-wash cartography
        // - Topographic: Warm mountain relief shading
        function updateTileFilter(layerName = '') {
            const tilePane = map.getPane('tilePane');
            if (!tilePane) return;

            tilePane.classList.remove(
                'layer-filter-parchment',
                'layer-filter-osm',
                'layer-filter-topo',
                'layer-filter-satellite'
            );

            const name = (layerName || '').toLowerCase();
            if (name.includes('satellite') || name.includes('esri') || name.includes('imagery')) {
                tilePane.classList.add('layer-filter-satellite');
            } else if (name.includes('topographic') || name.includes('contours')) {
                tilePane.classList.add('layer-filter-topo');
            } else {
                tilePane.classList.add('layer-filter-osm');
            }
        }

        map.on('baselayerchange', (e) => {
            updateTileFilter(e.name);
        });

        // Initialize with antique brown terrain satellite scroll filter
        setTimeout(() => {
            updateTileFilter('Esri Satellite (Brown Terrain Scroll)');
        }, 60);

        // Click anywhere to select location
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            if (typeof onMapClickCallback === 'function') {
                onMapClickCallback(lat, lng);
            }
        });

        setupFullscreenControls();

        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 200);

        return map;
    }

    /**
     * Sets user's current observation post marker
     */
    function setUserLocation(lat, lon, name = 'Your Vantage') {
        if (!map) return;

        if (userMarker) {
            map.removeLayer(userMarker);
        }

        userMarker = L.marker([lat, lon], { icon: createUserIcon(), zIndexOffset: 1000 })
            .addTo(map)
            .bindPopup(`
                <div style="font-family:'Cinzel',serif;font-weight:700;color:#D4AF37;font-size:1.05rem;margin-bottom:4px;">
                    📍 ${name}
                </div>
                <div style="font-size:0.85rem;color:#c9bda9;font-family:'EB Garamond',serif;">
                    Active Observation Bastion (${Number(lat).toFixed(4)}°N, ${Number(lon).toFixed(4)}°E)
                </div>
            `);

        map.setView([lat, lon], 11, { animate: true });
    }

    /**
     * Adds recommended spot markers, attaches interactive click events,
     * and filters according to the active category.
     */
    function addSpots(spots = []) {
        currentSpots = spots;
        renderFilteredMarkers();
    }

    function setFilter(filterCategory = 'all') {
        activeFilter = filterCategory;
        renderFilteredMarkers();
    }

    function renderFilteredMarkers() {
        if (!map || !markersLayer) return;
        markersLayer.clearLayers();

        const filtered = currentSpots.filter(spot => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'event') return spot.isEvent || spot.category === 'event';
            const t = (spot.type || '').toLowerCase();
            if (activeFilter === 'mountain') return t.includes('peak') || t.includes('mountain') || t.includes('hill');
            if (activeFilter === 'sanctuary') return t.includes('shrine') || t.includes('temple') || t.includes('sanctuary');
            if (activeFilter === 'park') return t.includes('park') || t.includes('reserve') || t.includes('forest') || t.includes('lake');
            if (activeFilter === 'star') return spot.score >= 70;
            return true;
        });

        filtered.forEach((spot, i) => {
            const icon = getMarkerIconForSpot(spot, i);
            const marker = L.marker([spot.lat, spot.lon], { icon });

            marker.on('click', () => {
                showSpotDetailPanel(spot);
            });

            // Fallback popup if panel is collapsed
            const popupSubtitle = spot.isEvent
                ? `${spot.badge || '☄️ Celestial Event'} &bull; ${spot.timeWindow || 'Tonight'}`
                : `${spot.typeLabel || 'Sanctuary'} &bull; ${spot.distance < 1 ? '<1 km' : Number(spot.distance).toFixed(1) + ' km'}`;

            marker.bindPopup(`
                <div style="min-width:220px;font-family:'EB Garamond',serif;padding:6px;">
                    <strong style="color:#D4AF37;font-family:'Cinzel',serif;font-size:1.05rem;">${spot.name}</strong>
                    <div style="font-size:0.82rem;color:#e5c158;text-transform:uppercase;margin:4px 0;">${popupSubtitle}</div>
                    <div style="font-size:0.95rem;margin:6px 0;"><strong>Sky Honor:</strong> <span style="color:#ffd700;font-weight:700;">${spot.score}/100</span> (${spot.scoreObj ? spot.scoreObj.rank : 'Rated'})</div>
                    <button class="popup-btn-select" onclick="window.tsukuyomiOpenDetail('${spot.id || spot.name}')">Inspect ${spot.isEvent ? 'Event Details' : 'Sanctuary'}</button>
                </div>
            `);

            markersLayer.addLayer(marker);
        });

        // Fit bounds
        if (filtered.length > 0 && userMarker) {
            const points = filtered.map(s => [s.lat, s.lon]);
            points.push(userMarker.getLatLng());
            map.fitBounds(points, { padding: [40, 40], maxZoom: 13 });
        }
    }

    /**
     * Opens a detailed sliding drawer / panel with complete information
     */
    function showSpotDetailPanel(spot) {
        const detailPanel = document.getElementById('spotDetailPanel');
        if (!detailPanel) return;

        const scoreObj = spot.scoreObj || {};
        const weather = spot.weather || {};
        const lp = spot.lightPollution || {};

        document.getElementById('sdName').textContent = spot.name;
        document.getElementById('sdCategory').textContent = spot.isEvent
            ? `${spot.badge || '☄️ Celestial Event'} • ${spot.typeLabel}`
            : (spot.typeLabel || 'Stargazing Sanctuary');
        document.getElementById('sdDistance').textContent = `${spot.distance < 1 ? '<1 km' : Number(spot.distance).toFixed(1) + ' km'} from vantage point`;
        document.getElementById('sdCoords').textContent = `${Number(spot.lat).toFixed(4)}°N, ${Number(spot.lon).toFixed(4)}°E`;
        document.getElementById('sdElev').textContent = weather.elevation != null ? `${weather.elevation} m` : 'Standard terrain';
        document.getElementById('sdScore').textContent = `${spot.score} / 100`;
        document.getElementById('sdRank').textContent = scoreObj.rank || 'Promising Sanctuary';

        if (spot.isEvent) {
            document.getElementById('sdReason').innerHTML = `
                <div class="event-drawer-highlight">
                    <div style="margin-bottom:6px;"><strong style="color:#ffd700;">Scheduled Timing:</strong> ${spot.dateText} &bull; ${spot.timeWindow}</div>
                    <div style="margin-bottom:6px;"><strong style="color:#ffd700;">Optimal Viewing:</strong> ${spot.optimalSkyAzimuth}</div>
                    <div style="margin-bottom:6px;"><strong style="color:#ffd700;">Expected Rate:</strong> ${spot.radiantRate}</div>
                    <div style="margin-bottom:6px;"><strong style="color:#ffd700;">Recommended Gear:</strong> ${spot.gearRecommended}</div>
                    <div style="margin-bottom:6px;"><strong style="color:#ffd700;">Host Sanctuary:</strong> ${spot.hostLocation}</div>
                    <p style="margin:8px 0;line-height:1.45;color:#e8dfcf;">${spot.description}</p>
                    <p style="margin-top:6px;font-style:italic;color:#ffd700;">💡 Tip: ${spot.astronomyTip}</p>
                </div>
            `;
        } else {
            document.getElementById('sdReason').textContent = spot.reason || 'Optimal atmospheric and terrain profile.';
        }

        // Weather Breakdown
        document.getElementById('sdCloud').textContent = `${weather.cloud_cover ?? 0}%`;
        document.getElementById('sdVis').textContent = `${Math.round((weather.visibility || 24000) / 1000)} km`;
        document.getElementById('sdHumid').textContent = `${weather.humidity ?? 50}%`;
        document.getElementById('sdWind').textContent = `${Math.round(weather.wind_speed ?? 5)} km/h`;
        document.getElementById('sdBortle').textContent = lp.short || 'Class 4';
        document.getElementById('sdTimestamp').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        detailPanel.classList.add('open');

        // Pan map smoothly to spot
        if (map) {
            map.setView([spot.lat, spot.lon], 12, { animate: true });
        }
    }

    window.tsukuyomiOpenDetail = (nameOrId) => {
        const target = currentSpots.find(s => (s.id === nameOrId || s.name === nameOrId));
        if (target) showSpotDetailPanel(target);
    };

    /**
     * "Expand Scroll" Fullscreen Modal Toggle
     */
    function setupFullscreenControls() {
        const expandBtn = document.getElementById('expandScrollBtn');
        const closeBtn = document.getElementById('closeScrollBtn');
        const recenterBtn = document.getElementById('recenterBtn');
        const bestSpotBtn = document.getElementById('bestSpotBtn');
        const wrapper = document.getElementById('scrollMapWrapper');

        if (expandBtn) {
            expandBtn.onclick = () => toggleFullscreen(wrapper, expandBtn, closeBtn);
        }
        if (closeBtn) {
            closeBtn.onclick = () => toggleFullscreen(wrapper, expandBtn, closeBtn, true);
        }

        if (recenterBtn) {
            recenterBtn.onclick = () => {
                if (userMarker && map) {
                    map.setView(userMarker.getLatLng(), 11, { animate: true });
                }
            };
        }

        if (bestSpotBtn) {
            bestSpotBtn.onclick = () => {
                if (currentSpots && currentSpots.length > 0) {
                    const topSpot = currentSpots[0];
                    showSpotDetailPanel(topSpot);
                }
            };
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isFullscreen) {
                toggleFullscreen(wrapper, expandBtn, closeBtn, true);
            }
        });
    }

    function toggleFullscreen(wrapper, expandBtn, closeBtn, forceClose = false) {
        if (!wrapper) return;

        if (forceClose || isFullscreen) {
            wrapper.classList.remove('scroll-fullscreen');
            if (closeBtn) closeBtn.hidden = true;
            if (expandBtn) {
                expandBtn.innerHTML = '<span class="scroll-btn-icon">📜</span><span class="scroll-btn-text">Expand Scroll</span>';
            }
            isFullscreen = false;
            document.body.style.overflow = '';
        } else {
            wrapper.classList.add('scroll-fullscreen');
            if (closeBtn) closeBtn.hidden = false;
            if (expandBtn) {
                expandBtn.innerHTML = '<span class="scroll-btn-icon">✖</span><span class="scroll-btn-text">Collapse Scroll</span>';
            }
            isFullscreen = true;
            document.body.style.overflow = 'hidden';
        }

        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 250);
    }

    function invalidateSize() {
        if (map) {
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    }

    function getMap() {
        return map;
    }

    return {
        init,
        setUserLocation,
        addSpots,
        setFilter,
        showSpotDetailPanel,
        invalidateSize,
        getMap
    };
})();
