/*
 * Galio Sundae — the shared data and helpers of the B mockup (galio-design/g/home.js), read live from
 * the shop. Nothing names a product, price, collection, address or delivery way: another bakery that
 * imports the Layout gets its own.
 *
 * The catalogue, the collections, the shop's facts and the layers (one open at a time, Esc, a click
 * outside, a route change) are the same live state the inner pages read (noir.ts, until those pages
 * are ported too), so the bag drawer, the cards and the pages count the same bag.
 */
import {
  bySells,
  catImage,
  catOf,
  catTitle,
  catTo,
  closeLayer,
  closeOnRoute,
  fmtDate,
  inCat,
  isModal,
  layer,
  loadNoir,
  money,
  noir,
  openLayer,
  priceView,
  productImage,
  productTo,
  prosOf,
  scrollBehavior,
  shopFacts,
  specGroups,
  specValue,
  toggleLayer,
  unitOf,
  wayTitle,
  wireLayers,
} from "../bakini/noir/noir";
import { t } from "../kalio/i18n/kalio-i18n";

export {
  bySells,
  catImage,
  catOf,
  catTitle,
  catTo,
  closeLayer,
  closeOnRoute,
  fmtDate,
  inCat,
  isModal,
  layer,
  loadNoir as loadShop,
  money,
  noir as shopData,
  openLayer,
  priceView,
  productImage,
  productTo,
  prosOf,
  scrollBehavior,
  shopFacts,
  specGroups,
  specValue,
  toggleLayer,
  unitOf,
  wayTitle,
  wireLayers,
};

declare const window: any;

/* ━━━━━━━━━━━━ Collections ━━━━━━━━━━━━ */

/** The mockup's sorbet tints, given to the collections in the shop's order (Bakio: cookies,
    croissants, Danish, mini cakes, muffins, tarts get the mockup's exact tints), cycled for more. */
export const TINTS = ["#f6e3c2", "#fbefc2", "#fcdfe4", "#f9dde8", "#e0e9f8", "#dbefe2"];

export function tintOf(catId: number | null | undefined): string {
  const i = noir.cats.findIndex((c) => c.id === catId);
  return TINTS[(i < 0 ? 0 : i) % TINTS.length];
}

/** Collections with products, most sold first (the sum of their products' sales), the shop's order on a tie. */
export function catsBySells(): any[] {
  return noir.cats
    .map((c, i) => ({ c, i, s: inCat(c.id).reduce((n, p) => n + (p.sells || 0), 0), n: inCat(c.id).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.c);
}

/** The cheapest price now and before in a collection, in the visitor's currency. */
export function fromPrice(shop: any, catId: number): { now: number; was: number | null } | null {
  const list = inCat(catId);
  if (!list.length) return null;
  let now = Infinity;
  let was = Infinity;
  for (const p of list) {
    const v = priceView(shop, p);
    now = Math.min(now, v.now);
    was = Math.min(was, v.was || v.now);
  }
  return { now, was: was > now ? was : null };
}

/** One saving for every product ("25"), or 0 when they differ or none is on offer. */
export function allOff(shop: any): number {
  const list = noir.products;
  if (!list.length) return 0;
  const offs = new Set(list.map((p) => priceView(shop, p).off || 0));
  if (offs.size !== 1) return 0;
  const [off] = [...offs];
  return off > 0 ? off : 0;
}

/** The words a collection's products share at the end ("… Croissant"), so names can be shortened. */
export function commonTail(list: any[]): string {
  if (list.length < 2) return "";
  const words = list.map((p) => String(p.title || "").split(" "));
  const tail: string[] = [];
  for (let k = 1; k < 4; k++) {
    const w = words[0][words[0].length - k];
    if (!w) break;
    if (words.every((ws) => ws.length > k && ws[ws.length - k] === w)) tail.unshift(w);
    else break;
  }
  return tail.join(" ");
}

/** A collection's n best sellers by short name ("Classic Butter", "Chocolate Drizzle"…). */
export function shortNames(catId: number, n: number): string[] {
  const all = inCat(catId);
  const tail = commonTail(all);
  return bySells(all)
    .slice(0, n)
    .map((p) => (tail && p.title.length > tail.length + 1 && p.title.endsWith(tail) ? p.title.slice(0, -tail.length).trim() : p.title));
}

export function listJoin(items: string[]): string {
  try {
    const lang = document.documentElement.lang || "en";
    /* English as the mockup writes it: "a, b and c" (no serial comma). */
    if (/^en/i.test(lang)) return items.length < 2 ? items.join("") : items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
    return new Intl.ListFormat(lang, { style: "long", type: "conjunction" }).format(items);
  } catch {
    return items.join(", ");
  }
}

/** A short real line about a product (the mockup's tag): its look from the spec ("Visual Finish",
    "Surface", "Finish", "Appearance", "Look"), else its first pro's title. */
export function lookOf(p: any): string {
  let line = "";
  for (const g of specGroups(p)) {
    for (const [k, v] of g.rows) {
      if (/visual finish|^finish$|surface|appearance|^look$/i.test(k) && v && v.length <= 160) {
        line = v;
        break;
      }
    }
    if (line) break;
  }
  if (!line) line = prosOf(p)[0]?.[0] || "";
  return line ? line.charAt(0).toUpperCase() + line.slice(1) : "";
}

/* ━━━━━━━━━━━━ The shop ━━━━━━━━━━━━ */

/** "Bakio" from "bakio". */
export function shopName(shop: any): string {
  const n = String(shop?.title || "").trim();
  return n.charAt(0).toUpperCase() + n.slice(1);
}

/** The street ("1 The Embarcadero"): the pickup point's own address, else the first part of the shop's. */
export function streetOf(facts: any): string {
  return facts.pickupPoint?.address || String(facts.address || "").split(",")[0].trim();
}

/** "1 The Embarcadero, San Francisco". */
export function shortAddress(facts: any): string {
  const street = streetOf(facts);
  return [street, facts.city && !street.includes(facts.city) ? facts.city : ""].filter(Boolean).join(", ");
}

/** "Open every day 8:00–18:00", "Open Mon, Tue · 8:00–18:00" or "". */
export function openLine(facts: any): string {
  if (!facts.days.length && !facts.hours) return "";
  if (facts.everyDay) return facts.hours ? t("galio.facts.everyDayHours", "Open every day, {hours}", { hours: facts.hours }) : t("galio.facts.everyDay", "Open every day");
  const days = facts.days.map((d: string) => d.slice(0, 3)).join(", ");
  return facts.hours ? t("galio.facts.daysHours", "Open {days}, {hours}", { days, hours: facts.hours }) : t("galio.facts.days", "Open {days}", { days });
}

/** A tel: link. */
export function telOf(phone: string): string {
  return "tel:" + String(phone || "").replace(/[^\d+]/g, "");
}

/** Directions to the shop's real place: its coordinates, else its address. */
export function directionsTo(facts: any): string {
  const l = facts.location;
  const dest = l && Number(l.lat) && Number(l.lng) ? `${l.lat},${l.lng}` : encodeURIComponent(facts.address || "");
  return dest ? `https://www.google.com/maps/dir/?api=1&destination=${dest}` : "";
}

/* ━━━━━━━━━━━━ Routes ━━━━━━━━━━━━ */

export function routes() {
  return window.$storefront.routes;
}

export function shopAllTo() {
  return { name: routes().SHOP_PAGE, query: { sort: "most_sales" } };
}

export function bagPageTo() {
  return { name: routes().BASKET_PAGE, params: { type: "PHYSICAL" } };
}

/* ━━━━━━━━━━━━ Words on one line ━━━━━━━━━━━━ */

/** The mockup's fitAll(): a script word stays on one line inside its box; the font shrinks until it fits. */
export function fitLine(el: HTMLElement): void {
  el.style.fontSize = "";
  const cs = getComputedStyle(el);
  if (cs.display === "none" || cs.position === "static") return;
  let s = parseFloat(cs.fontSize);
  while (el.scrollWidth > el.clientWidth + 1 && s > 36) {
    s -= 2;
    el.style.fontSize = s + "px";
  }
}
