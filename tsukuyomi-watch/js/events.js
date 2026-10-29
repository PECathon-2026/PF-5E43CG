/* ===================================================
   Celestial Events & Stargazing Gatherings Engine
   Features:
     - Rich dataset of upcoming astronomical phenomena
     - Meteor Showers, Planetary Alignments, ISS Passes,
       Deep-Sky Windows & Public Star Parties
     - Dynamic geographic anchoring to local dark-sky sanctuaries
     - Filterable and synchronized with Leaflet Scroll Map
   =================================================== */

const CelestialEvents = (() => {
    'use strict';

    /**
     * Master Astronomical Events Templates
     * Formatted with realistic astronomical dates, peak hours, and observing parameters.
     */
    const CELESTIAL_EVENT_TEMPLATES = [
        {
            key: 'orionids-meteor',
            title: 'Orionids & Taurids Fireball Crossing',
            type: 'meteor',
            typeLabel: 'Meteor Shower Gathering',
            category: 'event',
            badge: '☄️ Active Tonight',
            icon: 'meteor',
            dateText: 'Tonight & Tomorrow Night',
            timeWindow: '22:30 – 03:45 Local Time',
            optimalSkyAzimuth: 'East-Southeast (Radiant near Orion constellation)',
            radiantRate: '20 – 35 meteors / hour',
            gearRecommended: 'Naked Eye / Wide-Field Tripod Camera',
            description: 'Debris stream from Halley’s Comet colliding with upper atmosphere. Fast meteors with persistent glowing dust trains and occasional bright green-gold fireballs.',
            astronomyTip: 'Lie flat on a reclining ground mat facing East-Southeast away from artificial glare for maximum field of view.',
            offsetLat: 0.16,
            offsetLon: -0.14,
            elevBonus: 320
        },
        {
            key: 'jupiter-opposition',
            title: 'Jupiter & Galilean Moon Transit',
            type: 'planet',
            typeLabel: 'Planetary Opposition Viewpoint',
            category: 'event',
            badge: '🪐 Prime Viewing',
            icon: 'planet',
            dateText: 'Tonight from 20:00 to 04:00',
            timeWindow: 'Peak Transit at 00:15 Midnight',
            optimalSkyAzimuth: 'South-Southeast (High elevation 58°)',
            radiantRate: 'Apparent Magnitude -2.8 (Brilliant)',
            gearRecommended: 'Binoculars 10×50 or 70mm+ Telescope',
            description: 'Jupiter reaches prime nocturnal elevation. Four Galilean moons (Io, Europa, Ganymede, Callisto) clearly visible in alignment with prominent Jovian equatorial cloud belts.',
            astronomyTip: 'Use 60× to 120× magnification to resolve shadow transits of Io across the Great Red Spot.',
            offsetLat: -0.19,
            offsetLon: 0.22,
            elevBonus: 280
        },
        {
            key: 'iss-overhead-pass',
            title: 'International Space Station (ISS) Zenith Flyover',
            type: 'satellite',
            typeLabel: 'Orbital Flyover Watchpoint',
            category: 'event',
            badge: '🛰️ Scheduled Flyover',
            icon: 'satellite',
            dateText: 'Tonight at 21:14 Local Time',
            timeWindow: '21:14:20 – 21:19:50 (5m 30s Duration)',
            optimalSkyAzimuth: 'Southwest to Northeast (Peak 78° Altitude)',
            radiantRate: 'Max Brightness: Mag -3.4 (Exceeds Venus)',
            gearRecommended: 'Naked Eye (Track movement smoothly across constellations)',
            description: 'The ISS passes directly overhead reflecting bright sunlight. Visible as an intense steady brilliant white-gold star moving silently across the zenith.',
            astronomyTip: 'Start scanning the Southwest horizon 60 seconds before pass time. Long exposure cameras (15-30s) can capture stunning orbital streak trails.',
            offsetLat: 0.09,
            offsetLon: 0.28,
            elevBonus: 190
        },
        {
            key: 'deepsky-messier-marathon',
            title: 'Tsukuyomi Deep-Sky Window: Orion (M42) & Andromeda (M31)',
            type: 'deepsky',
            typeLabel: 'Deep Space Astrophotography Post',
            category: 'event',
            badge: '🌌 Dark Sky Window',
            icon: 'star',
            dateText: 'Nocturnal Window: 23:00 – 04:00',
            timeWindow: 'Optimal Sky Darkness: 00:30 – 03:30',
            optimalSkyAzimuth: 'East (Orion Nebula) & Overhead (Andromeda Galaxy)',
            radiantRate: 'Bortle Class 2-3 Dark Sky Zone Required',
            gearRecommended: 'Telescope 100mm+ / DSLR Tracker Rig',
            description: 'Nocturnal window with zero moonlight interference, providing ideal conditions for imaging the Great Orion Nebula (M42), Pleiades (M45), and the spiral arms of Andromeda (M31).',
            astronomyTip: 'Allow 20 minutes for human eyes to adjust to complete night vision; use only faint red illumination.',
            offsetLat: 0.28,
            offsetLon: -0.22,
            elevBonus: 480
        },
        {
            key: 'saturn-ring-observation',
            title: 'Saturn Ring-Plane Horizon Watch',
            type: 'planet',
            typeLabel: 'Planetary Observatory Post',
            category: 'event',
            badge: '🪐 Dusk Horizon Event',
            icon: 'planet',
            dateText: 'Evening Dusk from 19:30 to 23:30',
            timeWindow: 'Best Seeing: 20:15 – 21:45',
            optimalSkyAzimuth: 'South-Southwest (Elevation 38°)',
            radiantRate: 'Apparent Magnitude +0.6',
            gearRecommended: 'Telescope 90mm+ with 9mm Eyepiece',
            description: 'Saturn visible with its majestic ring system tilted at a shallow angle. Distinct Cassini division and the bright moon Titan easily distinguishable.',
            astronomyTip: 'Observe immediately after astronomical twilight before the planet dips into dense boundary atmosphere.',
            offsetLat: -0.26,
            offsetLon: -0.15,
            elevBonus: 240
        },
        {
            key: 'public-star-party',
            title: 'Tsukuyomi Celestial Gathering & Telescope Star Party',
            type: 'starparty',
            typeLabel: 'Community Stargazing Meetup',
            category: 'event',
            badge: '🔭 Star Gathering',
            icon: 'starparty',
            dateText: 'This Weekend (Saturday 20:00 – 01:00)',
            timeWindow: 'Gate Access: 19:30 | Guided Sky Tour: 21:00',
            optimalSkyAzimuth: '360° Unobstructed Horizon Vantage',
            radiantRate: 'Community Event & Shared High-End Dobsonian Telescopes',
            gearRecommended: 'Warm Layers, Red Flashlight, Stargazing Chair',
            description: 'Public community stargazing gathering hosted at an elevated scenic nature sanctuary. Featuring guided laser constellation tours, deep-sky telescope viewing, and astrophotography assistance.',
            astronomyTip: 'Bring warm thermals and hot tea in a thermos; mountain night temperatures drop 5–8°C below valley levels.',
            offsetLat: 0.12,
            offsetLon: 0.18,
            elevBonus: 360
        },
        {
            key: 'geminids-early-surge',
            title: 'Geminids Celestial Starlight Surge',
            type: 'meteor',
            typeLabel: 'Major Meteor Shower Vista',
            category: 'event',
            badge: '☄️ Upcoming Fireball Shower',
            icon: 'meteor',
            dateText: 'Upcoming Major Peak Stream',
            timeWindow: 'Active Midnight to Dawn (01:00 – 05:00)',
            optimalSkyAzimuth: 'Northeast near Gemini Constellation (Castor & Pollux)',
            radiantRate: 'Up to 120 meteors / hour at peak',
            gearRecommended: 'Naked Eye / Wide-Angle Lens on Intervalometer',
            description: 'The king of meteor showers originating from asteroid 3200 Phaethon. Famous for multi-colored meteors (white, yellow, green) moving at moderate speeds with intense terminal bursts.',
            astronomyTip: 'The Geminids reward patient observers; radiant rises high in the sky after midnight offering multi-directional viewing.',
            offsetLat: -0.15,
            offsetLon: 0.32,
            elevBonus: 410
        },
        {
            key: 'moon-venus-conjunction',
            title: 'Slender Crescent Moon & Venus Twilight Conjunction',
            type: 'planet',
            typeLabel: 'Dawn Celestial Alignment',
            category: 'event',
            badge: '🌘 Dawn Spectacle',
            icon: 'planet',
            dateText: 'Upcoming Dawn Twilight (05:00 – 06:15)',
            timeWindow: 'Best Contrast: 05:25 – 05:50 (Pre-Dawn)',
            optimalSkyAzimuth: 'East-Southeast low horizon (15° to 25°)',
            radiantRate: 'Venus at Mag -4.2 with 12% Crescent Moon',
            gearRecommended: 'Naked Eye / Binoculars / Telephoto Camera (70-200mm)',
            description: 'A breathtaking celestial pair in the eastern morning twilight. The razor-thin crescent moon hangs mere degrees from dazzling Venus, accompanied by faint earthshine illuminating the unlit lunar surface.',
            astronomyTip: 'Find an elevated eastern horizon free of trees and buildings for clean dawn photography.',
            offsetLat: 0.24,
            offsetLon: 0.06,
            elevBonus: 290
        }
    ];

    /**
     * Generate local events anchored to nearby coordinates
     */
    function generateNearbyEvents(centerLat, centerLon, baseSpots = []) {
        const events = [];

        CELESTIAL_EVENT_TEMPLATES.forEach((tmpl, idx) => {
            // Anchor either to an existing real nearby spot or calculated regional vantage
            let eventLat, eventLon, spotName, spotElev;

            if (baseSpots.length > idx && baseSpots[idx]) {
                const s = baseSpots[idx];
                eventLat = s.lat;
                eventLon = s.lon;
                spotName = s.name;
                spotElev = s.weather ? s.weather.elevation : 350;
            } else {
                eventLat = Number((centerLat + tmpl.offsetLat).toFixed(4));
                eventLon = Number((centerLon + tmpl.offsetLon).toFixed(4));
                spotName = `Observation Bastion: ${tmpl.title.split(' ')[0]} Sanctuary`;
                spotElev = 300 + tmpl.elevBonus;
            }

            const dist = calculateDistance(centerLat, centerLon, eventLat, eventLon);

            events.push({
                id: `event-${tmpl.key}-${idx}`,
                key: tmpl.key,
                name: tmpl.title,
                fullName: `${tmpl.title} @ ${spotName}`,
                type: tmpl.type,
                typeLabel: tmpl.typeLabel,
                category: 'event',
                badge: tmpl.badge,
                iconType: tmpl.icon,
                dateText: tmpl.dateText,
                timeWindow: tmpl.timeWindow,
                optimalSkyAzimuth: tmpl.optimalSkyAzimuth,
                radiantRate: tmpl.radiantRate,
                gearRecommended: tmpl.gearRecommended,
                description: tmpl.description,
                astronomyTip: tmpl.astronomyTip,
                hostLocation: spotName,
                lat: eventLat,
                lon: eventLon,
                distance: dist,
                elevBoost: tmpl.elevBonus,
                isEvent: true
            });
        });

        return events;
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    return {
        getTemplates: () => CELESTIAL_EVENT_TEMPLATES,
        generateNearbyEvents
    };
})();

