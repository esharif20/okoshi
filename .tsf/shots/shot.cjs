// usage: node shot.cjs <url> <name> [fullPage]
const { chromium } = require('playwright');
(async () => {
  const [url, name, full] = process.argv.slice(2);
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist'] });
  for (const [w, h, tag] of [[1440, 900, 'd'], [390, 844, 'm']]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: tag === 'm' ? 2 : 1, isMobile: tag === 'm', hasTouch: tag === 'm' });
    page.on('pageerror', e => console.log('pageerror', tag, e.message));
    page.on('console', m => { if (m.type() === 'error') console.log('console', tag, m.text().slice(0, 200)); });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${__dirname}/${name}-${tag}.png`, fullPage: !!full });
  }
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
