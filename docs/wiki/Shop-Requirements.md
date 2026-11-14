# Shop Requirements

The Layout reads everything from your shop. Nothing about Bakio is hard-coded. Here is what your shop's data needs so that each part looks as it does on [galio.selldone.shop](https://galio.selldone.shop). A section with no data folds away; it never shows an empty box, and no fact is invented to fill one.

## Settings (yours to choose)

| Setting | What to set | What the Layout does |
| --- | --- | --- |
| **OAuth client id** | Set it up for your shop first | Sign-in uses your shop's own sign-in. Without it, sign-in leaves for Selldone and shows an error. |
| **Business model** | A normal shop with one seller | Galio is made for one bakery. |
| **Shop title** | The name you want read | It is drawn as the wordmark, the tab icon's letter and the page titles. |
| **Guest checkout** | Your choice | When guests may buy, the sign-in dialog and the account entry offer "Continue as guest"; otherwise the shopper signs in first. |
| **Payment methods** | At least one, for your currency (cash on delivery is fine) | "How it reaches you", the product page, the bag and the footer name it ("Pay the courier when your order arrives" for cash on delivery, else its description). Without one, the checkout says "This shop is not taking payment right now" instead of showing Pay. |
| **Delivery ways** (transportations) | What you offer, each with a title, a fixed fee, a free-shipping threshold if you have one, and **time windows** where the shopper picks one | The home's "How it reaches you", the product page's delivery lines, the bag and the checkout's delivery cards and sheet. A way without a title gets words from its kind ("<Shop> courier", "Worldwide shipping", "By post", "Pickup"). The windows are the way's time spans, shown only when its delivery time is one of Selldone's **timeframe** kinds (`timeframe`, `weekday-timeframe`); a way with time spans but another kind (Bakio's worldwide shipping) offers no window, and no line names one for it. |
| **Pickup point** | If you have a counter: a pickup point with an address and a note that holds the hours, e.g. "Open every day 8:00–18:00" | The counter hours are read from that note (a time range like `8:00-18:00`, `8:00–18:00` or `8:00 to 18:00`). They show in the rail's foot, the menu sheet, "How it reaches you", Visit the counter, About, Contact and the checkout's pickup card. With no hours in the note, the hours are left out. When the note already gives the hours, they are not repeated. |
| **Checkout map** | On or off | On: the address sheet has a map and a pin. Off: it is a short form. Bakio has it off. |
| **Login modes** | Your choice | The sign-in dialog shows your shop's own ways in (social logins as you switch them on, an email code; a phone login uses Selldone's own form). |
| **Currency, country, language** | Your market | Prices, the address form, and the **EN · USD** pill in the rail (the menu sheet's "Language & currency" row on a phone). Galio's own words are in English, with Arabic ready; another language needs files (see [Customize](Customize#languages)). |
| **Home of the domain** | The shop page | The designed home is the shop page. A Page Builder page set as Home replaces it on `/`. |

## Shop info

The facts on the home, the rail, the footer, About, Contact and the sample pages come from the shop's own info (Selldone dashboard, the shop's contact information):

- **Address**, city, region and postal code: Visit the counter, About, Contact, the footer ("A pâtisserie at <address>."). Without one, the pickup point's address is used.
- **Location** (the pin on the map): the real map on Visit the counter, About and Contact, a static map from Selldone's map service (street style in light mode, dark style in dark mode), with "Get directions" built from the coordinates. Without a location there is no street picture.
- **Open days:** "every day" or the days you list, in the rail's foot, the footer and Contact.
- **Phone** and **email:** the rail's foot, Visit the counter, the footer and Contact.

## Collections (categories)

- Each **top-level category** with products is a collection: a card in the home's "Pick your pastry", a tab in "Today's prices", an entry in the rail's Shop menu and the phone menu, a chip on every listing, and its own listing page.
- Galio draws each collection with a **line drawing**, matched by its name or address name: cookie / biscuit / macaron, croissant / brioche, danish / pastry / puff, muffin / cupcake, cake / gâteau / torte, tart / pie / quiche. A collection that matches none gets a generic pastry. Its image in Selldone is not needed for that.
- Give each one a short **description**: its line in "Pick your pastry".
- Order them in Selldone; the Layout keeps your order. The six sorbet tints of the plates and the collection discs are given to the collections in that order, then repeat.
- The hero slider shows up to three collections, those with their own photo first (see below), then by **sales** (the sum of their products' sales). Each slide names the collection's three best sellers.

## Photo slots (the hero, the mosaic and the banner)

These photos are part of the **Layout**, not of your shop: files in `assets/galio/` in your repository, picked up at build time, so adding one needs a release.

| File | Size | Where |
| --- | --- | --- |
| `galio-hero-<collection name>-wide.webp` | 2400 × 1200 | a hero slide, desktop and tablet |
| `galio-hero-<collection name>-square.webp` | 1200 × 1200 | the same slide, phones |
| `galio-mosaic-counter.webp` | 1600 × 1600 | "How it reaches you", the counter |
| `galio-mosaic-courier.webp` | 800 × 800 | the courier |
| `galio-mosaic-table.webp` | 800 × 800 | paying on delivery |
| `galio-mosaic-shipping.webp` | 1600 × 800 | shipping |
| `galio-banner-wide.webp` | 2400 × 1000 | the "Sold by the piece" banner |
| `galio-banner-square.webp` | 1200 × 1200 | the same banner, phones |

`<collection name>` is the collection's address name in Selldone. The repository ships **none** of these files. Without its file, a slot is a designed fallback, never a caption: the hero and the banner keep a warm painted ground with the collection's best sellers as small cut-outs (never blown up), and the mosaic's tiles are sorbet tints with a line drawing or your own pastries. Each photo adds a file to the release: keep the total under ~360 (see [Build and Upload](Build-and-Upload)).

## Products

- The **main photo** as a **transparent cut-out** (PNG or WebP, the pastry alone on no ground). Every card, the price list, the quick look and the product page set it on a round plate in its collection's tint; a photo with its own ground shows as a square on the plate. More photos make the product page's gallery. A product without a main photo is left out of Galio's lists.
- A **unit** (Selldone's `unit` field, for example "croissant"): "per croissant" on every card and price-list row, "Sold by the piece · per croissant" on the product page, and the home banner's "a cookie, a croissant and a cake". Without one, the Layout says "piece".
- A **price**, and a **discount** for a saving: the price before, the tilted sticker with the percentage, "Save $X", the Deals page and its "Biggest savings". When every product has the same saving, the hero and the listings say so once ("25% off").
- **Discount dates:** a deal with a real end date gets a clock on the product page. Without an end date there is no clock; no date is ever invented.
- **Pros** (Selldone's product pros, a title and a line each): "Why you'll love it" on the product page, "Why pick it" on Compare, and the first pro's title as the card's short line when the spec has no look line.
- A **look line** in the spec (a key such as "Visual Finish", "Finish", "Surface", "Appearance" or "Look"): the short line on cards and in the price list ("per <unit> · <look>").
- **Rating criteria** (for example "Flakiness", "Flavor"): shown as "Not rated" beside "No reviews yet" until the first review.
- **Stock:** the product page shows how many are left; the listings' In stock filter uses the real quantities.
- **Variants** only when the product really has options: tiles with their own photo on the product page; the quick look and the card then say "Choose options" and open the product.
- A **product code** (SKU) shows on the product page.
- **Sales:** the hero's order, Best sellers, the collections menu's "Most ordered" and Buy together are ranked by Selldone's own sales count.
- Galio reads up to **250 products** in one go; a larger catalogue shows its first 250 in the listings and on the home.

## Specs and filters

The listing's filter panel (and its phone sheet), the product page's Specification tab and Compare come from each product's **spec**:

- Write specs **flat**: `{"Group": "group", "Key": ["value"]}` with `spec_order`. A nested spec is not shown anywhere.
- Keep the values you want as filters **short**. A spec key becomes a filter only when the collection has **two or more different values** for it, each **28 characters or fewer**. A long sentence (an allergen note, a description of the finish) is never a filter, but it still shows under Specification.
- **Price** (a two-thumb range with short boxes), **On offer** and **In stock** are always there. Nothing else is invented, so a collection may show fewer filters than another.
- The filters are read live from the products, so a spec change shows on the next visit. No category filter list is needed.
- Sort: Featured, Best sellers, Customer review, Price low to high, Price high to low, Newest.

## Content

- **Articles** (blog posts) with **cover images**: the four newest show in "From the journal", last on the home (Selldone's demo posts are left out); the journal page shows the newest large, then every post. Only published posts show. Publish **four or more** for a full row.
- In an article's text, **link the pastries** it talks about (`/product/<id>` links): the post ends with "Shop this post". Without links, it shows the pastries the text names, else four pastries to try.
- A post about **pickup or delivery**: "How it reaches you" links it ("Read: …").
- **FAQ** entries: the Questions page. Until you add some, it shows sample questions built from your shop's facts, under the sample label below.
- **About us, Terms, Privacy, Contact us** pages (Selldone's shop profiles). Until you write them, About, Terms and Privacy show sample text built only from your shop's facts (no invented history, names or reviews), under a clear "Sample text — the shop has not written this page yet" label. Contact always shows your real lines and the map.
- The footer's links are the Layout's own pages (Home, Shop, Journal, About us, Contact, FAQ, Privacy, Terms of use); a Selldone footer menu is not read.
- **Social links:** shown in the footer's legal row.
- The footer's **newsletter** form adds the address to the shop's "newsletter" audience in Selldone. It works for guests; nothing to set up.

## Checklist

- [ ] The shop's OAuth client id is set up
- [ ] The shop's title reads the way the wordmark should
- [ ] Collections have names that say what they are (for the line drawings) and a short description
- [ ] Products have a cut-out main photo, a unit, pros, flat specs with short values (and a look line), and an SKU
- [ ] Some products have discounts, with end dates only where the deal really ends
- [ ] At least one payment method (cash on delivery is fine)
- [ ] Delivery ways with titles, fees and, where the shopper picks one, time windows; a pickup point whose note holds the hours
- [ ] The shop info has an address, a location on the map, open days, a phone and an email
- [ ] Four or more articles with covers, linking the pastries they talk about
- [ ] FAQ entries, and your own About, Terms and Privacy
- [ ] Optional: the photo slot files in `assets/galio/`
- [ ] The domain's Home is the shop page
