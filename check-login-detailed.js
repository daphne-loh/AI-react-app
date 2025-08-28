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
    console.log('Navigating to http://localhost:5173/login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    
    // Wait for React to load
    await page.waitForTimeout(2000);
    
    console.log('Page title:', await page.title());
    
    // Check if the root div has content
    const rootContent = await page.textContent('#root');
    console.log('Root div content:', rootContent);
    
    // Check for specific login elements
    const hasLoginForm = await page.locator('form').count() > 0;
    console.log('Has login form:', hasLoginForm);
    
    const hasComingSoon = await page.locator('text=Coming in Story').count() > 0;
    console.log('Has "Coming in Story" text:', hasComingSoon);
    
    const hasWelcomeBack = await page.locator('text=Welcome Back').count() > 0;
    console.log('Has "Welcome Back" text:', hasWelcomeBack);
    
    // Take a screenshot
    await page.screenshot({ path: 'login-page-detailed.png', fullPage: true });
    console.log('Screenshot saved as login-page-detailed.png');
    
    // Wait so we can see the page
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();