# Customize

Galio's design lives in its own components and style sheets. Selldone's commerce logic underneath (basket, bill, checkout, variants, orders, payment) stays untouched. After any change in the code: build and upload a new version ([Build and Upload](Build-and-Upload)) and put it live ([Go Live](Go-Live)). A change in your shop's data (a title, a photo, a delivery window, an article) needs no release: it shows on the next visit.

## The name and the wordmark

The wordmark is your **shop's title**, read live. `components/galio/GlMark.vue` draws it in lower case in Shrikhand, then a round lemon dot, in the rail, the top bar, the menu sheet, the sign-in dialog and the footer. A long title shrinks until it fits its place; it is never cut. The page titles and the messages use the same title. Rename the shop in Selldone and the Layout follows.

`components/kalio/kalio-brand.ts`: `BRAND.name = null` keeps the shop's title. A string there replaces it everywhere the storefront names the shop.

The mark (the browser tab's icon) is drawn from the title's first letter by `markFor()` in the same file: the letter in Shrikhand, cream on a cocoa rounded square, with the lemon dot. It is an inline SVG, so there is no image file to replace.

## The colours, light or dark

One file: `components/galio/galio-theme.settings.ts`. See [Theme and colours](Theme-and-colours). Do not edit the palettes in `components/galio/galio-theme.ts` or the tokens in `style/galio/b.css` for a merchant's theme.

## Type, tokens and words

| What | Where |
| --- | --- |
| Fonts (Shrikhand for display, Caveat for the kickers, Outfit for text; Material Symbols Rounded for the icons of the parts the shared base still draws) | `components/kalio/kalio-fonts.ts` |
| Icons (the mockup's inline line icons and the collections' line drawings) | `components/galio/gl-icons.ts`, drawn by `GlIcon.vue`; `collKey()` matches a collection to its drawing by name |
| Colour, type and radius tokens for both modes (white pages, the four sorbet bands, cocoa rail and footer, plates, stickers, map, the action colour) | `style/galio/b.css` (generated from the mockup): `:root` is light, `html.gl-dark` the cocoa night. To change one for good, change the mockup and re-run `scripts/galio-css.cjs`, or override it in `style/galio.scss` |
| The collections' sorbet tints (six, given in the shop's order, then repeated) | `TINTS` in `components/galio/galio.ts` |
| "Bag" instead of basket in Selldone's own English strings | `components/kalio/kalio-brand.ts` (`bagWords()`) |
| Galio's own words (every one through `t("galio.…", "English")`) | the components; the English in `components/kalio/i18n/galio.en.ts`, the languages in `galio.<code>.ts` (see [Languages](#languages)) |

## Photos

Every pastry, collection fact and article picture is your shop's own; a few photo slots belong to the Layout:

| Picture | Where it comes from |
| --- | --- |
| Pastries on every card, the price list, the bag, the quick look, the product page | each product's main photo, a transparent cut-out (PNG or WebP), set on a round plate in its collection's tint; more photos make the gallery |
| Collections in the rail's Shop menu, the menu sheet and "Pick your pastry" | a line drawing matched by the collection's name (`components/galio/gl-icons.ts`) |
| The journal and each post | each article's cover image |
| Visit the counter, About and Contact | a static map of the shop's location (Selldone's map service) |
| The hero slides, the "How it reaches you" mosaic, the "Sold by the piece" banner | the photo slots: `assets/galio/<file>` when the file is in the repository (`components/galio/gl-photos.ts`), else a designed fallback with your own cut-outs or a sorbet tint and a line drawing |

So a pastry photo is changed in the Selldone dashboard, not in the code. The cut-outs matter: a photo with its own ground shows as a square on the round plate. See [Shop Requirements](Shop-Requirements#products).

To add a photo slot, put the WebP file in `assets/galio/` with the exact name and size from [Shop Requirements](Shop-Requirements#photo-slots-the-hero-the-mosaic-and-the-banner) and release. The slot never shows a file name or a size caption, with or without its file.

## Sections and pages

| What | Where |
| --- | --- |
| Side rail (from 1100px), top bar, menu sheet, the language and currency pill and panel | `components/galio/shell/GlShell.vue` |
| The collections menu beside the rail, search, bag drawer, quick look, sign-in dialog | `components/galio/shell/` (`GlFly.vue`, `GlSearch.vue` and `gl-search.ts`, `GlBagDrawer.vue`, `GlBagRow.vue`, `GlLineStep.vue`, `GlQuick.vue`, `GlSignIn.vue`) |
| Footer (wordmark and shop line, newsletter, links, the Theme row, the legal row) | `components/galio/shell/GlFooter.vue` |
| Shared pieces (the shop's data and facts, layers, card, quantity box, product row, receipt, empty state, page-title band) | `components/galio/` (`gl-data.ts`, `galio.ts`, `GlCard.vue`, `GlQb.vue`, `GlMini.vue`, `GlReceipt.vue`, `GlEmpty.vue`, `GlPtitle.vue`) |
| Home (hero slider, Pick your pastry, How it reaches you, Today's prices, Sold by the piece, Best sellers, Visit the counter, From the journal) | `components/galio/home/` (`GlHome.vue`, `GlHero.vue`, `GlTile.vue`, `GlCuts.vue`, `GlMap.vue`), inside `pages/products/StorefrontPageProducts.vue` |
| Listings (a collection, search, deals, all pastries; filters, sort, phone filter sheet) | `components/galio/shop/` (`GlListing.vue`, `GlFilterPanel.vue`), inside `pages/products/StorefrontPageProducts.vue` |
| Product page (gallery, buy column, phone buy bar, tabs, Buy together, More <collection>) | `pages/product/StorefrontPageProduct.vue`, `components/galio/product/` (`GlProductOverview.vue`, `GlPdQb.vue`, `GlTogether.vue`), `components/galio/gl-product.ts` |
| Compare | `components/galio/compare/GlCompare.vue`, `pages/comparison/` |
| Bag page and checkout (step pills, numbered cards, delivery cards and windows, address or pickup counter, billing, note, coupons, the delivery sheet, payment) | `pages/basket/cart/StorefrontPageBasketCart.vue`, `pages/basket/cart/SCartShippingOptions.vue`, `components/galio/buy/gl-cart.ts`, `components/kalio/checkout/KalioAddressSheet.vue` |
| Order page (track card, pieces, payment, delivery, chat) | `pages/basket/order/` (`StorefrontPageBasketOrder.vue`, `physical/dashbaord/`), `components/kalio/order/` |
| Account desk (Overview, Orders, Addresses, Profile; the guest's sign-in entry) | `components/kalio/account/`, `components/galio/account/gl-account.ts`, `pages/user/` |
| Journal and post | `pages/blog/list/StorefrontPageBlogsList.vue`, `pages/blog/view/StorefrontPageBlogsView.vue`, `components/galio/read/` (`GlPost.vue`, `GlCover.vue`) |
| About, Contact, Terms, Privacy, Questions (with the sample text and its label) | `pages/official/`, `pages/faq/StorefrontPageFaq.vue`, `components/galio/read/` (`GlLegal.vue`, `GlSample.vue`), `components/galio/gl-read.ts` |
| 404 | `pages/errors/404/StorefrontPageError404.vue` |

A shop with its own custom header or footer code in Selldone keeps Selldone's header or footer (`layouts/StorefrontLayout.vue`).

## Styles

| File | Holds |
| --- | --- |
| `style/galio/core.css`, `b.css`, `shell.css`, `shop.css`, `product.css`, `buy.css`, `read.css` | the mockup's seven stylesheets, converted by `scripts/galio-css.cjs`: every rule scoped to Galio's own markup (`.gl`), the custom properties renamed `--gl-…`, dark mode as `html.gl-dark`. **Generated: never edit them.** |
| `style/galio.scss` | the Layout's own touches on the shell, home, listings, product and reading pages (for example Selldone's own `.link`, `.dot` and `.card` names, which the mockup shares, set back inside `.gl`) |
| `style/galio-buy.scss` | the Layout's own touches on the bag, checkout, sheets, Selldone's payment window, the account and the order page |
| `style/storefront.scss` and the files it loads (`kalio-*.scss`, `bakini-*.scss`, `walio-*.scss`) | the shared base the Layout started from, for the parts Selldone and Kalio still draw; Galio's switcher writes its palette into their `--bk-act*` colours, `--bk-ft` / `--bk-fd` point at Outfit and Shrikhand, and `html.bk-dark` follows `html.gl-dark` (`storefront.ts`) |

The Galio files are loaded from `StorefrontApp.vue`. Every Galio component wraps its markup in an element with the class `gl`, so the Galio rules never touch Selldone's or Vuetify's parts outside it. The theme switcher's build step (`postcss-dark-tokens`, in `vite.config.ts`) gives the shared base its dark values under `html.gl-dark`; it leaves Galio's own styles alone, because they hold both modes themselves.

## Languages

Every word Galio writes goes through `t("key", "English")` (`components/kalio/i18n/kalio-i18n.ts`). The English is the second argument at the call site; the dictionaries are files beside it:

| File | Holds |
| --- | --- |
| `components/kalio/i18n/base/<code>.ts` | the shared Kalio words (bag, checkout, account, compare, theme…), the same in every Kalio-family Layout |
| `components/kalio/i18n/bakini.<code>.ts` | the Bakini words Galio still uses (`bakini.*`, 159 of them: badges, delivery way names, units) |
| `components/kalio/i18n/galio.<code>.ts` | Galio's own words (`galio.*`) |
| `components/kalio/i18n/lang-<code>.ts` | merges the three; loaded only when a visitor picks that language |
| `components/kalio/i18n/index.ts` | `EN` (English, bundled) and `LOADERS`, the list of other languages Galio knows |

Galio ships English and Arabic (`ar`, right to left: the whole page mirrors). The visitor picks one from the language and currency pill (the menu sheet's "Language & currency" row on a phone); the list is the shop's own languages (Selldone dashboard › Shop › Languages). Bakio sells in English only, so the Arabic is not seen on its live shop. To try it on the dev server, run `localStorage["galio-dev-languages"] = "ar"` in the browser console and reload: Arabic joins the shop's languages in that browser. This switch exists in development only and is left out of the build.

To change a word: edit the English at the call site, and the same key's value in `galio.en.ts` and in each `galio.<code>.ts` (a `bakini.…` key lives in `bakini.<code>.ts`, and a shared Kalio word, one without either prefix, in `base/<code>.ts`). `galio.en.ts` is generated from the `t()` calls by the Kalio kit's `i18n-extract.cjs`; edit the call site first.

To add a language your shop offers:

1. Copy `galio.en.ts` to `galio.<code>.ts` and translate every value (keep `{n}`, `{shop}` and the other `{…}` words; plural keys end in `.one` / `.other`, and a language with more forms adds `.zero`, `.two`, `.few`, `.many`).
2. Do the same for `bakini.en.ts` → `bakini.<code>.ts` and `base/en.ts` → `base/<code>.ts`.
3. Copy `lang-ar.ts` to `lang-<code>.ts` and change its three imports.
4. Add one line to `LOADERS` in `index.ts`, next to `ar: () => import("./lang-ar")`.
5. Build and check every page in that language. A word still in English is a string that is not wrapped in `t()` yet: wrap it with a new `galio.…` key.

The words the shop writes (product names, collections, units, pros, spec, articles) are the shop's data: translate them in the Selldone dashboard.

Right to left, Galio keeps these rules:

- logical CSS everywhere (`margin-inline`, `inset-inline`, `text-align: start`), so the page mirrors (the hero's tabs fill from the right);
- the shop's own words (names, collections, addresses) sit in `<bdi>`, so each keeps its own direction inside a translated sentence;
- words in a circle (the saving sticker, the journal's date roundel) stay inside it in every currency and language: `components/bakini/fit-in-circle.ts` shrinks them until they fit, and the stickers refit when the window changes;
- an Arabic face (Noto Sans Arabic) is loaded only when Arabic is picked.

## Rules the design keeps

- **One action colour.** Cherry (or your palette) for every button, chosen state and link. Every colour is a token.
- **Flat.** Pill buttons without shadows; hover changes the colour only; no line under any word or icon. The only underlined words are the links inside a post's own text.
- **Rings inside the box.** Every selection ring and card edge is an inset shadow, never an outline.
- **Cut-outs on round plates.** Product photos are transparent cut-outs on a plate in their collection's tint; the tints darken in dark mode, so there is no white tile in either mode.
- **Bag, not cart.** In the Layout's words and in Selldone's own English strings.
- **Honest words.** No invented history, awards, names, counts or reviews; sample pages say they are samples; delivery lines and windows only from the shop's own delivery ways (a window only where the shopper can pick one); counter hours only from the pickup note; deal clocks only to a deal's real end date; "not taking payment" when there is no payment method.
- **Live data.** Nothing names a product, price, collection, delivery way or opening hour; another bakery gets its own.
- **Photo slots never show a caption.** Without its file a slot is a designed fallback, and a 640px cut-out is never blown up into a hero.
