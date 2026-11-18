const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on("console", msg => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });
  
  page.on("pageerror", error => {
    errors.push(error.message);
  });
  
  try {
    await page.goto("http://127.0.0.1:9000", { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Get page content
    const title = await page.title();
    console.log("Page title:", title);
    
    // Check for weather cards
    const weatherCards = await page.$$(".weather-card");
    console.log("Weather cards found:", weatherCards.length);
    
    // Check for clothing cards
    const clothingCards = await page.$$(".clothing-card");
    console.log("Clothing cards found:", clothingCards.length);
    
    // Check for rain analysis cards
    const rainCards = await page.$$(".rain-analysis-card");
    console.log("Rain analysis cards found:", rainCards.length);
    
    // Get text content of weather cards
    for (const card of weatherCards) {
      const text = await card.textContent();
      console.log("Weather card text:", text.substring(0, 200));
    }
    
    // Get text content of clothing cards
    for (const card of clothingCards) {
      const text = await card.textContent();
      console.log("Clothing card text:", text.substring(0, 200));
    }
    
    // Get text content of rain cards
    for (const card of rainCards) {
      const text = await card.textContent();
      console.log("Rain card text:", text.substring(0, 300));
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
