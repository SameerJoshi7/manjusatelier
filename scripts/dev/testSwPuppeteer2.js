import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const context = browser.defaultBrowserContext();
  await context.overridePermissions('https://manjusatelier.in', ['notifications']);

  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[PAGE LOG] ${msg.text()}`);
  });

  console.log('Navigating to live site...');
  await page.goto('https://manjusatelier.in');

  console.log('Waiting for SW registration...');
  await new Promise(r => setTimeout(r, 5000));

  console.log('Subscribing to push notifications via JS...');
  const success = await page.evaluate(async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      
      const res = await fetch('/api/push/vapid-public-key');
      const { publicKey } = await res.json();
      
      const padding = '='.repeat((4 - (publicKey.length % 4)) % 4);
      const base64 = (publicKey + padding).replace(/\-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const applicationServerKey = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        applicationServerKey[i] = rawData.charCodeAt(i);
      }

      const existing = await reg.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();

      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
      
      const saveRes = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub })
      });
      return saveRes.ok;
    } catch (err) {
      console.log('Eval error:', err.message);
      return false;
    }
  });

  console.log('Subscription success:', success);

  console.log('Waiting 10 seconds for welcome push to arrive...');
  await new Promise(r => setTimeout(r, 10000));

  await browser.close();
}

run();
