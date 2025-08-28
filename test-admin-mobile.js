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
    // Navigate to the admin interface
    await page.goto('http://localhost:5173/admin/food-items');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Additional wait for any animations
    
    // Take a screenshot of the fixed mobile view
    await page.screenshot({ 
      path: 'mobile-admin-fixed.png', 
      fullPage: true 
    });
    
    console.log('Screenshot taken: mobile-admin-fixed.png');
    
    // Test responsive elements
    const header = await page.locator('h1').first();
    if (await header.isVisible()) {
      const headerText = await header.textContent();
      console.log('Header text:', headerText);
      
      const headerBox = await header.boundingBox();
      console.log('Header dimensions:', headerBox);
    }
    
    // Check buttons
    const selectButton = await page.getByRole('button', { name: /select/i }).first();
    if (await selectButton.isVisible()) {
      console.log('Select button is visible');
      const selectBox = await selectButton.boundingBox();
      console.log('Select button dimensions:', selectBox);
    }
    
    const createButton = await page.getByRole('button', { name: /create/i }).first();
    if (await createButton.isVisible()) {
      console.log('Create button is visible');
      const createBox = await createButton.boundingBox();
      console.log('Create button dimensions:', createBox);
    }
    
    // Check if buttons fit within viewport
    const viewport = page.viewportSize();
    console.log('Viewport size:', viewport);
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  await browser.close();
})();