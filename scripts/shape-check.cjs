// Galio — the shape-language audit (option B "Awning", galio-design/BUILD-AWNING.md), ported from
// galio-design/check/shape-check.cjs to the Layout: pages are opened in the app (the router, as a visitor
// clicks; a headless browser on a cold /product/ gets Selldone's SEO page), and the overlays are the
// Layout's own (shop flyout, search, region popover, menu sheet, bag drawer, filter sheet, quick view,
// sign-in sheet; with FILLED=1 also the checkout with a piece in the bag, the address sheet and Selldone's
// payment window, the bag emptied after).
//
// For every visible box with a visible edge (a fill that differs from what is behind it, a ring or a
// border on two sides) each corner must be on the scale: circle/pill (radius ≥ half the short side),
// panel 28 px, inner 14 px, or square only where the box runs to the window or page edge (full-bleed,
// or against the rail). A focused control keeps its own shape; nothing sticks out past the window.
//
// usage: node scripts/shape-check.cjs <base-url> [wait-selector]
//   PAGES="home=/,category=/croissants-category" WIDTHS=1440,1100,390 STORAGE='{"galio-theme":"…"}'
//   STATES=0 (pages only) · FILLED=1 (the checkout overlays) · V=1 (every finding)
// Prints one line per page/state and "TOTAL n".
"use strict";
const PW = process.env.PW || "D:/Kalio Sample Shop Claude/kalio-marketplace/node_modules/playwright";
const { chromium } = require(PW);
const [base0, WAIT = ".gl-ftr"] = process.argv.slice(2);
const BASE = (base0 || "http://localhost:9145").replace(/\/$/, "");
const PAGES = (process.env.PAGES || "home=/,category=/croissants-category,product=/product/720375,blog=/blog,about=/about-us,404=/no-such-page")
  .split(",")
  .map((s) => {
    const i = s.indexOf("=");
    return [s.slice(0, i), s.slice(i + 1)];
  });
const WIDTHS = (process.env.WIDTHS || "1440,1100,390").split(",").map(Number);
const VERBOSE = !!process.env.V;
const SCALE = [28, 14];

/* runs in the page: every edge on the scale; nothing past the window */
function audit(SCALE) {
  const out = { radius: [], overflow: [] };
  const vis = (el) => {
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.display === "none" || s.visibility === "hidden" || +s.opacity === 0) return false;
    }
    return true;
  };
  const name = (el) => (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : el.tagName.toLowerCase()) + (el.id ? "#" + el.id : "");
  const rgb = (c) => {
    const m = c && c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return [v[0], v[1], v[2], v[3] == null ? 1 : v[3]];
  };
  const behind = (el) => {
    for (let e = el.parentElement; e; e = e.parentElement) {
      const c = rgb(getComputedStyle(e).backgroundColor);
      if (c && c[3] > 0.5) return c;
    }
    return [255, 255, 255, 1];
  };
  const same = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 6;
  const W = document.documentElement.clientWidth;
  const rail = document.querySelector(".gl-shell .side");
  const rr = rail && innerWidth >= 1100 ? rail.getBoundingClientRect() : null;
  const pageL = rr && rr.width ? (rr.left < W / 2 ? rr.right : 0) : 0;
  const pageR = rr && rr.width ? (rr.left < W / 2 ? W : rr.left) : W;
  document.querySelectorAll("body *").forEach((el) => {
    if (el.closest("svg, .mapboxgl-map, .k-addr__canvas, iframe")) return;
    if (/^(IMG|SVG|PATH|BR|S|B|I|EM|STRONG|SPAN|SMALL|TIME|OUTPUT|OPTION|SCRIPT|STYLE|SOURCE|PICTURE|CANVAS|VIDEO)$/.test(el.tagName) && !el.className) return;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return;
    if (r.bottom < 0 || r.top > document.documentElement.scrollHeight) return;
    const s = getComputedStyle(el);
    if (s.display === "inline" || !vis(el)) return;
    const ring =
      s.boxShadow.split(/,(?![^(]*\))/).some((sh) => {
        if (!/inset/.test(sh)) return false;
        const n = sh.replace(/rgba?\([^)]*\)/, "").match(/-?[\d.]+px/g) || [];
        return n.length >= 4 && +parseFloat(n[0]) === 0 && +parseFloat(n[1]) === 0 && parseFloat(n[3]) > 0;
      }) ||
      (parseFloat(s.borderTopWidth) > 0 && parseFloat(s.borderLeftWidth) > 0 && s.borderTopStyle !== "none" && s.borderLeftStyle !== "none");
    const bg = rgb(s.backgroundColor);
    const img = s.backgroundImage !== "none" && !/^radial-gradient\(circle, /.test(s.backgroundImage) && !/^url\(/.test(s.backgroundImage);
    const fill = bg && bg[3] > 0.05 && !same(bg, behind(el));
    if (!fill && !ring && !img) return;
    const short = Math.min(r.width, r.height);
    const fullBleed = r.left <= pageL + 1 && r.right >= pageR - 1;
    const clipAt = (x, y) => {
      for (let p = el.parentElement, i = 0; p && i < 3; p = p.parentElement, i++) {
        const ps = getComputedStyle(p);
        if (ps.overflowX === "visible" && ps.overflowY === "visible") continue;
        const q = p.getBoundingClientRect();
        if (Math.abs(q.left - x) <= 1.5 || Math.abs(q.right - x) <= 1.5) if (Math.abs(q.top - y) <= 1.5 || Math.abs(q.bottom - y) <= 1.5) return true;
      }
      return false;
    };
    const corners = [
      ["top-left", r.left, r.top],
      ["top-right", r.right, r.top],
      ["bottom-right", r.right, r.bottom],
      ["bottom-left", r.left, r.bottom],
    ];
    corners.forEach(([c, x, y]) => {
      if (clipAt(x, y)) return;
      const raw = s.getPropertyValue("border-" + c + "-radius").split(" ")[0];
      let v = parseFloat(raw) || 0;
      if (/%$/.test(raw)) v = (v / 100) * short;
      const eff = Math.min(v, short / 2);
      if (eff >= short / 2 - 1) return; /* circle or pill */
      if (SCALE.some((k) => Math.abs(eff - k) <= 0.6)) return; /* panel / inner */
      if (eff < 0.5) {
        const fixed = s.position === "fixed" || s.position === "sticky";
        const onEdge = x <= 1 || x >= W - 1 || Math.abs(x - pageL) <= 1 || Math.abs(x - pageR) <= 1 || (fixed && (y <= 1 || y >= innerHeight - 1));
        if (fullBleed || onEdge) return;
        out.radius.push(name(el) + " square " + c);
        return;
      }
      out.radius.push(name(el) + " " + eff.toFixed(1) + "px " + c);
    });
  });
  for (const k in out) out[k] = [...new Set(out[k])];
  if (document.documentElement.scrollWidth > innerWidth) {
    document.querySelectorAll("body *").forEach((el) => {
      if (!vis(el)) return;
      const r = el.getBoundingClientRect();
      if (r.right > innerWidth + 0.5 && r.width) {
        let p = el.parentElement;
        let clipped = false;
        for (; p && p !== document.body; p = p.parentElement) {
          const ps = getComputedStyle(p);
          if (ps.overflowX !== "visible" && p.getBoundingClientRect().right <= innerWidth + 0.5) {
            clipped = true;
            break;
          }
        }
        if (!clipped) out.overflow.push(name(el) + " right " + r.right.toFixed(0));
      }
    });
    out.overflow = out.overflow.slice(0, 8);
  }
  return out;
}

/* runs in the page: a focused control keeps its own shape */
function focusShapes(SCALE) {
  const out = [];
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight * 3) return false;
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.display === "none" || s.visibility === "hidden" || +s.opacity === 0) return false;
    }
    return true;
  };
  const name = (el) => (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : el.tagName.toLowerCase()) + (el.textContent ? " «" + el.textContent.trim().slice(0, 18) + "»" : "");
  const R = (el) => ["top-left", "top-right", "bottom-right", "bottom-left"].map((c) => getComputedStyle(el).getPropertyValue("border-" + c + "-radius")).join(" ");
  const eff = (el, v) => {
    const r = el.getBoundingClientRect();
    const short = Math.min(r.width, r.height);
    return v
      .split(" ")
      .map((x) => Math.min(/%$/.test(x) ? (parseFloat(x) / 100) * short : parseFloat(x) || 0, short / 2).toFixed(1))
      .join(" ");
  };
  const onScale = (el, v) => {
    const r = el.getBoundingClientRect();
    const short = Math.min(r.width, r.height);
    return v.split(" ").every((x) => +x >= short / 2 - 1 || SCALE.some((k) => Math.abs(+x - k) <= 0.6));
  };
  const els = [...document.querySelectorAll(".gl a[href], .gl button, .gl [tabindex='0']")].filter((e) => vis(e) && !e.disabled).slice(0, 160);
  for (const el of els) {
    const before = eff(el, R(el));
    el.focus({ preventScroll: true });
    if (document.activeElement !== el || !el.matches(":focus-visible")) continue;
    const after = eff(el, R(el));
    const plain = before.split(" ").every((x) => +x === 0);
    if (plain ? !onScale(el, after) : before !== after) out.push(name(el) + " " + before.split(" ")[0] + "→" + after.split(" ")[0]);
    el.blur();
  }
  return [...new Set(out)];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch();
  let total = 0;
  for (const w of WIDTHS) {
    const mob = w < 768;
    const ctx = await browser.newContext({ viewport: { width: w, height: mob ? 844 : 900 }, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob, reducedMotion: "reduce" });
    if (process.env.STORAGE)
      await ctx.addInitScript((st) => {
        for (const [k, v] of Object.entries(JSON.parse(st))) localStorage.setItem(k, v);
      }, process.env.STORAGE);
    await ctx.route((u) => !/^(localhost|127\.0\.0\.1)$/.test(u.hostname) && /\/buy\//.test(u.pathname), (r) => r.abort());
    const pg = await ctx.newPage();
    pg.setDefaultTimeout(30000);
    const push = (to) => pg.evaluate((p) => { window.$global_router.push(p).catch(() => {}); }, to);
    const report = async (tag, withFocus) => {
      const R = await pg.evaluate(audit, SCALE);
      if (withFocus) {
        await pg.keyboard.press("Tab");
        R.focus = await pg.evaluate(focusShapes, SCALE);
      }
      const n = Object.values(R).reduce((a, v) => a + v.length, 0);
      total += n;
      console.log(tag, n ? "ISSUES " + n : "ok");
      if (n) for (const k in R) if (R[k].length) console.log("    " + k + ": " + R[k].slice(0, VERBOSE ? 99 : 10).join(" | ") + (!VERBOSE && R[k].length > 10 ? " …+" + (R[k].length - 10) : ""));
    };
    const clickVis = async (sel) => {
      const ok = await pg.evaluate((s) => {
        const el = [...document.querySelectorAll(s)].find((e) => {
          const r = e.getBoundingClientRect();
          return r.width && r.height && getComputedStyle(e).visibility !== "hidden";
        });
        if (!el) return false;
        el.click();
        return true;
      }, sel);
      if (!ok) throw new Error("nothing visible for " + sel);
    };
    const close = async () => {
      await pg.keyboard.press("Escape").catch(() => {});
      await sleep(400);
      await pg.evaluate(() => document.querySelector(".scrim")?.click()).catch(() => {});
      await sleep(400);
    };
    await pg.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 120000 });
    await pg.waitForSelector(WAIT, { timeout: 120000 });
    await sleep(3000);
    for (const [label, to] of PAGES) {
      try {
        if (to !== "/" || label !== PAGES[0][0]) await push(to);
        await pg.waitForSelector(WAIT, { timeout: 60000 }).catch(() => {});
        await sleep(3500);
        await pg.evaluate(() => window.scrollTo(0, 0));
        const tag = (s) => `${label.padEnd(10)} ${String(w).padEnd(5)} ${s.padEnd(13)}`;
        await report(tag("page"), true);
        if (process.env.STATES === "0") continue;
        const states = [];
        if (w < 1100) states.push(["menu", ".menu-btn"]);
        else {
          states.push(["shop-flyout", ".side-shop"]);
          states.push(["region", ".pill-region"]);
        }
        states.push(["search", w < 1100 ? ".srch-btn" : ".side-srch"]);
        if (label === "home" || label === "category") states.push(["bag", ".gl-bag-btn"]);
        if (label === "category") {
          if (w < 1280) states.push(["filter-sheet", ".fbtn"]);
          states.push(["quick", ".qv-btn"]);
        }
        if (label === "account" || label === "home") states.push(["signin", "@signin"]);
        for (const [st, sel] of states) {
          try {
            await pg.evaluate(() => window.scrollTo(0, 0));
            if (sel === "@signin") {
              await push("/user");
              await sleep(3500);
              await clickVis(".signin-acts button");
            } else await clickVis(sel);
            await sleep(900);
            await report(tag(st), false);
          } catch (e) {
            total++;
            console.log(tag(st), "FAILED", String(e.message || e).split("\n")[0].slice(0, 140));
          }
          await close();
          if (sel === "@signin" && to !== "/user") {
            await push(to);
            await sleep(2500);
          }
        }
      } catch (e) {
        total++;
        console.log(`${label} ${w} FAILED`, String(e.message || e).split("\n")[0].slice(0, 160));
      }
    }
    /* the checkout with a piece in the bag, the address sheet and Selldone's payment window */
    if (process.env.FILLED === "1") {
      const tag = (s) => `${"checkout".padEnd(10)} ${String(w).padEnd(5)} ${s.padEnd(13)}`;
      try {
        await push("/");
        await pg.waitForSelector(".gl-home .cards .card .btn", { timeout: 60000 });
        await pg.evaluate(() => document.querySelector(".gl-home .cards .card .btn")?.click());
        await sleep(3500);
        await push("/basket/PHYSICAL");
        await sleep(3500);
        await report(tag("bag-page"), false);
        await push("/basket/PHYSICAL?step=checkout");
        await pg.waitForSelector("#co-delivery .mcard", { timeout: 45000 });
        await sleep(3000);
        await report(tag("page"), true);
        await pg.locator("#co-f-email").fill("galio.walk@example.com");
        await pg.locator("#co-f-phone").fill("+44 20 7946 0123");
        await pg.locator("#co-f-phone").blur();
        await clickVis("#co-delivery .ckc-h .link");
        await sleep(1200);
        await report(tag("delivery"), false);
        await clickVis("#gl-dlsheet .dlg-head .x");
        await sleep(800);
        await clickVis("#co-address .addr button");
        await sleep(2500);
        await report(tag("address"), false);
        await clickVis(".k-sheet__foot .k-sheet__ghost");
        await sleep(800);
        const n = await pg.locator("#co-delivery .mcard").count();
        await pg.locator("#co-delivery .mcard").nth(n - 1).click();
        await sleep(3500);
        await pg.locator("#co-pay .btn--big").click();
        await pg.waitForSelector(".s--storefront-master-payment-dialog .v-card", { state: "visible", timeout: 20000 });
        await sleep(1500);
        await report(tag("payment"), false);
        await pg.locator(".s--storefront-master-payment-dialog .v-toolbar .v-btn").last().click();
        await sleep(1000);
      } catch (e) {
        total++;
        console.log(tag("flow"), "FAILED", String(e.message || e).split("\n")[0].slice(0, 160));
      }
      try {
        await push("/basket/PHYSICAL");
        await sleep(3500);
        for (let i = 0; i < 6; i++) {
          const x = await pg.$(".gl-cartpage .brow-x");
          if (!x) break;
          await x.click();
          await sleep(2500);
        }
      } catch {
        /* the bag stays for this browser only */
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log("TOTAL", total);
  process.exit(total ? 1 : 0);
})();
