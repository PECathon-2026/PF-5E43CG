/**
 * ============================================================================
 * TSUKUYOMI WATCHTOWER — NIGHT HONOR SCORE ENGINE
 * A transparent, explainable, configurable 7-factor astronomical suitability
 * scoring system (0 to 100) calibrated for stargazing observation clarity.
 *
 * Configurable Weights (Normalized to 100%):
 *   1. Cloud Cover:          30% (Clearer skies receive higher score)
 *   2. Light Pollution:      25% (Darker skies / lower Bortle receive higher score)
 *   3. Visibility:           15% (Better horizontal visibility receives higher score)
 *   4. Humidity:             10% (Lower humidity prevents dew and aerosol haze)
 *   5. Wind Conditions:       5% (Gentle breeze is optimal; high wind shakes optics)
 *   6. Moon Brightness:      10% (Less moonlight favors deep-sky faint object observation)
 *   7. Location Suitability:  5% (Elevation above inversion layer & natural surroundings)
 * ============================================================================
 */

const Scoring = (() => {
    'use strict';

    // Default 7-factor weights
    const DEFAULT_WEIGHTS = {
        cloudCover: 0.30,
        lightPollution: 0.25,
        visibility: 0.15,
        humidity: 0.10,
        wind: 0.05,
        moon: 0.10,
        location: 0.05
    };

    let activeWeights = { ...DEFAULT_WEIGHTS };

    /**
     * Configure active factor weights (automatically normalizes to 1.0 / 100%).
     */
    function setWeights(customWeights = {}) {
        const merged = { ...activeWeights, ...customWeights };
        let sum = 0;
        for (const key of Object.keys(DEFAULT_WEIGHTS)) {
            merged[key] = Math.max(0, Number(merged[key]) || 0);
            sum += merged[key];
        }
        if (sum > 0) {
            for (const key of Object.keys(DEFAULT_WEIGHTS)) {
                merged[key] = Number((merged[key] / sum).toFixed(4));
            }
            activeWeights = merged;
        }
        return { ...activeWeights };
    }

    function getWeights() {
        return { ...activeWeights };
    }

    function resetWeights() {
        activeWeights = { ...DEFAULT_WEIGHTS };
        return { ...activeWeights };
    }

    /* -------------------------------------------------------------------------
       Subscore Normalization Functions (Each maps to 0 - 100)
       ------------------------------------------------------------------------- */

    /**
     * Cloud Cover Subscore (0 to 100)
     * Clear sky (0% cloud) = 100. Overcast (100% cloud) = 0.
     */
    function subscoreCloudCover(cloudPct) {
        if (cloudPct == null || isNaN(cloudPct)) return null;
        const clamped = Math.max(0, Math.min(100, Number(cloudPct)));
        return 100 - clamped;
    }

    /**
     * Light Pollution Subscore (0 to 100)
     * Based on standard astronomical Bortle scale (1 to 9).
     * Bortle 1 (Pristine Dark Sky) = 100.
     * Bortle 9 (Inner-City Core) = 0.
     */
    function subscoreLightPollution(bortle) {
        if (bortle == null || isNaN(bortle)) return null;
        const clamped = Math.max(1, Math.min(9, Number(bortle)));
        // Linear scale from 1 (100) to 9 (0)
        const score = ((9 - clamped) / 8) * 100;
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Visibility Subscore (0 to 100)
     * Open-Meteo returns visibility in meters. Clear sky standard >= 24,000m.
     */
    function subscoreVisibility(visMeters) {
        if (visMeters == null || isNaN(visMeters)) return null;
        const meters = Math.max(0, Number(visMeters));
        const score = (meters / 24000) * 100;
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Humidity Subscore (0 to 100)
     * High humidity (> 75%) causes dew on optical lenses and aerosol haze.
     * 0-35% humidity = 100 subscore; 100% humidity = 0 subscore.
     */
    function subscoreHumidity(humidityPct) {
        if (humidityPct == null || isNaN(humidityPct)) return null;
        const h = Math.max(0, Math.min(100, Number(humidityPct)));
        if (h <= 35) return 100;
        const score = 100 - ((h - 35) / 65) * 100;
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Wind Conditions Subscore (0 to 100)
     * Light breeze (0 to 12 km/h) keeps dew away without shaking telescope barrels = 100.
     * High wind (> 35 km/h) impairs tripod stability and induces turbulence = 0.
     */
    function subscoreWind(windKmh) {
        if (windKmh == null || isNaN(windKmh)) return null;
        const w = Math.max(0, Number(windKmh));
        if (w <= 12) return 100;
        const score = 100 - ((w - 12) / 28) * 100;
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Moon Brightness Subscore (0 to 100)
     * New Moon (0% illumination) = 100.
     * Full Moon (100% illumination) = 0.
     */
    function subscoreMoon(illumPct) {
        if (illumPct == null || isNaN(illumPct)) return null;
        const illum = Math.max(0, Math.min(100, Number(illumPct)));
        return 100 - illum;
    }

    /**
     * Location Suitability Subscore (0 to 100)
     * Factors in altitude (rising above boundary aerosol mist) and natural terrain.
     */
    function subscoreLocation(elevationMeters = 0, placeType = 'default') {
        let score = 50; // Baseline neutral score

        // Elevation bonus
        const elev = Number(elevationMeters) || 0;
        if (elev >= 2500) score += 35;
        else if (elev >= 1500) score += 25;
        else if (elev >= 800) score += 15;
        else if (elev >= 300) score += 8;

        // Place character bonus
        const type = String(placeType).toLowerCase();
        if (type.includes('peak') || type.includes('mountain') || type.includes('observatory')) {
            score += 15;
        } else if (type.includes('park') || type.includes('nature') || type.includes('reserve')) {
            score += 10;
        } else if (type.includes('shrine') || type.includes('temple') || type.includes('sanctuary')) {
            score += 8;
        } else if (type.includes('city') || type.includes('urban') || type.includes('commercial')) {
            score -= 20;
        }

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /* -------------------------------------------------------------------------
       Master Night Honor Score Calculation
       ------------------------------------------------------------------------- */

    /**
     * Calculates the complete explainable Night Honor Score (0 - 100).
     *
     * @param {Object} weather - Real-time atmospheric metrics (cloud_cover, visibility, humidity, wind_speed, elevation)
     * @param {number|Object} lightPollution - Bortle scale value (1 to 9) or light pollution object
     * @param {number} moonIllumPct - Current lunar illumination percentage (0 to 100)
     * @param {string} placeCategory - Category of location (mountain, park, shrine, etc.)
     * @returns {Object} Comprehensive calculation result, breakdown, and insights
     */
    function calculate(weather = {}, lightPollution = 5, moonIllumPct = 50, placeCategory = 'sanctuary') {
        const bortle = (typeof lightPollution === 'object' && lightPollution != null)
            ? (lightPollution.bortle || 5)
            : Number(lightPollution) || 5;

        // 1. Calculate each raw subscore (0 to 100 or null if missing)
        const subscores = {
            cloudCover: subscoreCloudCover(weather.cloud_cover ?? weather.cloudCover),
            lightPollution: subscoreLightPollution(bortle),
            visibility: subscoreVisibility(weather.visibility),
            humidity: subscoreHumidity(weather.humidity ?? weather.relative_humidity_2m),
            wind: subscoreWind(weather.wind_speed ?? weather.windSpeed ?? weather.wind_speed_10m),
            moon: subscoreMoon(moonIllumPct),
            location: subscoreLocation(weather.elevation, placeCategory)
        };

        // 2. Identify available vs missing factors
        const availableFactors = [];
        const missingFactors = [];
        let totalAvailableWeight = 0;

        for (const [key, weight] of Object.entries(activeWeights)) {
            if (subscores[key] != null) {
                availableFactors.push(key);
                totalAvailableWeight += weight;
            } else {
                missingFactors.push(key);
            }
        }

        const dataCompletenessPct = Math.round((availableFactors.length / Object.keys(activeWeights).length) * 100);
        const isProvisional = subscores.cloudCover == null || subscores.lightPollution == null;

        // 3. Weighted computation with dynamic missing-factor normalization
        let weightedSum = 0;
        const breakdown = {};

        for (const [key, weight] of Object.entries(activeWeights)) {
            const rawSub = subscores[key];
            if (rawSub != null && totalAvailableWeight > 0) {
                // Re-normalize weight across available factors so sum always equals 1.0 (100 pts)
                const normalizedWeight = weight / totalAvailableWeight;
                const pointsEarned = Number((rawSub * normalizedWeight).toFixed(1));
                const maxPoints = Number((100 * normalizedWeight).toFixed(1));
                weightedSum += pointsEarned;

                breakdown[key] = {
                    name: formatFactorName(key),
                    rawScore: rawSub,
                    weight: Number(normalizedWeight.toFixed(3)),
                    baseWeight: weight,
                    pointsEarned,
                    maxPoints,
                    unitDisplay: formatFactorUnit(key, weather, bortle, moonIllumPct),
                    status: rawSub >= 70 ? 'optimal' : (rawSub >= 40 ? 'moderate' : 'limiting')
                };
            } else {
                breakdown[key] = {
                    name: formatFactorName(key),
                    rawScore: null,
                    weight: 0,
                    baseWeight: weight,
                    pointsEarned: 0,
                    maxPoints: 0,
                    unitDisplay: 'Telemetry Missing',
                    status: 'missing'
                };
            }
        }

        const finalScore = Math.max(0, Math.min(100, Math.round(weightedSum)));

        // 4. Rank, Colors & Explanatory Insights
        const rank = getRank(finalScore);
        const color = getColor(finalScore);
        const { positiveContributors, negativeContributors, recommendations } = generateInsights(breakdown, weather, bortle, moonIllumPct);

        return {
            finalScore,
            rank: rank.title,
            rankJapanese: rank.japanese,
            rankDesc: rank.desc,
            color,
            breakdown,
            subscores,
            dataCompletenessPct,
            isProvisional,
            availableFactorsCount: availableFactors.length,
            totalFactorsCount: Object.keys(activeWeights).length,
            positiveContributors,
            negativeContributors,
            recommendations,
            timestamp: new Date().toISOString()
        };
    }

    function formatFactorName(key) {
        const names = {
            cloudCover: 'Cloud Cover Clarity',
            lightPollution: 'Dark Sky Purity (Bortle)',
            visibility: 'Atmospheric Visibility',
            humidity: 'Atmospheric Dryness',
            wind: 'Wind Stability',
            moon: 'Lunar Darkness',
            location: 'Terrain & Altitude'
        };
        return names[key] || key;
    }

    function formatFactorUnit(key, weather, bortle, moonIllum) {
        switch (key) {
            case 'cloudCover':
                return `${weather.cloud_cover ?? weather.cloudCover ?? 0}% Cover`;
            case 'lightPollution':
                return `Class ${bortle} (Bortle Scale)`;
            case 'visibility':
                const km = Math.round((weather.visibility || 24000) / 1000);
                return `${km} km Range`;
            case 'humidity':
                return `${weather.humidity ?? weather.relative_humidity_2m ?? 50}% RH`;
            case 'wind':
                return `${Math.round(weather.wind_speed ?? weather.windSpeed ?? 5)} km/h Wind`;
            case 'moon':
                return `${Math.round(moonIllum)}% Moon Illumination`;
            case 'location':
                return `${weather.elevation != null ? weather.elevation + ' m' : 'Natural Haven'}`;
            default:
                return 'Recorded';
        }
    }

    function getRank(score) {
        if (score >= 90) {
            return {
                title: 'Celestial Sanctuary',
                japanese: '天眼神域',
                desc: 'Pristine, crystal clarity. The Milky Way arch, distant nebulae, and stellar clusters are vividly perceptible.'
            };
        }
        if (score >= 75) {
            return {
                title: "Shogun's Sky",
                japanese: '将軍の天',
                desc: 'Exceptional observation quality. Fine celestial details and major constellations stand out with commanding honor.'
            };
        }
        if (score >= 60) {
            return {
                title: "Samurai's Gaze",
                japanese: '侍の眼',
                desc: 'Favorable stargazing conditions. Clear horizons with easily observable planets and prominent stellar formations.'
            };
        }
        if (score >= 45) {
            return {
                title: "Ronin's Watch",
                japanese: '浪人の夜',
                desc: 'Moderate atmospheric clarity. Major planets and brightest stars are visible, though faint nebulae are suppressed.'
            };
        }
        if (score >= 30) {
            return {
                title: "Ashigaru's View",
                japanese: '足軽の視',
                desc: 'Limited viewing clarity. Urban light pollution, humidity, or intermittent cloud cover diminish the cosmic sphere.'
            };
        }
        return {
            title: 'Clouded Horizon',
            japanese: '霧迷夜空',
            desc: 'Unfavorable stargazing conditions. Heavy overcast, thick aerosol haze, or severe urban glare blanket the heavens.'
        };
    }

    function getColor(score) {
        if (score >= 85) return '#ffd700'; // Imperial Bright Gold
        if (score >= 70) return '#4E9A51'; // Forest Jade Green
        if (score >= 50) return '#D4AF37'; // Antique Gold
        if (score >= 35) return '#e67e22'; // Warning Amber
        return '#8B0000';                   // Deep Crimson
    }

    /**
     * Generates positive, negative, and actionable observational recommendations.
     */
    function generateInsights(breakdown, weather, bortle, moonIllum) {
        const positiveContributors = [];
        const negativeContributors = [];
        const recommendations = [];

        // Check Cloud Cover
        if (breakdown.cloudCover && breakdown.cloudCover.rawScore >= 80) {
            positiveContributors.push(`Exceptional clear sky (${100 - breakdown.cloudCover.rawScore}% cloud cover) maximizes cosmic transparency.`);
        } else if (breakdown.cloudCover && breakdown.cloudCover.rawScore <= 40) {
            negativeContributors.push(`Significant cloud cover (${100 - breakdown.cloudCover.rawScore}%) is the primary visual barrier.`);
            recommendations.push('Cloud cover is currently the largest limiting factor. Consult the hourly window to find an opening later tonight.');
        }

        // Check Light Pollution
        if (bortle <= 3) {
            positiveContributors.push(`Pristine dark sky (Class ${bortle} Bortle) protects faint galaxies and nebular contrast.`);
        } else if (bortle >= 6) {
            negativeContributors.push(`Urban artificial light dome (Class ${bortle} Bortle) washes out faint deep-sky objects.`);
            recommendations.push('Traveling 15–25 km away from the city center towards an elevated park will dramatically improve faint galaxy visibility.');
        }

        // Check Moon
        if (moonIllum <= 20) {
            positiveContributors.push(`Faint lunar glare (${Math.round(moonIllum)}% illuminated) ensures dark sky background.`);
        } else if (moonIllum >= 75) {
            negativeContributors.push(`Bright moonlight (${Math.round(moonIllum)}% illuminated) washes out deep-sky contrast.`);
            recommendations.push('Focus observation on bright planets, double stars, and lunar crater relief while the moon dominates.');
        }

        // Check Humidity & Dew
        const humidity = weather.humidity ?? weather.relative_humidity_2m;
        if (humidity != null && humidity > 80) {
            negativeContributors.push(`Elevated relative humidity (${humidity}%) risks optical lens condensation and haze.`);
            recommendations.push('High humidity detected: Equip a telescope dew shield and store optical gear in a dry case between viewings.');
        }

        // Check Wind
        const wind = weather.wind_speed ?? weather.windSpeed;
        if (wind != null && wind > 28) {
            negativeContributors.push(`Gusty wind (${Math.round(wind)} km/h) can cause telescope tripod vibration.`);
            recommendations.push('Set up equipment on the leeward side of an elevated ridge or natural barrier to buffer against wind vibrations.');
        }

        if (recommendations.length === 0) {
            recommendations.push('Optimal celestial conditions present across all telemetry factors. Ideal for long-exposure astrophotography.');
        }

        return { positiveContributors, negativeContributors, recommendations };
    }

    return {
        calculate,
        setWeights,
        getWeights,
        resetWeights,
        subscoreCloudCover,
        subscoreLightPollution,
        subscoreVisibility,
        subscoreHumidity,
        subscoreWind,
        subscoreMoon,
        subscoreLocation,
        getRank,
        getColor
    };
})();

// Export for Node/CommonJS environments if present
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Scoring;
}
