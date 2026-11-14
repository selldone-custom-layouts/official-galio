# Troubleshooting

## Sign in goes to Selldone and shows an error

The shop has no OAuth client for sign-in. Set up the shop's OAuth client id (shop dashboard, or the Selldone MCP connector's `selldone_shop_client_create`). See [Shop Requirements](Shop-Requirements).

## The live shop is blank, with "… is not defined" in the console

A package module was put in a chunk where it runs before what it needs. This is how Galio 1.0.0 was blank on galio.selldone.shop: the core-chunk rule took any small module, so Prism's language files joined the core and ran before Prism (`ReferenceError: Prism is not defined`). Every dev check had passed, because the dev server does not bundle.

- Keep the rule in `coreChunk` (`vite.config.ts`): only the Layout's own source (this folder, never `node_modules`, never a virtual or query module) under 6 kB may join the core.
- `GALIO_CHUNK_LOG=<file> npx vite build` lists the modules that joined the core.
- Always release with `scripts/release.sh`: its step 5b (`scripts/galio-prod-check.mjs`) loads the built bundle in a browser and refuses the upload on any page error. See [Build and Upload](Build-and-Upload#why-step-5b-exists).

## The release stops with "PROD-CHECK FAILED"

The built bundle did not draw a page, or raised an error, in a headless browser. The line above it names the page and the error; fix that and run the release again (nothing was sent to Selldone, so that version number is still free). Other messages from the check:

| Message | Fix |
| --- | --- |
| `no dist/app/shop.js: build first` | Run `npx vite build` before running the check by hand. |
| `… has no private Layout release in its loader to point at the local build` | `SHOP_URL` must be an address whose loader carries a private Layout release. Leave it at the default `https://galio.selldone.shop`, or use a domain of yours that already has a Layout attached. |
| `Cannot find module` / a Playwright error | Set `PW` to your install's `node_modules/playwright/index.js` and install Chromium (`npx playwright install chromium`). |
| `the storefront HTML did not come` | The shop address did not answer. The check tries four times; check your connection and `SHOP_URL`. |

## The shop shows a blank page, or an old page flashes first

A chunk imports `../shop.js`, so the app loads twice through Selldone's redirect. Keep shared code in the `core` chunk and don't use `experimentalMinChunkSize` (both in `vite.config.ts`; Rollup merged chunks into the entry with it). `release.sh` refuses such a build.

## Chunks fail with a MIME error (`text/x-java`)

Selldone stores the MIME type it sniffs from each file. Every JS file must start with `"use strict";`: that is `sniffAsJavaScript` in `vite.config.ts`. Check with `file --mime-type dist/app/js/*.js`.

## The upload is rejected

| Message | Fix |
| --- | --- |
| "The manifest must be an array." | Upload with `scripts/kalio-deploy.mjs`, not the plain CLI. |
| "Archive paths must be safe relative app/ paths." | Remove `dist/index.html`, and use no spaces or brackets in file names. |
| "Active SVG attributes" / "only passive vector shapes" | Run `node scripts/kalio-svg-flatten.mjs dist/app`. |
| Request cut off after ~100 s, and the version exists but is empty | Too many files. Stay under ~360 (Galio 1.0.2 has 317; photo slots add one file each), then upload a **new** version number. |
| 401 | The CLI is signed out (`~/.selldone-dev/.persist` is empty). Run `selldone` → Login. |
| `node: bad option: --use-system-ca` | Your Node.js is too old for the release scripts. Use Node.js 22.15 or newer. |

## The upload worked but the shop still shows the old version

- The version isn't attached yet: see [Go Live](Go-Live).
- A custom domain keeps its own selection. Attach the version to that domain, or set it to **inherit**.
- You checked a URL with a query. Open the plain address and read `window.sdShopLayout`.
- The ZIP was stale: always package with `--force` and compare `shop.js` with `cmp`.

## `/` shows a landing page, the Layout is only on `/shop`

The Home is a Page Builder page. Set Home to **Shop** for the shop, or for that domain: see [Go Live](Go-Live).

## A pastry sits on a white or coloured square inside its round plate

Its photo has its own ground. Galio sets every pastry on a round plate in its collection's tint, so the main photo must be a **transparent cut-out** (PNG or WebP). Replace the photo in Selldone; no release is needed. See [Shop Requirements](Shop-Requirements#products).

## A home section is missing

Each section folds away without its data:

| Section | Needs |
| --- | --- |
| The hero slider | collections with products; a photo slot file for each slide is optional (without one, the slide shows the collection's best sellers as cut-outs) |
| Pick your pastry, Today's prices | collections with products |
| How it reaches you | a courier, shipping or pickup way, or a payment method; a way the shop lacks leaves its tile out (four make the mosaic, fewer a row) |
| Best sellers | products |
| Visit the counter | an address or a location in the shop info (or a pickup point's address) |
| From the journal | published articles (Selldone's demo posts are left out) |

See [Shop Requirements](Shop-Requirements).

## The hero shows small pastries instead of a photo

That is the designed fallback of a photo slot without its file. Add `assets/galio/galio-hero-<collection name>-wide.webp` and `-square.webp` and release; see [Shop Requirements](Shop-Requirements#photo-slots-the-hero-the-mosaic-and-the-banner). The collection name is its address name in Selldone, so a renamed collection needs renamed files.

## A collection has the wrong line drawing

The drawing is matched by the collection's name or address name (cookie, croissant, danish, muffin, cake, tart and their neighbours); one that matches none gets a generic pastry. Rename the collection, or add a pattern to `MATCH` in `components/galio/gl-icons.ts` and release.

## The counter hours are missing, or show twice

They are read from the pickup point's note, as a time range: `8:00-18:00`, `8:00–18:00` or `8:00 to 18:00`. Write them that way in the note. Without a range, the hours are left out everywhere; nothing is guessed. When the note itself already gives the hours, the Layout shows the note and does not add them again (fixed in 1.0.2: the delivery sheet once read "… Open every day 8:00–18:00. · open every day 8:00–18:00").

## Checkout shows no time windows, or a way lists windows it doesn't offer

The windows are your delivery ways' own time spans, and Galio shows them only for a way whose delivery time is one of Selldone's timeframe kinds (`timeframe`, `weekday-timeframe`). Add the time spans and choose that kind on the delivery way in the Selldone dashboard. A way with time spans but another kind (Bakio's worldwide shipping) offers no window: since 1.0.2 no page lists windows for it, and a window picked for the courier is dropped when the shopper switches to such a way.

## The pickup address reads "Building number: 1, …"

Selldone's own address text adds its field labels. Since 1.0.2 the delivery sheet writes the counter's address the way a shopper writes it. If it still looks wrong, check the pickup point's address fields in the dashboard.

## The map shows no streets

Neither the shop info nor the pickup point has a location. Set the shop's location on the map in the Selldone dashboard. Without one, Visit the counter, About and Contact show no street picture.

## Filters are missing, or a spec key never becomes a filter

- Specs must be **flat**, plus `spec_order`. A nested spec is not shown anywhere.
- A key becomes a filter only with **two or more different values** in that collection, each **28 characters or fewer**. A long sentence stays under Specification and never becomes a filter. Price, On offer and In stock are always there.

See [Shop Requirements](Shop-Requirements#specs-and-filters).

## The quick look or a card says "Choose options"

The product has variants. The shopper is sent to the product page, where the options are chosen. This is by design.

## Checkout says "This shop is not taking payment right now"

The shop has no payment method for this currency. Add one in the Selldone dashboard (cash on delivery is fine). Galio shows this line instead of a Pay button that opens an empty window.

## Selldone's payment window looks off-white, square or narrower than the phone

Kalio's rule for every bottom sheet's card is heavier than Galio's, and Selldone sizes the window at `98vw`. Since 1.0.2 `style/galio-buy.scss` makes the payment window white and round, and full width on a phone. If you restyle it, keep the selector at least as strong as `.v-bottom-sheet > .v-bottom-sheet__content > .v-card`.

## About, Terms, Privacy or Questions say "Sample text"

The shop has not written that page yet. The sample is built only from your shop's facts. Write the page (or the FAQ entries) in the Selldone dashboard and the label goes away.

## A post ends with "Pastries to try" instead of "Shop this post"

The panel under a post shows the pastries its text links to (`/product/<id>` links), else the ones it names, else four to try. Link the pastries in the article's text.

## The footer's Theme row doesn't show on my shop

That is by design: with `themeSwitcher: "showcase"` it shows only on the Layout's own showcase shops. Set `themeSwitcher: "on"` in `components/galio/galio-theme.settings.ts` to give your visitors the switcher. See [Theme and colours](Theme-and-colours).

## Selldone's default purple appears in some places

Those are Selldone's own components using the theme colour. Galio's switcher writes the palette into `--gl-act*` and the shared base's `--bk-act*`, `style/kalio-tokens.scss` points `--v-theme-primary` at it, and Vuetify's theme takes the palette from `components/galio/galio-theme.ts`; if a part still shows Selldone's purple, make it read that variable rather than a fixed colour. To change the colours themselves, use the settings file, not the tokens.

## Selldone's header or footer shows instead of Galio's

The shop has custom header or footer code in Selldone. A shop with its own code keeps Selldone's header or footer (`layouts/StorefrontLayout.vue`). Remove the custom code to get Galio's rail, top bar and footer.

## I edited `style/galio/*.css` and my change was lost

Those files are generated from the mockup by `scripts/galio-css.cjs`. Put the change in `style/galio.scss` or `style/galio-buy.scss` instead. See [Customize](Customize#styles).

## A product page shows a plain purple page in a headless test

A headless browser opening a `/product/` link directly gets Selldone's SEO page. Open the home first and move with the Layout's links, or test in a normal browser or the dev server.

## The map in the address sheet is grey or 0 px tall

`mapbox-gl.css` sets `position: relative` on the map; the canvas must stay `position: absolute`. Use the `streets-v12` style. Search finds streets and numbers, not landmarks. With the checkout map off, the address sheet is a short form instead.

## Sticky parts don't stick

Vuetify's `.v-application` has `overflow: hidden`. Switch it to `overflow: clip` on the pages that need sticky (the product page's buy column is one).

## GitHub blocks the push: "Mapbox Secret Access Token"

Selldone's storefront history contains Selldone's **public** Mapbox browser key (`pk.`). It has been public in `selldone/storefront` since 2023. Allow it once with the link GitHub prints, or remove it from your own commits.

## A word stays in English after picking another language

If it is your shop's data (a product, collection, unit, pros, spec or article), translate it in the Selldone dashboard. If Galio writes it, it is a string not yet wrapped in `t()`: wrap it with a new `galio.…` key, add the key to `galio.en.ts` and to each `galio.<code>.ts`, then build and release. See [Customize](Customize#languages).

## Arabic never appears on my shop

The language list is the shop's own. Bakio sells in English only, so its live shop has no Arabic. Enable the language in the Selldone dashboard, or, to try it on the dev server only, set `localStorage["galio-dev-languages"] = "ar"` in the browser and reload.

## A check stops with "Resulting promise was garbage collected"

A Playwright flake, not a finding. Run that check again (`bash scripts/run-checks.sh <base> <logs> <check name>`).

## A red "429 Too Many Attempts" message, or a page that stays empty

Selldone limits how many requests one address may send in a minute. Many test browsers at once (or several Layouts tested from one computer) reach it; shoppers do not. Galio retries its shared reads up to four times; wait a minute and reload. Run the checks one at a time.
