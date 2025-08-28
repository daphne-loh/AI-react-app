const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
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
  
  try {
    console.log('Navigating to http://localhost:5173/food-items...');
    await page.goto('http://localhost:5173/food-items', { waitUntil: 'networkidle' });
    
    // Wait for React to load
    await page.waitForTimeout(2000);
    
    console.log('Page title:', await page.title());
    
    // Check if it's a 404 page
    const has404 = await page.locator('text=404').count() > 0;
    console.log('Has 404 text:', has404);
    
    const hasNotFound = await page.locator('text=Page Not Found').count() > 0;
    console.log('Has "Page Not Found" text:', hasNotFound);
    
    // Check for food items page content
    const hasFoodItems = await page.locator('text=Food Items').count() > 0;
    console.log('Has "Food Items" text:', hasFoodItems);
    
    // Check the root content
    const rootContent = await page.textContent('#root');
    console.log('Root div content:', rootContent?.substring(0, 200) + '...');
    
    // Take a screenshot
    await page.screenshot({ path: 'food-items-page.png', fullPage: true });
    console.log('Screenshot saved as food-items-page.png');
    
    // Wait so we can see the page
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();