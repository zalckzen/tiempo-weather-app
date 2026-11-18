const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const requests = [];
  const responses = [];
  
  page.on("request", req => {
    requests.push({ url: req.url(), method: req.method() });
  });
  
  page.on("response", res => {
    responses.push({ url: res.url(), status: res.status() });
  });
  
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
    await page.waitForTimeout(5000);
    
    console.log("=== NETWORK REQUESTS ===");
    requests.forEach(r => console.log(r.method, r.url));
    
    console.log("\n=== NETWORK RESPONSES ===");
    responses.forEach(r => console.log(r.status, r.url));
    
    // Get API responses
    for (const res of responses) {
      if (res.url.includes("open-meteo") || res.url.includes("api.open-meteo")) {
        console.log("\n--- API Response from:", res.url, "---");
        const response = await page.evaluate(async (url) => {
          const resp = await fetch(url);
          return await resp.json();
        }, res.url);
        console.log(JSON.stringify(response, null, 2).substring(0, 2000));
      }
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
