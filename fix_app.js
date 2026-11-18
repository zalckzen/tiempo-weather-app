
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
        console.log("[APP] Initializing...");
        
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
        
        console.log("[APP] Initialization complete");
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
        console.log("[APP] Loading weather data...");
        UI.setLoading(true);
        UI.hideError();
        
        try {
            const api = getAPI();
            if (!api) {
                throw new Error("Mòdul API no disponible. Recarregui la pàgina.");
            }
            
            console.log("[APP] Calling API.fetchAllWeather()...");
            const { results, errors } = await api.fetchAllWeather();
            console.log("[APP] API response:", { results: Object.keys(results), errors });
            
            if (Object.keys(results).length === 0) {
                throw new Error("Error en obtenir dades meteorològiques de totes les ubicacions");
            }
            
            // Show any partial errors
            if (Object.keys(errors).length > 0) {
                const errorMessages = Object.entries(errors).map(([loc, err]) => `${loc}: ${err}`).join("; ");
                UI.showError(`Dades parcials: ${errorMessages}`);
            }
            
            currentWeatherData = results;
            console.log("[APP] Weather data loaded:", Object.keys(currentWeatherData));
            
            // Generate clothing recommendations
            console.log("[APP] Generating clothing recommendations...");
            currentRecommendations = CLOTHING.getAllRecommendations(results);
            console.log("[APP] Recommendations generated:", Object.keys(currentRecommendations));
            
            // Render all UI components
            console.log("[APP] Rendering UI...");
            renderAll();
            
        } catch (error) {
            console.error("[APP] Error loading weather data:", error);
            UI.showError(`Error en carregar dades meteorològiques: ${error.message}`);
        } finally {
            UI.setLoading(false);
        }
    }

    /**
     * Render all UI components
     */
    function renderAll() {
        console.log("[APP] renderAll() called");
        if (!currentWeatherData || !currentRecommendations) {
            console.warn("[APP] Missing data for renderAll:", { currentWeatherData: !!currentWeatherData, currentRecommendations: !!currentRecommendations });
            return;
        }
        
        try {
            console.log("[APP] Rendering weather cards...");
            UI.renderWeatherCards(currentWeatherData);
            
            console.log("[APP] Rendering clothing recommendations...");
            UI.renderClothingRecommendations(currentRecommendations);
            
            // Render forecasts for default location (comaruga)
            console.log("[APP] Rendering forecasts...");
            UI.renderHourlyForecast(currentWeatherData, "comaruga");
            UI.renderDailyForecast(currentWeatherData, "comaruga");
            UI.renderCharts(currentWeatherData, "comaruga");
            
            UI.updateLastUpdated();
            console.log("[APP] All UI rendered successfully");
        } catch (error) {
            console.error("[APP] Error during render:", error);
            UI.showError(`Error en renderitzar la interfície: ${error.message}`);
        }
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
