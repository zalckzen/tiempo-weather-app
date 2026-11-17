/**
 * Weather API Module
 * Uses Open-Meteo API for weather data
 */

const API = (function() {
    // Location coordinates
    const LOCATIONS = {
        comaruga: {
            name: "Coma-ruga",
            lat: 41.1833,
            lon: 1.5667,
            timezone: "Europe/Madrid",
            type: "Ciutat natal"
        },
        calafell: {
            name: "Calafell",
            lat: 41.2000,
            lon: 1.5667,
            timezone: "Europe/Madrid",
            type: "Lloc d'""'estudis"
        }
    };

    const BASE_URL = "https://api.open-meteo.com/v1/forecast";

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
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "precipitation_probability",
                "precipitation",
                "weathercode",
                "windspeed_10m",
                "winddirection_10m",
                "visibility"
            ].join(","),
            daily: [
                "weathercode",
                "temperature_2m_max",
                "temperature_2m_min",
                "apparent_temperature_max",
                "apparent_temperature_min",
                "precipitation_probability_max",
                "precipitation_sum",
                "windspeed_10m_max",
                "winddirection_10m_dominant",
                "uv_index_max"
            ].join(","),
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

        return `${BASE_URL}?${searchParams.toString()}`;
    }

    /**
     * Fetch weather data for a location
     */
    async function fetchLocationWeather(locationKey) {
        const location = LOCATIONS[locationKey];
        if (!location) throw new Error(`Ubicació desconeguda: ${locationKey}`);

        const url = buildUrl(location);
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error API: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return transformWeatherData(data, location);
        } catch (error) {
            console.error(`Error obtenint temps per ${location.name}:`, error);
            throw error;
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
        const currentHourIndex = data.hourly.time.findIndex(t => {
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
     * Fetch weather for all locations
     */
    async function fetchAllWeather() {
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

        return { results, errors };
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
        getLocationInfo,
        getAllLocations,
        LOCATIONS
    };

    // Explicitly expose on window for cross-script compatibility
    if (typeof window !== "undefined") {
        window.API = publicAPI;
    }

    return publicAPI;
})();