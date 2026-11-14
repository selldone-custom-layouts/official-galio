/*
 * Galio — the README and wiki screenshots (docs/screenshots/), from the live shop.
 *
 * Desktop 1440×900 and phone 390×844, the window only (as official-bakini's): home, a collection
 * (category), a product (opened in the app: a headless browser on a cold /product/ gets Selldone's
 * SEO page), the bag with pieces in it, the checkout, and the home in dark mode. Each page is scrolled
 * to the bottom and back first so lazy photos load. Then cover.jpg (1600×900): the desktop home with
 * the phone home beside it. The bag is emptied at the end; nothing is ordered (Selldone's /buy/ calls
 * are blocked).
 *
 * Usage: node --use-system-ca scripts/galio-doc-shots.mjs [base] [out]   (default https://galio.selldone.shop, docs/screenshots)
 */
import fs from "node:fs";
import path from "node:path";

const BASE = (process.argv[2] || "https://galio.selldone.shop").replace(/\/$/, "");
const OUT = path.resolve(process.argv[3] || "docs/screenshots");
const CATEGORY = process.env.CATEGORY || "/croissants-category";
const PRODUCT = process.env.PRODUCT || "/product/720375";
const PW = process.env.PW || "D:/Kalio Sample Shop Claude/kalio-marketplace/node_modules/playwright/index.js";
fs.mkdirSync(OUT, { recursive: true });
const pw = await import("file:///" + PW.replace(/\\/g, "/"));
const chromium = pw.chromium || pw.default?.chromium;
const browser = await chromium.launch();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const made = [];

async function session(kind, mode, list) {
  const phone = kind === "phone";
  const W = phone ? 390 : 1440;
  const H = phone ? 844 : 900;
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone });
  await ctx.addInitScript((mode) => {
    try {
      localStorage.setItem("galio-theme", JSON.stringify({ palette: "cherry", mode }));
    } catch {}
  }, mode);
  const page = await ctx.newPage();
  await page.route((u) => !/^(localhost|127\.0\.0\.1)$/.test(u.hostname) && /\/buy\//.test(u.pathname), (r) => r.abort());
  const push = (to) => page.evaluate((p) => window.$global_router.push(p).catch(() => {}), to);
  const settle = async () => {
    await page.waitForSelector(".gl-ftr", { timeout: 60000 }).catch(() => {});
    await sleep(3000);
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += Math.round(H * 0.8)) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await sleep(250);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(2000);
  };
  const shot = async (name) => {
    const file = path.join(OUT, `${kind}-${name}.jpg`);
    await page.screenshot({ path: file, type: "jpeg", quality: 86 });
    made.push(path.basename(file));
    console.log("shot", path.basename(file), await page.evaluate(() => location.pathname + location.search));
  };
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 120000 });
  let bagged = false;
  for (const name of list) {
    if (name === "home" || name === "dark") await push("/");
    else if (name === "category") await push(CATEGORY);
    else if (name === "product") await push(PRODUCT);
    else {
      if (!bagged) {
        await push("/");
        await page.waitForSelector(".gl-home .cards .card .btn", { timeout: 60000 });
        await sleep(1500);
        // three different pieces, two of the first
        await page.evaluate(() => [...document.querySelectorAll(".gl-home .cards .card .btn")].slice(0, 3).forEach((b) => b.click()));
        await sleep(4000);
        await page.evaluate(() => document.querySelector(".gl-home .cards .card .step button:last-child, .gl-home .cards .card .qty button:last-child")?.click());
        await sleep(3000);
        bagged = true;
      }
      await push(name === "cart" ? "/basket/PHYSICAL" : "/basket/PHYSICAL?step=checkout");
    }
    await settle();
    await shot(name);
  }
  if (bagged) {
    await push("/basket/PHYSICAL");
    await sleep(3500);
    for (let i = 0; i < 8; i++) {
      const x = await page.$(".gl-cartpage .brow-x");
      if (!x) break;
      await x.click();
      await sleep(2500);
    }
    console.log("bag emptied:", (await page.evaluate(() => document.querySelectorAll(".gl-cartpage .brow-x").length)) ? "NO" : "yes");
  }
  await ctx.close();
}

await session("desktop", "light", ["home", "category", "product", "cart", "checkout"]);
await session("phone", "light", ["home", "category", "product", "cart", "checkout"]);
await session("desktop", "dark", ["dark"]);
await session("phone", "dark", ["dark"]);

/* the cover: the desktop home with the phone home beside it, on the Cherry family's tints */
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
const data = (f) => "data:image/jpeg;base64," + fs.readFileSync(path.join(OUT, f)).toString("base64");
await page.setContent(`<body style="margin:0;width:1600px;height:900px;overflow:hidden;background:linear-gradient(135deg,#ffeeef 0%,#ffdcde 60%,#fbbfc3 100%);position:relative">
  <img src="${data("desktop-home.jpg")}" style="position:absolute;left:56px;top:70px;width:1200px;height:750px;border-radius:18px;box-shadow:0 30px 70px -25px rgba(46,24,26,.55),0 0 0 1px rgba(46,24,26,.12)">
  <img src="${data("phone-home.jpg")}" style="position:absolute;left:1180px;top:118px;width:340px;height:736px;border-radius:34px;border:10px solid #2e181a;box-shadow:0 30px 70px -20px rgba(46,24,26,.6)">
</body>`);
await page.waitForFunction(() => [...document.images].every((i) => i.complete));
await page.screenshot({ path: path.join(OUT, "cover.jpg"), type: "jpeg", quality: 88 });
made.push("cover.jpg");
await browser.close();
console.log("made:", made.join(", "));
