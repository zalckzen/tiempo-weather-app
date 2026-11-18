/**
 * Weather API Module
 * Uses Open-Meteo API for weather data with caching and retry logic
 */

const API = (function() {
    // Location coordinates
    const LOCATIONS = {
        comaruga: {
            name: 'Coma-ruga',
            lat: 41.1833,
            lon: 1.5667,
            timezone: 'Europe/Madrid',
            type: 'Ciutat natal'
        },
        calafell: {
            name: 'Calafell',
            lat: 41.2000,
            lon: 1.5667,
            timezone: 'Europe/Madrid',
            type: 'Lloc d\'estudis'
        }
    };

    const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
    const CACHE_KEY = 'weather_cache';
    const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour - longer cache to avoid rate limiting

    /**
     * Get cached weather data if valid
     */
    function getCachedData() {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;
            const parsed = JSON.parse(cached);
            const age = Date.now() - parsed.timestamp;
            if (age < CACHE_DURATION_MS) {
                console.log('[API] Using cached data (age:', Math.round(age / 1000 / 60), 'minutes)');
                return parsed.data;
            }
            console.log('[API] Cache expired (age:', Math.round(age / 1000 / 60), 'minutes)');
        } catch (e) {
            console.warn('[API] Cache read error:', e);
        }
        return null;
    }

    /**
     * Save weather data to cache
     */
    function saveCache(data) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                data: data
            }));
            console.log('[API] Data cached');
        } catch (e) {
            console.warn('[API] Cache write error:', e);
        }
    }

    /**
     * Build API URL with parameters
     */
    function buildUrl(location, params = {}) {
        const defaultParams = {
            latitude: location.lat,
            longitude: location.lon,
            timezone: location.timezone,
            current_weather: true,
            hourly: [
                'temperature_2m',
                'relative_humidity_2m',
                'apparent_temperature',
                'precipitation_probability',
                'precipitation',
                'weathercode',
                'windspeed_10m',
                'winddirection_10m',
                'visibility'
            ].join(','),
            daily: [
                'weathercode',
                'temperature_2m_max',
                'temperature_2m_min',
                'apparent_temperature_max',
                'apparent_temperature_min',
                'precipitation_probability_max',
                'precipitation_sum',
                'windspeed_10m_max',
                'winddirection_10m_dominant',
                'uv_index_max'
            ].join(','),
            forecast_days: 7,
            ...params
        };

        const searchParams = new URLSearchParams();
        Object.entries(defaultParams).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => searchParams.append(key, v));
            } else {
                searchParams.append(key, value);
            }
        });

        return BASE_URL + '?' + searchParams.toString();
    }

    /**
     * Sleep utility for retry delays
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Fetch weather data for a location with retry logic
     */
    async function fetchLocationWeather(locationKey, retries = 3) {
        const location = LOCATIONS[locationKey];
        if (!location) throw new Error('Ubicacio desconeguda: ' + locationKey);

        const url = buildUrl(location);
        
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url);
                
                // Handle rate limiting with exponential backoff
                if (response.status === 429) {
                    if (attempt < retries) {
                        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                        console.log('[API] Rate limited (429), retrying in ' + Math.round(delay) + 'ms (attempt ' + (attempt + 1) + '/' + retries + ')');
                        await sleep(delay);
                        continue;
                    }
                    // Last attempt failed - throw error to be caught by caller
                    throw new Error('Error API: 429 Too Many Requests - Limite de peticions superat');
                }
                
                if (!response.ok) {
                    throw new Error('Error API: ' + response.status + ' ' + response.statusText);
                }
                
                const data = await response.json();
                return transformWeatherData(data, location);
            } catch (error) {
                console.error('Error obtenint temps per ' + location.name + ':', error);
                
                // Don't retry on non-429 errors
                if (error.message.includes('429') || attempt < retries) {
                    if (attempt < retries) {
                        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                        await sleep(delay);
                        continue;
                    }
                }
                throw error;
            }
        }
    }

    /**
     * Transform raw API data into usable format
     */
    function transformWeatherData(data, location) {
        const now = new Date();
        const currentHour = now.getHours();
        
        // Current weather from current_weather endpoint
        const current = data.current_weather;
        
        // Find current hour index in hourly data
        const currentHourIndex = data.hourly.time.findIndex(function(t) {
            const hour = new Date(t).getHours();
            const date = new Date(t).toDateString();
            return hour === currentHour && date === now.toDateString();
        });

        const validHourIndex = currentHourIndex >= 0 ? currentHourIndex : 0;

        return {
            location: location,
            current: {
                temperature: current?.temperature ?? data.hourly.temperature_2m[validHourIndex],
                feelsLike: data.hourly.apparent_temperature[validHourIndex],
                windSpeed: current?.windspeed ?? data.hourly.windspeed_10m[validHourIndex],
                windDirection: current?.winddirection ?? data.hourly.winddirection_10m[validHourIndex],
                weatherCode: current?.weathercode ?? data.hourly.weathercode[validHourIndex],
                humidity: data.hourly.relative_humidity_2m[validHourIndex],
                precipitation: data.hourly.precipitation[validHourIndex],
                precipitationProbability: data.hourly.precipitation_probability[validHourIndex],
                visibility: data.hourly.visibility[validHourIndex],
                time: current?.time ?? data.hourly.time[validHourIndex]
            },
            hourly: {
                time: data.hourly.time,
                temperature: data.hourly.temperature_2m,
                feelsLike: data.hourly.apparent_temperature,
                humidity: data.hourly.relative_humidity_2m,
                precipitation: data.hourly.precipitation,
                precipitationProbability: data.hourly.precipitation_probability,
                weatherCode: data.hourly.weathercode,
                windSpeed: data.hourly.windspeed_10m,
                windDirection: data.hourly.winddirection_10m,
                visibility: data.hourly.visibility
            },
            daily: {
                time: data.daily.time,
                weatherCode: data.daily.weathercode,
                tempMax: data.daily.temperature_2m_max,
                tempMin: data.daily.temperature_2m_min,
                feelsLikeMax: data.daily.apparent_temperature_max,
                feelsLikeMin: data.daily.apparent_temperature_min,
                precipitationProbability: data.daily.precipitation_probability_max,
                precipitationSum: data.daily.precipitation_sum,
                windSpeedMax: data.daily.windspeed_10m_max,
                windDirectionDominant: data.daily.winddirection_10m_dominant,
                uvIndexMax: data.daily.uv_index_max
            }
        };
    }

    /**
     * Fetch weather for all locations with caching
     */
    async function fetchAllWeather() {
        // First check cache
        const cached = getCachedData();
        if (cached) {
            console.log('[API] Returning cached weather data');
            return { results: cached, errors: {} };
        }

        const results = {};
        const errors = {};

        await Promise.all(
            Object.keys(LOCATIONS).map(async (key) => {
                try {
                    results[key] = await fetchLocationWeather(key);
                } catch (error) {
                    errors[key] = error.message;
                }
            })
        );

        // Only cache if we got at least one successful result
        if (Object.keys(results).length > 0) {
            saveCache(results);
        }

        return { results, errors };
    }

    /**
     * Force refresh (bypass cache)
     */
    async function forceRefresh() {
        localStorage.removeItem(CACHE_KEY);
        return fetchAllWeather();
    }

    /**
     * Get location info
     */
    function getLocationInfo(key) {
        return LOCATIONS[key];
    }

    /**
     * Get all locations
     */
    function getAllLocations() {
        return LOCATIONS;
    }

    // Public API
    const publicAPI = {
        fetchAllWeather,
        fetchLocationWeather,
        forceRefresh,
        getLocationInfo,
        getAllLocations,
        LOCATIONS
    };

    // Explicitly expose on window for cross-script compatibility
    if (typeof window !== 'undefined') {
        window.API = publicAPI;
    }

    return publicAPI;
})();
