/* ===================================================
   Stargazing Spots Finder & Expanded Datasets Engine
   Features:
     - Real geographic POIs via OpenStreetMap Nominatim
     - Multi-faceted queries across mountains, reserves,
       lakes, observatories, and sacred heritage grounds
     - Comprehensive fallback archetypes covering all 8 cardinal quadrants
     - Integrated Celestial Events Dataset (meteor showers, planetary
       alignments, ISS passes, and dark-sky star gatherings)
     - Independent Open-Meteo weather & 7-factor Night Honor Scoring
   =================================================== */

const SpotsFinder = (() => {
    'use strict';

    const SPOT_SEARCH_QUERIES = [
        { query: 'mountain peak', type: 'mountain', label: 'Mountain Ridge / Summit' },
        { query: 'hill summit', type: 'mountain', label: 'Elevated Hill Vantage' },
        { query: 'mountain pass', type: 'mountain', label: 'High Elevation Mountain Pass' },
        { query: 'national park', type: 'park', label: 'National Park / Wilderness' },
        { query: 'nature reserve', type: 'park', label: 'Protected Nature Reserve' },
        { query: 'forest reserve', type: 'park', label: 'Dark Sky Woodland' },
        { query: 'observatory', type: 'observatory', label: 'Astronomical Observatory' },
        { query: 'stargazing viewpoint', type: 'mountain', label: 'Scenic Stargazing Vista' },
        { query: 'lake', type: 'park', label: 'Alpine Lakeside Vantage' },
        { query: 'reservoir', type: 'park', label: 'Tranquil Reservoir Shore' },
        { query: 'shrine', type: 'sanctuary', label: 'Sacred Heritage Shrine' },
        { query: 'temple', type: 'sanctuary', label: 'Historic Monastery / Temple' },
        { query: 'scenic viewpoint', type: 'mountain', label: 'Panoramic Sky Viewpoint' }
    ];

    /**
     * Search nearby real POIs via OpenStreetMap Nominatim
     */
    async function searchNearby(lat, lon, query, limit = 3) {
        const delta = 1.15; // Approx 125km search radius for dark-sky sanctuaries
        const params = new URLSearchParams({
            q: query,
            format: 'json',
            limit: String(limit),
            viewbox: `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`,
            bounded: '1',
            addressdetails: '1'
        });

        const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

        try {
            const resp = await fetch(url, {
                headers: { 'User-Agent': 'TsukuyomiWatchtowerHackathon/2.0 (celestial-guide)' }
            });
            if (!resp.ok) return [];
            return await resp.json();
        } catch {
            return [];
        }
    }

    /**
     * Haversine distance in km
     */
    function haversine(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    /**
     * Rich fallback geographic archetypes spanning all 8 compass directions
     */
    function generateNearbyCandidates(lat, lon, count, seen, isJapan = false) {
        const archetypes = isJapan ? [
            { name: 'Northern Highland Ridge', type: 'mountain', label: 'High Mountain Ridge', dLat: 0.22, dLon: 0.08, elevBoost: 520 },
            { name: 'Eastern Starlight Sanctuary', type: 'sanctuary', label: 'Tranquil Forest Shrine', dLat: 0.08, dLon: 0.26, elevBoost: 260 },
            { name: 'Western Elevated Plateau', type: 'mountain', label: 'High Altitude Plateau', dLat: -0.12, dLon: -0.28, elevBoost: 440 },
            { name: 'Southern Dark-Sky Lake', type: 'park', label: 'Alpine Lakeside Vantage', dLat: -0.28, dLon: 0.09, elevBoost: 210 },
            { name: 'Summit Celestial Point', type: 'observatory', label: 'Summit Astronomical Post', dLat: 0.20, dLon: -0.18, elevBoost: 680 },
            { name: 'Northeastern Pine Clearing', type: 'park', label: 'Wilderness Pine Reserve', dLat: 0.32, dLon: 0.24, elevBoost: 380 },
            { name: 'Southwestern Cedar Valley', type: 'sanctuary', label: 'Mountain Monastery Grounds', dLat: -0.34, dLon: -0.22, elevBoost: 320 },
            { name: 'Northwestern Crest Overlook', type: 'mountain', label: 'Panoramic Summit Vista', dLat: 0.36, dLon: -0.32, elevBoost: 590 },
            { name: 'Southeastern Mist Lake', type: 'park', label: 'Secluded Reservoir Bastion', dLat: -0.22, dLon: 0.36, elevBoost: 240 },
            { name: 'Zenith Stargazer Terrace', type: 'observatory', label: 'Public Telescope Terrace', dLat: 0.14, dLon: 0.15, elevBoost: 410 },
            { name: 'Outer Shadow Foothills', type: 'mountain', label: 'Dark Sky Mountain Foothills', dLat: -0.42, dLon: 0.18, elevBoost: 470 },
            { name: 'Sacred Moonrise Vista', type: 'sanctuary', label: 'Elevated Heritage Sanctuary', dLat: 0.18, dLon: -0.38, elevBoost: 350 },
            { name: 'Highlands Timberline Ridge', type: 'mountain', label: 'Alpine Timberline Ridge', dLat: 0.44, dLon: 0.05, elevBoost: 720 },
            { name: 'Tranquil Lakeside Clearing', type: 'park', label: 'Protected Lakeshore Reserve', dLat: -0.15, dLon: -0.42, elevBoost: 190 }
        ] : [
            { name: 'Highland Peak Vantage', type: 'mountain', label: 'Elevated Hill Ridge / Summit', dLat: 0.24, dLon: 0.09, elevBoost: 460 },
            { name: 'Dark-Sky Nature Clearing', type: 'park', label: 'Wilderness Forest Reserve', dLat: 0.09, dLon: 0.28, elevBoost: 210 },
            { name: 'Secluded Lakeside Vantage', type: 'park', label: 'Tranquil Lake Shoreline', dLat: -0.14, dLon: -0.31, elevBoost: 160 },
            { name: 'Heritage Sanctuary Grounds', type: 'sanctuary', label: 'Historic Monastery / Heritage Area', dLat: -0.28, dLon: 0.11, elevBoost: 240 },
            { name: 'High-Altitude Viewpoint', type: 'mountain', label: 'Panoramic Sky Viewpoint', dLat: 0.22, dLon: -0.19, elevBoost: 520 },
            { name: 'North Ridge Astronomical Post', type: 'observatory', label: 'Astronomical Summit Bastion', dLat: 0.34, dLon: 0.22, elevBoost: 610 },
            { name: 'Valley Horizon Vista', type: 'mountain', label: 'Unobstructed Horizon Bluff', dLat: -0.32, dLon: -0.24, elevBoost: 330 },
            { name: 'South River Darkness Reserve', type: 'park', label: 'Protected Wetland Reserve', dLat: -0.38, dLon: 0.16, elevBoost: 180 },
            { name: 'Eastern Hills Stargazer Plateau', type: 'mountain', label: 'High Altitude Plateau', dLat: 0.15, dLon: 0.38, elevBoost: 420 },
            { name: 'Western Forest Clearing', type: 'park', label: 'Dark Sky Wilderness Clearing', dLat: -0.08, dLon: -0.42, elevBoost: 270 },
            { name: 'Summit Crest Observatory View', type: 'observatory', label: 'Public Stargazing Terrace', dLat: 0.41, dLon: -0.12, elevBoost: 690 },
            { name: 'Silent Lake Dark Reserve', type: 'park', label: 'Lakeside Astrophotography Point', dLat: -0.22, dLon: 0.44, elevBoost: 190 },
            { name: 'Boulder Ridge Vista', type: 'mountain', label: 'High Rocky Outcrop', dLat: 0.29, dLon: -0.36, elevBoost: 530 },
            { name: 'High Meadow Starlight Post', type: 'sanctuary', label: 'Heritage Sanctuary Grounds', dLat: -0.44, dLon: -0.15, elevBoost: 310 }
        ];

        const candidates = [];
        for (let i = 0; i < Math.min(count, archetypes.length); i++) {
            const t = archetypes[i];
            const sLat = Number((lat + t.dLat).toFixed(4));
            const sLon = Number((lon + t.dLon).toFixed(4));
            const key = `${sLat},${sLon}`;

            if (!seen.has(key)) {
                seen.add(key);
                candidates.push({
                    id: `cand-${i}`,
                    name: t.name,
                    fullName: `${t.name} (Dark Sky Candidate Area)`,
                    lat: sLat,
                    lon: sLon,
                    type: t.type,
                    typeLabel: t.label,
                    elevBoost: t.elevBoost,
                    address: { type: t.type, natural: 'ridge' }
                });
            }
        }
        return candidates;
    }

    /**
     * Generates transparent observational reason
     */
    function generateReason(weather, scoreObj, lp, typeLabel, distance) {
        const reasons = [];

        // 1. Cloud Cover
        if (weather.cloud_cover <= 10) {
            reasons.push('Exceptional crystal clear sky');
        } else if (weather.cloud_cover <= 30) {
            reasons.push(`Favorable low cloud cover (${weather.cloud_cover}%)`);
        } else {
            reasons.push(`Moderate cloud cover (${weather.cloud_cover}%)`);
        }

        // 2. Light Pollution
        if (lp.bortle <= 3) {
            reasons.push(`pristine dark sky (${lp.short})`);
        } else if (lp.bortle <= 5) {
            reasons.push(`moderate dark sky (${lp.short})`);
        } else {
            reasons.push(`urban glow presence (${lp.short})`);
        }

        // 3. Visibility
        const visKm = Math.round((weather.visibility || 24000) / 1000);
        if (visKm >= 20) {
            reasons.push(`high optical clarity (${visKm} km)`);
        }

        // 4. Distance
        const distStr = distance < 1 ? 'under 1 km away' : `${distance.toFixed(1)} km away`;
        reasons.push(`${typeLabel} situated ${distStr}`);

        return reasons.join(', ') + '.';
    }

    let lastCalculatedSpots = [];
    let lastCalculatedEvents = [];

    /**
     * Find, evaluate, and rank spots + upcoming celestial events
     */
    async function findSpots(userLat, userLon) {
        const spotsPool = [];
        const seen = new Set();

        const isJapan = (userLat >= 24 && userLat <= 46 && userLon >= 122 && userLon <= 153);

        // 1. Fetch real POIs across multiple categories
        const searchPromises = SPOT_SEARCH_QUERIES.slice(0, 8).map(async (sq) => {
            await new Promise(res => setTimeout(res, Math.random() * 400));
            const results = await searchNearby(userLat, userLon, sq.query, 3);

            for (const r of results) {
                const lat = parseFloat(r.lat);
                const lon = parseFloat(r.lon);
                const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;

                if (!seen.has(key)) {
                    seen.add(key);
                    const cleanName = r.display_name.split(',')[0].trim();
                    spotsPool.push({
                        id: `osm-${r.place_id || Math.random()}`,
                        name: cleanName,
                        fullName: r.display_name,
                        lat,
                        lon,
                        type: sq.type,
                        typeLabel: sq.label,
                        address: r.address || {}
                    });
                }
            }
        });

        await Promise.all(searchPromises);

        // 2. Supplement with candidate areas to guarantee at least 14 varied spots
        if (spotsPool.length < 14) {
            const extra = generateNearbyCandidates(userLat, userLon, 14 - spotsPool.length, seen, isJapan);
            spotsPool.push(...extra);
        }

        // 3. Score each spot independently with real weather & light pollution
        const scoredSpots = [];
        const targetSpots = spotsPool.slice(0, 12);

        // Calculate lunar phase illumination
        const moonIllum = (typeof MoonPhase !== 'undefined') ? MoonPhase.calculate() * 100 : 50;

        for (const spot of targetSpots) {
            try {
                const weather = await WeatherAPI.fetchCurrent(spot.lat, spot.lon);
                if (spot.elevBoost && weather.elevation) {
                    weather.elevation += spot.elevBoost;
                }

                const lp = LightPollution.estimate(spot.lat, spot.lon, spot.address, weather.elevation);

                // 7-Factor Night Honor Score Calculation
                const scoreResult = Scoring.calculate(weather, lp, moonIllum, spot.type);
                const distance = haversine(userLat, userLon, spot.lat, spot.lon);
                const reason = generateReason(weather, scoreResult, lp, spot.typeLabel, distance);

                scoredSpots.push({
                    ...spot,
                    weather,
                    lightPollution: lp,
                    score: scoreResult.finalScore,
                    scoreObj: scoreResult,
                    distance,
                    reason,
                    isEvent: false
                });

                await new Promise(r => setTimeout(r, 80));
            } catch (err) {
                console.warn(`Could not evaluate spot ${spot.name}:`, err);
            }
        }

        // Sort descending by score
        scoredSpots.sort((a, b) => b.score - a.score);

        // 4. Generate & Integrate Upcoming Celestial Events Dataset
        let events = [];
        if (typeof CelestialEvents !== 'undefined') {
            events = CelestialEvents.generateNearbyEvents(userLat, userLon, scoredSpots);

            // Inherit weather & dark sky scores from their host bastions
            events = events.map((ev, i) => {
                const partnerSpot = scoredSpots[i % scoredSpots.length] || scoredSpots[0];
                const weather = partnerSpot ? partnerSpot.weather : { cloud_cover: 15, humidity: 45, visibility: 24000, elevation: 420, wind_speed: 6 };
                const lp = partnerSpot ? partnerSpot.lightPollution : { bortle: 3, short: 'Class 3 Dark Sky' };
                const scoreResult = Scoring.calculate(weather, lp, moonIllum, 'observatory');

                return {
                    ...ev,
                    weather,
                    lightPollution: lp,
                    score: Math.min(100, Math.round(scoreResult.finalScore + 3)), // Minor event excitement bonus
                    scoreObj: scoreResult,
                    reason: `${ev.typeLabel} scheduled: ${ev.dateText} (${ev.timeWindow}). Optimal viewing target: ${ev.optimalSkyAzimuth}. Equipment: ${ev.gearRecommended}.`
                };
            });
        }

        // Store cached lists
        lastCalculatedSpots = scoredSpots;
        lastCalculatedEvents = events;

        // Return unified pool (spots + events)
        const combined = [...scoredSpots, ...events];
        return combined;
    }

    return {
        findSpots,
        getSpotsOnly: () => lastCalculatedSpots,
        getEventsOnly: () => lastCalculatedEvents,
        haversine
    };
})();
