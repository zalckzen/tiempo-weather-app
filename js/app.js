/**
 * Main Application Module
 * Initializes and coordinates all components
 */

const APP = (function() {
    let currentWeatherData = null;
    let currentRecommendations = null;
    let currentRainAnalyses = null;
    let updateInterval = null;
    // Increased to 30 minutes to avoid rate limiting
    const UPDATE_INTERVAL_MS = 30 * 60 * 1000;

    function getAPI() {
        return (typeof window !== 'undefined' && window.API) || (typeof API !== 'undefined' ? API : null);
    }

    async function init() {
        console.log('[APP] Initializing...');
        UI.initTheme();
        setupEventListeners();
        UI.updateDateTime();
        setInterval(UI.updateDateTime, 1000);
        await loadWeatherData();
        startAutoUpdate();
        console.log('[APP] Initialization complete');
    }

    function setupEventListeners() {
        UI.elements.themeToggle?.addEventListener('click', UI.toggleTheme);
        UI.elements.refreshBtn?.addEventListener('click', handleRefresh);
        UI.elements.errorDismiss?.addEventListener('click', UI.hideError);
        UI.elements.hourlyTab?.addEventListener('click', function() { UI.switchTab('hourly'); });
        UI.elements.dailyTab?.addEventListener('click', function() { UI.switchTab('daily'); });
        UI.elements.chartsTab?.addEventListener('click', function() { UI.switchTab('charts'); });
        UI.elements.hourlyLocation?.addEventListener('change', function(e) { if (currentWeatherData) UI.renderHourlyForecast(currentWeatherData, e.target.value); });
        UI.elements.dailyLocation?.addEventListener('change', function(e) { if (currentWeatherData) UI.renderDailyForecast(currentWeatherData, e.target.value); });
        UI.elements.chartsLocation?.addEventListener('change', function(e) { if (currentWeatherData) UI.renderCharts(currentWeatherData, e.target.value); });
    }

    async function handleRefresh() {
        UI.setRefreshLoading(true);
        await loadWeatherData(true);
        UI.setRefreshLoading(false);
    }

    async function loadWeatherData(forceRefresh = false) {
        console.log('[APP] Loading weather data...');
        UI.setLoading(true);
        UI.hideError();
        try {
            const api = getAPI();
            if (!api) throw new Error('Modul API no disponible. Recarregui la pagina.');
            console.log('[APP] Calling API.fetchAllWeather()...');
            
            let result;
            if (forceRefresh && api.forceRefresh) {
                result = await api.forceRefresh();
            } else {
                result = await api.fetchAllWeather();
            }
            
            const results = result.results;
            const errors = result.errors;
            console.log('[APP] API response:', { results: Object.keys(results), errors });
            
            // If we have cached data but API failed with 429, show cached data with warning
            const hasRateLimitError = Object.values(errors).some(e => e && e.includes('429'));
            
            if (Object.keys(results).length === 0) {
                // Try to get cached data
                const cached = getCachedData();
                if (cached) {
                    console.log('[APP] Using cached data due to API error');
                    Object.assign(results, cached);
                    UI.showError('Mostrant dades en cache (API no disponible temporalment)');
                } else {
                    throw new Error('Error en obtenir dades meteorologiques de totes les ubicacions');
                }
            }
            
            if (Object.keys(errors).length > 0) {
                const errorMessages = Object.entries(errors).map(function(entry) { return entry[0] + ': ' + entry[1]; }).join('; ');
                if (hasRateLimitError) {
                    UI.showError('Limite de peticions API superat. Mostrant dades en cache. Torneu-ho a provar en uns minuts.');
                } else {
                    UI.showError('Dades parcials: ' + errorMessages);
                }
            }
            
            currentWeatherData = results;
            console.log('[APP] Weather data loaded:', Object.keys(currentWeatherData));
            console.log('[APP] Generating clothing recommendations...');
            currentRecommendations = CLOTHING.getAllRecommendations(results);
            console.log('[APP] Recommendations generated:', Object.keys(currentRecommendations));
            console.log('[APP] Generating rain analysis...');
            if (typeof RAIN_ANALYSIS !== 'undefined' && RAIN_ANALYSIS.analyzeAllLocations) {
                currentRainAnalyses = RAIN_ANALYSIS.analyzeAllLocations(results);
                console.log('[APP] Rain analyses generated:', Object.keys(currentRainAnalyses));
            }
            console.log('[APP] Rendering UI...');
            renderAll();
        } catch (error) {
            console.error('[APP] Error loading weather data:', error);
            UI.showError('Error en carregar dades meteorologiques: ' + error.message);
        } finally {
            UI.setLoading(false);
        }
    }

    /**
     * Get cached data from localStorage
     */
    function getCachedData() {
        try {
            const cached = localStorage.getItem('weather_cache');
            if (!cached) return null;
            const parsed = JSON.parse(cached);
            const age = Date.now() - parsed.timestamp;
            // Use cache up to 1 hour old as fallback
            if (age < 60 * 60 * 1000) {
                return parsed.data;
            }
        } catch (e) {
            console.warn('[APP] Cache read error:', e);
        }
        return null;
    }

    function renderAll() {
        console.log('[APP] renderAll() called');
        if (!currentWeatherData || !currentRecommendations) {
            console.warn('[APP] Missing data for renderAll:', { currentWeatherData: !!currentWeatherData, currentRecommendations: !!currentRecommendations });
            return;
        }
        try {
            console.log('[APP] Rendering weather cards...');
            UI.renderWeatherCards(currentWeatherData);
            console.log('[APP] Rendering clothing recommendations...');
            UI.renderClothingRecommendations(currentRecommendations);
            console.log('[APP] Rendering rain analysis...');
            if (currentRainAnalyses) {
                UI.renderRainAnalysis(currentRainAnalyses);
            }
            console.log('[APP] Rendering forecasts...');
            UI.renderHourlyForecast(currentWeatherData, 'comaruga');
            UI.renderDailyForecast(currentWeatherData, 'comaruga');
            UI.renderCharts(currentWeatherData, 'comaruga');
            UI.updateLastUpdated();
            console.log('[APP] All UI rendered successfully');
        } catch (error) {
            console.error('[APP] Error during render:', error);
            UI.showError('Error en renderitzar la interficie: ' + error.message);
        }
    }

    function startAutoUpdate() {
        if (updateInterval) clearInterval(updateInterval);
        updateInterval = setInterval(loadWeatherData, UPDATE_INTERVAL_MS);
    }

    function stopAutoUpdate() {
        if (updateInterval) { clearInterval(updateInterval); updateInterval = null; }
    }

    window.APP = { currentWeatherData: null, currentRecommendations: null, loadWeatherData, init };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

    return { init, loadWeatherData, startAutoUpdate, stopAutoUpdate };
})();
