/*
 * Galio — full-page screenshots of every page of a live shop, for comparing with the -b mockups
 * (galio-design/shots/<page>-b-<width>[-dark].png) and for the README.
 *
 * Opens the home, then every page in the app (the router, as a visitor clicks: a headless browser
 * that opens /product/ cold gets Selldone's static SEO page). Scrolls each page to the bottom and
 * back so lazy photos load. The bag page and checkout get one piece from a home card first; the
 * bag is emptied at the end. Nothing is ordered.
 *
 * Usage: node --use-system-ca scripts/galio-live-shots.mjs [base] [out-folder]
 *   WIDTHS=1440,390 · MODES=light,dark · ONLY=home,product (page names)
 * Files: <out>/<page>-<width>-<mode>.png
 */
import fs from "node:fs";
import path from "node:path";

const BASE = (process.argv[2] || "https://galio.selldone.shop").replace(/\/$/, "");
const OUT = path.resolve(process.argv[3] || ".shots/live");
const WIDTHS = (process.env.WIDTHS || "1440,390").split(",").map(Number);
const MODES = (process.env.MODES || "light").split(",");
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;
const PW = process.env.PW || "D:/Kalio Sample Shop Claude/kalio-marketplace/node_modules/playwright/index.js";
const PAGES = [
  ["home", "/"],
  ["category", "/croissants-category"],
  ["product", "/product/720375"],
  ["deals", '/?filter={"only_has_discount":true}'],
  ["search", "/?search=pistachio"],
  ["compare", "/comparison?list=p720375_p720378_p720380"],
  ["empty", "/basket/PHYSICAL"],
  ["blog", "/blog"],
  ["article", "/blog/pickup-or-delivery-36222"],
  ["about", "/about-us"],
  ["contact", "/contact-us"],
  ["terms", "/terms"],
  ["privacy", "/privacy"],
  ["faq", "/faq"],
  ["404", "/no-such-page"],
  ["account", "/user"],
  ["cart", "@bag"],
  ["checkout", "@checkout"],
];
fs.mkdirSync(OUT, { recursive: true });
const pw = await import("file:///" + PW.replace(/\\/g, "/"));
const chromium = pw.chromium || pw.default?.chromium;
const browser = await chromium.launch();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let problems = 0;

for (const MODE of MODES)
  for (const W of WIDTHS) {
    const H = W < 768 ? 844 : 900;
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: W < 768, hasTouch: W < 768 });
    await ctx.addInitScript((mode) => {
      try {
        localStorage.setItem("galio-theme", JSON.stringify({ palette: "cherry", mode }));
      } catch {}
    }, MODE);
    const page = await ctx.newPage();
    /* Selldone's /buy/ calls (never the dev server's own modules: components/galio/buy/) */
    await page.route((u) => !/^(localhost|127\.0\.0\.1)$/.test(u.hostname) && /\/buy\//.test(u.pathname), (r) => r.abort());
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
    const push = (to) => page.evaluate((p) => window.$global_router.push(p).catch(() => {}), to);
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForSelector(".gl-ftr", { timeout: 90000 });
    await sleep(3000);
    let bagged = false;
    for (const [name, to] of PAGES) {
      if (ONLY && !ONLY.includes(name)) continue;
      try {
        if (to.startsWith("@")) {
          if (!bagged) {
            await push("/");
            await page.waitForSelector(".gl-home .cards .card .btn", { timeout: 60000 });
            await page.evaluate(() => document.querySelector(".gl-home .cards .card .btn")?.click());
            await sleep(3500);
            bagged = true;
          }
          await push(to === "@bag" ? "/basket/PHYSICAL" : "/basket/PHYSICAL?step=checkout");
        } else await push(to);
        await page.waitForSelector(".gl-ftr", { timeout: 60000 }).catch(() => {});
        await sleep(3500);
        // lazy photos: walk down the page and back
        const h = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < h; y += Math.round(H * 0.8)) {
          await page.evaluate((y) => window.scrollTo(0, y), y);
          await sleep(250);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await sleep(1500);
        const file = path.join(OUT, `${name}-${W}-${MODE}.png`);
        await page.screenshot({ path: file, fullPage: true });
        const st = await page.evaluate(() => ({ path: location.pathname + location.search, gl: document.querySelectorAll(".gl").length, w: document.documentElement.scrollWidth }));
        const side = st.w > W + 1;
        if (side || !st.gl) problems++;
        console.log(`${side || !st.gl ? "PROBLEM" : "ok"} ${name} ${W} ${MODE} ${st.path} .gl=${st.gl}${side ? " SIDE-SCROLL " + st.w : ""} → ${path.basename(file)}`);
      } catch (e) {
        problems++;
        console.log(`PROBLEM ${name} ${W} ${MODE}: ${e.message.split("\n")[0]}`);
      }
    }
    if (bagged) {
      await push("/basket/PHYSICAL");
      await sleep(3500);
      for (let i = 0; i < 6; i++) {
        const x = await page.$(".gl-cartpage .brow-x");
        if (!x) break;
        await x.click();
        await sleep(2500);
      }
      const left = await page.evaluate(() => document.querySelectorAll(".gl-cartpage .brow-x").length);
      console.log(`bag emptied: ${left ? left + " LEFT" : "yes"}`);
    }
    if (errors.length) {
      problems++;
      console.log(`PROBLEM page errors ${W} ${MODE}: ${errors.join(" | ")}`);
    }
    await ctx.close();
  }
await browser.close();
console.log(problems ? `SHOTS PROBLEMS ${problems}` : "SHOTS OK");
