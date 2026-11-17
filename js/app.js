@"
/**
 * Main Application Module
 * Initializes and coordinates all components
 */

const APP = (function() {
    let currentWeatherData = null;
    let currentRecommendations = null;
    let updateInterval = null;
    const UPDATE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

    /**
     * Get API instance (handles both window.API and global API)
     */
    function getAPI() {
        return (typeof window !== "undefined" && window.API) || (typeof API !== "undefined" ? API : null);
    }

    /**
     * Initialize the application
     */
    async function init() {
        // Initialize theme
        UI.initTheme();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initial date/time
        UI.updateDateTime();
        setInterval(UI.updateDateTime, 1000);
        
        // Load initial weather data
        await loadWeatherData();
        
        // Start auto-update interval
        startAutoUpdate();
    }

    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Theme toggle
        UI.elements.themeToggle?.addEventListener("click", UI.toggleTheme);
        
        // Refresh button
        UI.elements.refreshBtn?.addEventListener("click", handleRefresh);
        
        // Error dismiss
        UI.elements.errorDismiss?.addEventListener("click", UI.hideError);
        
        // Forecast tabs
        UI.elements.hourlyTab?.addEventListener("click", () => UI.switchTab("hourly"));
        UI.elements.dailyTab?.addEventListener("click", () => UI.switchTab("daily"));
        UI.elements.chartsTab?.addEventListener("click", () => UI.switchTab("charts"));
        
        // Location selectors
        UI.elements.hourlyLocation?.addEventListener("change", (e) => {
            if (currentWeatherData) {
                UI.renderHourlyForecast(currentWeatherData, e.target.value);
            }
        });
        
        UI.elements.dailyLocation?.addEventListener("change", (e) => {
            if (currentWeatherData) {
                UI.renderDailyForecast(currentWeatherData, e.target.value);
            }
        });
        
        UI.elements.chartsLocation?.addEventListener("change", (e) => {
            if (currentWeatherData) {
                UI.renderCharts(currentWeatherData, e.target.value);
            }
        });
    }

    /**
     * Handle refresh button click
     */
    async function handleRefresh() {
        UI.setRefreshLoading(true);
        await loadWeatherData();
        UI.setRefreshLoading(false);
    }

    /**
     * Load weather data from API
     */
    async function loadWeatherData() {
        UI.setLoading(true);
        UI.hideError();
        
        try {
            const api = getAPI();
            if (!api) {
                throw new Error("Mòdul API no disponible. Recarregui la pàgina.");
            }
            
            const { results, errors } = await api.fetchAllWeather();
            
            if (Object.keys(results).length === 0) {
                throw new Error("Error en obtenir dades meteorològiques de totes les ubicacions");
            }
            
            // Show any partial errors
            if (Object.keys(errors).length > 0) {
                const errorMessages = Object.entries(errors).map(([loc, err]) => `${loc}: ${err}`).join("; ");
                UI.showError(`Dades parcials: ${errorMessages}`);
            }
            
            currentWeatherData = results;
            
            // Generate clothing recommendations
            currentRecommendations = CLOTHING.getAllRecommendations(results);
            
            // Render all UI components
            renderAll();
            
        } catch (error) {
            console.error("Error loading weather data:", error);
            UI.showError(`Error en carregar dades meteorològiques: ${error.message}`);
        } finally {
            UI.setLoading(false);
        }
    }

    /**
     * Render all UI components
     */
    function renderAll() {
        if (!currentWeatherData || !currentRecommendations) return;
        
        UI.renderWeatherCards(currentWeatherData);
        UI.renderClothingRecommendations(currentRecommendations);
        
        // Render forecasts for default location (comaruga)
        UI.renderHourlyForecast(currentWeatherData, "comaruga");
        UI.renderDailyForecast(currentWeatherData, "comaruga");
        UI.renderCharts(currentWeatherData, "comaruga");
        
        UI.updateLastUpdated();
    }

    /**
     * Start auto-update interval
     */
    function startAutoUpdate() {
        if (updateInterval) clearInterval(updateInterval);
        updateInterval = setInterval(loadWeatherData, UPDATE_INTERVAL_MS);
    }

    /**
     * Stop auto-update interval
     */
    function stopAutoUpdate() {
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
    }

    // Expose for debugging
    window.APP = {
        currentWeatherData: null,
        currentRecommendations: null,
        loadWeatherData,
        init
    };

    // Initialize when DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    // Public API
    return {
        init,
        loadWeatherData,
        startAutoUpdate,
        stopAutoUpdate
    };
})();
"@
