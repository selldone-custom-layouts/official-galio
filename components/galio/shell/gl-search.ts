/*
 * Galio Sundae — search over the live catalogue (galio-design/g/shell.js score(), search()), shared by
 * the search panel and the results page: a word at the start of the title counts most, then the start
 * of a word in it, then anywhere in it, then the collection and the spec; every word must be found.
 */
import { specGroups } from "../gl-data";

/** The words the matching reads for a product: its title, its collection and its spec values. */
function hayOf(p: any, collection: string): string {
  const spec = specGroups(p)
    .flatMap((g) => g.rows.map((r) => r[1]))
    .join(" ");
  return `${p.title || ""} ${collection} ${spec}`.toLowerCase();
}

export function searchScore(p: any, q: string, collection = ""): number {
  const title = String(p?.title || "").toLowerCase();
  const hay = hayOf(p, collection);
  const words = String(q || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return 0;
  let s = 0;
  for (const w of words) {
    if (title.indexOf(w) === 0) s += 6;
    else if (title.indexOf(" " + w) >= 0) s += 5;
    else if (title.indexOf(w) >= 0) s += 3;
    else if (hay.indexOf(w) >= 0) s += 1;
    else return 0;
  }
  return s;
}

/* Words that say nothing about a pastry, left out of the suggestions. */
const STOP = new Set(["and", "with", "the", "of", "a", "an", "in", "on", "mini", "classic", "double", "cake", "cakes"]);

/** The words most product titles share (flavours), from the live catalogue, most shared first. */
export function popularWords(products: any[], cats: any[], n = 5): string[] {
  const count = new Map<string, number>();
  const titleOf = (c: any) => String(c?.title || c?.name || "").toLowerCase();
  const catWords = new Set(cats.flatMap((c) => titleOf(c).split(/\s+/)).concat(cats.flatMap((c) => titleOf(c).replace(/s$/, "").split(/\s+/))));
  for (const p of products) {
    const seen = new Set<string>();
    for (const w of String(p.title || "").split(/[^\p{L}]+/u)) {
      const k = w.toLowerCase();
      if (k.length < 4 || STOP.has(k) || catWords.has(k) || catWords.has(k + "s") || seen.has(k)) continue;
      seen.add(k);
      count.set(k, (count.get(k) || 0) + 1);
    }
  }
  return [...count.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
}
