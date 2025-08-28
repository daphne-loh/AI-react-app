const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X dimensions
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Testing mobile responsiveness...');
    
    // First, let's try to go to the login page and bypass auth or check if we can get to admin directly
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');
    
    // Use the provided login credentials
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    await page.fill('input[type="email"]', 'dolphine_487848@hotmail.com');
    await page.fill('input[type="password"]', 'Static66');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Login successful, now at:', page.url());
    
    // Now try to navigate to the admin page
    await page.goto('http://localhost:5173/admin/food-items');
    await page.waitForTimeout(3000);
    
    // Take a screenshot
    await page.screenshot({ 
      path: 'mobile-admin-test.png', 
      fullPage: true 
    });
    
    console.log('Screenshot taken: mobile-admin-test.png');
    console.log('Current URL:', page.url());
    
    // Check if we can see the Food Item Management title
    const managementTitle = page.locator('h1:has-text("Food Item Management")');
    if (await managementTitle.isVisible()) {
      console.log('✅ Food Item Management page is visible!');
      
      // Test the mobile layout
      const titleBox = await managementTitle.boundingBox();
      console.log('Title position:', titleBox);
      
      // Check if buttons are visible and positioned correctly
      const selectButton = page.locator('button:has-text("Select")');
      const createButton = page.locator('button:has-text("Create")');
      
      if (await selectButton.isVisible()) {
        const selectBox = await selectButton.boundingBox();
        console.log('✅ Select button visible at:', selectBox);
      }
      
      if (await createButton.isVisible()) {
        const createBox = await createButton.boundingBox();
        console.log('✅ Create button visible at:', createBox);
        
        // Check if buttons are within viewport
        const viewport = page.viewportSize();
        if (createBox && createBox.x + createBox.width <= viewport.width) {
          console.log('✅ Create button fits within viewport');
        } else {
          console.log('❌ Create button extends beyond viewport');
        }
      }
      
    } else {
      console.log('❌ Food Item Management page not visible');
      console.log('Page content:', await page.textContent('body'));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  await browser.close();
})();