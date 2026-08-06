import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const context = browser.defaultBrowserContext();
  await context.overridePermissions('https://manjusatelier.in', ['notifications']);

  const page = await browser.newPage();
  
  // Intercept console logs
  page.on('console', msg => {
    console.log(`[PAGE LOG] ${msg.type()}: ${msg.text()}`);
  });

  console.log('Navigating to live site...');
  await page.goto('https://manjusatelier.in/login');

  console.log('Logging in...');
  await page.type('input[type="email"]', 'sameer@example.com');
  await page.type('input[type="password"]', 'Password123');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  
  console.log('Enabling notifications...');
  try {
    const enableBtn = await page.waitForXPath('//button[contains(., "Enable Notifications")]', { timeout: 10000 });
    if (enableBtn) {
      await enableBtn.click();
      console.log('Clicked Enable Notifications');
    }
  } catch (err) {
    console.log('Enable notifications button not found, maybe already enabled or running script directly');
    await page.evaluate(async () => {
      const { enablePushNotifications } = await import('/src/utils/pushManager.ts');
      await enablePushNotifications();
      console.log('Push notifications enabled via JS');
    }).catch(e => console.log('Eval error:', e.message));
  }

  console.log('Waiting for SW logs...');
  await new Promise(r => setTimeout(r, 5000));

  await browser.close();
}

run();
