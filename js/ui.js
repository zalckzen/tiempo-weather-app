/**
 * UI Rendering Module
 * Handles all DOM updates and rendering
 */

const UI = (function() {
    // Cache DOM elements
    const elements = {};
    
    function cacheElements() {
        elements.loadingOverlay = document.getElementById('loadingOverlay');
        elements.errorBanner = document.getElementById('errorBanner');
        elements.errorMessage = document.getElementById('errorMessage');
        elements.errorDismiss = document.getElementById('errorDismiss');
        elements.weatherGrid = document.getElementById('weatherGrid');
        elements.clothingGrid = document.getElementById('clothingGrid');
        elements.rainGrid = document.getElementById('rainGrid');
        elements.hourlyScroll = document.getElementById('hourlyScroll');
        elements.dailyGrid = document.getElementById('dailyGrid');
        elements.currentDate = document.getElementById('currentDate');
        elements.currentTime = document.getElementById('currentTime');
        elements.lastUpdated = document.getElementById('lastUpdated');
        elements.refreshBtn = document.getElementById('refreshBtn');
        elements.themeToggle = document.getElementById('themeToggle');
        elements.hourlyLocation = document.getElementById('hourlyLocation');
        elements.dailyLocation = document.getElementById('dailyLocation');
        elements.chartsLocation = document.getElementById('chartsLocation');
        elements.hourlyTab = document.getElementById('hourlyTab');
        elements.dailyTab = document.getElementById('dailyTab');
        elements.chartsTab = document.getElementById('chartsTab');
        elements.hourlyPanel = document.getElementById('hourlyPanel');
        elements.dailyPanel = document.getElementById('dailyPanel');
        elements.chartsPanel = document.getElementById('chartsPanel');
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cacheElements);
    } else {
        cacheElements();
    }

    /**
     * Show/hide loading overlay
     */
    function setLoading(show) {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.classList.toggle('visible', show);
        }
    }

    /**
     * Show error banner
     */
    function showError(message) {
        if (elements.errorBanner && elements.errorMessage) {
            elements.errorMessage.textContent = message;
            elements.errorBanner.classList.add('visible');
        }
    }

    /**
     * Hide error banner
     */
    function hideError() {
        if (elements.errorBanner) {
            elements.errorBanner.classList.remove('visible');
        }
    }

    /**
     * Update current date/time - Catalan locale
     */
    function updateDateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        
        if (elements.currentDate) {
            elements.currentDate.textContent = now.toLocaleDateString('ca-ES', options);
        }
        if (elements.currentTime) {
            elements.currentTime.textContent = now.toLocaleTimeString('ca-ES', { 
                hour: '2-digit', 
                minute: '2-digit',
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
            elements.lastUpdated.textContent = now.toLocaleTimeString('ca-ES', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
        }
    }

    /**
     * Set refresh button loading state
     */
    function setRefreshLoading(loading) {
        if (elements.refreshBtn) {
            elements.refreshBtn.classList.toggle('loading', loading);
            elements.refreshBtn.disabled = loading;
        }
    }

    /**
     * Render weather cards
     */
    function renderWeatherCards(weatherData) {
        if (!elements.weatherGrid) return;
        
        elements.weatherGrid.innerHTML = '';
        
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
        const card = document.createElement('div');
        card.className = 'weather-card ' + key;
        
        const current = data.current;
        const location = data.location;
        const weatherInfo = CLOTHING.getWeatherInfo(current.weatherCode);
        const windInfo = CLOTHING.getWindInfo(current.windSpeed, current.windDirection);
        
        card.innerHTML = '\n' +
            '            <div class=\"card-header\">\n' +
            '                <div class=\"location-info\">\n' +
            '                    <div class=\"location-icon\">\n' +
            '                        ' + CLOTHING.ICONS.location + '\n' +
            '                    </div>\n' +
            '                    <div class=\"location-details\">\n' +
            '                        <h3>' + location.name + '</h3>\n' +
            '                        <span class=\"location-type\">' + location.type + '</span>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '                <div class=\"current-temp\">\n' +
            '                    <span class=\"temp-value\">' + Math.round(current.temperature) + '</span>\n' +
            '                    <span class=\"temp-unit\">°C</span>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class=\"card-body\">\n' +
            '                <div class=\"weather-metric\">\n' +
            '                    <div class=\"metric-label\">Sensació tèrmica</div>\n' +
            '                    <div class=\"metric-value\">' + Math.round(current.feelsLike) + '°C</div>\n' +
            '                </div>\n' +
            '                <div class=\"weather-metric\">\n' +
            '                    <div class=\"metric-label\">Humitat</div>\n' +
            '                    <div class=\"metric-value\">\n' +
            '                        ' + CLOTHING.ICONS['cloud-drizzle'] + '\n' +
            '                        ' + Math.round(current.humidity) + '%\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '                <div class=\"weather-metric\">\n' +
            '                    <div class=\"metric-label\">Vent</div>\n' +
            '                    <div class=\"metric-value\">\n' +
            '                        ' + Math.round(current.windSpeed) + ' km/h ' + windInfo.direction + '\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '                <div class=\"weather-metric\">\n' +
            '                    <div class=\"metric-label\">Prob. pluja</div>\n' +
            '                    <div class=\"metric-value\">\n' +
            '                        ' + (current.precipitationProbability > 0 ? CLOTHING.ICONS.umbrella : CLOTHING.ICONS.sun) + '\n' +
            '                        ' + Math.round(current.precipitationProbability) + '%\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '                <div class=\"weather-condition\">\n' +
            '                    <div class=\"condition-icon\">\n' +
            '                        ' + (CLOTHING.ICONS[weatherInfo.icon] || CLOTHING.ICONS.cloud) + '\n' +
            '                    </div>\n' +
            '                    <div class=\"condition-text\">\n' +
            '                        <div class=\"condition-main\">' + weatherInfo.main + '</div>\n' +
            '                        <div class=\"condition-desc\">' + weatherInfo.desc + '</div>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '            </div>\n';
        
        return card;
    }

    /**
     * Render clothing recommendations
     */
    function renderClothingRecommendations(recommendations) {
        if (!elements.clothingGrid) return;
        
        elements.clothingGrid.innerHTML = '';
        
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
        const card = document.createElement('div');
        card.className = 'clothing-card ' + key;
        
        const recommendations = data.recommendations;
        const current = data.current;
        const location = data.location;
        
        const items = [
            { ...recommendations.outerwear, category: 'Roba exterior' },
            { ...recommendations.top, category: 'Part superior' },
            { ...recommendations.bottom, category: 'Part inferior' },
            { ...recommendations.rainGear, category: 'Equip de pluja' },
            ...recommendations.accessories.map(function(a) { return { ...a, category: 'Accessoris' }; })
        ].filter(function(item) { return item.status !== 'not-needed' || item.category === 'Equip de pluja'; });
        
        // Status text in Catalan
        function getStatusText(status) {
            switch (status) {
                case 'recommended': return 'Recomanat';
                case 'optional': return 'Opcional';
                case 'not-needed': return 'No cal';
                default: return status;
            }
        }
        
        card.innerHTML = '\n' +
            '            <div class=\"clothing-header\">\n' +
            '                <div class=\"location-info\">\n' +
            '                    <div class=\"location-icon\" style=\"background: ' + (key === 'comaruga' ? 'var(--accent-light)' : 'rgba(139, 92, 246, 0.2)') + '; color: ' + (key === 'comaruga' ? 'var(--accent)' : '#8b5cf6') + ';\">\n' +
            '                        ' + CLOTHING.ICONS.location + '\n' +
            '                    </div>\n' +
            '                    <div class=\"location-details\">\n' +
            '                        <h3>' + location.name + '</h3>\n' +
            '                        <span class=\"location-type\">' + location.type + '</span>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '                <span class=\"clothing-badge\">' + current.weatherMain + '</span>\n' +
            '            </div>\n' +
            '            <div class=\"clothing-items\">\n' +
            items.map(function(item) { return '\n' +
                '                    <div class=\"clothing-item\">\n' +
                '                        <div class=\"clothing-icon\">\n' +
                '                            ' + (CLOTHING.ICONS[item.icon] || CLOTHING.ICONS.tshirt) + '\n' +
                '                        </div>\n' +
                '                        <div class=\"clothing-text\">\n' +
                '                            <span class=\"item-name\">' + item.name + '</span>\n' +
                '                            <span class=\"item-reason\">' + (item.reason || '') + '</span>\n' +
                '                        </div>\n' +
                '                        <span class=\"clothing-status ' + item.status + '\">' + getStatusText(item.status) + '</span>\n' +
                '                    </div>\n'; }).join('') +
            '            </div>\n';
        
        return card;
    }

    /**
     * Render rain analysis section
     */
    function renderRainAnalysis(analyses) {
        if (!elements.rainGrid) return;
        
        elements.rainGrid.innerHTML = '';
        
        Object.entries(analyses).forEach(function(entry) {
            var key = entry[0];
            var analysis = entry[1];
            if (!analysis) return;
            
            const card = createRainAnalysisCard(key, analysis);
            elements.rainGrid.appendChild(card);
        });
    }

    /**
     * Create a single rain analysis card
     */
    function createRainAnalysisCard(key, analysis) {
        const card = document.createElement('div');
        card.className = 'rain-analysis-card ' + key;
        
        const summary = analysis.summary;
        const rec = analysis.recommendation;
        const isWeekend = analysis.isWeekend;
        const schedule = analysis.schedule;
        
        // Format rainy hours for display
        var rainyHoursHtml = '';
        if (analysis.outdoorRainHours && analysis.outdoorRainHours.length > 0) {
            rainyHoursHtml = analysis.outdoorRainHours.map(function(h) {
                var hour = h.hour.toString().padStart(2, '0') + ':' + h.minute.toString().padStart(2, '0');
                var prob = Math.round(h.precipitationProbability);
                var precip = h.precipitation.toFixed(1);
                var intensity = h.intensity.label;
                return '<div class=\"rainy-hour\"><span class=\"rainy-hour-time\">' + hour + '</span><span class=\"rainy-hour-prob\">' + prob + '%</span><span class=\"rainy-hour-precip\">' + precip + ' mm</span><span class=\"rainy-hour-intensity\">' + intensity + '</span></div>';
            }).join('');
        } else {
            rainyHoursHtml = '<div class=\"rainy-hour none\">No s\'esperen precipitacions durant les hores exteriors</div>';
        }
        
        // Next rain time
        var nextRainHtml = '';
        if (analysis.nextRainTime) {
            var nextHour = analysis.nextRainTime.hour.toString().padStart(2, '0') + ':' + analysis.nextRainTime.minute.toString().padStart(2, '0');
            nextRainHtml = '<div class=\"rain-next\"><strong>Pròxima pluja:</strong> ' + nextHour + ' (' + Math.round(analysis.nextRainTime.precipitationProbability) + '%, ' + analysis.nextRainTime.precipitation.toFixed(1) + ' mm)</div>';
        } else {
            nextRainHtml = '<div class=\"rain-next\"><strong>Pròxima pluja:</strong> No s\'esperen més precipitacions avui</div>';
        }
        
        // Rain end time
        var rainEndHtml = '';
        if (analysis.rainEndTime) {
            var endHour = analysis.rainEndTime.hour.toString().padStart(2, '0') + ':' + analysis.rainEndTime.minute.toString().padStart(2, '0');
            rainEndHtml = '<div class=\"rain-end\"><strong>Fi de la pluja:</strong> ' + endHour + '</div>';
        }
        
        // Schedule description
        var scheduleHtml = schedule.map(function(p) { return p.label + ': ' + p.start + '–' + p.end; }).join(', ');
        
        card.innerHTML = '\n' +
            '            <div class=\"rain-header\">\n' +
            '                <div class=\"location-info\">\n' +
            '                    <div class=\"location-icon\" style=\"background: ' + (key === 'comaruga' ? 'var(--accent-light)' : 'rgba(139, 92, 246, 0.2)') + '; color: ' + (key === 'comaruga' ? 'var(--accent)' : '#8b5cf6') + ';\">\n' +
            '                        ' + CLOTHING.ICONS.location + '\n' +
            '                    </div>\n' +
            '                    <div class=\"location-details\">\n' +
            '                        <h3>' + (key === 'comaruga' ? 'Coma-ruga' : 'Calafell') + '</h3>\n' +
            '                        <span class=\"location-type\">' + (key === 'comaruga' ? 'Ciutat natal' : 'Lloc d\'estudis') + '</span>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '                <div class=\"rain-recommendation\" style=\"border-left-color: ' + rec.color + '\">\n' +
            '                    <div class=\"rain-rec-icon\">\n' +
            '                        ' + (CLOTHING.ICONS[rec.icon] || CLOTHING.ICONS.umbrella) + '\n' +
            '                    </div>\n' +
            '                    <div class=\"rain-rec-text\">\n' +
            '                        <span class=\"rain-rec-label\" style=\"color: ' + rec.color + '\">' + rec.label + '</span>\n' +
            '                        <span class=\"rain-rec-reason\">' + rec.reason + '</span>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class=\"rain-details\">\n' +
            '                <div class=\"rain-summary\">\n' +
            '                    <div class=\"rain-stat\">\n' +
            '                        <span class=\"rain-stat-label\">Prob. màxima</span>\n' +
            '                        <span class=\"rain-stat-value\">' + Math.round(summary.maxProbability) + '%</span>\n' +
            '                    </div>\n' +
            '                    <div class=\"rain-stat\">\n' +
            '                        <span class=\"rain-stat-label\">Pluja total</span>\n' +
            '                        <span class=\"rain-stat-value\">' + summary.totalPrecipitation.toFixed(1) + ' mm</span>\n' +
            '                    </div>\n' +
            '                    <div class=\"rain-stat\">\n' +
            '                        <span class=\"rain-stat-label\">Pluja màxima</span>\n' +
            '                        <span class=\"rain-stat-value\">' + summary.maxPrecipitation.toFixed(1) + ' mm</span>\n' +
            '                    </div>\n' +
            '                    <div class=\"rain-stat\">\n' +
            '                        <span class=\"rain-stat-label\">Hores amb pluja</span>\n' +
            '                        <span class=\"rain-stat-value\">' + summary.rainyOutdoorHoursCount + ' de ' + summary.outdoorHoursAnalyzed + '</span>\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '                <div class=\"rain-schedule\">\n' +
            '                    <span class=\"rain-schedule-label\">Horari exterior: </span>\n' +
            '                    <span class=\"rain-schedule-value\">' + scheduleHtml + '</span>\n' +
            '                </div>\n' +
            '                <div class=\"rain-hours\">\n' +
            '                    <h4>Hores amb pluja (horari exterior)</h4>\n' +
            '                    <div class=\"rainy-hours-list\">' + rainyHoursHtml + '</div>\n' +
            '                </div>\n' +
            '                <div class=\"rain-timing\">' + nextRainHtml + rainEndHtml + '</div>\n' +
            '            </div>\n';
        
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
        
        elements.hourlyScroll.innerHTML = '';
        
        // Show next 24 hours
        for (let i = 0; i < 24; i++) {
            const hourIndex = i;
            if (hourIndex >= data.hourly.time.length) break;
            
            const timeStr = data.hourly.time[hourIndex];
            const hour = new Date(timeStr).getHours();
            const isCurrent = hour === currentHour && new Date(timeStr).toDateString() === now.toDateString();
            
            const weatherInfo = CLOTHING.getWeatherInfo(data.hourly.weatherCode[hourIndex]);
            
            const item = document.createElement('div');
            item.className = 'hourly-item ' + (isCurrent ? 'current' : '');
            item.innerHTML = '\n' +
                '                <div class=\"hourly-time\">' + hour.toString().padStart(2, '0') + ':00' + (isCurrent ? ' Ara' : '') + '</div>\n' +
                '                <div class=\"hourly-icon\">\n' +
                '                    ' + (CLOTHING.ICONS[weatherInfo.icon] || CLOTHING.ICONS.cloud) + '\n' +
                '                </div>\n' +
                '                <div class=\"hourly-temp\">' + Math.round(data.hourly.temperature[hourIndex]) + '°C<\/div>\n' +
                '                <div class=\"hourly-rain\">\n' +
                '                    ' + CLOTHING.ICONS.umbrella + '\n' +
                '                    ' + Math.round(data.hourly.precipitationProbability[hourIndex]) + '%\n' +
                '                </div>\n' +
                '                <div class=\"hourly-wind\">' + Math.round(data.hourly.windSpeed[hourIndex]) + ' km/h</div>\n';
            
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
        
        const todayStr = new Date().toISOString().split('T')[0];
        
        elements.dailyGrid.innerHTML = '';
        
        for (let i = 0; i < 7; i++) {
            if (i >= data.daily.time.length) break;
            
            const dateStr = data.daily.time[i];
            const isToday = dateStr === todayStr;
            const weatherInfo = CLOTHING.getWeatherInfo(data.daily.weatherCode[i]);
            const date = new Date(dateStr);
            
            const item = document.createElement('div');
            item.className = 'daily-item ' + (isToday ? 'today' : '');
            item.innerHTML = '\n' +
                '                <div class=\"daily-date\">\n' +
                '                    <span class=\"daily-day\">' + date.toLocaleDateString('ca-ES', { weekday: 'short' }) + (isToday ? ' Avui' : '') + '</span>\n' +
                '                    <span class=\"daily-date-num\">' + date.toLocaleDateString('ca-ES', { month: 'short', day: 'numeric' }) + '</span>\n' +
                '                </div>\n' +
                '                <div class=\"daily-condition\">\n' +
                '                    <div class=\"daily-icon\">\n' +
                '                        ' + (CLOTHING.ICONS[weatherInfo.icon] || CLOTHING.ICONS.cloud) + '\n' +
                '                    </div>\n' +
                '                    <span class=\"daily-condition-text\">' + weatherInfo.main + '</span>\n' +
                '                </div>\n' +
                '                <div class=\"daily-temps\">\n' +
                '                    <span class=\"daily-high\">' + Math.round(data.daily.tempMax[i]) + '°C<\/span>\n' +
                '                    <span class=\"daily-low\">' + Math.round(data.daily.tempMin[i]) + '°C<\/span>\n' +
                '                </div>\n' +
                '                <div class=\"daily-rain\">\n' +
                '                    <div class=\"daily-rain-value\">\n' +
                '                        ' + CLOTHING.ICONS.umbrella + '\n' +
                '                        ' + Math.round(data.daily.precipitationProbability[i]) + '%\n' +
                '                    </div>\n' +
                '                    <div class=\"daily-rain-label\">Pluja</div>\n' +
                '                </div>\n' +
                '                <div class=\"daily-wind\">\n' +
                '                    <div class=\"daily-wind-value\">' + Math.round(data.daily.windSpeedMax[i]) + ' km/h</div>\n' +
                '                    <div class=\"daily-wind-dir\">' + getWindDirection(data.daily.windDirectionDominant[i]) + '</div>\n' +
                '                </div>\n';
            
            elements.dailyGrid.appendChild(item);
        }
    }

    function getWindDirection(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
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
        const tempCtx = document.getElementById('tempChart');
        if (tempCtx) {
            const labels = data.hourly.time.slice(0, 24).map(function(t) { return new Date(t).getHours() + ':00'; });
            
            if (tempChart) tempChart.destroy();
            
            tempChart = new Chart(tempCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Temperatura',
                            data: data.hourly.temperature.slice(0, 24),
                            borderColor: '#0ea5e9',
                            backgroundColor: 'rgba(14, 165, 233, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        },
                        {
                            label: 'Sensació tèrmica',
                            data: data.hourly.feelsLike.slice(0, 24),
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            fill: false,
                            tension: 0.4,
                            borderDash: [5, 5],
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }
                    ]
                },
                options: getChartOptions('Temperatura (°C)')
            });
        }

        // Rain & Wind Chart
        const rainWindCtx = document.getElementById('rainWindChart');
        if (rainWindCtx) {
            const labels = data.hourly.time.slice(0, 24).map(function(t) { return new Date(t).getHours() + ':00'; });
            
            if (rainWindChart) rainWindChart.destroy();
            
            rainWindChart = new Chart(rainWindCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Probabilitat de pluja (%)',
                            data: data.hourly.precipitationProbability.slice(0, 24),
                            backgroundColor: 'rgba(14, 165, 233, 0.6)',
                            borderColor: '#0ea5e9',
                            borderWidth: 1,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Velocitat del vent (km/h)',
                            data: data.hourly.windSpeed.slice(0, 24),
                            type: 'line',
                            borderColor: '#8b5cf6',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            fill: false,
                            tension: 0.4,
                            yAxisID: 'y1',
                            pointRadius: 3
                        }
                    ]
                },
                options: {
                    ...getChartOptions(''),
                    scales: {
                        x: { grid: { display: false }, ticks: { color: 'var(--text-muted)' } },
                        y: { 
                            type: 'linear', 
                            position: 'left',
                            min: 0,
                            max: 100,
                            grid: { color: 'var(--border-color)' },
                            ticks: { color: 'var(--text-muted)' }
                        },
                        y1: { 
                            type: 'linear', 
                            position: 'right',
                            min: 0,
                            grid: { drawOnChartArea: false },
                            ticks: { color: 'var(--text-muted)' }
                        }
                    }
                }
            });
        }
    }

    function getChartOptions(yTitle) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#cbd5e1' : '#475569';
        const gridColor = isDark ? '#334155' : '#e2e8f0';
        
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { 
                    position: 'top',
                    labels: { color: textColor, usePointStyle: true, padding: 20 }
                },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
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
        document.querySelectorAll('.forecast-tab').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update panels
        document.querySelectorAll('.forecast-panel').forEach(function(panel) {
            panel.classList.toggle('active', panel.id === tabName + 'Panel');
        });
    }

    /**
     * Theme toggle
     */
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Re-render charts with new theme
        if (window.APP && window.APP.currentWeatherData) {
            const locationKey = elements.chartsLocation?.value || 'comaruga';
            renderCharts(window.APP.currentWeatherData, locationKey);
        }
    }

    // Public API
    const publicAPI = {
        setLoading,
        showError,
        hideError,
        updateDateTime,
        updateLastUpdated,
        setRefreshLoading,
        renderWeatherCards,
        renderClothingRecommendations,
        renderRainAnalysis,
        renderHourlyForecast,
        renderDailyForecast,
        renderCharts,
        switchTab,
        initTheme,
        toggleTheme,
        elements
    };

    // Explicitly expose on window for cross-script compatibility
    if (typeof window !== 'undefined') {
        window.UI = publicAPI;
    }

    return publicAPI;
})();
