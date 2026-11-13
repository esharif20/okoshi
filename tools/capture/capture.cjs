// Records stills of the Diorama from the built Desktop edition, for the Phone and Still editions.
// Usage: npm run build && npm run preview (in another shell), then npm run capture. Needs Chrome, Playwright and cwebp.
const { chromium } = require("playwright");
const { execFileSync } = require("node:child_process");
const { mkdirSync, rmSync } = require("node:fs");
const path = require("node:path");

const URL = process.env.CAPTURE_URL ?? "http://localhost:4173/";
const OUT = path.join(__dirname, "../../public/poster");
// One still for each state of the Opening sequence, at the progress where it reads best.
const SHOTS = [
  ["arrival", 0],
  ["plan", 0.28],
  ["fold", 0.44],
  ["ink", 0.57],
  ["paint", 0.66],
  ["plate", 0.83],
];
const SIZES = [
  ["wide", 1600, 1000],
  ["tall", 900, 1350],
];

(async () => {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
  for (const [size, width, height] of SIZES) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(URL, { waitUntil: "networkidle" });
    // Only the picture: the words are set again as real text by the edition that shows the still.
    await page.addStyleTag({ content: ".hero > :not(.hero-canvas), .loader { display: none !important }" });
    await page.waitForTimeout(2500);
    for (const [name, progress] of SHOTS) {
      await page.evaluate((p) => {
        const o = document.getElementById("opening");
        window.scrollTo(0, o.offsetTop + (o.offsetHeight - innerHeight) * p);
      }, progress);
      await page.waitForTimeout(1600);
      const png = path.join(OUT, `${name}-${size}.png`);
      await page.screenshot({ path: png });
      execFileSync("cwebp", ["-quiet", "-q", "80", png, "-o", png.replace(".png", ".webp")]);
      rmSync(png);
    }
    await page.close();
  }
  await browser.close();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
