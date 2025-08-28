const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  // Create screenshots directory
  const screenshotDir = 'screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }
  
  // Capture console errors
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  const screenshots = [];
  
  const takeScreenshot = async (name, description) => {
    try {
      await page.waitForTimeout(2000); // Wait for page to settle
      const filename = `${screenshotDir}/${name}.png`;
      await page.screenshot({ path: filename, fullPage: true });
      console.log(`📸 ${description} - ${filename}`);
      screenshots.push({ name, description, filename, url: page.url() });
    } catch (error) {
      console.log(`❌ Failed to screenshot ${name}: ${error.message}`);
    }
  };

  try {
    console.log('🚀 Starting comprehensive page screenshot tour...\n');

    // 1. Landing Page (Coming Soon)
    console.log('1. Landing Page...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await takeScreenshot('01-landing-page', 'Landing Page (Coming Soon)');

    // 2. Login Page
    console.log('2. Login Page...');
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await takeScreenshot('02-login-page', 'Login Page');

    // 3. Register Page
    console.log('3. Register Page...');
    await page.goto('http://localhost:5173/register');
    await page.waitForTimeout(2000);
    await takeScreenshot('03-register-page', 'Register Page');

    // 4. 404 Page
    console.log('4. 404 Page...');
    await page.goto('http://localhost:5173/nonexistent-page');
    await page.waitForTimeout(2000);
    await takeScreenshot('04-404-page', '404 Not Found Page');

    // Now login for protected pages
    console.log('5. Logging in for protected pages...');
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', 'dolphine_487848@hotmail.com');
    await page.fill('input[type="password"]', 'Static66');
    await page.click('button[type="submit"]');
    
    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      console.log('✅ Login successful');
    } catch {
      console.log('⚠️  Login may have issues, continuing...');
    }

    // 5. Dashboard
    console.log('6. Dashboard...');
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(3000);
    await takeScreenshot('05-dashboard', 'User Dashboard');

    // 6. Food Items Database Page
    console.log('7. Food Items Database...');
    await page.goto('http://localhost:5173/food-items');
    await page.waitForTimeout(3000);
    await takeScreenshot('06-food-items-database', 'Food Items Database');

    // 7. Profile Page
    console.log('8. Profile Page...');
    await page.goto('http://localhost:5173/profile');
    await page.waitForTimeout(3000);
    await takeScreenshot('07-profile-page', 'User Profile');

    // 8. Account Settings
    console.log('9. Account Settings...');
    await page.goto('http://localhost:5173/settings');
    await page.waitForTimeout(3000);
    await takeScreenshot('08-account-settings', 'Account Settings');

    // 9. Collections (Coming Soon)
    console.log('10. Collections Page...');
    await page.goto('http://localhost:5173/collections');
    await page.waitForTimeout(2000);
    await takeScreenshot('09-collections-page', 'Collections (Coming Soon)');

    // 10. Subscribe Page
    console.log('11. Subscribe Page...');
    await page.goto('http://localhost:5173/subscribe');
    await page.waitForTimeout(2000);
    await takeScreenshot('10-subscribe-page', 'Subscribe Page');

    // 11. Forgot Password
    console.log('12. Forgot Password...');
    await page.goto('http://localhost:5173/forgot-password');
    await page.waitForTimeout(2000);
    await takeScreenshot('11-forgot-password', 'Forgot Password');

    // ADMIN PAGES
    console.log('\n🔧 Admin Pages...');

    // 12. Admin Food Items Management - List View
    console.log('13. Admin Food Items - List View...');
    await page.goto('http://localhost:5173/admin/food-items');
    await page.waitForTimeout(3000);
    await takeScreenshot('12-admin-food-items-list', 'Admin Food Items - List View');

    // 13. Admin Food Items - Create Form
    console.log('14. Admin Food Items - Create Form...');
    const hasCreateButton = await page.locator('text=Create New Item').count() > 0;
    if (hasCreateButton) {
      await page.click('text=Create New Item');
      await page.waitForTimeout(2000);
      await takeScreenshot('13-admin-food-items-create', 'Admin Food Items - Create Form');
      
      // Go back
      const hasCancelButton = await page.locator('text=Cancel').count() > 0;
      if (hasCancelButton) {
        await page.click('text=Cancel');
        await page.waitForTimeout(1000);
      }
    }

    // 14. Admin Food Items - Selection Mode
    console.log('15. Admin Food Items - Selection Mode...');
    await page.goto('http://localhost:5173/admin/food-items');
    await page.waitForTimeout(2000);
    const hasSelectButton = await page.locator('text=Select Items').count() > 0;
    if (hasSelectButton) {
      await page.click('text=Select Items');
      await page.waitForTimeout(1500);
      await takeScreenshot('14-admin-food-items-selection', 'Admin Food Items - Selection Mode');
    }

    // FORM INTERACTIONS
    console.log('\n📝 Form Interactions...');

    // 15. Login Form - Filled
    console.log('16. Login Form - Filled...');
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'password123');
    await takeScreenshot('15-login-form-filled', 'Login Form - Filled');

    // 16. Register Form - Filled
    console.log('17. Register Form - Filled...');
    await page.goto('http://localhost:5173/register');
    await page.waitForTimeout(2000);
    
    // Try to fill register form if fields exist
    try {
      const emailField = await page.locator('input[type="email"]').first();
      const passwordField = await page.locator('input[type="password"]').first();
      
      if (await emailField.count() > 0) {
        await emailField.fill('newuser@example.com');
      }
      if (await passwordField.count() > 0) {
        await passwordField.fill('newpassword123');
      }
      
      await takeScreenshot('16-register-form-filled', 'Register Form - Filled');
    } catch {
      await takeScreenshot('16-register-form-empty', 'Register Form - Empty');
    }

    // MOBILE VIEW SCREENSHOTS
    console.log('\n📱 Mobile View Screenshots...');
    
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    
    // 17. Mobile - Landing Page
    await page.goto('http://localhost:5173/');
    await page.waitForTimeout(2000);
    await takeScreenshot('17-mobile-landing', 'Mobile - Landing Page');

    // 18. Mobile - Login
    await page.goto('http://localhost:5173/login');
    await page.waitForTimeout(2000);
    await takeScreenshot('18-mobile-login', 'Mobile - Login Page');

    // 19. Mobile - Dashboard (if accessible)
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(3000);
    await takeScreenshot('19-mobile-dashboard', 'Mobile - Dashboard');

    // 20. Mobile - Admin Interface
    await page.goto('http://localhost:5173/admin/food-items');
    await page.waitForTimeout(3000);
    await takeScreenshot('20-mobile-admin', 'Mobile - Admin Interface');

    console.log('\n✅ Screenshot tour completed!');
    console.log(`📸 Total screenshots taken: ${screenshots.length}`);
    
    // Generate HTML report
    const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FoodDrop Application Screenshots</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        h1 { color: #333; text-align: center; }
        .screenshot { margin: 20px 0; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .screenshot h3 { color: #2c5aa0; margin-top: 0; }
        .screenshot img { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; }
        .url { color: #666; font-size: 14px; word-break: break-all; }
        .timestamp { color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <h1>🍜 FoodDrop Application Screenshots</h1>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Total Pages:</strong> ${screenshots.length}</p>
    
    ${screenshots.map(shot => `
        <div class="screenshot">
            <h3>${shot.description}</h3>
            <p class="url"><strong>URL:</strong> ${shot.url}</p>
            <img src="${shot.filename}" alt="${shot.description}" loading="lazy">
        </div>
    `).join('')}
    
    <div style="text-align: center; margin-top: 40px; color: #666;">
        <p>Generated by Playwright automation script</p>
    </div>
</body>
</html>`;

    fs.writeFileSync(`${screenshotDir}/report.html`, htmlReport);
    console.log(`📄 HTML report generated: ${screenshotDir}/report.html`);
    
    // List all screenshots
    console.log('\n📸 Screenshots taken:');
    screenshots.forEach((shot, i) => {
      console.log(`${String(i + 1).padStart(2, '0')}. ${shot.description}`);
    });

  } catch (error) {
    console.error('❌ Error during screenshot tour:', error.message);
  } finally {
    await browser.close();
    console.log('\n🎬 Browser closed. Screenshot tour complete!');
  }
})();