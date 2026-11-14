/*
 * Galio — the contrast audit (components/theme-switcher/tools/contrast-audit.cjs's probe) on what the
 * router alone cannot open: the checkout with a piece in the bag (the Delivery cards, the address,
 * the coupons card when the shop has coupons, the order summary) and Selldone's payment window.
 *
 * For each theme and width, a fresh browser: one piece from a home card, the checkout, a fake email and
 * phone, the pickup way (no address needed), the probe on the page; "Place order" (it only opens the
 * payment window), the probe on the window, its ✕; then the bag is emptied. Nothing inside the payment
 * window is touched but its ✕, and Selldone's /buy/ calls are blocked.
 *
 * Usage: node --use-system-ca scripts/galio-filled-checkout-audit.mjs [base]   (MODES=light,dark WIDTHS=1440,1100,390)
 * Prints each failure and "TOTAL n".
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { probe } = require("../components/theme-switcher/tools/contrast-audit.cjs");
const BASE = (process.argv[2] || "https://galio.selldone.shop").replace(/\/$/, "");
const MODES = (process.env.MODES || "light,dark").split(",");
const WIDTHS = (process.env.WIDTHS || "1440,1100,390").split(",").map(Number);
const PW = process.env.PW || "D:/Kalio Sample Shop Claude/kalio-marketplace/node_modules/playwright/index.js";
const pw = await import("file:///" + PW.replace(/\\/g, "/"));
const chromium = pw.chromium || pw.default?.chromium;
const browser = await chromium.launch();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let total = 0;
for (const mode of MODES)
  for (const W of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: W, height: W < 768 ? 844 : 900 }, isMobile: W < 768, hasTouch: W < 768 });
    await ctx.addInitScript((mode) => {
      try {
        localStorage.setItem("galio-theme", JSON.stringify({ palette: "cherry", mode }));
      } catch {}
    }, mode);
    const page = await ctx.newPage();
    await page.route((u) => !/^(localhost|127\.0\.0\.1)$/.test(u.hostname) && /\/buy\//.test(u.pathname), (r) => r.abort());
    const push = (to) => page.evaluate((p) => window.$global_router.push(p).catch(() => {}), to);
    const report = (what, fails) => {
      total += fails.length;
      console.log(`${mode} ${W} ${what}: ${fails.length ? "\n  " + fails.slice(0, 30).join("\n  ") : "ok"}`);
    };
    try {
      await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 120000 });
      await page.waitForSelector(".gl-home .cards .card .btn", { timeout: 90000 });
      await sleep(2000);
      await page.evaluate(() => document.querySelector(".gl-home .cards .card .btn")?.click());
      await sleep(3500);
      await push("/basket/PHYSICAL?step=checkout");
      await page.waitForSelector("#co-delivery .mcard", { timeout: 45000 });
      await sleep(3000);
      await page.locator("#co-f-email").fill("galio.walk@example.com");
      await page.locator("#co-f-email").blur();
      await page.locator("#co-f-phone").fill("+44 20 7946 0123");
      await page.locator("#co-f-phone").blur();
      const n = await page.locator("#co-delivery .mcard").count();
      await page.locator("#co-delivery .mcard").nth(n - 1).click();
      await sleep(4000);
      const coupons = await page.evaluate(() => !!document.querySelector("#co-offers .gl-offers"));
      report(`checkout (coupons card ${coupons ? "shown" : "not shown"})`, (await page.evaluate(probe)).fails);
      await page.locator("#co-pay .btn--big").click();
      await page.waitForSelector(".s--storefront-master-payment-dialog .v-card", { state: "visible", timeout: 20000 });
      await sleep(2500);
      report("payment window", (await page.evaluate(probe)).fails);
      await page.locator(".s--storefront-master-payment-dialog .v-toolbar .v-btn").last().click();
      await sleep(1500);
    } catch (e) {
      total++;
      console.log(`${mode} ${W} FAIL ${e.message.split("\n")[0]}`);
    }
    await push("/basket/PHYSICAL");
    await sleep(3500);
    for (let i = 0; i < 6; i++) {
      const x = await page.$(".gl-cartpage .brow-x");
      if (!x) break;
      await x.click();
      await sleep(2500);
    }
    const left = await page.evaluate(() => document.querySelectorAll(".gl-cartpage .brow-x").length);
    if (left) console.log(`${mode} ${W}: ${left} bag line(s) LEFT`);
    await ctx.close();
  }
await browser.close();
console.log("TOTAL", total);
process.exit(total ? 1 : 0);
