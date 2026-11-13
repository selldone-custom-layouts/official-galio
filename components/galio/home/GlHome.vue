<!--
  Galio Sundae — the home (galio-design/home-b.html, g/home.js): every section from the shop's live
  data; nothing names a product, price, collection, address or delivery way.

   1. The hero slider (GlHero): the collections with their Codex photo first, then by sales.
   2. "Pick your pastry" on the lemon band: every collection with its line drawing (matched by its
      name), its description, the "from" price and the price before.
   3. "How it reaches you": a photo mosaic of the shop's real ways (its courier with its reach and
      windows, its way to pay, its shipping fee and free threshold, its pickup counter's street and
      hours); a way the shop does not offer leaves its tile out.
   4. "Today's prices" on the strawberry band: a price list by collection (tabs), with dot leaders,
      the price before, the unit and a line about each piece, and a round "+".
   5. The cocoa banner "one piece at a time".
   6. "Best sellers" on the mint band: the eight pieces sold most, on round tinted plates with the
      tilted saving sticker, the "Add to bag" control under each.
   7. "Visit the counter": the shop's real place on a map with the pickup card (address, the
      counter's note, days and hours, phone, email, directions from the live address).
   8. The journal on the sky band: the four newest posts, last.
-->
<template>
  <div class="gl gl-home">
    <!-- 1. The hero slider -->
    <gl-hero :ready="data.ready" @prices="showPrices" />

    <!-- 2. The collections -->
    <section v-if="collsList.length" aria-labelledby="gl-h-colls" class="sec sec--colls">
      <div class="wrap">
        <div class="head">
          <span aria-hidden="true" class="kick">{{ t("galio.home.collsKick", "the collections") }}</span>
          <h2 id="gl-h-colls" class="h2">{{ t("galio.home.collsH", "Pick your pastry") }}</h2>
          <p class="lede">{{ collsLede }}</p>
        </div>
        <div :style="colsStyle(collsList.length)" class="colls gl-cols">
          <router-link v-for="c in collsList" :key="c.id" :style="{ '--gl-tint': tintOf(c.id) }" :to="catTo(c)" class="coll">
            <span class="coll-ic"><gl-icon :coll="c" /></span>
            <h3><bdi>{{ catTitle(c) }}</bdi></h3>
            <p v-if="c.description"><bdi>{{ c.description }}</bdi></p>
            <span v-if="fromOf(c)" class="from"
              >{{ t("galio.home.from", "From {price}", { price: money(fromOf(c).now) }) }}<s v-if="fromOf(c).was" class="tab-num">{{ money(fromOf(c).was) }}</s></span
            >
            <span aria-hidden="true" class="link">{{ t("galio.home.shopNow", "Shop now") }}<gl-icon name="arrow" /></span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- 3. How it reaches you -->
    <section v-if="tiles.length" aria-labelledby="gl-h-mos" class="sec sec--mosaic">
      <div class="wrap">
        <div class="head">
          <span aria-hidden="true" class="kick">{{ t("galio.home.mosKick", "pickup & delivery") }}</span>
          <h2 id="gl-h-mos" class="h2">{{ t("galio.home.mosH", "How it reaches you") }}</h2>
          <p v-if="mosLede" class="lede">{{ mosLede }}</p>
        </div>
        <div v-if="fullMosaic" class="mosaic">
          <div class="mos-left">
            <figure class="tile t-sq"><gl-tile :tile="tileOf('courier')" /></figure>
            <figure class="tile t-sq"><gl-tile :tile="tileOf('pay')" /></figure>
            <figure class="tile t-wide"><gl-tile :tile="tileOf('ship')" /></figure>
          </div>
          <figure class="tile t-big"><gl-tile :tile="tileOf('counter')" /></figure>
        </div>
        <div v-else :class="['gl-mosaic-few', '-n' + tiles.length]">
          <figure v-for="tl in tiles" :key="tl.key" class="tile t-sq"><gl-tile :tile="tl" /></figure>
        </div>
        <p v-if="mosPost" class="mos-note">
          <router-link :to="postTo(mosPost)" class="link">{{ t("galio.home.read", "Read: {title}", { title: mosPost.title }) }}<gl-icon name="arrow" /></router-link>
        </p>
      </div>
    </section>

    <!-- 4. Today's prices -->
    <section v-if="menuCat" id="menu" aria-labelledby="gl-h-menu" class="sec sec--menu">
      <div class="wrap">
        <div class="head">
          <span aria-hidden="true" class="kick">{{ t("galio.home.menuKick", "the price list") }}</span>
          <h2 id="gl-h-menu" class="h2">{{ t("galio.home.menuH", "Today’s prices") }}</h2>
          <p class="lede">{{ menuLede }}</p>
        </div>
        <div ref="mtabs" :aria-label="t('galio.home.collections', 'Collections')" class="menu-tabs" role="tablist" @keydown="onMenuKeys">
          <button
            v-for="c in collsList"
            :id="'gl-mtab-' + c.id"
            :key="c.id"
            :aria-controls="'gl-mlist'"
            :aria-selected="c.id === menuCat.id ? 'true' : 'false'"
            :tabindex="c.id === menuCat.id ? 0 : -1"
            class="mtab"
            role="tab"
            type="button"
            @click="setMenu(c)"
          >
            <bdi>{{ catTitle(c) }}</bdi>
          </button>
        </div>
        <ul id="gl-mlist" :aria-labelledby="'gl-mtab-' + menuCat.id" class="mlist" role="tabpanel">
          <li v-for="p in menuRows" :key="p.id" :style="{ '--gl-tint': tintOf(p.category_id) }" class="mrow">
            <router-link :to="productTo(p)" aria-hidden="true" class="mthumb" tabindex="-1"><img :src="thumb(p)" alt="" height="56" loading="lazy" width="56" /></router-link>
            <div class="mtext">
              <div class="mline">
                <router-link :to="productTo(p)" class="mname">{{ p.title }}</router-link>
                <span aria-hidden="true" class="lead"></span>
                <span class="mprice tab-num">{{ money(pv(p).now) }}<s v-if="pv(p).was">{{ money(pv(p).was) }}</s></span>
              </div>
              <span class="msub">{{ subOf(p) }}</span>
            </div>
            <gl-qb :product="p" kind="round" />
          </li>
        </ul>
        <div class="menu-foot">
          <router-link :to="catTo(menuCat)" class="link">{{ t("galio.home.shopAllOf", "Shop all {name}", { name: catTitle(menuCat).toLowerCase() }) }}<gl-icon name="arrow" /></router-link>
          <span v-if="menuFootLine">{{ menuFootLine }}</span>
        </div>
      </div>
    </section>

    <!-- 5. The banner -->
    <section aria-labelledby="gl-h-ban" class="sec sec--banner banner">
      <div class="wrap">
        <div class="banner-box">
          <div :class="['ph', 'ph--wide-only', { '-photo': banner.wide }]">
            <img v-if="banner.wide" :src="banner.wide" alt="" class="ph-img" decoding="async" loading="lazy" />
            <gl-cuts v-else :items="bannerPicks" class="-banner" />
          </div>
          <div :class="['ph', 'ph--square-only', { '-photo': banner.square }]">
            <img v-if="banner.square" :src="banner.square" alt="" class="ph-img" decoding="async" loading="lazy" />
            <gl-cuts v-else :items="bannerPicks" class="-banner -square" />
          </div>
          <span ref="banScript" aria-hidden="true" class="banner-script">{{ t("galio.home.banScript", "one piece at a time") }}</span>
          <div class="banner-plate">
            <b id="gl-h-ban">{{ t("galio.home.banH", "Sold by the piece") }}</b>
            <p>{{ bannerLine }}</p>
            <router-link :to="shopAllTo" class="btn">{{ t("galio.home.shopAll", "Shop all pastries") }}</router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. Best sellers -->
    <section v-if="best.length" id="best" aria-labelledby="gl-h-best" class="sec sec--best">
      <div class="wrap">
        <div class="head">
          <span aria-hidden="true" class="kick">{{ t("galio.home.bestKick", "most ordered") }}</span>
          <h2 id="gl-h-best" class="h2">{{ t("galio.home.bestH", "Best sellers") }}</h2>
          <p class="lede">{{ t("galio.home.bestLede", "The pieces ordered most often, across every collection.") }}</p>
        </div>
        <ul class="cards">
          <li v-for="p in best" :key="p.id" class="card">
            <div class="plate-wrap">
              <router-link :aria-label="p.title" :style="{ '--gl-tint': tintOf(p.category_id) }" :to="productTo(p)" class="plate"
                ><img :sizes="'(max-width: 760px) 40vw, 240px'" :src="img(p)" :srcset="srcset(p)" alt="" height="400" loading="lazy" width="400" @error="dropSrcset"
              /></router-link>
              <span v-if="pv(p).off > 0" ref="stickers" :aria-label="t('galio.card.offAria', '{off} percent off', { off: pv(p).off })" class="sticker" role="img"
                ><span dir="ltr">−{{ pv(p).off }}%</span></span
              >
            </div>
            <span class="cat"><bdi>{{ catTitle(catOf(p.category_id)) }}</bdi></span>
            <h3><router-link :to="productTo(p)">{{ p.title }}</router-link></h3>
            <p v-if="lookOf(p)" class="tag">{{ lookOf(p) }}</p>
            <div class="price tab-num">
              {{ money(pv(p).now) }}<s v-if="pv(p).was">{{ money(pv(p).was) }}</s><span class="per">{{ t("galio.card.per", "per {unit}", { unit: unitOf(p) }) }}</span>
            </div>
            <div class="buy"><gl-qb :product="p" kind="btn" /></div>
          </li>
        </ul>
        <div class="cards-foot"><router-link :to="shopAllTo" class="btn btn--ghost">{{ t("galio.home.shopAll", "Shop all pastries") }}</router-link></div>
      </div>
    </section>

    <!-- 7. Visit the counter -->
    <section v-if="facts.address || facts.location" id="visit" aria-labelledby="gl-h-visit" class="sec sec--visit visit">
      <div class="wrap wrap-head">
        <div class="head">
          <span aria-hidden="true" class="kick">{{ t("galio.home.visitKick", "come by") }}</span>
          <h2 id="gl-h-visit" class="h2">{{ facts.pickup ? t("galio.home.visitH", "Visit the counter") : t("galio.home.visitHShop", "Visit the shop") }}</h2>
        </div>
      </div>
      <div class="wrap gl-visit-wrap">
        <gl-map :location="facts.location" :place="mapPlace" />
        <div class="visit-card">
          <h3><bdi>{{ visitTitle }}</bdi></h3>
          <ul class="facts">
            <li v-if="facts.address">
              <gl-icon name="pin" /><span
                ><bdi>{{ facts.address }}</bdi><small v-if="counterNote">{{ counterNote }}</small></span
              >
            </li>
            <li v-if="openText">
              <gl-icon name="clock" /><span>{{ openText }}<small v-if="facts.pickup && facts.pickup.fee === 0">{{ t("galio.home.pickupFree", "Pickup is free") }}</small></span>
            </li>
            <li v-if="facts.phone">
              <gl-icon name="phone" /><span><a :href="telOf(facts.phone)" dir="ltr">{{ facts.phone }}</a></span>
            </li>
            <li v-if="facts.email">
              <gl-icon name="mail" /><span><a :href="'mailto:' + facts.email">{{ facts.email }}</a></span>
            </li>
          </ul>
          <div class="acts">
            <a v-if="directions" :href="directions" class="btn" rel="noopener" target="_blank">{{ t("galio.home.directions", "Get directions") }}</a>
            <router-link v-if="facts.pickup" :to="shopAllTo" class="btn btn--ghost">{{ t("galio.home.orderPickup", "Order for pickup") }}</router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- 8. The journal (last) -->
    <section v-if="posts.length" id="journal" aria-labelledby="gl-h-jr" class="sec sec--journal">
      <div class="wrap">
        <div class="head">
          <span aria-hidden="true" class="kick">{{ t("galio.home.jrKick", "the journal") }}</span>
          <h2 id="gl-h-jr" class="h2">{{ t("galio.home.jrH", "From the journal") }}</h2>
        </div>
        <ul class="jstrip">
          <li v-for="b in posts" :key="b.id">
            <router-link :to="postTo(b)" class="jpost">
              <span class="jcover"
                ><img v-if="cover(b)" :sizes="'(max-width: 1023px) 46vw, 300px'" :src="cover(b)" :srcset="coverSet(b)" alt="" height="563" loading="lazy" width="1000" @error="dropSrcset"
              /></span>
              <time v-if="b.created_at" :datetime="b.created_at">{{ fmtDate(b.created_at) }}</time>
              <h3>{{ b.title }}</h3>
            </router-link>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script>
import GlIcon from "../GlIcon.vue";
import GlQb from "../GlQb.vue";
import GlHero from "./GlHero.vue";
import GlCuts from "./GlCuts.vue";
import GlTile from "./GlTile.vue";
import GlMap from "./GlMap.vue";
import {
  allOff,
  bySells,
  catOf,
  catTitle,
  catTo,
  catsBySells,
  directionsTo,
  fitLine,
  fromPrice,
  inCat,
  listJoin,
  loadShop,
  lookOf,
  money,
  openLine,
  priceView,
  productImage,
  productTo,
  shopAllTo,
  shopData,
  shopFacts,
  shopName,
  shortAddress,
  telOf,
  tintOf,
  unitOf,
} from "../galio";
import { photo } from "../gl-photos";
import { fitInCircle } from "../../bakini/fit-in-circle";
import { journalPage, postRoute } from "../../kalio/pages/kalio-journal";
import { dropSrcset, photoSrcset, productSrcset } from "../../kalio/kalio-catalog";
import { currentCurrency } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

/* A whole number of columns that leaves no row half full (at most `max`). */
function fullCols(n, max) {
  if (n <= max) return Math.max(1, n);
  for (let c = max; c >= 2; c--) if (n % c === 0) return c;
  return max;
}

export default {
  name: "GlHome",
  components: { GlIcon, GlQb, GlHero, GlCuts, GlTile, GlMap },

  data: () => ({ data: shopData, posts: [], menuId: null }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    currency() {
      return currentCurrency();
    },
    facts() {
      return shopFacts(this.shop);
    },
    off() {
      void this.currency;
      void this.data.ready;
      return allOff(this.shop);
    },
    /* The collections that have products, in the shop's order. */
    collsList() {
      void this.data.ready;
      return this.data.cats.filter((c) => inCat(c.id).length);
    },
    collsLede() {
      return this.off
        ? t("galio.home.collsLedeOff", "Every piece is sold on its own, and right now every one is {off}% off.", { off: this.off })
        : t("galio.home.collsLede", "Every piece is sold on its own.");
    },

    /* ── 3. The mosaic: the shop's own ways ── */
    tiles() {
      const f = this.facts;
      const out = [];
      if (f.courier) {
        const c = f.courier;
        const parts = [];
        if (c.distance && c.distance < 1000) parts.push(t("galio.home.within", "Within {km} km", { km: c.distance }));
        if (c.windows.length) parts.push(c.windows.join(", "));
        if (c.fee === 0) parts.push(t("galio.home.free", "free"));
        out.push({ key: "courier", icon: "scooter", title: c.title, line: parts.join(" · "), file: "galio-mosaic-courier.webp", tint: "lemon", art: "scooter" });
      }
      if (f.gateway) {
        const line = f.gateway.cod ? t("galio.home.payCourier", "Pay the courier when your order arrives.") : f.gateway.description || "";
        out.push({ key: "pay", icon: f.gateway.cod ? "cash" : "card", title: f.gateway.name, line, file: "galio-mosaic-table.webp", tint: "straw", picks: this.tablePicks });
      }
      if (f.shipping) {
        const s = f.shipping;
        const fee = s.fee ? money(s.fee) : t("galio.home.freeCap", "Free");
        const line = s.freeOver ? t("galio.home.shipFree", "{fee}, free on orders over {amount}", { fee, amount: money(s.freeOver, true) }) : fee;
        out.push({ key: "ship", icon: "plane", title: s.title, line, file: "galio-mosaic-shipping.webp", tint: "sky", art: "plane" });
      }
      if (f.pickup) {
        const bits = [this.street, this.facts.hours ? (f.everyDay ? t("galio.home.daily", "daily {hours}", { hours: this.facts.hours }) : this.facts.hours) : "", f.pickup.fee === 0 ? t("galio.home.free", "free") : ""].filter(Boolean);
        out.push({ key: "counter", icon: "store", title: t("galio.home.pickupCounter", "Pickup at the counter"), line: bits.join(" · "), file: "galio-mosaic-counter.webp", tint: "mint", picks: this.counterPicks, big: true });
      }
      return out.map((x) => ({ ...x, photo: photo(x.file) }));
    },
    fullMosaic() {
      return ["courier", "pay", "ship", "counter"].every((k) => this.tiles.some((x) => x.key === k));
    },
    mosLede() {
      const f = this.facts;
      const ways = [];
      if (f.pickup) ways.push(t("galio.home.wayCollect", "collect it at the counter"));
      if (f.courier) ways.push(t("galio.home.wayCourier", "have the {shop} courier bring it", { shop: shopName(this.shop) }));
      if (f.shipping) ways.push(t("galio.home.wayShip", "ship it further"));
      if (!ways.length) return "";
      let first = ways.length > 1 ? ways.slice(0, -1).join(", ") + t("galio.home.or", ", or ") + ways[ways.length - 1] : ways[0];
      first = first.charAt(0).toUpperCase() + first.slice(1) + ".";
      const pay = f.gateway?.cod ? " " + t("galio.home.payCash", "You pay in cash when it arrives.") : "";
      return first + pay;
    },
    /* A journal post about getting an order (pickup, delivery, shipping), if the shop wrote one. */
    mosPost() {
      return this.posts.find((b) => /pickup|deliver|shipping|courier/i.test(String(b.title || ""))) || null;
    },
    counterPicks() {
      return this.onePerCollection(4);
    },
    tablePicks() {
      return this.onePerCollection(3, 1);
    },

    /* ── 4. The price list ── */
    menuCat() {
      return this.collsList.find((c) => c.id === this.menuId) || this.collsList[0] || null;
    },
    menuRows() {
      return this.menuCat ? inCat(this.menuCat.id) : [];
    },
    menuLede() {
      return this.off ? t("galio.home.menuLedeOff", "Prices are per piece, with {off}% already taken off.", { off: this.off }) : t("galio.home.menuLede", "Prices are per piece.");
    },
    menuFootLine() {
      const f = this.facts;
      return [f.gateway?.name, f.pickup && f.pickup.fee === 0 ? t("galio.home.freePickup", "Free pickup") : ""].filter(Boolean).join(" · ");
    },

    /* ── 5. The banner ── */
    banner() {
      return { wide: photo("galio-banner-wide.webp"), square: photo("galio-banner-square.webp") };
    },
    bannerPicks() {
      return this.onePerCollection(6);
    },
    /* "…so one order can hold a cookie, a croissant and a tart." from the collections' own units. */
    bannerLine() {
      const units = [...new Set(catsBySells().map((c) => unitOf(inCat(c.id)[0]).toLowerCase()))].slice(0, 3);
      if (units.length < 2) return t("galio.home.banP0", "Every pastry is sold on its own, so an order holds exactly the pieces you want.");
      return t("galio.home.banP", "Every pastry is sold on its own, so one order can hold {units}.", { units: listJoin(units.map((u) => article(u))) });
    },

    /* ── 6. Best sellers ── */
    best() {
      return bySells(this.data.products).slice(0, 8);
    },

    /* ── 7. Visit ── */
    street() {
      return this.facts.pickupPoint?.address || String(this.facts.address || "").split(",")[0].trim();
    },
    visitTitle() {
      const name = shopName(this.shop);
      return this.facts.city && !name.includes(this.facts.city) ? `${name} ${this.facts.city}` : name;
    },
    /* The counter's own note, its first sentence ("Pickup counter at the Embarcadero entrance."). */
    counterNote() {
      const note = String(this.facts.pickupNote || "").trim();
      if (!note) return "";
      const first = note.split(/(?<=\.)\s/)[0];
      return /\d{1,2}[:.]\d{2}/.test(first) ? "" : first;
    },
    openText() {
      return openLine(this.facts);
    },
    mapPlace() {
      return shortAddress(this.facts) || shopName(this.shop);
    },
    directions() {
      return directionsTo(this.facts);
    },
    shopAllTo() {
      return shopAllTo();
    },
  },

  watch: {
    best() {
      this.$nextTick(() => this.fitStickers());
    },
    currency() {
      this.$nextTick(() => this.fitStickers());
    },
    "data.ready"(ok) {
      if (ok) this.$nextTick(() => this.toHash());
    },
    "$route.hash"() {
      this.toHash();
    },
  },

  created() {
    loadShop();
  },

  mounted() {
    journalPage({ page: 1, limit: 8 })
      .then(({ articles }) => (this.posts = (articles || []).slice(0, 4)))
      .catch(() => (this.posts = []));
    this.onResize = () => {
      clearTimeout(this.rt);
      this.rt = setTimeout(() => this.fitWords(), 120);
    };
    window.addEventListener("resize", this.onResize, { passive: true });
    this.$nextTick(() => this.fitWords());
    document.fonts?.ready?.then(() => this.fitWords());
    if (this.data.ready) this.$nextTick(() => this.toHash());
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
    clearTimeout(this.rt);
  },

  methods: {
    t,
    money,
    catTitle,
    catTo,
    catOf,
    tintOf,
    unitOf,
    lookOf,
    productTo,
    telOf,
    dropSrcset,
    pv(p) {
      void this.currency;
      return priceView(this.shop, p);
    },
    fromOf(c) {
      void this.currency;
      return fromPrice(this.shop, c.id);
    },
    img(p) {
      return productImage(p);
    },
    srcset(p) {
      return productSrcset(p);
    },
    thumb(p) {
      return productImage(p, 128);
    },
    subOf(p) {
      const look = lookOf(p);
      const per = t("galio.card.per", "per {unit}", { unit: unitOf(p) });
      return look ? `${per} · ${look}` : per;
    },
    colsStyle(n) {
      return { "--gl-cols-d": fullCols(n, 6), "--gl-cols-t": fullCols(n, 3), "--gl-cols-p": fullCols(n, 2) };
    },
    /* The best seller of each collection (the shop's order), from the `skip`-th collection on. */
    onePerCollection(n, skip = 0) {
      const out = [];
      const cats = this.collsList;
      for (let i = 0; i < cats.length && out.length < n; i++) {
        const c = cats[(i + skip) % cats.length];
        const top = bySells(inCat(c.id))[0];
        if (top) out.push(top);
      }
      return out;
    },
    tileOf(key) {
      return this.tiles.find((x) => x.key === key);
    },
    setMenu(c) {
      this.menuId = c.id;
    },
    /* "See the prices" on a hero slide: that collection's tab, then the list. */
    showPrices(c) {
      this.menuId = c.id;
      this.$nextTick(() => {
        const el = document.getElementById("menu");
        if (el) el.scrollIntoView({ behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth", block: "start" });
        document.getElementById("gl-mtab-" + c.id)?.focus({ preventScroll: true });
      });
    },
    onMenuKeys(e) {
      const list = this.collsList;
      const i = list.findIndex((c) => c.id === this.menuCat?.id);
      const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
      let next = null;
      if (e.key === "ArrowRight") next = i + (rtl ? -1 : 1);
      else if (e.key === "ArrowLeft") next = i + (rtl ? 1 : -1);
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = list.length - 1;
      if (next == null) return;
      e.preventDefault();
      const c = list[(next + list.length) % list.length];
      this.setMenu(c);
      this.$nextTick(() => document.getElementById("gl-mtab-" + c.id)?.focus());
    },
    postTo(b) {
      return postRoute(b);
    },
    cover(b) {
      return b.image ? window.CDN.GET_SHOP_IMAGE_PATH(b.image, null) : null;
    },
    coverSet(b) {
      return photoSrcset(this.cover(b));
    },
    fmtDate(iso) {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      try {
        return d.toLocaleDateString(document.documentElement.lang || "en", { month: "short", day: "numeric", year: "numeric" });
      } catch {
        return d.toDateString();
      }
    },
    fitStickers() {
      (this.$refs.stickers || []).forEach((el) => fitInCircle(el));
    },
    fitWords() {
      if (this.$refs.banScript) fitLine(this.$refs.banScript);
      this.fitStickers();
    },
    /* /#visit (the rail's "Visit" from another page): the section, once it is drawn. */
    toHash() {
      const id = String(this.$route?.hash || "").replace(/^#/, "");
      if (!id || !["visit", "menu", "best", "journal"].includes(id)) return;
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 120);
    },
  },
};

/* "a cookie", "an éclair". */
function article(word) {
  return /^[aeiouéèê]/i.test(word) ? t("galio.home.anUnit", "an {unit}", { unit: word }) : t("galio.home.aUnit", "a {unit}", { unit: word });
}
</script>
