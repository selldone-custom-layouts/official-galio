/*
 * Galio Sundae — typefaces (galio-design/home-b.html, set B "Sundae").
 *
 * Shrikhand (the fat retro display face: headings, the wordmark, the hero's
 * script word), Caveat (the handwritten kickers over each heading) and
 * Outfit (text and UI). Material Symbols Rounded still draws the icons of the
 * pages the base Layout draws until each is ported (Galio's own parts draw
 * the mockup's inline line icons). They are requested from the app at
 * start-up rather than from index.html: in production the Layout runs inside
 * the HTML Selldone renders for the shop, and index.html never reaches the
 * visitor. Selldone's own components keep their Material Icons (v-icon). An
 * Arabic face is loaded by the i18n runtime only when Arabic is picked.
 */

const FONTS = [
  "https://fonts.googleapis.com/css2?family=Shrikhand&family=Caveat:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..24,400..600,0..1,0&display=block",
];

function addLink(attrs: Record<string, string>) {
  if (document.head.querySelector(`link[href="${attrs.href}"]`)) return;
  const link = document.createElement("link");
  Object.entries(attrs).forEach(([key, value]) => link.setAttribute(key, value));
  document.head.appendChild(link);
}

addLink({ rel: "preconnect", href: "https://fonts.googleapis.com" });
addLink({ rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" });
for (const href of FONTS) addLink({ rel: "stylesheet", href });
