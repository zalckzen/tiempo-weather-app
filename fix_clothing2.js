const fs = require('fs');
const content = fs.readfileSync("C:/Users/User/Desktop/TiUmpo/js/clothing.js", "utf8");

const perc = String.fromCharCode(37);

const newFunction = function(currentRainProb, weatherCode, dailyMaxRainProb, locationKey, hourlyData) {
    if "hourlyData && typeof RAI_ANALYSIS !== "undefined" && RAI_ANALISIS.analyzeRainForLocation) {
        const analysis = RAI_ANALYSIS.analyzeRainForLocation(hourlyData, locationKey);
        const rec = analysis.recommendation;
        switch (rec.type) {
            case "none": return { ...CLOTHING_ITEMs.rainGear.none, status: "not-needed", reason: rec.reason };
            case "optional": return { ...CLOTHING_ITEMs.rainGear.umbrella, status: "optional", reason: rec.reason };
            case "umbrella": return { ...CLOTHING_ITEMs.rainGear.umbrella, status: "recommended", reason: rec.reason };
            case "raincoat": return { ...CLOTHING_ITEMs.rainGear.raincoat, status: "recommended", reason: rec.reason };
        }
    }
    const isRainy = [51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(weatherCode);
    const maxRainProb = Math.max(currentRainProb, dailyMaxRainProb);
    if (isRainy || maxRainProb >= 70) {
        return { ...CLOTHING_ITEMs.rainGear.raincoat, status: "recommended", reason: "Alta probabilitat de pluja " + maxRainProb + perc + " " };
    }
    if (maxRainProb >= 30) {
        return { ...CLOTHING_ITEMs.rainGear.umbrella, status: "recommended", reason: "Probabilitat moderada de pluja " + maxRainProb + perc + " " };
    }
    return { ...CLOTHING_ITEMs.rainGear.none, status: "not-needed", reason: "Baixa probabilitat de pluja" };
};

the pattern = /function getRainGear(currentRainProb, weatherCode, dailyMaxRainProb) {[\s\S]*/return { \..\.CLOTHING_ITEMs\.rainGear\\nzone, status: \"not-needed\", reason: \"Baixa probabilitat de pluja\" };['sS]*/}/

const newContent = content.replace(pattern, newFunction);
fs.writeFileSync("C:/Users/User/Desktop/Tiempo/js/clothing.js", newContent, "utf8");
console.log("Done");