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
    await page.goto('http://localhost:5173');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the current mobile view
    await page.screenshot({ 
      path: 'mobile-admin-current.png', 
      fullPage: true 
    });
    
    console.log('Screenshot taken: mobile-admin-current.png');
    
    // Check for the admin interface elements
    const header = await page.locator('header, .header, [data-testid="header"]').first();
    if (await header.isVisible()) {
      console.log('Header found');
      
      // Get the bounding box of the header
      const headerBox = await header.boundingBox();
      console.log('Header dimensions:', headerBox);
    }
    
    // Look for the "Food Item Management" title and buttons
    const title = await page.getByText('Food Item Management').first();
    if (await title.isVisible()) {
      console.log('Title found');
      const titleBox = await title.boundingBox();
      console.log('Title dimensions:', titleBox);
    }
    
    const selectButton = await page.getByText('Select Items').first();
    if (await selectButton.isVisible()) {
      console.log('Select Items button found');
      const selectBox = await selectButton.boundingBox();
      console.log('Select button dimensions:', selectBox);
    }
    
    const createButton = await page.getByText('Create + New Item').first();
    if (await createButton.isVisible()) {
      console.log('Create button found');
      const createBox = await createButton.boundingBox();
      console.log('Create button dimensions:', createBox);
    }
    
    // Check if elements are overlapping or off-screen
    const viewport = page.viewportSize();
    console.log('Viewport size:', viewport);
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  await browser.close();
})();