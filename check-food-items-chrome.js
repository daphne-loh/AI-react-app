const { chromium } = require('playwright');

(async () => {
  // Launch with Chrome instead of Chromium
  const browser = await chromium.launch({ 
    headless: false,
    channel: 'chrome' // This uses actual Chrome browser
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    console.log('CONSOLE:', msg.type(), msg.text());
  });
  
  // Capture errors
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  // Capture network requests to see what's happening
  page.on('request', request => {
    if (request.url().includes('food-items') || request.url().includes('404')) {
      console.log('REQUEST:', request.method(), request.url());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('food-items') || response.status() === 404) {
      console.log('RESPONSE:', response.status(), response.url());
    }
  });
  
  try {
    console.log('Testing with actual Chrome browser...');
    
    console.log('Step 1: Login...');
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    await page.fill('input[type="email"]', 'dolphine_487848@hotmail.com');
    await page.fill('input[type="password"]', 'Static66');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('Login successful, now at:', page.url());
    
    console.log('Step 2: Navigate to food-items directly...');
    await page.goto('http://localhost:5173/food-items', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    
    // Check what's actually rendered
    const bodyContent = await page.textContent('body');
    console.log('Body content (first 500 chars):', bodyContent.substring(0, 500));
    
    // Check specifically for 404 indicators
    const has404Number = await page.locator('text=404').count();
    const hasNotFound = await page.locator('text=Page Not Found').count();
    const hasGoBackHome = await page.locator('text=Go Back Home').count();
    
    console.log('Has "404" text:', has404Number > 0);
    console.log('Has "Page Not Found" text:', hasNotFound > 0);
    console.log('Has "Go Back Home" text:', hasGoBackHome > 0);
    
    // Check for food items content
    const hasFoodItems = await page.locator('text=Food Items').count();
    const hasTestFood = await page.locator('text=Century Egg').count();
    console.log('Has "Food Items" text:', hasFoodItems > 0);
    console.log('Has "Century Egg" text:', hasTestFood > 0);
    
    // Check the main content area
    const rootElement = await page.locator('#root').textContent();
    console.log('Root element content (first 300 chars):', rootElement.substring(0, 300));
    
    // Take a screenshot
    await page.screenshot({ path: 'food-items-chrome.png', fullPage: true });
    console.log('Screenshot saved as food-items-chrome.png');
    
    // Let's also try navigating via the UI instead of direct URL
    console.log('Step 3: Try navigating via URL bar simulation...');
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(1000);
    
    // Now type in the address bar (simulate what user does)
    await page.evaluate(() => {
      window.location.href = '/food-items';
    });
    await page.waitForTimeout(3000);
    
    console.log('After navigation simulation:', page.url());
    const finalContent = await page.textContent('body');
    console.log('Final content (first 300 chars):', finalContent.substring(0, 300));
    
    // Wait to see the page
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();