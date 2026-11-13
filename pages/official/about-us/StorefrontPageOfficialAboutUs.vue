<!--
  Galio Sundae — About (galio-design/about-b.html): the banner (its photo slot, else the collections'
  own cut-outs) with the script line and the plate ("About Bakio", one line from the shop's facts); the
  story in three rows (the counter, the collections as a collage of round plates, how it reaches you);
  the collections; the quote band; "Visit the counter" with the real map; the newest posts. The shop's
  own "about us" text, when it has one, takes the place of the story; the story written from the
  shop's facts carries the label "Sample text — the shop has not written this page yet".
-->
<template>
  <div class="gl gl-about">
    <section aria-labelledby="gl-ab-h" class="ab-hero">
      <div class="wrap">
        <div class="ab-box">
          <div :class="['ph', 'ph--wide-only', { '-photo': banner.wide }]">
            <img v-if="banner.wide" :src="banner.wide" alt="" class="ph-img" decoding="async" />
            <gl-cuts v-else :items="bannerPicks" class="-banner" />
          </div>
          <div :class="['ph', 'ph--square-only', { '-photo': banner.square }]">
            <img v-if="banner.square" :src="banner.square" alt="" class="ph-img" decoding="async" />
            <gl-cuts v-else :items="bannerPicks" class="-banner -square" />
          </div>
          <span ref="script" aria-hidden="true" class="ab-script">{{ t("galio.ab.script", "a few words") }}</span>
          <div class="ab-plate">
            <h1 id="gl-ab-h">{{ t("galio.ab.h1", "About {shop}", { shop: name }) }}</h1>
            <p>{{ heroLine }}</p>
            <gl-sample v-if="!own" />
          </div>
        </div>
      </div>
    </section>

    <section :aria-label="t('galio.ab.storyAria', 'Our story')" class="sec sec--tight bg-white">
      <div v-if="own" class="wrap">
        <div class="gl-own prose" v-html="ownHtml"></div>
      </div>
      <div v-else class="wrap story">
        <div v-if="f.address" class="srow">
          <div class="srow-m">
            <div :class="['ph', 'srow-ph', { '-photo': photos.counter }]">
              <img v-if="photos.counter" :src="photos.counter" alt="" class="ph-img" loading="lazy" />
              <gl-cuts v-else :items="picks.slice(0, 3)" class="-banner -square" />
            </div>
          </div>
          <div class="srow-t">
            <span aria-hidden="true" class="kick">{{ t("galio.ab.counterKick", "the counter") }}</span>
            <h2>{{ f.pickup ? t("galio.ab.counterH", "One counter, open to visit") : t("galio.ab.shopH", "Where the bakery is") }}</h2>
            <p>{{ counterP1 }}</p>
            <p v-if="counterP2">{{ counterP2 }}</p>
            <router-link :to="contactTo" class="link">{{ t("galio.ab.planVisit", "Plan a visit") }}<gl-icon name="arrow" /></router-link>
          </div>
        </div>
        <div v-if="plates.length" class="srow srow--flip">
          <div class="srow-m">
            <ul class="collage">
              <li v-for="x in plates" :key="x.c.id">
                <router-link :aria-label="catTitle(x.c)" :style="{ '--gl-tint': tintOf(x.c.id) }" :to="catTo(x.c)"><img :src="productImage(x.p)" alt="" height="400" loading="lazy" width="400" /></router-link>
              </li>
            </ul>
          </div>
          <div class="srow-t">
            <span aria-hidden="true" class="kick">{{ t("galio.ab.collsKick", "the collections") }}</span>
            <h2>{{ t("galio.ab.pieceH", "Sold by the piece") }}</h2>
            <p>{{ collsP }}</p>
            <router-link :to="shopTo" class="link">{{ t("galio.ab.shopAll", "Shop all pastries") }}<gl-icon name="arrow" /></router-link>
          </div>
        </div>
        <div v-if="wayP1" class="srow">
          <div class="srow-m">
            <div :class="['ph', 'srow-ph', { '-photo': photos.courier }]">
              <img v-if="photos.courier" :src="photos.courier" alt="" class="ph-img" loading="lazy" />
              <gl-cuts v-else :items="picks.slice(3, 6)" class="-banner -square" />
            </div>
          </div>
          <div class="srow-t">
            <span aria-hidden="true" class="kick">{{ t("galio.ab.doorKick", "to your door") }}</span>
            <h2>{{ t("galio.ab.howH", "How it reaches you") }}</h2>
            <p>{{ wayP1 }}</p>
            <p v-if="payP">{{ payP }}</p>
            <router-link :to="faqTo" class="link">{{ t("galio.ab.faqDelivery", "Questions about delivery") }}<gl-icon name="arrow" /></router-link>
          </div>
        </div>
      </div>
    </section>

    <section v-if="cats.length" aria-labelledby="gl-h-cols" class="sec sec--tight bg-lemon">
      <div class="wrap">
        <div class="head">
          <span aria-hidden="true" class="kick">{{ collsKick }}</span>
          <h2 id="gl-h-cols" class="h2">{{ t("galio.ab.colsH", "What's on the counter") }}</h2>
        </div>
        <div class="colls gl-cols" :style="colsStyle">
          <router-link v-for="c in cats" :key="c.id" :style="{ '--gl-tint': tintOf(c.id) }" :to="catTo(c)" class="coll">
            <span class="coll-ic"><gl-icon :coll="c" /></span>
            <h3><bdi>{{ catTitle(c) }}</bdi></h3>
            <span v-if="fromOf(c)" class="from">{{ t("galio.home.from", "From {price}", { price: money(fromOf(c).now) }) }}</span>
            <span aria-hidden="true" class="link">{{ t("galio.home.shopNow", "Shop now") }}<gl-icon name="arrow" /></span>
          </router-link>
        </div>
      </div>
    </section>

    <section v-if="quote" :aria-label="t('galio.ab.quoteAria', 'Statement')" class="sec sec--tight bg-cocoa quote">
      <div class="wrap">
        <p class="q-txt">{{ quote }}</p>
        <span aria-hidden="true" class="q-sig"><gl-mark /></span>
      </div>
    </section>

    <section v-if="f.address || f.location" aria-labelledby="gl-h-visit" class="sec sec--tight bg-straw">
      <div class="wrap visit2">
        <div class="v2-t">
          <span aria-hidden="true" class="kick">{{ t("galio.home.visitKick", "come by") }}</span>
          <h2 id="gl-h-visit" class="h3x">{{ f.pickup ? t("galio.home.visitH", "Visit the counter") : t("galio.home.visitHShop", "Visit the shop") }}</h2>
          <ul class="facts">
            <li v-if="f.address">
              <gl-icon name="pin" /><span
                ><bdi>{{ f.address }}</bdi><small v-if="counterNote">{{ counterNote }}</small></span
              >
            </li>
            <li v-if="openText">
              <gl-icon name="clock" /><span>{{ openText }}<small v-if="f.pickup && f.pickup.fee === 0">{{ t("galio.home.pickupFree", "Pickup is free") }}</small></span>
            </li>
            <li v-if="f.phone">
              <gl-icon name="phone" /><span><a :href="telOf(f.phone)" dir="ltr">{{ f.phone }}</a></span>
            </li>
            <li v-if="f.email">
              <gl-icon name="mail" /><span><a :href="'mailto:' + f.email">{{ f.email }}</a></span>
            </li>
          </ul>
          <div class="v2-acts">
            <a v-if="directions" :href="directions" class="btn" rel="noopener" target="_blank">{{ t("galio.home.directions", "Get directions") }}</a>
            <router-link :to="contactTo" class="btn btn--ghost">{{ t("galio.ab.contact", "Contact the bakery") }}</router-link>
          </div>
        </div>
        <div class="v2-map"><gl-map :location="f.location" :place="mapPlace" /></div>
      </div>
    </section>

    <section v-if="posts.length" aria-labelledby="gl-h-jr" class="sec sec--tight bg-sky">
      <div class="wrap">
        <h2 id="gl-h-jr" class="h3x">{{ t("galio.rd.jrH", "From the journal") }}</h2>
        <ul class="pgrid pgrid--4"><gl-post v-for="b in posts" :key="b.id" :post="b" /></ul>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import GlIcon from "@app-storefront/components/galio/GlIcon.vue";
import GlMark from "@app-storefront/components/galio/GlMark.vue";
import GlCuts from "@app-storefront/components/galio/home/GlCuts.vue";
import GlMap from "@app-storefront/components/galio/home/GlMap.vue";
import GlPost from "@app-storefront/components/galio/read/GlPost.vue";
import GlSample from "@app-storefront/components/galio/read/GlSample.vue";
import {
  bySells,
  catTitle,
  catTo,
  catsBySells,
  directionsTo,
  fitLine,
  fromPrice,
  inCat,
  loadShop,
  money,
  openLine,
  productImage,
  shopAllTo,
  shopData,
  shopFacts,
  shortAddress,
  streetOf,
  telOf,
  tintOf,
  unitOf,
} from "@app-storefront/components/galio/galio";
import { photo } from "@app-storefront/components/galio/gl-photos";
import { listWords, ownText, paySentence, shopName, shopProfile } from "@app-storefront/components/galio/gl-read";
import { journalPage } from "@app-storefront/components/kalio/pages/kalio-journal";
import { currentCurrency } from "@app-storefront/components/region-switcher/region";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

/** A count in words up to twelve ("six collections"), else the number. */
function countWord(n: number): string {
  const words = [
    "",
    t("galio.n.one", "one"),
    t("galio.n.two", "two"),
    t("galio.n.three", "three"),
    t("galio.n.four", "four"),
    t("galio.n.five", "five"),
    t("galio.n.six", "six"),
    t("galio.n.seven", "seven"),
    t("galio.n.eight", "eight"),
    t("galio.n.nine", "nine"),
    t("galio.n.ten", "ten"),
    t("galio.n.eleven", "eleven"),
    t("galio.n.twelve", "twelve"),
  ];
  return words[n] || String(n);
}

function fullCols(n: number, max: number) {
  if (n <= max) return Math.max(1, n);
  for (let c = max; c >= 2; c--) if (n % c === 0) return c;
  return max;
}

export default {
  name: "StorefrontPageOfficialAboutUs",
  components: { GlIcon, GlMark, GlCuts, GlMap, GlPost, GlSample },
  inject: ["$shop"],

  data: () => ({ data: shopData, profile: null as any, posts: [] as any[] }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    currency() {
      return currentCurrency();
    },
    f() {
      return shopFacts(this.shop);
    },
    name() {
      return shopName(this.shop);
    },
    own() {
      return ownText(this.profile?.body);
    },
    ownHtml() {
      return String(this.profile?.body || "").replace(/\scontenteditable="[^"]*"/g, "");
    },
    cats() {
      void this.data.cats.length;
      return catsBySells();
    },
    colsStyle() {
      const n = this.cats.length;
      return { "--gl-cols-d": fullCols(n, 6), "--gl-cols-t": fullCols(n, 3), "--gl-cols-p": fullCols(n, 2) };
    },
    units() {
      return [...new Set(this.cats.map((c: any) => unitOf(inCat(c.id)[0] || {}).toLowerCase()).filter(Boolean))] as string[];
    },
    /* "A pâtisserie at 1 The Embarcadero, San Francisco, selling individual pastries for delivery and pickup." */
    heroLine() {
      const where = shortAddress(this.f);
      const ways: string[] = [];
      if (this.f.courier || this.f.shipping) ways.push(t("galio.ab.delivery", "delivery"));
      if (this.f.pickup) ways.push(t("galio.ab.pickup", "pickup"));
      const how = ways.length ? t("galio.ab.forWays", " for {ways}", { ways: listWords(ways) }) : "";
      return where
        ? t("galio.ab.heroAt", "A pâtisserie at {address}, selling individual pastries{how}.", { address: where, how })
        : t("galio.ab.hero", "A pâtisserie selling individual pastries{how}.", { how });
    },
    counterP1() {
      const street = streetOf(this.f);
      const open = this.f.hours ? (this.f.everyDay ? t("galio.ab.openEvery", " It is open every day from {hours}", { hours: this.f.hours }) : t("galio.ab.openHours", " It is open {hours}", { hours: this.f.hours })) : "";
      const lead = street ? t("galio.ab.counterAt", "{shop} has one counter, at {street}.", { shop: this.name, street }) : t("galio.ab.counterIs", "{shop} has one counter.", { shop: this.name });
      return lead + (open ? open + t("galio.ab.andOnline", ", and every pastry on the shelves is also on the website.") : "");
    },
    counterP2() {
      const p = this.f.pickup;
      if (!p) return "";
      const wins = p.windows.length ? t("galio.ab.pickWin", ", pick a {windows} window", { windows: listWords(p.windows, "disjunction") }) : "";
      return p.fee
        ? t("galio.ab.pickupPaid", "Choose pickup at checkout{wins} and collect your order at the counter.", { wins })
        : t("galio.ab.pickupFree", "Pickup is free: choose it at checkout{wins} and collect your order at the counter.", { wins });
    },
    /* The best seller of each collection on its plate. */
    plates() {
      return this.cats.map((c: any) => ({ c, p: bySells(inCat(c.id))[0] })).filter((x: any) => x.p).slice(0, 9);
    },
    collsP() {
      const names = listWords(this.cats.map((c: any) => catTitle(c)));
      const u = this.units;
      const one = u[0] ? t("galio.ab.fromOne", ", from a single {unit} to a mixed tray", { unit: u[0] }) : "";
      return t("galio.ab.colls", "{names}. Each pastry is sold on its own, so one order can hold exactly the pieces you want{one}.", { names, one });
    },
    wayP1() {
      const parts: string[] = [];
      const c = this.f.courier;
      if (c) {
        const near = c.distance && c.distance < 1000 ? t("galio.ab.within", " within {km} km of the bakery", { km: c.distance }) : "";
        const days = c.days.length >= 7 ? t("galio.ab.everyDay", " every day") : "";
        const win = c.windows.length ? t("galio.ab.inWin", ", in the {windows} window", { windows: listWords(c.windows, "disjunction") }) : "";
        parts.push(t("galio.ab.courier", "The {name} delivers{near}{days}{win}.", { name: c.title, near, days, win }));
      }
      const s = this.f.shipping;
      if (s) {
        const fee = s.fee ? t("galio.ab.forFee", " for {fee}", { fee: money(s.fee) }) : "";
        const free = s.freeOver ? t("galio.ab.freeOver", ", free on orders over {amount}", { amount: money(s.freeOver, true) }) : "";
        parts.push(t("galio.ab.shipping", "{name} covers the rest{fee}{free}.", { name: s.title, fee, free }));
      }
      return parts.join(" ");
    },
    payP() {
      return this.f.gateway?.cod ? t("galio.ab.payCod", "Whichever you choose, you pay in cash when the order arrives.") : this.f.gateway ? paySentence(this.f) : "";
    },
    collsKick() {
      const n = this.cats.length;
      return n === 1 ? t("galio.ab.oneColl", "one collection") : t("galio.ab.nColls", "{n} collections", { n: countWord(n) });
    },
    quote() {
      const n = this.cats.length;
      if (!n) return "";
      const head = n === 1 ? t("galio.ab.qOne", "One collection") : t("galio.ab.qN", "{n} collections", { n: countWord(n).charAt(0).toUpperCase() + countWord(n).slice(1) });
      return this.f.pickup ? t("galio.ab.quote", "{head}, one counter, and every piece sold on its own.", { head }) : t("galio.ab.quote0", "{head}, and every piece sold on its own.", { head });
    },
    banner() {
      return { wide: photo("galio-banner-wide.webp"), square: photo("galio-banner-square.webp") };
    },
    photos() {
      return { counter: photo("galio-mosaic-counter.webp"), courier: photo("galio-mosaic-courier.webp") };
    },
    /* One best seller from each collection, for the drawn fallbacks. */
    picks() {
      const out = this.plates.map((x: any) => x.p);
      return out.concat(out).slice(0, 6);
    },
    bannerPicks() {
      return this.plates.map((x: any) => x.p).slice(0, 6);
    },
    counterNote() {
      const note = String(this.f.pickupNote || "").trim();
      if (!note) return "";
      const first = note.split(/(?<=\.)\s/)[0];
      return /\d{1,2}[:.]\d{2}/.test(first) ? "" : first;
    },
    openText() {
      return openLine(this.f);
    },
    mapPlace() {
      return shortAddress(this.f) || this.name;
    },
    directions() {
      return directionsTo(this.f);
    },
    shopTo() {
      return shopAllTo();
    },
    contactTo() {
      return { name: window.$storefront.routes.SHOP_CONTACT_US };
    },
    faqTo() {
      return { name: "ShopFAQ" };
    },
  },

  watch: {
    "data.cats.length"() {
      this.$nextTick(this.fit);
    },
  },

  created() {
    loadShop();
    this.setPageTitle?.(t("galio.ab.title", "About {shop}", { shop: shopName(this.$store.getters.getShop) }));
    shopProfile(this.$shop.name, "about-us").then((p) => (this.profile = p));
    journalPage({ page: 1, limit: 4 })
      .then(({ articles }: any) => (this.posts = (articles || []).slice(0, 4)))
      .catch(() => {});
  },

  mounted() {
    this.fit();
    document.fonts?.ready?.then(() => this.fit());
    this.onResize = () => this.fit();
    window.addEventListener("resize", this.onResize, { passive: true });
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },

  methods: {
    t,
    money,
    tintOf,
    catTo,
    catTitle,
    telOf,
    productImage(p: any) {
      return productImage(p, 128) || productImage(p);
    },
    fromOf(c: any) {
      void this.currency;
      return fromPrice(this.shop, c.id);
    },
    /* The script line stays on one line inside the banner (the mockup's fitAll). */
    fit() {
      if (this.$refs.script && window.innerWidth > 760) fitLine(this.$refs.script as HTMLElement);
    },
  },
};
</script>
