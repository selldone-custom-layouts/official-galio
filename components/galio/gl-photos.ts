/*
 * Galio Sundae — the photo slots (galio-design/g/photos.js, the prompts in galio-design/CODEX-PROMPTS.md).
 *
 * A slot shows assets/galio/<file> when that file is in the Layout (import.meta.glob lists only the
 * files that exist at build time). The owner's Codex photos are dropped in later with the same names:
 *
 *   galio-hero-<collection name>-wide.webp   2400×1200  hero slide, desktop and tablet
 *   galio-hero-<collection name>-square.webp 1200×1200  hero slide, phones
 *   galio-mosaic-counter.webp                1600×1600  "How it reaches you", the counter
 *   galio-mosaic-courier.webp                 800×800   the courier
 *   galio-mosaic-table.webp                   800×800   paying on delivery
 *   galio-mosaic-shipping.webp               1600×800   shipping
 *   galio-banner-wide.webp                   2400×1000  the "one piece at a time" banner
 *   galio-banner-square.webp                 1200×1200  the same, phones
 *
 * A hero slide is matched by the collection's own `name` (its address slug), so a collection with no
 * photo, a new collection or a cloned shop never shows an empty frame: every slot without its file
 * shows a designed fallback (the tinted surface with line art, or the collection's own cut-outs kept
 * small). No file name or size is ever written on the page.
 */
const FILES = import.meta.glob("../../assets/galio/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const BY_FILE = new Map<string, string>(Object.entries(FILES).map(([path, url]) => [path.split("/").pop()!, url]));

/** The photo for a file name, or null (then the slot's fallback stands in). */
export function photo(file: string): string | null {
  return BY_FILE.get(file) || null;
}

/** A hero slide's photos (wide for desktop and tablet, square for phones), by the collection's name. */
export function heroPhotos(cat: any): { wide: string | null; square: string | null } {
  const slug = String(cat?.name || "");
  if (!slug) return { wide: null, square: null };
  return { wide: photo(`galio-hero-${slug}-wide.webp`), square: photo(`galio-hero-${slug}-square.webp`) };
}

export function hasHeroPhoto(cat: any): boolean {
  const p = heroPhotos(cat);
  return !!(p.wide || p.square);
}
