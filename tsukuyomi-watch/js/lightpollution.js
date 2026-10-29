/* ===================================================
   Light Pollution Engine & Astronomical Sky Quality
   Reference:
     - International Dark-Sky Association (Bortle Dark-Sky Scale)
     - NASA EOSDIS GIBS VIIRS Nighttime Lights Composite
     - Sky Quality Meter (SQM mag/arcsec²)
   =================================================== */

const LightPollution = (() => {
    'use strict';

    /**
     * Standard Astronomical Bortle Dark-Sky Scale (1–9)
     */
    const BORTLE_CLASSES = {
        1: {
            title: 'Class 1: Excellent Dark-Sky Site (極闇)',
            short: 'Class 1 (Pristine)',
            desc: 'The zodiacal light, gegenschein, and airglow are visible. M33 galaxy is visible to the naked eye.',
            sqm: '21.7 – 22.0 mag/arcsec²',
            radiance: '< 0.05 nW/cm²·sr',
            penalty: 0
        },
        2: {
            title: 'Class 2: Truly Dark Site (真闇)',
            short: 'Class 2 (Truly Dark)',
            desc: 'Airglow faintly visible along horizon. Summer Milky Way shows intricate structure and dark rifts.',
            sqm: '21.5 – 21.7 mag/arcsec²',
            radiance: '0.05 – 0.20 nW/cm²·sr',
            penalty: 4
        },
        3: {
            title: 'Class 3: Rural Sky (山野)',
            short: 'Class 3 (Rural)',
            desc: 'Some faint light domes along the horizon. Milky Way still appears complex; globular clusters easily seen.',
            sqm: '21.3 – 21.5 mag/arcsec²',
            radiance: '0.20 – 0.50 nW/cm²·sr',
            penalty: 9
        },
        4: {
            title: 'Class 4: Rural / Suburban Transition (郷里)',
            short: 'Class 4 (Rural/Suburban)',
            desc: 'Obvious light domes in multiple directions. Milky Way well above horizon is still impressive.',
            sqm: '20.4 – 21.3 mag/arcsec²',
            radiance: '0.50 – 1.50 nW/cm²·sr',
            penalty: 16
        },
        5: {
            title: 'Class 5: Suburban Sky (市街郊)',
            short: 'Class 5 (Suburban)',
            desc: 'Milky Way is weak or invisible near horizon; artificial light sources wash out deep-sky nebulosity.',
            sqm: '19.1 – 20.4 mag/arcsec²',
            radiance: '1.50 – 4.00 nW/cm²·sr',
            penalty: 24
        },
        6: {
            title: 'Class 6: Bright Suburban Sky (明街)',
            short: 'Class 6 (Bright Suburban)',
            desc: 'Milky Way only faintly discernible near the zenith. Sky background has an artificial greyish glow.',
            sqm: '18.0 – 19.1 mag/arcsec²',
            radiance: '4.00 – 10.0 nW/cm²·sr',
            penalty: 32
        },
        7: {
            title: 'Class 7: Suburban / Urban Transition (都境)',
            short: 'Class 7 (Suburban/Urban)',
            desc: 'Entire sky background has a pale tint. Constellations are faint; telescopes require nebula filters.',
            sqm: '17.0 – 18.0 mag/arcsec²',
            radiance: '10.0 – 25.0 nW/cm²·sr',
            penalty: 40
        },
        8: {
            title: 'Class 8: City Sky (城下町)',
            short: 'Class 8 (City Sky)',
            desc: 'Sky glows orange-white. Only brightest stars, moon, and planets visible; constellations washed out.',
            sqm: '16.0 – 17.0 mag/arcsec²',
            radiance: '25.0 – 60.0 nW/cm²·sr',
            penalty: 48
        },
        9: {
            title: 'Class 9: Inner-City Core (帝都灯火)',
            short: 'Class 9 (Inner City)',
            desc: 'Entire sky brightly illuminated even at zenith. Deep-sky observation is not possible without filters.',
            sqm: '< 16.0 mag/arcsec²',
            radiance: '> 60.0 nW/cm²·sr',
            penalty: 55
        }
    };

    // Major Reference Calibration Coordinates
    const KNOWN_SITES = [
        // Japan
        { lat: 35.3606, lon: 138.7274, bortle: 2.1, radius: 18, name: 'Mount Fuji' },
        { lat: 35.4433, lon: 137.7336, bortle: 1.6, radius: 15, name: 'Achi Village' },
        { lat: 35.9417, lon: 138.4725, bortle: 2.0, radius: 15, name: 'Nobeyama Observatory' },
        { lat: 35.6762, lon: 139.6503, bortle: 8.5, radius: 35, name: 'Tokyo Metropole' },
        { lat: 34.6937, lon: 135.5023, bortle: 8.1, radius: 25, name: 'Osaka' },
        { lat: 35.0116, lon: 135.7681, bortle: 6.8, radius: 20, name: 'Kyoto' },
        // Global Reference Hubs
        { lat: 40.7128, lon: -74.0060, bortle: 9.0, radius: 35, name: 'New York City' },
        { lat: 51.5074, lon: -0.1278, bortle: 8.5, radius: 30, name: 'London' },
        { lat: 48.8566, lon: 2.3522, bortle: 8.5, radius: 25, name: 'Paris' },
        { lat: 28.6139, lon: 77.2090, bortle: 8.9, radius: 35, name: 'Delhi NCR' },
        { lat: 19.0760, lon: 72.8777, bortle: 8.8, radius: 35, name: 'Mumbai' },
        { lat: 19.8206, lon: -155.4681, bortle: 1.0, radius: 25, name: 'Mauna Kea' },
        { lat: -24.6272, lon: -70.4042, bortle: 1.0, radius: 40, name: 'Atacama Desert' }
    ];

    function haversineDist(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    /**
     * Estimates astronomical Bortle scale using geographic tags, proximity, and altitude.
     */
    function estimate(lat, lon, address = {}, elevation = 0) {
        // 1. Direct calibration site check
        for (const site of KNOWN_SITES) {
            const dist = haversineDist(lat, lon, site.lat, site.lon);
            if (dist <= site.radius) {
                const decay = (dist / site.radius) * 1.2;
                const b = Math.max(1, Math.min(9, Math.round(site.bortle + decay * (site.bortle > 5 ? -1 : 1))));
                const info = BORTLE_CLASSES[b];
                return {
                    bortle: b,
                    ...info,
                    isEstimated: false,
                    source: `Calibrated Ground Station (${site.name})`
                };
            }
        }

        // 2. Geographic Tag Heuristic
        const type = (address.type || '').toLowerCase();
        const category = (address.category || '').toLowerCase();
        const city = (address.city || address.town || address.village || address.hamlet || '').toLowerCase();
        const suburb = (address.suburb || address.neighbourhood || '').toLowerCase();
        let b = 5; // Baseline suburban default

        if (type.includes('peak') || type.includes('national_park') || type.includes('nature') || category === 'natural') {
            b = 2;
        } else if (address.hamlet || type.includes('isolated') || type.includes('forest')) {
            b = 3;
        } else if (address.village || address.municipality) {
            b = 4;
        } else if (address.town) {
            b = 5;
        } else if (suburb) {
            b = 6;
        } else if (city) {
            b = 8;
        }

        // Elevation clarity discount (high mountains rise above boundary inversion mist)
        const elev = Number(elevation) || 0;
        if (elev >= 2000) b = Math.max(1, b - 2);
        else if (elev >= 1000) b = Math.max(1, b - 1);

        b = Math.max(1, Math.min(9, Math.round(b)));
        const info = BORTLE_CLASSES[b];

        return {
            bortle: b,
            ...info,
            isEstimated: true,
            source: 'Geographic Terrain & Population Estimation'
        };
    }

    /**
     * NASA VIIRS Nighttime Lights WMS / WMTS Tile Layer Configuration
     * Publicly accessible satellite data showing artificial night lights globally.
     * Clearly labeled as a nighttime radiance proxy for artificial light.
     */
    function getTileLayerConfig() {
        return {
            url: 'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default//GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg',
            options: {
                attribution: '&copy; <a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noopener">NASA EOSDIS GIBS</a> &copy; VIIRS Nighttime Lights (Artificial Radiance Proxy)',
                maxZoom: 8,
                opacity: 0.72,
                zIndex: 10
            },
            disclaimer: 'NASA VIIRS Day/Night Band represents surface artificial nighttime radiance. It serves as an indirect proxy for ground lighting, rather than real-time direct zenith skyglow.'
        };
    }

    return {
        BORTLE_CLASSES,
        estimate,
        getTileLayerConfig
    };
})();
