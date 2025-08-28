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
    console.log('Step 1: Navigating to login page...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    console.log('Step 2: Filling in login credentials...');
    await page.fill('input[type="email"]', 'dolphine_487848@hotmail.com');
    await page.fill('input[type="password"]', 'Static66');
    
    console.log('Step 3: Submitting login form...');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete (either redirect or error)
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('Current URL after login attempt:', currentUrl);
    
    // Check if login was successful by looking for dashboard or if still on login
    if (currentUrl.includes('/login')) {
      console.log('Still on login page - checking for errors...');
      const errorText = await page.textContent('body');
      console.log('Page content:', errorText.substring(0, 300));
    } else {
      console.log('Login appears successful, redirected to:', currentUrl);
    }
    
    console.log('Step 4: Navigating to food-items page...');
    await page.goto('http://localhost:5173/food-items', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('Food-items page URL:', page.url());
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
    console.log('Root div content:', rootContent?.substring(0, 300) + '...');
    
    // Take a screenshot
    await page.screenshot({ path: 'food-items-after-login.png', fullPage: true });
    console.log('Screenshot saved as food-items-after-login.png');
    
    // Wait so we can see the page
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();