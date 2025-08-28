const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    channel: 'chrome' 
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Step 1: Check authentication state on home page...');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Check if user is logged in by looking for login/logout indicators
    const hasLoginLink = await page.locator('text=Sign In, text=Login, a[href="/login"]').count();
    const hasLogoutLink = await page.locator('text=Logout, text=Sign Out').count();
    const hasDashboardLink = await page.locator('a[href="/dashboard"]').count();
    
    console.log('Has login link:', hasLoginLink > 0);
    console.log('Has logout link:', hasLogoutLink > 0);
    console.log('Has dashboard link:', hasDashboardLink > 0);
    
    console.log('Step 2: Try accessing /food-items directly without login...');
    await page.goto('http://localhost:5173/food-items', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    console.log('Current URL after direct access:', page.url());
    
    if (page.url().includes('/login')) {
      console.log('❌ Redirected to login - user not authenticated');
      
      console.log('Step 3: Login and then try food-items...');
      await page.fill('input[type="email"]', 'dolphine_487848@hotmail.com');
      await page.fill('input[type="password"]', 'Static66');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      console.log('✅ Login successful');
      
      console.log('Step 4: Now try food-items after login...');
      await page.goto('http://localhost:5173/food-items', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      console.log('Final URL:', currentUrl);
      
      if (currentUrl.includes('/food-items')) {
        const content = await page.textContent('body');
        if (content.includes('404') || content.includes('Page Not Found')) {
          console.log('❌ Shows 404 error');
          console.log('Content:', content.substring(0, 500));
        } else if (content.includes('Food Item') || content.includes('Century Egg')) {
          console.log('✅ Food items page loaded successfully');
          console.log('Content preview:', content.substring(0, 200));
        } else {
          console.log('⚠️  Unknown content');
          console.log('Content:', content.substring(0, 500));
        }
      } else {
        console.log('❌ Redirected away from food-items to:', currentUrl);
      }
      
    } else if (page.url().includes('/food-items')) {
      console.log('✅ Successfully accessed food-items without redirect');
      const content = await page.textContent('body');
      console.log('Content preview:', content.substring(0, 200));
    } else {
      console.log('❌ Unexpected redirect to:', page.url());
    }
    
    console.log('Step 5: Check browser localStorage and sessionStorage...');
    const localStorage = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });
    
    console.log('LocalStorage keys:', Object.keys(localStorage));
    
    // Wait to see the result
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();