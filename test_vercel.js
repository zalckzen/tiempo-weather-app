const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on("console", msg => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    } else if (msg.type() === "log") {
      console.log("[BROWSER LOG]:", msg.text());
    }
  });
  
  page.on("pageerror", error => {
    errors.push(error.message);
  });
  
  try {
    await page.goto("https://tiempo-weather.vercel.app", { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(5000);
    
    // Check if data is in window.APP
    const appData = await page.evaluate(() => {
      return {
        currentWeatherData: window.APP?.currentWeatherData,
        currentRecommendations: window.APP?.currentRecommendations,
        currentRainAnalyses: window.APP?.currentRainAnalyses
      };
    });
    console.log("APP Data keys:", Object.keys(appData.currentWeatherData || {}));
    console.log("Recommendations keys:", Object.keys(appData.currentRecommendations || {}));
    
    // Check weather grid content
    const weatherGrid = await page.$(".weather-grid");
    if (weatherGrid) {
      const html = await weatherGrid.innerHTML();
      console.log("Weather grid HTML length:", html.length);
      console.log("Weather grid HTML:", html.substring(0, 2000));
    }
    
    console.log("\n--- Console Errors ---");
    if (errors.length > 0) {
      errors.forEach(e => console.log("ERROR:", e));
    } else {
      console.log("No errors!");
    }
    
  } catch (e) {
    console.log("Error:", e.message);
  }
  
  await browser.close();
})();
