 /**
  * Rain Analysis Module
  * Analyzes Open-Meteo hourly data to provide smart rain probability
  * and umbrella recommendations based on user's outdoor schedule
  */
 
 const RAIN_ANALYSIS = (function() {
     // Rain intensity thresholds (mm/h)
     const RAIN_INTENSITY = {
         none: 0,
         light: 0.1,
         moderate: 2.5,
         heavy: 10,
         violent: 50
     };
 
     // Probability thresholds for recommendations
     const PROB_THRESHOLDS = {
         veryLow: 20,
         low: 40,
         moderate: 60,
         high: 80
     };
 
     /**
      * Get rain intensity label from precipitation amount
      */
     function getRainIntensity(precipitation) {
         if (precipitation <= RAIN_INTENSITY.none) return { level: "none", label: "Sense pluja", color: "var(--success)" };
         if (precipitation < RAIN_INTENSITY.moderate) return { level: "light", label: "Pluja lleu", color: "var(--accent)" };
         if (precipitation < RAIN_INTENSITY.heavy) return { level: "moderate", label: "Pluja moderada", color: "var(--warning)" };
         if (precipitation < RAIN_INTENSITY.violent) return { level: "heavy", label: "Pluja forta", color: "var(--danger)" };
         return { level: "violent", label: "Pluja violenta", color: "#991b1b" };
     }
 
     /**
      * Analyze hourly forecast data against user's outdoor schedule
      */
     function analyzeRainForLocation(hourlyData, locationKey) {
         const now = new Date();
         const todayStr = now.toISOString().split("T")[0];
         const schedule = SCHEDULE.getCurrentSchedule();
         
         const rainHours = [];
         let maxProbOutdoor = 0;
         let totalPrecipOutdoor = 0;
         let maxPrecipOutdoor = 0;
         let outdoorHoursCount = 0;
         let rainyOutdoorHours = [];
         
         hourlyData.time.forEach(function(timeStr, index) {
             const hourDate = new Date(timeStr);
             const hour = hourDate.getHours();
             const minute = hourDate.getMinutes();
             const dateStr = hourDate.toISOString().split("T")[0];
             
             if (dateStr !== todayStr) return;
             
             const prob = hourlyData.precipitationProbability[index] || 0;
             const precip = hourlyData.precipitation[index] || 0;
             const weatherCode = hourlyData.weatherCode[index] || 0;
             
             const isOutdoor = SCHEDULE.isHourOutdoor(hour, minute);
             
             const hourAnalysis = {
                 time: timeStr,
                 hour: hour,
                 minute: minute,
                 precipitationProbability: prob,
                 precipitation: precip,
                 weatherCode: weatherCode,
                 intensity: getRainIntensity(precip),
                 isOutdoor: isOutdoor
             };
             
             if (isOutdoor) {
                 outdoorHoursCount++;
                 maxProbOutdoor = Math.max(maxProbOutdoor, prob);
                 totalPrecipOutdoor += precip;
                 maxPrecipOutdoor = Math.max(maxPrecipOutdoor, precip);
                 
                 if (prob > 0 || precip > 0) {
                     rainyOutdoorHours.push(hourAnalysis);
                 }
             }
             
             if (prob > 0 || precip > 0) {
                 rainHours.push(hourAnalysis);
             }
         });
         
         const avgPrecipOutdoor = outdoorHoursCount > 0 ? totalPrecipOutdoor / outdoorHoursCount : 0;
         const recommendation = getUmbrellaRecommendation(maxProbOutdoor, maxPrecipOutdoor, avgPrecipOutdoor, rainyOutdoorHours.length, outdoorHoursCount);
         const outdoorRainHours = rainHours.filter(function(h) { return h.isOutdoor; });
         
         return {
             locationKey: locationKey,
             schedule: schedule,
             isWeekend: now.getDay() === 0 || now.getDay() === 6,
             summary: {
                 outdoorHoursAnalyzed: outdoorHoursCount,
                 maxProbability: maxProbOutdoor,
                 totalPrecipitation: totalPrecipOutdoor,
                 averagePrecipitation: avgPrecipOutdoor,
                 maxPrecipitation: maxPrecipOutdoor,
                 rainyOutdoorHoursCount: rainyOutdoorHours.length
             },
             rainHours: rainHours,
             outdoorRainHours: outdoorRainHours,
             recommendation: recommendation,
             nextRainTime: getNextRainTime(rainHours, now),
             rainEndTime: getRainEndTime(rainHours, now)
         };
     }
 
     function getUmbrellaRecommendation(maxProb, maxPrecip, avgPrecip, rainyHoursCount, totalOutdoorHours) {
         const maxIntensity = getRainIntensity(maxPrecip);
         
         if (totalOutdoorHours === 0) {
             return {
                 type: "none",
                 label: "No cal paraigua",
                 icon: "sun",
                 reason: "No hi ha hores d'activitat exterior programades per avui",
                 color: "var(--success)"
             };
         }
         
         if (maxProb <= PROB_THRESHOLDS.veryLow && maxPrecip <= RAIN_INTENSITY.none) {
             return {
                 type: "none",
                 label: "No cal paraigua",
                 icon: "sun",
                 reason: "Probabilitat de pluja molt baixa (" + Math.round(maxProb) + "%) durant les hores exteriors",
                 color: "var(--success)"
             };
         }
         
         if (maxProb <= PROB_THRESHOLDS.low && maxIntensity.level === "light" && avgPrecip < 0.5) {
             return {
                 type: "optional",
                 label: "Paraigua opcional",
                 icon: "umbrella",
                 reason: "Probabilitat de pluja lleu (" + Math.round(maxProb) + "%), possible bruineig lleu",
                 color: "var(--accent)"
             };
         }
         
         if (maxProb <= PROB_THRESHOLDS.moderate || maxIntensity.level === "light") {
             return {
                 type: "umbrella",
                 label: "Endu paraigua",
                 icon: "umbrella",
                 reason: "Probabilitat de pluja moderada (" + Math.round(maxProb) + "%) amb " + maxIntensity.label.toLowerCase() + " prevista",
                 color: "var(--accent)"
             };
         }
         
         if (maxProb > PROB_THRESHOLDS.moderate || maxIntensity.level === "moderate" || maxIntensity.level === "heavy") {
             if (maxIntensity.level === "heavy" || maxIntensity.level === "violent" || maxProb >= PROB_THRESHOLDS.high) {
                 return {
                     type: "raincoat",
                     label: "Impermeable recomanat",
                     icon: "raincoat",
                     reason: "Pluja " + maxIntensity.label.toLowerCase() + " amb alta probabilitat (" + Math.round(maxProb) + "%) durant les hores exteriors",
                     color: "var(--danger)"
                 };
             }
             return {
                 type: "umbrella",
                 label: "Endu paraigua",
                 icon: "umbrella",
                 reason: "Alta probabilitat de pluja (" + Math.round(maxProb) + "%) durant les hores exteriors",
                 color: "var(--warning)"
             };
         }
         
         return {
             type: "optional",
             label: "Paraigua opcional",
             icon: "umbrella",
             reason: "Condicions variables, reviseu la previsió horària",
             color: "var(--text-muted)"
         };
     }
 
     function getNextRainTime(rainHours, now) {
         const currentTime = now.getTime();
         for (var i = 0; i < rainHours.length; i++) {
             const rainTime = new Date(rainHours[i].time).getTime();
             if (rainTime > currentTime && rainHours[i].isOutdoor) {
                 return rainHours[i];
             }
         }
         return null;
     }
 
     function getRainEndTime(rainHours, now) {
         const currentTime = now.getTime();
         var inRain = false;
         var rainStart = null;
         
         for (var i = 0; i < rainHours.length; i++) {
             const rainTime = new Date(rainHours[i].time).getTime();
             const isOutdoor = rainHours[i].isOutdoor;
             
             if (isOutdoor && (rainHours[i].precipitationProbability > 30 || rainHours[i].precipitation > 0.1)) {
                 if (!inRain) {
                     inRain = true;
                     rainStart = rainHours[i];
                 }
             } else if (inRain && isOutdoor) {
                 var willStayDry = true;
                 for (var j = i + 1; j < Math.min(i + 3, rainHours.length); j++) {
                     if (rainHours[j].isOutdoor && (rainHours[j].precipitationProbability > 30 || rainHours[j].precipitation > 0.1)) {
                         willStayDry = false;
                         break;
                     }
                 }
                 if (willStayDry) {
                     return rainHours[i - 1];
                 }
             }
         }
         return null;
     }
 
     function formatHour(hour, minute) {
         return hour.toString().padStart(2, "0") + ":" + minute.toString().padStart(2, "0");
     }
 
     function analyzeAllLocations(weatherResults) {
         const analyses = {};
         Object.entries(weatherResults).forEach(function(entry) {
             var key = entry[0];
             var data = entry[1];
             if (data && data.hourly) {
                 analyses[key] = analyzeRainForLocation(data.hourly, key);
             }
         });
         return analyses;
     }
 
     const publicAPI = {
         analyzeRainForLocation: analyzeRainForLocation,
         analyzeAllLocations: analyzeAllLocations,
         getUmbrellaRecommendation: getUmbrellaRecommendation,
         getRainIntensity: getRainIntensity,
         formatHour: formatHour,
         RAIN_INTENSITY: RAIN_INTENSITY,
         PROB_THRESHOLDS: PROB_THRESHOLDS
     };
 
     if (typeof window !== "undefined") {
         window.RAIN_ANALYSIS = publicAPI;
     }
 
     return publicAPI;
 })();
