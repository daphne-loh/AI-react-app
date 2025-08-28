const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Navigating to http://localhost:5174...');
    
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
    
    // Take a screenshot
    await page.screenshot({ path: 'page-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved as page-screenshot.png');
    
    // Get page title
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Check if page loaded
    const bodyText = await page.textContent('body');
    console.log('📝 Page has content:', bodyText.length > 0);
    
    // Look for main heading
    const heading = await page.textContent('h1').catch(() => null);
    console.log('🏷️  Main heading:', heading);
    
    // Check for any errors
    const errors = await page.evaluate(() => {
      const errors = [];
      // Check for JavaScript errors
      if (window.console && window.console.error) {
        errors.push('Console errors may be present');
      }
      return errors;
    });
    
    // Get console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console error:', msg.text());
      }
    });
    
    // Wait a bit more to see if anything loads
    await page.waitForTimeout(2000);
    
    // Check if React app root exists
    const reactRoot = await page.$('#root');
    console.log('⚛️  React root found:', reactRoot !== null);
    
    if (reactRoot) {
      const rootContent = await page.textContent('#root');
      console.log('📦 Root content length:', rootContent.length);
      console.log('📦 Root content preview:', rootContent.substring(0, 200));
    }
    
  } catch (error) {
    console.error('❌ Error accessing the page:', error.message);
  } finally {
    await browser.close();
  }
})();