// Captures the pictures that are screenshots of live pages, as PNG, into the
// folder given as the first argument. tools/media/make.sh turns them into webp.
//   NODE_PATH=$(npm root -g) node tools/media/capture.cjs <out dir> [name ...]
// Needs a global Playwright and Chrome. Every page is public; nothing is logged in.
const { chromium } = require("playwright");

const DEMO = "https://finance-agent-demo-chi.vercel.app";
const GH = "https://github.com/esharif20";

// Each shot: where to go, what to do there, and what to photograph.
const shots = {
  "finance-agent/transactions": async (page) => {
    await page.goto(`${DEMO}/app`, { waitUntil: "networkidle" });
    await page.click('a:has-text("Transactions")');
    await page.waitForSelector("text=/\\d+ transactions/", { timeout: 25000 });
    await page.waitForTimeout(1500);
    return { clip: { x: 170, y: 0, width: 1100, height: 900 } };
  },
  // The live Assistant endpoint was failing when these were taken, so this is
  // the worked answer the demo site itself shows in "The app itself".
  "finance-agent/answer": async (page) => {
    await page.goto(`${DEMO}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, 7700));
    await page.waitForSelector("text=From spending_by_category", { timeout: 20000 });
    await page.waitForTimeout(2000);
    return { clip: { x: 0, y: 0, width: 1440, height: 900 } };
  },
  "finance-agent/architecture": async (page) => {
    await page.goto(`${DEMO}/architecture`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    return { clip: { x: 0, y: 0, width: 1440, height: 860 } };
  },
  "software-factory/benchmarks": async (page) => {
    await page.goto(`${GH}/herdr-software-factory#status`, { waitUntil: "networkidle" });
    const table = page.locator("article table", { hasText: "bench10" }).first();
    await table.scrollIntoViewIfNeeded();
    return { element: table };
  },
  "minic-compiler/grammar": async (page) => {
    await page.goto(`${GH}/minic-compiler/blob/main/grammar/Task_1_2_1.txt`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    return { clip: { x: 340, y: 162, width: 1100, height: 738 } };
  },
  "minic-compiler/program": async (page) => {
    await page.goto(`${GH}/minic-compiler/blob/main/code/tests/fibonacci/fibonacci.c`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    return { clip: { x: 340, y: 162, width: 1100, height: 738 } };
  },
  "minic-compiler/tests": async (page) => {
    await page.goto(`${GH}/minic-compiler/actions/runs/19601759266`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    return { clip: { x: 0, y: 186, width: 1440, height: 480 } };
  },
};

(async () => {
  const [out, ...only] = process.argv.slice(2);
  if (!out) throw new Error("usage: capture.cjs <out dir> [name ...]");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  for (const [name, run] of Object.entries(shots)) {
    if (only.length && !only.includes(name)) continue;
    // The hosted demo's API sometimes answers 500 on a cold start, so each shot gets four tries.
    let done = false;
    for (let attempt = 1; attempt <= 4 && !done; attempt++) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: "light" });
      try {
        const { clip, element } = await run(page);
        const path = `${out}/${name.replace("/", "--")}.png`;
        if (element) await element.screenshot({ path });
        else await page.screenshot({ path, clip });
        console.log("ok", name);
        done = true;
      } catch (e) {
        console.log(attempt < 4 ? "retry" : "FAILED", name, String(e.message).split("\n")[0]);
        if (attempt === 4) process.exitCode = 1;
      }
      await page.close();
    }
  }
  await browser.close();
})();
