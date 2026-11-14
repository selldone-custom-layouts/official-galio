/*
 * Galio Sundae's theme: the one file to edit (for a merchant, or the merchant's AI).
 *
 * These settings are the Layout's designed default on any shop, painted before the first paint. On a
 * shop that does not show the visitor switcher (see themeSwitcher) they are the only theme. After a
 * change: build and upload (bash scripts/release.sh <new-version> desk), see AGENTS.md "Theme".
 *
 * Galio uses one colour family: the palette (or brandColor) colours the buttons and also every ground,
 * band, plate, the rail and the footer (components/galio/galio-family.ts computes the family from it;
 * a merchant edits only this file).
 *
 * palette        one of: "cherry" (the brand, the default), "pistachio", "blueberry", "cocoa"
 * brandColor     any colour, "#RRGGBB"; when set it replaces `palette`: the whole page takes its family,
 *                and the colour is made readable automatically (buttons, links, dark mode)
 * mode           "light" (white pages and the family's light tints, the default) | "dark" (the same
 *                family's night)
 * themeSwitcher  "showcase" (the visitor switcher only on the Layout's own showcase shop, Bakio; the
 *                default) | "on" (your visitors get it) | "off"
 * textOnBrand    with brandColor: "auto" (a light brand such as yellow keeps its colour, with dark words
 *                on its buttons) | "white" (white words; a light colour is darkened until they read)
 */
import type { ThemeSettings } from "../theme-switcher/theme-switcher";

export const THEME_SETTINGS: ThemeSettings = {
  palette: "cherry",
  // brandColor: "#F5C400",
  mode: "light",
  themeSwitcher: "showcase",
  textOnBrand: "auto",
};
