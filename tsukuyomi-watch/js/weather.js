/* ===================================================
   Weather API Engine (Open-Meteo — High Resolution Telemetry)
   Reference: https://open-meteo.com/
   Provides:
     - Real-time Atmospheric Telemetry
     - 24-Hour Forecast Projections
     - Calculation of "Best Stargazing Window Tonight"
   =================================================== */

const WeatherAPI = (() => {
    'use strict';

    const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

    // Standard WMO 4501 Interpretation Codes
    const WMO_CODES = {
        0: 'Clear sky (澄天)',
        1: 'Mainly clear (晴朗)',
        2: 'Partly cloudy (半雲)',
        3: 'Overcast (雲天)',
        45: 'Fog (霧中)',
        48: 'Depositing rime fog (樹氷)',
        51: 'Light drizzle (小雨)',
        53: 'Moderate drizzle (雨)',
        55: 'Dense drizzle (細雨)',
        56: 'Light freezing drizzle (着氷性小雨)',
        57: 'Dense freezing drizzle (着氷性雨)',
        61: 'Slight rain (微雨)',
        63: 'Moderate rain (降雨)',
        65: 'Heavy rain (豪雨)',
        71: 'Slight snow (小雪)',
        73: 'Moderate snow (降雪)',
        75: 'Heavy snow (大雪)',
        80: 'Rain showers (驟雨)',
        85: 'Snow showers (驟雪)',
        95: 'Thunderstorm (雷雨)'
    };

    function decodeWmo(code) {
        return WMO_CODES[code] || `Code ${code}`;
    }

    /**
     * Fetches current atmospheric observation and 24-hour forecast data
     */
    async function fetchCurrent(lat, lon) {
        const params = new URLSearchParams({
            latitude: Number(lat).toFixed(4),
            longitude: Number(lon).toFixed(4),
            current: 'cloud_cover,relative_humidity_2m,visibility,temperature_2m,wind_speed_10m,precipitation,dew_point_2m,weather_code,is_day',
            hourly: 'cloud_cover,visibility,relative_humidity_2m,wind_speed_10m',
            forecast_hours: '24',
            timezone: 'auto'
        });

        const url = `${BASE_URL}?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Open-Meteo telemetry error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const cur = data.current || {};
        const hourly = data.hourly || {};

        // Calculate best viewing window tonight from hourly forecast
        const bestWindow = calculateBestViewingWindow(hourly);

        return {
            latitude: data.latitude,
            longitude: data.longitude,
            elevation: data.elevation != null ? Math.round(data.elevation) : null,
            timezone: data.timezone,
            time: cur.time,
            cloud_cover: cur.cloud_cover != null ? cur.cloud_cover : 0,
            cloudCover: cur.cloud_cover != null ? cur.cloud_cover : 0,
            humidity: cur.relative_humidity_2m != null ? cur.relative_humidity_2m : 50,
            visibility: cur.visibility != null ? cur.visibility : 24000,
            temperature: cur.temperature_2m != null ? cur.temperature_2m : 15,
            wind_speed: cur.wind_speed_10m != null ? cur.wind_speed_10m : 5,
            windSpeed: cur.wind_speed_10m != null ? cur.wind_speed_10m : 5,
            precipitation: cur.precipitation != null ? cur.precipitation : 0,
            dew_point: cur.dew_point_2m != null ? cur.dew_point_2m : 10,
            weather_code: cur.weather_code != null ? cur.weather_code : 0,
            weather_desc: decodeWmo(cur.weather_code),
            is_day: cur.is_day === 1,
            is_night: cur.is_day === 0,
            hourly: hourly,
            bestWindow: bestWindow,
            isForecast: false,
            timestamp: cur.time || new Date().toISOString()
        };
    }

    /**
     * Identifies the optimal nocturnal observation window (typically 9PM - 4AM)
     */
    function calculateBestViewingWindow(hourly) {
        if (!hourly || !hourly.time || !hourly.cloud_cover) {
            return { windowText: 'Tonight 10:00 PM - 02:00 AM', avgCloud: 20, recommendation: 'Consistent clarity expected.' };
        }

        const times = hourly.time;
        const clouds = hourly.cloud_cover;
        let minCloud = 100;
        let bestIndex = 0;

        for (let i = 0; i < Math.min(times.length, 24); i++) {
            const hourDate = new Date(times[i]);
            const hour = hourDate.getHours();
            // Filter nocturnal hours (8PM to 5AM)
            if (hour >= 20 || hour <= 5) {
                if (clouds[i] < minCloud) {
                    minCloud = clouds[i];
                    bestIndex = i;
                }
            }
        }

        if (bestIndex >= 0 && times[bestIndex]) {
            const bestDate = new Date(times[bestIndex]);
            const hourStr = bestDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return {
                windowText: `Prime clarity at ${hourStr} (${minCloud}% Cloud Cover)`,
                bestHour: hourStr,
                minCloud: minCloud,
                recommendation: minCloud <= 25 ? 'Excellent nocturnal viewing window.' : 'Partially overcast; track gap openings.'
            };
        }

        return { windowText: 'Late Evening Window', minCloud: 30, recommendation: 'Monitor local cloud movement.' };
    }

    return {
        fetchCurrent,
        decodeWmo
    };
})();
