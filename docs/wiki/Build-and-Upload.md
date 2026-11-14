# Build and Upload

Every release is a **new version** of your Layout on Selldone. `scripts/release.sh` runs every step in order; this page explains each one.

## One-time setup

```bash
npm i -g selldone-cli                                        # the official CLI
git clone https://github.com/selldone/cli selldone-cli-src   # its packager lives in .agents/
npm i playwright && npx playwright install chromium          # in any folder: for the production check
```

Sign in to the CLI once:

1. Run `selldone`.
2. Choose **Login | Login to your Selldone account.**
3. Approve the sign-in in your browser and type your **2FA code** in the terminal.

`selldone login` is not a command. The sign-in is saved in `~/.selldone-dev/.persist`; if that file is empty, every upload answers 401 until you sign in again.

You also need Python 3 (for the packager), Node.js 22.15 or newer (the scripts run `node --use-system-ca`) and Bash with `file`, `unzip` and `cmp` (Git Bash on Windows has them).

## Release

The first upload creates your Layout. Leave `LAYOUT_ID` out:

```bash
PW=<playwright folder>/node_modules/playwright/index.js SELLDONE_CLI_SRC=../selldone-cli-src \
  bash scripts/release.sh 1.0.0 desk
```

Note the Layout id printed after it (the line `deploy: {"layout_id":…}`; it is also in the Selldone developer panel). Every later release:

```bash
LAYOUT_ID=<your Layout id> PW=<playwright folder>/node_modules/playwright/index.js \
  SELLDONE_CLI_SRC=../selldone-cli-src bash scripts/release.sh <new version> desk
```

The arguments:
- the **new version**, never used before;
- `desk`, the account design argument of the shared script. Galio no longer reads it (`VITE_KALIO_ACCOUNT`): its account desk is the same either way.

The variables:
- `SELLDONE_CLI_SRC`: your clone of [selldone/cli](https://github.com/selldone/cli) (required);
- `SELLDONE_CLI`: the installed CLI, by default `$(npm root -g)/selldone-cli`;
- `LAYOUT_ID`: with it, the script also checks the upload on the server;
- `PW`: the `index.js` of your Playwright install, for the production check;
- `SHOP_URL`: the shop address the production check borrows its HTML from (default `https://galio.selldone.shop`, see step 5b).

Run one upload at a time. (The workspace where Galio was built wraps `release.sh` in a small queue script, `upload-guard.sh`, because several Layouts upload from one computer there. It is not part of this repository, and you don't need it for one upload at a time.)

## What the script does, and why

| Step | Why |
| --- | --- |
| 1. Bump `version` in `manifest.json` | A version number is used up even when an upload fails. Never reuse one. |
| 2. `npm run build-production` | Outputs `dist/app/shop.js`, one stylesheet `dist/app/shop.css` and the chunks, with a **relative base**. Releases are served from `cdn.selldone.com/public/layouts/<id>/releases/<ULID>/app/`. Galio ships no photo files unless you add the photo slots (see [Shop Requirements](Shop-Requirements#photo-slots-the-hero-the-mosaic-and-the-banner)). |
| 3. `rm -f dist/index.html` | Every ZIP member must be under `app/`. In production the Layout runs inside Selldone's HTML, so `index.html` is never used. The fonts (Shrikhand, Caveat, Outfit) load from the app code (`components/kalio/kalio-fonts.ts`). |
| 4. `scripts/kalio-svg-flatten.mjs` | Selldone accepts only passive SVG attributes. `style`, `<style>`, `xml:space`, `enable-background`, `display`, `fx/fy`, `data-*` and character references in values are refused. |
| 5. MIME check (`file --mime-type`) | Selldone stores the MIME type it sniffs. A chunk starting with `import{` is stored as `text/x-java`, which browsers refuse. Every chunk starts with `"use strict";` (`sniffAsJavaScript` in `vite.config.ts`). |
| 5. No `../shop.js` imports | Selldone's loader reaches `shop.js` through a redirect. A chunk importing `../shop.js` loads the app twice: an old page flashes, then the page goes blank. Shared code lives in a `core` chunk (`coreChunk` in `vite.config.ts`). |
| 5. File count under ~360 | The archive is extracted inside the upload request, behind a ~100 s limit. At 714 files it was cut off mid-way and the version was burned. Galio 1.0.2 has 317 files: small modules of the Layout's own source join the core chunk, the reading pages share one chunk (`galio-read`), SVGs up to 16 KB and small PNG/JPG icons up to 12 KB ride inline, fonts ship as WOFF2 only and country flags load from jsDelivr (all in `vite.config.ts`). A new dependency or photo slots can push it over. |
| 5b. `scripts/galio-prod-check.mjs` | **The built bundle must load in a real browser before it goes up.** A local server (port 9146) answers every address with the shop's real storefront HTML from `SHOP_URL`, with Selldone's loader pointed at `dist/app/shop.js` and `shop.css`. Headless Chromium opens the home and moves in the app to a collection, a product, the journal, a post, the bag with one piece and the checkout. Each page must draw Galio's root (`.gl`) with text and raise no page error, or the release stops here. Nothing is ordered: Selldone's `/buy/` calls are blocked. |
| 6. `package_layout.py … --force` | Without `--force`, an old `dist.zip` is kept and it still prints PASS. |
| 6. `cmp` of `shop.js` | Proves the ZIP is this build. |
| 7. `scripts/kalio-deploy.mjs` | Uploads with the official CLI's sign-in and checks, sending only the six manifest fields the server accepts. |
| 7. `scripts/kalio-verify-deploy.mjs` | Asks the server: the newest deploy must show `extracting:false`, `error:null`, `js_match:true` and `css_match:true`. **A CLI exit code is not proof.** |

To check an upload again later:

```bash
node --use-system-ca scripts/kalio-verify-deploy.mjs <selldone-cli root> <your Layout id> dist/app
```

It prints the two newest deploys, each with its release path.

## Why step 5b exists

**Dev checks never see chunking bugs: always load the built bundle before uploading.** The dev server does not bundle, so it cannot show what the chunk rules do. Galio 1.0.0 passed every dev check and was blank live: the core-chunk rule then took any small module, packages included, so Prism's language files (`prismjs/components/prism-*.js`) joined the core and ran before Prism itself (`ReferenceError: Prism is not defined`). Since 1.0.1 only the Layout's own source (this folder, never `node_modules`, never a virtual or query module) under 6 kB can join the core, and every release is loaded in a browser first.

To run the check by hand:

```bash
npx vite build
PW=<playwright folder>/node_modules/playwright/index.js node --use-system-ca scripts/galio-prod-check.mjs
```

It prints one line per page and `PROD-CHECK OK`, or `PROD-CHECK FAILED n`. `SHOP_URL` must be an address whose loader carries a **private** Layout release (any Layout), because the check swaps that release for your build. The default, `https://galio.selldone.shop`, works for a first release; once your own domain carries a Layout, use it so the check runs on your data. `GALIO_CHUNK_LOG=<file> npx vite build` writes the list of modules that joined the core chunk.

## Upload rules found by testing (November 2026)

- `manifest` holds only `package, version, name, description, storefront, backoffice`.
- No spaces or brackets in any file name (`safeName` in `vite.config.ts`).
- The `package` name never changes after the first upload.
- An upload creates a **beta** version. Your shop doesn't change until you attach it: see [Go Live](Go-Live).

## Restyling from the mockup

Galio's look comes from seven mockup stylesheets (`core`, `b`, `shell`, `shop`, `product`, `buy`, `read`), converted by `scripts/galio-css.cjs` into `style/galio/*.css` (generated, scoped to `.gl`, custom properties renamed `--gl-…`, dark mode as `html.gl-dark`). They are part of the repository, so a normal release needs nothing extra. The mockup itself is not in this repository; run the script again only after a change to the mockup: `node scripts/galio-css.cjs <path to the mockup's g/ folder>`. Never edit `style/galio/` by hand; see [Customize](Customize#styles).

## Preview a release before it is live

```bash
SHOP_URL=https://galio.selldone.shop node --use-system-ca scripts/kalio-live-preview.mjs <release-ULID> 9125
```

This serves a shop's real HTML with the loader pointed at that release, on `http://localhost:9125`. The ULID is in the release path that `kalio-verify-deploy.mjs` prints. Without `SHOP_URL` it reads `https://bakini.selldone.shop`, Bakio's other domain; name your own shop's address to preview on your data: `SHOP_URL=https://<your handle>.myselldone.com`.
