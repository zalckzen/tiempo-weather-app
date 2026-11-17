/**
 * UI Rendering Module
 * Handles all DOM updates and rendering
 */

const UI = (function() {
    // Cache DOM elements
    const elements = {};
    
    function cacheElements() {
        elements.loadingOverlay = document.getElementById("loadingOverlay");
        elements.errorBanner = document.getElementById("errorBanner");
        elements.errorMessage = document.getElementById("errorMessage");
        elements.errorDismiss = document.getElementById("errorDismiss");
        elements.weatherGrid = document.getElementById("weatherGrid");
        elements.clothingGrid = document.getElementById("clothingGrid");
        elements.hourlyScroll = document.getElementById("hourlyScroll");
        elements.dailyGrid = document.getElementById("dailyGrid");
        elements.currentDate = document.getElementById("currentDate");
        elements.currentTime = document.getElementById("currentTime");
        elements.lastUpdated = document.getElementById("lastUpdated");
        elements.refreshBtn = document.getElementById("refreshBtn");
        elements.themeToggle = document.getElementById("themeToggle");
        elements.hourlyLocation = document.getElementById("hourlyLocation");
        elements.dailyLocation = document.getElementById("dailyLocation");
        elements.chartsLocation = document.getElementById("chartsLocation");
        elements.hourlyTab = document.getElementById("hourlyTab");
        elements.dailyTab = document.getElementById("dailyTab");
        elements.chartsTab = document.getElementById("chartsTab");
        elements.hourlyPanel = document.getElementById("hourlyPanel");
        elements.dailyPanel = document.getElementById("dailyPanel");
        elements.chartsPanel = document.getElementById("chartsPanel");
    }

    // Initialize on DOM ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", cacheElements);
    } else {
        cacheElements();
    }

    /**
     * Show/hide loading overlay
     */
    function setLoading(show) {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.classList.toggle("visible", show);
        }
    }

    /**
     * Show error banner
     */
    function showError(message) {
        if (elements.errorBanner && elements.errorMessage) {
            elements.errorMessage.textContent = message;
            elements.errorBanner.classList.add("visible");
        }
    }

    /**
     * Hide error banner
     */
    function hideError() {
        if (elements.errorBanner) {
            elements.errorBanner.classList.remove("visible");
        }
    }

    /**
     * Update current date/time - Catalan locale
     */
    function updateDateTime() {
        const now = new Date();
        const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
        
        if (elements.currentDate) {
            elements.currentDate.textContent = now.toLocaleDateString("ca-ES", options);
        }
        if (elements.currentTime) {
            elements.currentTime.textContent = now.toLocaleTimeString("ca-ES", { 
                hour: "2-digit", 
                minute: "2-digit",
                hour12: false 
            });
        }
    }

    /**
     * Update last updated timestamp
     */
    function updateLastUpdated() {
        if (elements.lastUpdated) {
            const now = new Date();
            elements.lastUpdated.textContent = now.toLocaleTimeString("ca-ES", { 
                hour: "2-digit", 
                minute: "2-digit",
                hour12: false 
            });
        }
    }

    /**
     * Set refresh button loading state
     */
    function setRefreshLoading(loading) {
        if (elements.refreshBtn) {
            elements.refreshBtn.classList.toggle("loading", loading);
            elements.refreshBtn.disabled = loading;
        }
    }

    /**
     * Render weather cards
     */
    function renderWeatherCards(weatherData) {
        if (!elements.weatherGrid) return;
        
        elements.weatherGrid.innerHTML = "";
        
        Object.entries(weatherData).forEach(([key, data]) => {
            if (!data) return;
            
            const card = createWeatherCard(key, data);
            elements.weatherGrid.appendChild(card);
        });
    }

    /**
     * Create a single weather card
     */
    function createWeatherCard(key, data) {
        const card = document.createElement("div");
        card.className = `weather-card ${key}`;
        
        const current = data.current;
        const location = data.location;
        const weatherInfo = CLOTHING.getWeatherInfo(current.weatherCode);
        const windInfo = CLOTHING.getWindInfo(current.windSpeed, current.windDirection);
        
        card.innerHTML = `
            <div class="card-header">
                <div class="location-info">
                    <div class="location-icon">
                        ${CLOTHING.ICONS.location}
                    </div>
                    <div class="location-details">
                        <h3>${location.name}</h3>
                        <span class="location-type">${location.type}</span>
                    </div>
                </div>
                <div class="current-temp">
                    <span class="temp-value">${Math.round(current.temperature)}</span>
                    <span class="temp-unit">°C</span>
                </div>
            </div>
            <div class="card-body">
                <div class="weather-metric">
                    <div class="metric-label">Sensació tèrmica</div>
                    <div class="metric-value">${Math.round(current.feelsLike)}°C</div>
                </div>
                <div class="weather-metric">
                    <div class="metric-label">Humitat</div>
                    <div class="metric-value">
                        ${CLOTHING.ICONS["cloud-drizzle"]}
                        ${Math.round(current.humidity)}%
                    </div>
                </div>
                <div class="weather-metric">
                    <div class="metric-label">Vent</div>
                    <div class="metric-value">
                        ${Math.round(current.windSpeed)} km/h ${windInfo.direction}
                    </div>
                </div>
                <div class="weather-metric">
                    <div class="metric-label">Prob. pluja</div>
                    <div class="metric-value">
                        ${current.precipitationProbability > 0 ? CLOTHING.ICONS.umbrella : CLOTHING.ICONS.sun}
                        ${Math.round(current.precipitationProbability)}%
                    </div>
                </div>
                <div class="weather-condition">
                    <div class="condition-icon">
                        ${CLOTHING.ICONS[weatherInfo.icon] || CLOTHING.ICONS.cloud}
                    </div>
                    <div class="condition-text">
                        <div class="condition-main">${weatherInfo.main}</div>
                        <div class="condition-desc">${weatherInfo.desc}</div>
                    </div>
                </div>
            </div>
        `;
        
        return card;
    }

    /**
     * Render clothing recommendations
     */
    function renderClothingRecommendations(recommendations) {
        if (!elements.clothingGrid) return;
        
        elements.clothingGrid.innerHTML = "";
        
        Object.entries(recommendations).forEach(([key, data]) => {
            if (!data) return;
            
            const card = createClothingCard(key, data);
            elements.clothingGrid.appendChild(card);
        });
    }

    /**
     * Create a single clothing card
     */
    function createClothingCard(key, data) {
        const card = document.createElement("div");
        card.className = `clothing-card ${key}`;
        
        const { recommendations, current, reasons } = data;
        const location = data.location;
        
        const items = [
            { ...recommendations.outerwear, category: "Roba exterior" },
            { ...recommendations.top, category: "Part superior" },
            { ...recommendations.bottom, category: "Part inferior" },
            { ...recommendations.rainGear, category: "Equip de pluja" },
            ...recommendations.accessories.map(a => ({ ...a, category: "Accessoris" }))
        ].filter(item => item.status !== "not-needed" || item.category === "Equip de pluja");
        
        // Status text in Catalan
        const getStatusText = (status) => {
            switch (status) {
                case "recommended": return "Recomanat";
                case "optional": return "Opcional";
                case "not-needed": return "No cal";
                default: return status;
            }
        };
        
        card.innerHTML = `
            <div class="clothing-header">
                <div class="location-info">
                    <div class="location-icon" style="background: ${key === "comaruga" ? "var(--accent-light)" : "rgba(139, 92, 246, 0.2)"}; color: ${key === "comaruga" ? "var(--accent)" : "#8b5cf6"};">
                        ${CLOTHING.ICONS.location}
                    </div>
                    <div class="location-details">
                        <h3>${location.name}</h3>
                        <span class="location-type">${location.type}</span>
                    </div>
                </div>
                <span class="clothing-badge">${current.weatherMain}</span>
            </div>
            <div class="clothing-items">
                ${items.map(item => `
                    <div class="clothing-item">
                        <div class="clothing-icon">
                            ${CLOTHING.ICONS[item.icon] || CLOTHING.ICONS.tshirt}
                        </div>
                        <div class="clothing-text">
                            <span class="item-name">${item.name}</span>
                            <span class="item-reason">${item.reason || ""}</span>
                        </div>
                        <span class="clothing-status ${item.status}">${getStatusText(item.status)}</span>
                    </div>
                `).join("")}
            </div>
        `;
        
        return card;
    }

    /**
     * Render hourly forecast
     */
    function renderHourlyForecast(weatherData, locationKey) {
        if (!elements.hourlyScroll) return;
        
        const data = weatherData[locationKey];
        if (!data) return;
        
        const now = new Date();
        const currentHour = now.getHours();
        
        elements.hourlyScroll.innerHTML = "";
        
        // Show next 24 hours
        for (let i = 0; i < 24; i++) {
            const hourIndex = i;
            if (hourIndex >= data.hourly.time.length) break;
            
            const timeStr = data.hourly.time[hourIndex];
            const hour = new Date(timeStr).getHours();
            const isCurrent = hour === currentHour && new Date(timeStr).toDateString() === now.toDateString();
            
            const weatherInfo = CLOTHING.getWeatherInfo(data.hourly.weatherCode[hourIndex]);
            
            const item = document.createElement("div");
            item.className = `hourly-item ${isCurrent ? "current" : ""}`;
            item.innerHTML = `
                <div class="hourly-time">${hour.toString().padStart(2, "0")}:00${isCurrent ? " Ara" : ""}</div>
                <div class="hourly-icon">
                    ${CLOTHING.ICONS[weatherInfo.icon] || CLOTHING.ICONS.cloud}
                </div>
                <div class="hourly-temp">${Math.round(data.hourly.temperature[hourIndex])}°</div>
                <div class="hourly-rain">
                    ${CLOTHING.ICONS.umbrella}
                    ${Math.round(data.hourly.precipitationProbability[hourIndex])}%
                </div>
                <div class="hourly-wind">${Math.round(data.hourly.windSpeed[hourIndex])} km/h</div>
            `;
            
            elements.hourlyScroll.appendChild(item);
        }
    }

    /**
     * Render daily forecast
     */
    function renderDailyForecast(weatherData, locationKey) {
        if (!elements.dailyGrid) return;
        
        const data = weatherData[locationKey];
        if (!data) return;
        
        const todayStr = new Date().toISOString().split("T")[0];
        
        elements.dailyGrid.innerHTML = "";
        
        for (let i = 0; i < 7; i++) {
            if (i >= data.daily.time.length) break;
            
            const dateStr = data.daily.time[i];
            const isToday = dateStr === todayStr;
            const weatherInfo = CLOTHING.getWeatherInfo(data.daily.weatherCode[i]);
            const date = new Date(dateStr);
            
            const item = document.createElement("div");
            item.className = `daily-item ${isToday ? "today" : ""}`;
            item.innerHTML = `
                <div class="daily-date">
                    <span class="daily-day">${date.toLocaleDateString("ca-ES", { weekday: "short" })}${isToday ? " Avui" : ""}</span>
                    <span class="daily-date-num">${date.toLocaleDateString("ca-ES", { month: "short", day: "numeric" })}</span>
                </div>
                <div class="daily-condition">
                    <div class="daily-icon">
                        ${CLOTHING.ICONS[weatherInfo.icon] || CLOTHING.ICONS.cloud}
                    </div>
                    <span class="daily-condition-text">${weatherInfo.main}</span>
                </div>
                <div class="daily-temps">
                    <span class="daily-high">${Math.round(data.daily.tempMax[i])}°</span>
                    <span class="daily-low">${Math.round(data.daily.tempMin[i])}°</span>
                </div>
                <div class="daily-rain">
                    <div class="daily-rain-value">
                        ${CLOTHING.ICONS.umbrella}
                        ${Math.round(data.daily.precipitationProbability[i])}%
                    </div>
                    <div class="daily-rain-label">Pluja</div>
                </div>
                <div class="daily-wind">
                    <div class="daily-wind-value">${Math.round(data.daily.windSpeedMax[i])} km/h</div>
                    <div class="daily-wind-dir">${getWindDirection(data.daily.windDirectionDominant[i])}</div>
                </div>
            `;
            
            elements.dailyGrid.appendChild(item);
        }
    }

    function getWindDirection(degrees) {
        const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
        return directions[Math.round(degrees / 22.5) % 16];
    }

    /**
     * Render charts
     */
    let tempChart = null;
    let rainWindChart = null;

    function renderCharts(weatherData, locationKey) {
        const data = weatherData[locationKey];
        if (!data) return;

        // Temperature Chart
        const tempCtx = document.getElementById("tempChart");
        if (tempCtx) {
            const labels = data.hourly.time.slice(0, 24).map(t => new Date(t).getHours() + ":00");
            
            if (tempChart) tempChart.destroy();
            
            tempChart = new Chart(tempCtx, {
                type: "line",
                data: {
                    labels,
                    datasets: [
                        {
                            label: "Temperatura",
                            data: data.hourly.temperature.slice(0, 24),
                            borderColor: "#0ea5e9",
                            backgroundColor: "rgba(14, 165, 233, 0.1)",
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        },
                        {
                            label: "Sensació tèrmica",
                            data: data.hourly.feelsLike.slice(0, 24),
                            borderColor: "#f59e0b",
                            backgroundColor: "rgba(245, 158, 11, 0.1)",
                            fill: false,
                            tension: 0.4,
                            borderDash: [5, 5],
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }
                    ]
                },
                options: getChartOptions("Temperatura (°C)")
            });
        }

        // Rain & Wind Chart
        const rainWindCtx = document.getElementById("rainWindChart");
        if (rainWindCtx) {
            const labels = data.hourly.time.slice(0, 24).map(t => new Date(t).getHours() + ":00");
            
            if (rainWindChart) rainWindChart.destroy();
            
            rainWindChart = new Chart(rainWindCtx, {
                type: "bar",
                data: {
                    labels,
                    datasets: [
                        {
                            label: "Probabilitat de pluja (%)",
                            data: data.hourly.precipitationProbability.slice(0, 24),
                            backgroundColor: "rgba(14, 165, 233, 0.6)",
                            borderColor: "#0ea5e9",
                            borderWidth: 1,
                            yAxisID: "y"
                        },
                        {
                            label: "Velocitat del vent (km/h)",
                            data: data.hourly.windSpeed.slice(0, 24),
                            type: "line",
                            borderColor: "#8b5cf6",
                            backgroundColor: "rgba(139, 92, 246, 0.1)",
                            fill: false,
                            tension: 0.4,
                            yAxisID: "y1",
                            pointRadius: 3
                        }
                    ]
                },
                options: {
                    ...getChartOptions(""),
                    scales: {
                        x: { grid: { display: false }, ticks: { color: "var(--text-muted)" } },
                        y: { 
                            type: "linear", 
                            position: "left",
                            min: 0,
                            max: 100,
                            grid: { color: "var(--border-color)" },
                            ticks: { color: "var(--text-muted)" }
                        },
                        y1: { 
                            type: "linear", 
                            position: "right",
                            min: 0,
                            grid: { drawOnChartArea: false },
                            ticks: { color: "var(--text-muted)" }
                        }
                    }
                }
            });
        }
    }

    function getChartOptions(yTitle) {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        const textColor = isDark ? "#cbd5e1" : "#475569";
        const gridColor = isDark ? "#334155" : "#e2e8f0";
        
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { 
                    position: "top",
                    labels: { color: textColor, usePointStyle: true, padding: 20 }
                },
                tooltip: {
                    backgroundColor: isDark ? "#1e293b" : "#ffffff",
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true
                }
            },
            scales: {
                x: { 
                    grid: { display: false }, 
                    ticks: { color: textColor }
                },
                y: { 
                    grid: { color: gridColor },
                    ticks: { color: textColor },
                    title: { display: !!yTitle, text: yTitle, color: textColor }
                }
            }
        };
    }

    /**
     * Update forecast tab
     */
    function switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll(".forecast-tab").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.tab === tabName);
        });
        
        // Update panels
        document.querySelectorAll(".forecast-panel").forEach(panel => {
            panel.classList.toggle("active", panel.id === `${tabName}Panel`);
        });
    }

    /**
     * Theme toggle
     */
    function initTheme() {
        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute("data-theme");
        const newTheme = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        
        // Re-render charts with new theme
        if (window.APP && window.APP.currentWeatherData) {
            const locationKey = elements.chartsLocation?.value || "comaruga";
            renderCharts(window.APP.currentWeatherData, locationKey);
        }
    }

    // Public API
    return {
        setLoading,
        showError,
        hideError,
        updateDateTime,
        updateLastUpdated,
        setRefreshLoading,
        renderWeatherCards,
        renderClothingRecommendations,
        renderHourlyForecast,
        renderDailyForecast,
        renderCharts,
        switchTab,
        initTheme,
        toggleTheme,
        elements
    };
})();
