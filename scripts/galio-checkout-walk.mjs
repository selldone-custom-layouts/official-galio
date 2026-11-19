/*
 * Galio — the guest checkout walk on a live shop, up to Selldone's payment window. Never further.
 *
 * For each width (1440 desktop, 390 phone), in a fresh browser (so a fresh guest basket):
 *   home → one piece in the bag (a home card's button) → the bag drawer → Checkout → contact (fake)
 *   → every delivery way the shop offers, one after the other (and a window chip when the way has
 *   windows) → the delivery sheet ("Compare the options") → the address sheet as the shop has it
 *   (map on: a pin, then the details; map off: the form), fake details, Save → the sheet in the
 *   other map state (the shop's checkout option flipped in this browser only, then put back exactly;
 *   nothing is saved to the shop; the sheet is cancelled) → for each way: "Place
 *   order", which only opens Selldone's payment window → a screenshot → the window's ✕.
 *   At the end the bag is emptied again.
 *
 * Nothing is ordered: nothing inside the payment window is touched but its ✕, and every Selldone
 * /buy/ call is blocked here as a second guard (it would be logged as BLOCKED).
 *
 * Usage: node --use-system-ca scripts/galio-checkout-walk.mjs [base] [out-folder]
 *   base default https://galio.selldone.shop · out default .shots/walk · WIDTHS=1440,390 · MODE=light|dark
 * Prints every step, then "WALK OK" or "WALK PROBLEMS n".
 */
import fs from "node:fs";
import path from "node:path";

const BASE = (process.argv[2] || "https://galio.selldone.shop").replace(/\/$/, "");
const OUT = path.resolve(process.argv[3] || ".shots/walk");
const WIDTHS = (process.env.WIDTHS || "1440,390").split(",").map(Number);
const MODE = process.env.MODE || "light";
/* PW=<playwright's index.js>; by default the project's shared copy beside this repo (no machine path in the repo) */
const PW = process.env.PW || path.resolve(path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1")), "../../kalio-marketplace/node_modules/playwright/index.js");
fs.mkdirSync(OUT, { recursive: true });

const pw = await import("file:///" + PW.replace(/\\/g, "/"));
const chromium = pw.chromium || pw.default?.chromium;
const browser = await chromium.launch();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let problems = 0;
const bad = (w, msg) => {
  problems++;
  console.log(`  PROBLEM ${w}: ${msg}`);
};
const slug = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 28);

for (const W of WIDTHS) {
  const H = W < 768 ? 844 : 900;
  console.log(`\n=== ${W}×${H} ${MODE}`);
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: W < 768, hasTouch: W < 768 });
  await ctx.addInitScript((mode) => {
    try {
      localStorage.setItem("galio-theme", JSON.stringify({ palette: "cherry", mode }));
    } catch {}
  }, MODE);
  const page = await ctx.newPage();
  /* no step may wait forever: fail it and say where */
  page.setDefaultTimeout(60000);
  const errors = [];
  const blocked = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 240)));
  /* Selldone's /buy/ calls (never the dev server's own modules: components/galio/buy/) */
  await page.route(
    (u) => !/^(localhost|127\.0\.0\.1)$/.test(u.hostname) && /\/buy\//.test(u.pathname),
    (r) => {
      blocked.push(r.request().method() + " " + r.request().url());
      return r.abort();
    },
  );
  const shot = async (name, full = false) => {
    const file = path.join(OUT, `walk-${W}-${name}.png`);
    await page.screenshot({ path: file, fullPage: full });
    console.log(`  shot ${path.relative(process.cwd(), file)}`);
    return file;
  };
  const push = (to) => page.evaluate((p) => window.$global_router.push(p).catch(() => {}), to);
  const visible = (sel) => page.locator(sel).filter({ visible: true }).first();

  try {
    // ── home and one piece in the bag
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForSelector(".gl-ftr", { timeout: 90000 });
    await page.waitForSelector(".gl-home .cards .card .btn", { timeout: 60000 });
    await sleep(2500);
    const addBtn = page.locator(".gl-home .cards .card .btn").first();
    await addBtn.scrollIntoViewIfNeeded();
    const piece = await page.evaluate(() => document.querySelector(".gl-home .cards .card")?.querySelector("h3, .card-t, a[href*='/product/']")?.textContent?.trim());
    await addBtn.click();
    console.log(`  added one piece: ${piece || "(first home card)"}`);
    await sleep(3500);

    // ── the bag drawer
    await visible(".gl-bag-btn").click();
    await page.waitForSelector("#drawer .dr-foot .btn", { timeout: 20000 });
    await sleep(1200);
    const drawerLines = await page.evaluate(() => document.querySelectorAll("#drawer .brows > li, #drawer .brows > *").length);
    console.log(`  bag drawer open, ${drawerLines} line(s)`);
    if (!drawerLines) bad(W, "the drawer shows no line after adding a piece");
    await shot("01-drawer");
    await page.locator("#drawer .dr-foot .btn").click();
    await page.waitForFunction(() => /step=checkout/.test(location.search) || location.pathname.includes("/basket/"), null, { timeout: 30000 });
    await sleep(1500);
    if (!/step=checkout/.test(await page.evaluate(() => location.search))) {
      // the drawer led to the bag page: its Checkout button
      await page.locator(".gl-cartpage .sumcard .btn--big").click();
    }
    await page.waitForSelector("#co-details", { timeout: 45000 });
    await sleep(3500);
    console.log(`  checkout: ${await page.evaluate(() => location.pathname + location.search)}`);
    await shot("02-checkout", true);

    // ── contact (fake)
    const email = page.locator("#co-f-email");
    if (await email.isDisabled()) bad(W, "the guest email field is disabled (no guest checkout?)");
    else {
      await email.fill("galio.walk@example.com");
      await email.blur();
    }
    const phone = page.locator("#co-f-phone");
    if (await phone.count()) {
      await phone.fill("+44 20 7946 0123");
      await phone.blur();
    }
    await sleep(2500);

    // ── every delivery way
    const ways = await page.evaluate(() => [...document.querySelectorAll("#co-delivery .mcard")].map((b) => b.querySelector(".mc-t b")?.textContent?.trim() + " | " + (b.querySelector(".mc-t small")?.textContent?.trim() || "") + " | " + (b.querySelector(".mc-fee")?.textContent?.trim() || "")));
    console.log(`  delivery ways (${ways.length}):`);
    ways.forEach((w, i) => console.log(`    ${i + 1}. ${w}`));
    if (!ways.length) bad(W, "the Delivery card shows no way");
    const wayInfo = [];
    for (let i = 0; i < ways.length; i++) {
      const card = page.locator("#co-delivery .mcard").nth(i);
      await card.scrollIntoViewIfNeeded();
      await card.click();
      await sleep(3500);
      const st = await page.evaluate((i) => {
        const c = document.querySelectorAll("#co-delivery .mcard")[i];
        const chips = [...document.querySelectorAll("#co-delivery .wins .chip")];
        return {
          checked: c?.getAttribute("aria-checked"),
          chips: chips.map((x) => x.textContent.trim() + (x.disabled ? " (off)" : "")),
          date: !!document.querySelector("#co-delivery .gl-ship-date input"),
          addressH: document.querySelector("#co-address h2")?.textContent?.trim(),
          wayLine: document.querySelector("#co-pay .sum-line")?.textContent?.trim(),
          delivery: [...document.querySelectorAll("#co-pay .rc-row, #co-pay .rc li, #co-pay dl > div")].map((r) => r.textContent.replace(/\s+/g, " ").trim()).filter((t) => /deliver|pickup|ship|collect/i.test(t)).join(" ; "),
        };
      }, i);
      const name = ways[i].split(" | ")[0];
      console.log(`  way ${i + 1} "${name}": checked=${st.checked} chips=[${st.chips.join(", ")}]${st.date ? " date-field" : ""} address-card="${st.addressH}" line="${st.wayLine || ""}" receipt="${st.delivery}"`);
      if (st.checked !== "true") bad(W, `way "${name}" did not become the chosen one`);
      const firstChip = page.locator("#co-delivery .wins .chip:not([disabled])").first();
      if (await firstChip.count()) {
        await firstChip.click();
        await sleep(2500);
        const on = await page.evaluate(() => document.querySelector("#co-delivery .wins .chip[aria-checked='true']")?.textContent?.trim());
        console.log(`    window chosen: ${on || "NONE"}`);
        if (!on) bad(W, `way "${name}": a window chip did not stay chosen`);
      }
      wayInfo.push({ i, name, pickup: /pickup|counter|collect/i.test(st.addressH || "") });
      await page.locator("#co-delivery").screenshot({ path: path.join(OUT, `walk-${W}-03-way${i + 1}-${slug(name)}.png`) });
      console.log(`  shot walk-${W}-03-way${i + 1}-${slug(name)}.png`);
    }

    // ── the delivery sheet
    const cmp = page.locator("#co-delivery .ckc-h .link");
    if (await cmp.count()) {
      await cmp.click();
      await page.waitForSelector("#gl-dlsheet", { timeout: 15000 });
      await sleep(1500);
      const rows = await page.evaluate(() => [...document.querySelectorAll("#gl-dlsheet .dopt-h")].map((b) => b.textContent.replace(/\s+/g, " ").trim()));
      console.log(`  delivery sheet: ${rows.length} row(s): ${rows.join(" / ")}`);
      await shot("04-delivery-sheet");
      await page.locator("#gl-dlsheet .dlg-head .x").click();
      await sleep(1200);
    }

    // ── a way that needs an address, then the address sheet with the map
    const home = wayInfo.find((w) => !w.pickup);
    if (home) {
      await page.locator("#co-delivery .mcard").nth(home.i).click();
      await sleep(3000);
      const firstChip = page.locator("#co-delivery .wins .chip:not([disabled])").first();
      if (await firstChip.count()) {
        await firstChip.click();
        await sleep(2000);
      }
      const addrBtn = page.locator("#co-address .addr button").first();
      await addrBtn.scrollIntoViewIfNeeded();
      await addrBtn.click();
      await page.waitForSelector(".k-addr__grid", { timeout: 20000 });
      await sleep(4000);
      const hasMap = await page.evaluate(() => !!document.querySelector(".k-addr__map"));
      console.log(`  address sheet open, map ${hasMap ? "on" : "off"} (the shop's option)`);
      await shot(`05-address-map-${hasMap ? "on" : "off"}`);
      if (hasMap) {
        // the pin: the address under it
        await page.locator(".k-addr__pin svg").click();
        await sleep(5000);
        const found = await page.evaluate(() => document.querySelector(".k-addr__found b")?.textContent?.trim());
        console.log(`  pin placed; address under it: ${found}`);
        // phone: the details come on their own screen
        const cont = page.locator(".k-sheet__foot .k-sheet__go");
        if (await page.evaluate(() => !!document.querySelector(".k-addr__grid.-step-map"))) {
          await cont.click();
          await sleep(1500);
        }
      }
      const fill = async (sel, v, force = false) => {
        const el = page.locator(sel).first();
        if (!(await el.count())) return;
        if (force || !(await el.inputValue())) await el.fill(v);
      };
      await fill('.k-addr__field input[autocomplete="street-address"]', "12 Walk Street");
      await fill('.k-addr__field input[placeholder="No."]', "12");
      await fill('.k-addr__field input[autocomplete="name"]', "Galio Walk", true);
      await fill('.k-addr__field input[autocomplete="tel"]', "+44 20 7946 0123", true);
      await fill('.k-addr__field input[autocomplete="address-level2"]', "London");
      await fill('.k-addr__field input[autocomplete="postal-code"]', "N1 7GU");
      await fill(".k-addr__field textarea", "Ring twice (test walk)", true);
      await sleep(800);
      await shot("06-address-details");
      await page.locator(".k-sheet__foot .k-sheet__go").click();
      await sleep(5000);
      const left = await page.evaluate(() => !!document.querySelector(".k-addr__grid"));
      const missing = await page.evaluate(() => document.querySelector(".k-addr__missing")?.textContent?.trim());
      if (left) bad(W, `the address sheet stayed open after Save${missing ? ": " + missing : ""}`);
      const set = await page.evaluate(() => document.querySelector("#co-address .addr")?.className + " :: " + document.querySelector("#co-address .addr")?.textContent?.replace(/\s+/g, " ").trim());
      console.log(`  address saved: ${set}`);
      await shot("07-address-set", true);

      // the address sheet in the other map state (flipped in this browser only, then restored exactly)
      const other = hasMap ? "off" : "on";
      const orig = await page.evaluate((mapOn) => {
        const shop = document.querySelector("#app")?.__vue_app__?.config?.globalProperties?.$store?.getters?.getShop;
        if (!shop) return { ok: false };
        shop.options = shop.options || [];
        const o = shop.options.find((e) => e.code === "checkout");
        const was = o ? JSON.stringify(o.value) : null;
        if (o) o.value = { ...(o.value || {}), map: mapOn };
        else shop.options.push({ code: "checkout", value: { map: mapOn, mode: "default" } });
        return { ok: true, was };
      }, !hasMap);
      await sleep(1200);
      if (orig.ok) {
        await page.locator("#co-address .addr button").first().click();
        await page.waitForSelector(".k-addr__grid", { timeout: 20000 });
        await sleep(other === "on" ? 6000 : 2000);
        const st = await page.evaluate(() => ({ map: !!document.querySelector(".k-addr__map"), canvas: !!document.querySelector(".k-addr__canvas canvas, .k-addr__canvas .mapboxgl-canvas"), nomap: !!document.querySelector(".k-addr__grid.-nomap") }));
        console.log(`  address sheet with the map ${other} (flipped here only): map=${st.map} canvas=${st.canvas} form-only=${st.nomap}`);
        if (other === "on" && !(st.map && st.canvas)) bad(W, "the map-on sheet draws no map");
        if (other === "off" && !st.nomap) bad(W, "the map-off sheet still shows a map");
        await shot(`08-address-map-${other}`);
        if (other === "on") {
          await page.locator(".k-addr__pin svg").click().catch(() => {});
          await sleep(5000);
          const found = await page.evaluate(() => document.querySelector(".k-addr__found b")?.textContent?.trim());
          console.log(`  pin on the map: "${found}"`);
          await shot("08b-address-map-on-pin");
        }
        await page.locator(".k-sheet__foot .k-sheet__ghost").first().click();
        await sleep(1200);
        if (await page.evaluate(() => !!document.querySelector(".k-addr__grid"))) await page.locator(".k-sheet__head .k-sheet__x, .k-sheet__x").first().click();
        await sleep(1000);
        await page.evaluate((was) => {
          const shop = document.querySelector("#app")?.__vue_app__?.config?.globalProperties?.$store?.getters?.getShop;
          const i = shop.options.findIndex((e) => e.code === "checkout");
          if (was === null) shop.options.splice(i, 1);
          else shop.options[i].value = JSON.parse(was);
        }, orig.was);
        await sleep(1500);
      } else console.log("  (the other map state is not reachable: no shop object in the page)");
    } else bad(W, "no way that needs an address");

    // ── each way: Place order → the payment window → its ✕
    for (const w of wayInfo) {
      await page.locator("#co-delivery .mcard").nth(w.i).scrollIntoViewIfNeeded();
      await page.locator("#co-delivery .mcard").nth(w.i).click();
      await sleep(3500);
      const chip = page.locator("#co-delivery .wins .chip:not([disabled])").first();
      if ((await chip.count()) && !(await page.locator("#co-delivery .wins .chip[aria-checked='true']").count())) {
        await chip.click();
        await sleep(2500);
      }
      const place = page.locator("#co-pay .btn--big");
      if (!(await place.count())) {
        bad(W, `way "${w.name}": no Place order button (${await page.evaluate(() => document.querySelector("#co-pay .pn-box, #co-pay .sum-note")?.textContent?.trim())})`);
        continue;
      }
      const label = (await place.textContent()).trim();
      await place.scrollIntoViewIfNeeded();
      await place.click();
      const opened = await page
        .waitForSelector(".s--storefront-master-payment-dialog .v-card", { state: "visible", timeout: 20000 })
        .then(() => true)
        .catch(() => false);
      if (!opened) {
        const miss = await page.evaluate(() => [...document.querySelectorAll("#errsum li, #co-pay .sum-note")].map((x) => x.textContent.trim()).join(" ; "));
        bad(W, `way "${w.name}": "${label}" did not open the payment window (${miss})`);
        await shot(`09-noplace-${slug(w.name)}`, true);
        continue;
      }
      await sleep(3500);
      const pay = await page.evaluate(() => {
        const d = document.querySelector(".s--storefront-master-payment-dialog");
        const r = d.getBoundingClientRect();
        return {
          text: d.innerText.replace(/\s+/g, " ").trim().slice(0, 400),
          box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
          over: d.scrollWidth > d.clientWidth + 1,
        };
      });
      console.log(`  way "${w.name}": "${label}" → payment window [${pay.box}]${pay.over ? " SIDE-SCROLL" : ""}: ${pay.text}`);
      if (pay.box[2] > W + 1 || pay.box[0] < -1) bad(W, `payment window is off the screen: ${pay.box}`);
      await shot(`10-payment-${slug(w.name)}`);
      // only its ✕
      const x = page.locator(".s--storefront-master-payment-dialog .v-toolbar .v-btn").last();
      if (await x.count()) await x.click();
      else await page.keyboard.press("Escape");
      await page.waitForSelector(".s--storefront-master-payment-dialog .v-card", { state: "hidden", timeout: 10000 }).catch(() => bad(W, "the payment window did not close with its ✕"));
      await sleep(1500);
    }

    // ── the detour (19 Nov 2026): pickup, then back to a delivery way. The buyer's address must still be on the
    //    card and Place order must open the payment window (before 1.0.6 the address was gone and Place order
    //    opened the address sheet instead).
    const pk = wayInfo.find((w) => w.pickup);
    if (pk && home) {
      for (const w of [pk, home]) {
        await page.locator("#co-delivery .mcard").nth(w.i).scrollIntoViewIfNeeded();
        await page.locator("#co-delivery .mcard").nth(w.i).click();
        await sleep(3500);
      }
      const chip = page.locator("#co-delivery .wins .chip:not([disabled])").first();
      if ((await chip.count()) && !(await page.locator("#co-delivery .wins .chip[aria-checked='true']").count())) {
        await chip.click();
        await sleep(2500);
      }
      const addr = await page.evaluate(() => (document.querySelector("#co-address .addr")?.textContent || "").replace(/\s+/g, " ").trim());
      console.log(`  detour "${pk.name}" → "${home.name}": address "${addr || "(none)"}"`);
      const place = page.locator("#co-pay .btn--big");
      if (await place.count()) {
        await place.scrollIntoViewIfNeeded();
        await place.click();
        const opened = await page
          .waitForSelector(".s--storefront-master-payment-dialog .v-card", { state: "visible", timeout: 20000 })
          .then(() => true)
          .catch(() => false);
        if (!opened) {
          bad(W, `after the detour, Place order on "${home.name}" did not open the payment window`);
          await shot("12-detour-noplace", true);
        } else {
          console.log(`  detour: Place order on "${home.name}" → payment window`);
          await shot("12-detour-payment");
          const x = page.locator(".s--storefront-master-payment-dialog .v-toolbar .v-btn").last();
          if (await x.count()) await x.click();
          else await page.keyboard.press("Escape");
          await page.waitForSelector(".s--storefront-master-payment-dialog .v-card", { state: "hidden", timeout: 10000 }).catch(() => bad(W, "the payment window did not close with its ✕"));
          await sleep(1500);
        }
      } else bad(W, `after the detour: no Place order button`);
    }
  } catch (e) {
    bad(W, "walk stopped: " + e.message.split("\n")[0]);
    await shot("99-stopped", true).catch(() => {});
  }

  // ── leave the guest bag empty
  try {
    await push("/basket/PHYSICAL");
    await sleep(3500);
    for (let i = 0; i < 6; i++) {
      const x = await page.$(".gl-cartpage .brow-x");
      if (!x) break;
      await x.click();
      await sleep(2500);
    }
    const left = await page.evaluate(() => document.querySelectorAll(".gl-cartpage .brow-x").length);
    console.log(`  bag emptied: ${left ? left + " line(s) LEFT" : "yes"}`);
    if (left) bad(W, "the bag is not empty at the end");
    await shot("11-bag-empty");
  } catch (e) {
    bad(W, "emptying the bag: " + e.message.split("\n")[0]);
  }
  if (errors.length) bad(W, "page errors: " + errors.join(" | "));
  if (blocked.length) bad(W, "BLOCKED buy calls (the walk pressed something it must not): " + blocked.join(" | "));
  await ctx.close();
}
await browser.close();
console.log(problems ? `\nWALK PROBLEMS ${problems}` : "\nWALK OK");
process.exit(problems ? 1 : 0);
