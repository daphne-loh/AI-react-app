const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    if (msg.text().includes('Food item') || msg.text().includes('Error') || msg.text().includes('404')) {
      console.log('CONSOLE:', msg.type(), msg.text());
    }
  });
  
  // Capture errors
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  try {
    console.log('Step 1: Login...');
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('input[type="email"]');
    
    await page.fill('input[type="email"]', 'dolphine_487848@hotmail.com');
    await page.fill('input[type="password"]', 'Static66');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('Login successful, now at:', page.url());
    
    console.log('Step 2: Navigate to food-items...');
    await page.goto('http://localhost:5173/food-items');
    await page.waitForTimeout(3000); // Give it time to load
    
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    
    // Check if it's a 404 page
    const has404 = await page.locator('text=404').count();
    console.log('Has 404 text:', has404 > 0);
    
    const hasNotFound = await page.locator('text=Page Not Found').count();
    console.log('Has "Page Not Found" text:', hasNotFound > 0);
    
    // Check for food items page content
    const hasFoodItems = await page.locator('text=Food Items').count();
    const hasTestFood = await page.locator('text=Century Egg').count();
    console.log('Has "Food Items" text:', hasFoodItems > 0);
    console.log('Has "Century Egg" text:', hasTestFood > 0);
    
    // Check for any grid or list content
    const hasGrid = await page.locator('[class*="grid"]').count();
    const hasCards = await page.locator('[class*="card"], .card').count();
    console.log('Has grid elements:', hasGrid > 0);
    console.log('Has card elements:', hasCards > 0);
    
    // Take a screenshot
    await page.screenshot({ path: 'food-items-final.png', fullPage: true });
    console.log('Screenshot saved as food-items-final.png');
    
    // Wait to see the page
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();