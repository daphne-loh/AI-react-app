const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    if (msg.text().includes('Error') || msg.text().includes('admin') || msg.text().includes('Food')) {
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
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    await page.fill('input[type="email"]', 'dolphine_487848@hotmail.com');
    await page.fill('input[type="password"]', 'Static66');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Login successful, now at:', page.url());
    
    console.log('Step 2: Navigate to admin food-items interface...');
    await page.goto('http://localhost:5173/admin/food-items');
    await page.waitForTimeout(3000); // Give it time to load
    
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    
    // Check for admin interface elements
    const hasAdminTitle = await page.locator('text=Food Item Management').count() > 0;
    const hasCreateButton = await page.locator('text=Create New Item').count() > 0;
    const hasTable = await page.locator('table').count() > 0;
    const hasSelectButton = await page.locator('text=Select Items').count() > 0;
    
    console.log('✅ Admin Interface Elements:');
    console.log('  - Title "Food Item Management":', hasAdminTitle);
    console.log('  - "Create New Item" button:', hasCreateButton);
    console.log('  - Data table present:', hasTable);
    console.log('  - "Select Items" button:', hasSelectButton);
    
    // Check for food items in table
    const foodItemRows = await page.locator('tbody tr').count();
    console.log('  - Food items in table:', foodItemRows);
    
    if (hasCreateButton) {
      console.log('Step 3: Test create form...');
      await page.click('text=Create New Item');
      await page.waitForTimeout(2000);
      
      const hasForm = await page.locator('form').count() > 0;
      const hasNameField = await page.locator('input[placeholder*="name"], input[label*="Name"]').count() > 0;
      console.log('  - Create form opened:', hasForm);
      console.log('  - Name field present:', hasNameField);
      
      // Go back to list
      const hasCancelButton = await page.locator('text=Cancel').count() > 0;
      if (hasCancelButton) {
        await page.click('text=Cancel');
        await page.waitForTimeout(1000);
        console.log('  - Successfully returned to list');
      }
    }
    
    if (hasSelectButton) {
      console.log('Step 4: Test selection mode...');
      await page.click('text=Select Items');
      await page.waitForTimeout(1000);
      
      const hasCheckboxes = await page.locator('input[type="checkbox"]').count() > 0;
      const hasBatchPanel = await page.locator('text=selected').count() > 0;
      console.log('  - Selection checkboxes appeared:', hasCheckboxes);
      console.log('  - Batch operations panel:', hasBatchPanel);
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'admin-interface-test.png', fullPage: true });
    console.log('📸 Screenshot saved as admin-interface-test.png');
    
    // Wait to see the result
    console.log('✅ Admin interface test completed successfully!');
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();