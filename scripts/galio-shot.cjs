// galio-shot.cjs: screenshots of the Layout while building (one browser, pages one after the other).
//
//   node scripts/galio-shot.cjs <base-url> <out-dir> <widths: 1440,390> <modes: light,dark> [name=/path ...]
//
// Env: WAIT (selector, default .gl-home), FULL=0 (viewport only), STORAGE (JSON of extra localStorage
// keys), ACT (JS run before the shot, e.g. open the menu), SUFFIX (added to the file name).
"use strict";
const path = require("path");
const fs = require("fs");
const { chromium } = require("D:/Kalio Sample Shop Claude/kalio-marketplace/node_modules/playwright");

const [base, out, widthsArg = "1440,390", modesArg = "light,dark", ...pagesArg] = process.argv.slice(2);
const pages = (pagesArg.length ? pagesArg : ["home=/"]).map((p) => {
  const i = p.indexOf("=");
  return i > 0 ? [p.slice(0, i), p.slice(i + 1)] : ["page", p];
});
const WAIT = process.env.WAIT || ".gl-home";
const FULL = process.env.FULL !== "0";
const EXTRA = process.env.STORAGE ? JSON.parse(process.env.STORAGE) : {};
const ACT = process.env.ACT || "";
const SUFFIX = process.env.SUFFIX ? "-" + process.env.SUFFIX : "";

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  for (const w of widthsArg.split(",").map(Number)) {
    for (const mode of modesArg.split(",")) {
      const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 844 : 900 }, deviceScaleFactor: 1, hasTouch: w < 800, isMobile: w < 800 });
      await ctx.addInitScript(
        ([m, extra]) => {
          try {
            localStorage.setItem("galio-theme", JSON.stringify({ palette: "cherry", mode: m }));
            for (const [k, v] of Object.entries(extra)) localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
          } catch (e) {}
        },
        [mode, EXTRA],
      );
      for (const [name, p] of pages) {
        const page = await ctx.newPage();
        const errs = [];
        page.on("console", (m) => {
          if (m.type() === "error") errs.push(m.text().slice(0, 200));
        });
        page.on("pageerror", (e) => errs.push(String(e).slice(0, 300)));
        await page.goto(base.replace(/\/$/, "") + p, { waitUntil: "domcontentloaded", timeout: 90000 });
        try {
          await page.waitForSelector(WAIT, { timeout: 60000 });
        } catch (e) {
          errs.push("no " + WAIT);
        }
        await page.waitForTimeout(2500);
        await page.evaluate(() => document.querySelectorAll("img[loading=lazy]").forEach((i) => (i.loading = "eager")));
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 4000); }))));
        });
        if (ACT) {
          const r = await page.evaluate(ACT);
          if (r !== true && r != null) errs.push("ACT " + r);
          await page.waitForTimeout(700);
        }
        await page.waitForTimeout(500);
        const file = path.join(out, `${name}-${w}-${mode}${SUFFIX}.png`);
        await page.screenshot({ path: file, fullPage: FULL, timeout: 60000 });
        const sw = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth, document.documentElement.scrollHeight]);
        console.log(path.basename(file), "scrollW", sw[0], "innerW", sw[1], "H", sw[2], errs.length ? "ERR " + errs.join(" | ") : "");
        await page.close();
      }
      await ctx.close();
    }
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
