/*
 * Galio Sundae — the mockup's icons (galio-design/g/icons.js): the UI line icons (24×24, one stroke)
 * and the collection line drawings (64×64), drawn for Galio.
 *
 * A collection's drawing is matched by its own name or slug (cookie, croissant, danish, cake,
 * muffin, tart…), so another bakery's collections get the right one; a collection that matches none
 * gets a generic pastry (a scored loaf). Nothing is matched by id.
 */
export const ICONS: Record<string, string> = {
  bag: "<path d=\"M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8z\"/><path d=\"M9 8V6.5a3 3 0 0 1 6 0V8\"/>",
  menu: "<path d=\"M4 7h16M4 12h16M4 17h16\"/>",
  x: "<path d=\"M6 6l12 12M18 6L6 18\"/>",
  search: "<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"M16 16l4 4\"/>",
  globe: "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5s1.2-6.1 3.8-8.5z\"/>",
  left: "<path d=\"M14.5 6l-6 6 6 6\"/>",
  right: "<path d=\"M9.5 6l6 6-6 6\"/>",
  arrow: "<path d=\"M5 12h13M13 7l5 5-5 5\"/>",
  play: "<path d=\"M8 5.5v13l10.5-6.5z\"/>",
  pause: "<path d=\"M9 6v12M15 6v12\"/>",
  plus: "<path d=\"M12 5v14M5 12h14\"/>",
  minus: "<path d=\"M5 12h14\"/>",
  pin: "<path d=\"M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z\"/><circle cx=\"12\" cy=\"10\" r=\"2.4\"/>",
  clock: "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5V12l3 2\"/>",
  phone: "<path d=\"M6.6 3.8l2.6-.3 1.5 4-2 1.4a11 11 0 0 0 6.4 6.4l1.4-2 4 1.5-.3 2.6a2 2 0 0 1-2.1 1.8C10.6 18.6 5.4 13.4 4.8 5.9a2 2 0 0 1 1.8-2.1z\"/>",
  mail: "<rect x=\"3.5\" y=\"5.5\" width=\"17\" height=\"13\" rx=\"1.5\"/><path d=\"M4 7l8 6 8-6\"/>",
  sun: "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6\"/>",
  moon: "<path d=\"M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z\"/>",
  store: "<path d=\"M4 10v10h16V10\"/><path d=\"M3 10l2-6h14l2 6\"/><path d=\"M3 10c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3\"/><path d=\"M10 20v-5h4v5\"/>",
  scooter: "<circle cx=\"6.5\" cy=\"17\" r=\"2.5\"/><circle cx=\"17.5\" cy=\"17\" r=\"2.5\"/><path d=\"M9 17h6l2.5-6H20\"/><path d=\"M14 7h3l.5 4\"/><path d=\"M4 13h6\"/>",
  plane: "<path d=\"M21 12.5L3 5l3.5 7L3 19z\"/><path d=\"M6.5 12H13\"/>",
  cash: "<rect x=\"3\" y=\"6.5\" width=\"18\" height=\"11\" rx=\"1.5\"/><circle cx=\"12\" cy=\"12\" r=\"2.6\"/><path d=\"M6.5 9.5v5M17.5 9.5v5\"/>",
  camera: "<path d=\"M4 8.5h3.2l1.6-2.5h6.4l1.6 2.5H20v10H4z\"/><circle cx=\"12\" cy=\"13\" r=\"3.6\"/>",
  doc: "<path d=\"M7 3.5h7l4 4v13H7z\"/><path d=\"M14 3.5v4h4M9.5 12h6M9.5 15.5h6\"/>",
  leaf: "<path d=\"M5 19c0-8 5-13 14-14-1 9-6 14-14 14z\"/><path d=\"M5 19l7-7\"/>",
  user: "<circle cx=\"12\" cy=\"8.5\" r=\"3.8\"/><path d=\"M4.5 20c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6\"/>",
  down: "<path d=\"M6 9.5l6 6 6-6\"/>",
  up: "<path d=\"M6 14.5l6-6 6 6\"/>",
  check: "<path d=\"M5 12.5l4.5 4.5L19 7.5\"/>",
  trash: "<path d=\"M5 7h14M10 7V5h4v2M7 7l1 12.5h8L17 7\"/><path d=\"M10.5 10.5v6M13.5 10.5v6\"/>",
  filter: "<path d=\"M4 6h16M7 12h10M10 18h4\"/>",
  sort: "<path d=\"M8 5v14M5 16l3 3 3-3M16 19V5M13 8l3-3 3 3\"/>",
  send: "<path d=\"M4 12l16-7-6 15-2.5-6.5z\"/><path d=\"M11.5 13.5L20 5\"/>",
  chat: "<path d=\"M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-4.5 3.5v-3.5h0a2 2 0 0 1-1-1.7z\"/>",
  share: "<circle cx=\"6.5\" cy=\"12\" r=\"2.4\"/><circle cx=\"17.5\" cy=\"6\" r=\"2.4\"/><circle cx=\"17.5\" cy=\"18\" r=\"2.4\"/><path d=\"M8.6 10.9l6.8-3.8M8.6 13.1l6.8 3.8\"/>",
  link: "<path d=\"M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2\"/><path d=\"M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2\"/>",
  compare: "<rect x=\"3.5\" y=\"5\" width=\"7\" height=\"14\" rx=\"1.5\"/><rect x=\"13.5\" y=\"5\" width=\"7\" height=\"14\" rx=\"1.5\"/><path d=\"M6 9h2M16 9h2M6 12.5h2M16 12.5h2\"/>",
  gift: "<rect x=\"4\" y=\"9\" width=\"16\" height=\"11\" rx=\"1.5\"/><path d=\"M3 9h18M12 9v11M12 9c-1.5-3.5-5.5-4-5.5-1.5S10 9 12 9zm0 0c1.5-3.5 5.5-4 5.5-1.5S14 9 12 9z\"/>",
  info: "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 11v5.5M12 7.8v.4\"/>",
  edit: "<path d=\"M5 19l1-4 9.5-9.5 3 3L9 18z\"/><path d=\"M13.5 7.5l3 3\"/>",
  home: "<path d=\"M4 11l8-6.5 8 6.5\"/><path d=\"M6 9.5V20h12V9.5\"/><path d=\"M10 20v-5h4v5\"/>",
  box: "<path d=\"M4 8l8-4 8 4v8.5l-8 4-8-4z\"/><path d=\"M4 8l8 4 8-4M12 12v8.5\"/>",
  lock: "<rect x=\"5\" y=\"10.5\" width=\"14\" height=\"9.5\" rx=\"1.5\"/><path d=\"M8 10.5V8a4 4 0 0 1 8 0v2.5\"/>",
  out: "<path d=\"M14 5h4.5v14H14\"/><path d=\"M10 8l-4 4 4 4M6 12h9.5\"/>",
  star: "<path d=\"M12 4.5l2.3 4.8 5.2.7-3.8 3.6.9 5.2L12 16.3 7.4 18.8l.9-5.2L4.5 10l5.2-.7z\"/>",
  oven: "<rect x=\"4\" y=\"4.5\" width=\"16\" height=\"15.5\" rx=\"1.5\"/><path d=\"M4 9h16\"/><rect x=\"7.5\" y=\"12\" width=\"9\" height=\"5\" rx=\"1\"/><path d=\"M7.5 6.8h.5M10.5 6.8h.5\"/>",
  locate: "<circle cx=\"12\" cy=\"12\" r=\"6.5\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3\"/>",
  question: "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.4M12 16.5v.3\"/>",
  google: "<path d=\"M20 12.2c0-.6-.1-1.2-.2-1.7H12v3.3h4.5a3.9 3.9 0 0 1-1.7 2.5v2.1h2.7c1.6-1.5 2.5-3.6 2.5-6.2z\"/><path d=\"M12 20.5c2.3 0 4.2-.8 5.5-2.1l-2.7-2.1c-.8.5-1.7.8-2.8.8-2.2 0-4-1.5-4.7-3.4H4.6v2.2A8.5 8.5 0 0 0 12 20.5z\"/><path d=\"M7.3 13.7a5 5 0 0 1 0-3.4V8.1H4.6a8.5 8.5 0 0 0 0 7.8z\"/><path d=\"M12 6.9c1.3 0 2.4.4 3.3 1.3l2.4-2.4A8.4 8.4 0 0 0 4.6 8.1l2.7 2.2C8 8.4 9.8 6.9 12 6.9z\"/>",
  apple: "<path d=\"M15.5 4c.1 1.2-.4 2.3-1.1 3.1-.8.8-1.8 1.3-2.8 1.2-.1-1.1.4-2.3 1.1-3 .8-.8 1.9-1.3 2.8-1.3z\"/><path d=\"M18.8 16.3c-.5 1.1-.7 1.6-1.3 2.5-.9 1.3-2.1 2.9-3.6 2.9-1.3 0-1.7-.9-3.5-.9s-2.2.9-3.5.9c-1.5 0-2.6-1.4-3.5-2.8C1.9 15.5 1.7 11 3.7 9c1-1 2.3-1.6 3.6-1.6s2.1.9 3.5.9c1.3 0 2.1-.9 3.6-.9 1.2 0 2.5.6 3.4 1.7-3 1.6-2.5 5.9 1 7.2z\"/>",
  github: "<path d=\"M12 3.5a8.5 8.5 0 0 0-2.7 16.6c.4.1.6-.2.6-.4v-1.6c-2.4.5-2.9-1-2.9-1-.4-1-1-1.3-1-1.3-.8-.5.1-.5.1-.5.9.1 1.3.9 1.3.9.8 1.3 2 1 2.5.7.1-.6.3-1 .6-1.2-1.9-.2-3.9-1-3.9-4.2 0-.9.3-1.7.9-2.3-.1-.2-.4-1.1.1-2.3 0 0 .7-.2 2.3.9a8 8 0 0 1 4.2 0c1.6-1.1 2.3-.9 2.3-.9.5 1.2.2 2.1.1 2.3.5.6.9 1.4.9 2.3 0 3.3-2 4-3.9 4.2.3.3.6.8.6 1.6v2.4c0 .2.2.5.6.4A8.5 8.5 0 0 0 12 3.5z\"/>",
  linkedin: "<rect x=\"3.5\" y=\"3.5\" width=\"17\" height=\"17\" rx=\"2\"/><path d=\"M8 10.5v6M8 7.6v.2M11.5 16.5v-6M11.5 13c0-1.6 1-2.6 2.4-2.6s2.1 1 2.1 2.6v3.5\"/>",
  logout: "<path d=\"M14 5h4.5v14H14\"/><path d=\"M10 8l-4 4 4 4M6 12h9.5\"/>",
  grid: "<rect x=\"4\" y=\"4\" width=\"6.5\" height=\"6.5\" rx=\"1.5\"/><rect x=\"13.5\" y=\"4\" width=\"6.5\" height=\"6.5\" rx=\"1.5\"/><rect x=\"4\" y=\"13.5\" width=\"6.5\" height=\"6.5\" rx=\"1.5\"/><rect x=\"13.5\" y=\"13.5\" width=\"6.5\" height=\"6.5\" rx=\"1.5\"/>",
  heart: "<path d=\"M12 19.5s-7.5-4.4-7.5-10A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7.5 2.5c0 5.6-7.5 10-7.5 10z\"/>",
  card: "<rect x=\"3\" y=\"5.5\" width=\"18\" height=\"13\" rx=\"2\"/><path d=\"M3 10h18M7 15h4\"/>",
  wallet: "<rect x=\"3.5\" y=\"6\" width=\"17\" height=\"13\" rx=\"2\"/><path d=\"M16 12.5h4.5M3.5 9h17\"/>",
  undo: "<path d=\"M9 7L5 11l4 4\"/><path d=\"M5 11h9a5 5 0 0 1 0 10h-2\"/>",
};

/** One UI icon as SVG markup (aria-hidden: the words beside it name it). */
export function iconSvg(name: string, cls = ""): string {
  return `<svg class="i${cls ? " " + cls : ""}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

/** The collection line drawings, 64×64, one stroke weight (the mockup's six, and a generic pastry). */
const COLL: Record<string, string> = {
  cookies:
    '<circle cx="32" cy="32" r="22"/><path d="M14 27c3 1 4-2 7-1M43 46c2-2 5-1 6-3"/>' +
    '<path d="M22.5 22.5l4.5-1.5 1.5 4.2-4.3 1.6z"/><path d="M36 18.5l4 .6-.4 4.2-4.2-.8z"/><path d="M40.5 31l4.6 1.2-1.3 4.3-4.4-1.4z"/>' +
    '<path d="M26 38.5l4.2 1.2-1.2 4.2-4.4-1.3z"/><path d="M33.5 29.5l3 .2.2 3-3 .2z"/><circle cx="20" cy="33" r=".9"/><circle cx="31" cy="47" r=".9"/><circle cx="46" cy="24" r=".9"/>',
  croissants:
    '<path d="M8 40c3-12 13-20 24-20s21 8 24 20c-3 3-8 3-11-1-1 4-5 7-13 7s-12-3-13-7c-3 4-8 4-11 1z"/>' +
    '<path d="M19 39c1.5-7 4-12 8-15.5M45 39c-1.5-7-4-12-8-15.5M32 46V21"/><path d="M13 36c1-3 2.5-5 4-7M51 36c-1-3-2.5-5-4-7"/>',
  danish:
    '<path d="M32 10c5 0 7 5 7 8 3-2 9-2 11 3s-1 9-4 10c3 2 4 7 1 11s-8 3-11 1c0 3-2 8-7 8s-7-5-7-8c-3 2-8 3-11-1s-2-9 1-11c-3-1-6-5-4-10s8-5 11-3c0-3 2-8 7-8z"/>' +
    '<circle cx="32" cy="32" r="9"/><circle cx="29" cy="30" r="2"/><circle cx="35" cy="29.5" r="2"/><circle cx="32" cy="35" r="2"/>',
  cakes:
    '<path d="M15 30h34v20a3 3 0 0 1-3 3H18a3 3 0 0 1-3-3z"/><path d="M15 30c0-3 3-5 6-5h22c3 0 6 2 6 5"/>' +
    '<path d="M15 31c2 4 4 4 5 1 1 5 4 5 5 0 1 4 4 4 5 0 1 5 4 5 5 0 1 4 4 4 5 0 1 4 4 4 5-1"/><circle cx="32" cy="19" r="4"/><path d="M33.5 15.5c1-3 3-4.5 6-5"/><path d="M15 44h34"/>',
  muffins:
    '<path d="M17 34h30l-4 19H21z"/><path d="M24 34l1.5 19M32 34v19M40 34l-1.5 19"/>' +
    '<path d="M14 34c-2-6 2-10 6-10 0-6 6-9 12-9s12 3 12 9c4 0 8 4 6 10z"/><circle cx="26" cy="24" r="1.2"/><circle cx="35" cy="21" r="1.2"/><circle cx="39" cy="28" r="1.2"/><circle cx="29" cy="29" r="1.2"/>',
  tarts:
    '<path d="M32 11l3.3 2.4 4-.6 2.2 3.4 3.9 1 .6 4 3.2 2.5-1 3.9 2 3.5-2.4 3.2.6 4-3.4 2.2-1 3.9-4 .6-2.5 3.2-3.9-1-3.5 2-3.2-2.4-4 .6-2.2-3.4-3.9-1-.6-4-3.2-2.5 1-3.9-2-3.5 2.4-3.2-.6-4 3.4-2.2 1-3.9 4-.6L28.8 13z"/>' +
    '<circle cx="32" cy="32" r="13"/><path d="M32 32l-6-9M32 32l7-8.5M32 32l10 3M32 32l-10.5 2.5M32 32l1 11"/>',
  /* A generic pastry for a collection the words below do not name: a scored loaf on its board. */
  pastry:
    '<path d="M11 40c0-11 9.5-19 21-19s21 8 21 19v4a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3z"/>' +
    '<path d="M22 28.5l4 7M31 25.5l3.5 8M40 27.5l3.5 7"/><path d="M8 52h48"/>',
};

const MATCH: [RegExp, string][] = [
  [/cookie|biscuit|biscotti|macaron/, "cookies"],
  [/croissant|viennois|brioche/, "croissants"],
  [/danish|pastr(y|ies)|puff|strudel/, "danish"],
  [/muffin|cupcake/, "muffins"],
  [/cake|g[aâ]teau|torte|entremet/, "cakes"],
  [/tart|pie|quiche/, "tarts"],
];

/** The drawing's key for a collection, from its slug and title. */
export function collKey(cat: any): string {
  const words = `${cat?.name || ""} ${cat?.title || ""}`.toLowerCase();
  for (const [re, key] of MATCH) if (re.test(words)) return key;
  return "pastry";
}

/** A collection's line drawing as SVG markup. */
export function collSvg(cat: any): string {
  return `<svg viewBox="0 0 64 64" aria-hidden="true">${COLL[collKey(cat)]}</svg>`;
}
