<!--
  Galio Sundae — the pages that list pastries (galio-design/category-b.html, search-b.html,
  deals-b.html; g/pages-shop.js), drawn from the live catalogue (one read, shared):

  - A collection or every pastry: the short lemon title band (breadcrumbs, the name, its line and the
    shared saving), the collections as chips on phones and tablets (the rail lists them on a
    computer), then the mint band: the toolbar (Filter on narrower screens, the active filters as
    chips, Sort), "Updating results…", the grid of cards with the quick look; on wide screens the
    filter panel and "Popular in <collection>" at the side. On narrower screens Filter opens the same
    panel as a sheet.
  - The filters are the collection's own spec, read live: a key is a filter only when the collection
    has two or more distinct short values for it (28 characters at most; the coordinator's rule), plus
    the price per piece (a two-thumb range with short boxes), On offer and Stock (from the real
    quantities). Nothing is invented. Sort: Featured, Best sellers, Customer review, Price low to high
    and high to low, Newest. Every change dims the cards, says "Updating results…" and fades the new
    ones up in steps (nothing moves with reduced motion).
  - Search: the sky band with the asked words and the search box (it suggests while typing), the
    collections in the results as chips, the grid; nothing found: the empty state with the collections.
  - Deals: the strawberry band with the shared saving, "Biggest savings" (the three largest dollar
    savings on the podium), then everything on offer by collection.
-->
<template>
  <div class="gl gl-listing">
    <!-- ━━━━━━━━━━ A collection, or every pastry ━━━━━━━━━━ -->
    <template v-if="kind === 'category' || kind === 'all'">
      <gl-ptitle :crumbs="crumbs" :h1="title" :lede="catLede" band="lemon" cls="ptitle--short" />
      <section :aria-label="title" class="sec sec--tight sec--shop bg-mint">
        <div class="wrap">
          <nav :aria-label="t('galio.ls.collections', 'Collections')" class="cat-chips">
            <router-link :aria-current="kind === 'all' ? 'page' : undefined" :to="allTo" class="chip">{{ t("galio.ls.all", "All") }}</router-link>
            <router-link v-for="c in cats" :key="c.id" :aria-current="c.id === cat?.id ? 'page' : undefined" :to="catTo(c)" class="chip"><bdi>{{ catTitle(c) }}</bdi></router-link>
          </nav>
          <div class="shop">
            <div class="shop-main">
              <div class="toolbar">
                <button ref="fbtn" aria-controls="fsheet" aria-haspopup="dialog" class="btn btn--ghost fbtn" type="button" @click="openSheet">
                  <gl-icon name="filter" />{{ t("galio.ls.filter", "Filter") }}<span v-if="active.length" class="count">{{ active.length }}</span>
                </button>
                <div class="act-chips">
                  <button v-for="a in active" :key="a.id" :aria-label="t('galio.ls.removeFilter', 'Remove filter: {name}', { name: a.label })" class="chip chip--on" type="button" @click="a.clear()">
                    <bdi>{{ a.label }}</bdi><gl-icon name="x" />
                  </button>
                </div>
                <label class="sortsel"
                  ><span class="vh">{{ t("galio.ls.sortBy", "Sort by") }}</span><gl-icon name="sort" /><select :value="sort" @change="setSort($event.target.value)">
                    <option v-for="s in sorts" :key="s[0]" :value="s[0]">{{ s[1] }}</option></select
                  ><gl-icon name="down"
                /></label>
              </div>
              <p v-if="busy" class="busy"><span aria-hidden="true" class="spin"></span>{{ t("galio.ls.updating", "Updating results…") }}</p>
              <div :class="{ 'is-busy': busy }" aria-live="polite" class="gl-results">
                <ul v-if="!ready" aria-hidden="true" class="grid-cards">
                  <li v-for="n in 8" :key="n" class="card gl-skel"><div class="plate-wrap"><span class="plate"></span></div><i></i><i></i><i></i></li>
                </ul>
                <div v-else-if="!shown.length" class="noresults">
                  <gl-empty :text="t('galio.ls.noneP', 'Every pastry here is sold on its own. Widen the price range or clear a filter to see more.')" :title="t('galio.ls.noneT', 'No pastries match these filters')" icon="filter">
                    <button class="btn" type="button" @click="reset">{{ t("galio.ls.clearAllFilters", "Clear all filters") }}</button>
                  </gl-empty>
                </div>
                <ul v-else class="grid-cards">
                  <gl-card
                    v-for="(p, i) in shown"
                    :key="p.id + '-' + drawn"
                    :class="{ 'fade-up': animate && i < 12 }"
                    :nocat="kind === 'category'"
                    :product="p"
                    :style="animate && i < 12 ? { animationDelay: i * 25 + 'ms' } : null"
                    quick
                  />
                </ul>
              </div>
            </div>
            <aside :aria-label="t('galio.ls.filters', 'Filters')" class="shop-side">
              <gl-filter-panel v-bind="panelProps" v-on="panelEvents" id-prefix="side" />
              <div v-if="popular.length" class="side-card">
                <h2>{{ t("galio.ls.popularIn", "Popular in {name}", { name: title.toLowerCase() }) }}</h2>
                <ul class="minis"><gl-mini v-for="p in popular" :key="p.id" :product="p" /></ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <!-- The filter sheet (narrower screens) -->
      <teleport to="body">
        <div v-if="sheet" :dir="rtl ? 'rtl' : 'ltr'" class="gl gl-layers">
          <div class="scrim scrim--dialog" @click="closeSheet"></div>
          <div id="fsheet" :aria-label="t('galio.ls.filters', 'Filters')" aria-modal="true" class="lay lay--dialog dlg fsheet" role="dialog" @keydown.esc.stop="closeSheet">
            <div class="dlg-head">
              <h2 class="fs-h">{{ t("galio.ls.filterOf", "Filter {name}", { name: kind === "all" ? t("galio.ls.allLower", "all pastries") : title.toLowerCase() }) }}</h2>
              <button ref="sheetX" :aria-label="t('galio.ls.closeFilters', 'Close filters')" class="x" type="button" @click="closeSheet"><gl-icon name="x" /></button>
            </div>
            <gl-filter-panel v-bind="panelProps" v-on="panelEvents" id-prefix="sheet" />
            <div class="fs-foot">
              <button class="link" type="button" @click="reset">{{ t("galio.ls.clearAll", "Clear all") }}</button>
              <button class="btn" type="button" @click="closeSheet">{{ t("galio.ls.showN", { one: "Show {n} result", other: "Show {n} results" }, { n: list.length }) }}</button>
            </div>
          </div>
        </div>
      </teleport>
    </template>

    <!-- ━━━━━━━━━━ Search ━━━━━━━━━━ -->
    <template v-else-if="kind === 'search'">
      <gl-ptitle :crumbs="[[t('galio.crumb.home', 'Home'), { path: '/' }], [t('galio.crumb.search', 'Search')]]" :kick="t('galio.ls.searchedFor', 'you searched for')" band="sky" cls="ptitle--short">
        <template #h1>“<bdi>{{ search }}</bdi>”</template>
        <form ref="spForm" class="sp-form" role="search" @submit.prevent="submitSearch">
          <label class="vh" for="gl-sp-q">{{ t("galio.search.label", "Search the pastries") }}</label>
          <gl-icon name="search" />
          <input
            id="gl-sp-q"
            :placeholder="t('galio.search.ph', 'Search pastries, flavours, collections')"
            :value="q"
            aria-controls="gl-sp-sug"
            autocomplete="off"
            enterkeyhint="search"
            type="search"
            @focus="sugOpen = !!q.trim()"
            @input="onQ($event.target.value)"
            @keydown.esc="sugOpen = false"
          />
          <button class="btn" type="submit">{{ t("galio.search.go", "Search") }}</button>
          <div v-if="sugOpen && q.trim()" id="gl-sp-sug" class="sp-sug">
            <p v-if="!sugHits.length" class="sg-none">{{ t("galio.ls.noSug", "No pastry matches “{q}”.", { q: q.trim() }) }}</p>
            <ul v-else :aria-label="t('galio.search.suggestions', 'Suggestions')" class="sg-list" role="listbox">
              <li v-for="p in sugHits" :key="p.id" role="option">
                <router-link :to="productTo(p)">
                  <span :style="{ '--gl-tint': tintOf(p.category_id) }" class="mthumb"><img :src="thumb(p)" alt="" height="400" width="400" /></span>
                  <span class="sg-t"
                    ><b>{{ p.title }}</b><small><bdi>{{ catTitle(catOf(p.category_id)) }}</bdi> · {{ t("galio.card.per", "per {unit}", { unit: unitOf(p) }) }}</small></span
                  >
                  <span class="sg-p tab-num">{{ money(pv(p).now) }}</span>
                </router-link>
              </li>
            </ul>
          </div>
        </form>
      </gl-ptitle>
      <section :aria-label="t('galio.ls.results', 'Results')" class="sec sec--tight bg-white">
        <div class="wrap">
          <template v-if="ready && base.length">
            <p class="res-line">{{ tab !== "all" ? t("galio.ls.inCat", "In {name}", { name: catTitle(catOf(tab)) }) : t("galio.ls.across", { one: "Across {n} collection", other: "Across {n} collections" }, { n: resultCats.length }) }}</p>
            <nav :aria-label="t('galio.ls.collectionsIn', 'Collections in the results')" class="cat-chips cat-chips--all">
              <button :aria-pressed="tab === 'all' ? 'true' : 'false'" class="chip" type="button" @click="setTab('all')">{{ t("galio.ls.allCollections", "All collections") }}</button>
              <button v-for="id in resultCats" :key="id" :aria-pressed="tab === id ? 'true' : 'false'" class="chip" type="button" @click="setTab(id)"><bdi>{{ catTitle(catOf(id)) }}</bdi></button>
            </nav>
            <ul class="grid-cards grid-cards--5">
              <gl-card v-for="p in shown" :key="p.id + '-' + drawn" :product="p" quick />
            </ul>
          </template>
          <ul v-else-if="!ready" aria-hidden="true" class="grid-cards grid-cards--5">
            <li v-for="n in 5" :key="n" class="card gl-skel"><div class="plate-wrap"><span class="plate"></span></div><i></i><i></i><i></i></li>
          </ul>
          <gl-empty v-else :text="noMatchLine" :title="t('galio.ls.noMatchT', 'No pastry matches “{q}”', { q: search })" icon="search">
            <div class="chips">
              <router-link v-for="c in cats" :key="c.id" :to="catTo(c)" class="chip"><bdi>{{ catTitle(c) }}</bdi></router-link>
            </div>
          </gl-empty>
        </div>
      </section>
    </template>

    <!-- ━━━━━━━━━━ Deals ━━━━━━━━━━ -->
    <template v-else>
      <gl-ptitle :crumbs="[[t('galio.crumb.home', 'Home'), { path: '/' }], [t('galio.crumb.deals', 'Deals')]]" :h1="t('galio.ls.dealsH', 'Deals')" :kick="t('galio.ls.dealsKick', 'a sweet deal')" :lede="dealsLede" band="straw" />
      <template v-if="ready && base.length">
        <section aria-labelledby="gl-h-big" class="sec sec--tight bg-white deals-top">
          <div class="wrap">
            <h2 id="gl-h-big" class="h3x">{{ t("galio.ls.biggest", "Biggest savings") }}</h2>
            <ul class="podium">
              <li v-for="(x, i) in podium" :key="x.id" :style="{ '--gl-tint': tintOf(x.category_id) }" class="pod">
                <span aria-hidden="true" class="pod-n">{{ i + 1 }}</span>
                <router-link :to="productTo(x)" aria-hidden="true" class="pod-plate" tabindex="-1"><img :src="img(x)" alt="" height="400" width="400" /></router-link>
                <div class="pod-t">
                  <span class="cat"><bdi>{{ catTitle(catOf(x.category_id)) }}</bdi></span>
                  <h3><router-link :to="productTo(x)">{{ x.title }}</router-link></h3>
                  <p class="pod-save">{{ t("galio.ls.save", "Save {amount}", { amount: money(pv(x).save) }) }}</p>
                  <div class="price tab-num">
                    {{ money(pv(x).now) }}<s v-if="pv(x).was">{{ money(pv(x).was) }}</s><span class="per">{{ t("galio.card.per", "per {unit}", { unit: unitOf(x) }) }}</span>
                  </div>
                  <gl-qb :product="x" kind="btn" />
                </div>
              </li>
            </ul>
          </div>
        </section>
        <section aria-labelledby="gl-h-all" class="sec sec--tight bg-lemon">
          <div class="wrap">
            <div class="deals-head">
              <h2 id="gl-h-all" class="h3x">{{ tab !== "all" ? t("galio.ls.onOfferIn", "{name} on offer", { name: catTitle(catOf(tab)) }) : t("galio.ls.everything", "Everything on offer") }}</h2>
              <nav :aria-label="t('galio.ls.collections', 'Collections')" class="cat-chips cat-chips--all">
                <button :aria-pressed="tab === 'all' ? 'true' : 'false'" class="chip" type="button" @click="setTab('all')">{{ t("galio.ls.everyCollection", "Every collection") }}</button>
                <button v-for="c in tabCats" :key="c.id" :aria-pressed="tab === c.id ? 'true' : 'false'" class="chip" type="button" @click="setTab(c.id)"><bdi>{{ catTitle(c) }}</bdi></button>
              </nav>
            </div>
            <ul class="grid-cards grid-cards--5">
              <gl-card v-for="p in shown" :key="p.id + '-' + drawn" :product="p" save />
            </ul>
          </div>
        </section>
      </template>
      <section v-else class="sec sec--tight bg-white">
        <div class="wrap">
          <ul v-if="!ready" aria-hidden="true" class="grid-cards grid-cards--5">
            <li v-for="n in 5" :key="n" class="card gl-skel"><div class="plate-wrap"><span class="plate"></span></div><i></i><i></i><i></i></li>
          </ul>
          <gl-empty v-else :text="t('galio.ls.noDealsP', 'Nothing is on offer right now. Every pastry is still sold on its own.')" :title="t('galio.ls.noDealsT', 'No deals today')" icon="gift">
            <router-link :to="allTo" class="btn">{{ t("galio.ls.shopAll", "Shop all pastries") }}</router-link>
          </gl-empty>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import GlIcon from "../GlIcon.vue";
import GlCard from "../GlCard.vue";
import GlMini from "../GlMini.vue";
import GlQb from "../GlQb.vue";
import GlEmpty from "../GlEmpty.vue";
import GlPtitle from "../GlPtitle.vue";
import GlFilterPanel from "./GlFilterPanel.vue";
import { allOff, bySells, catOf, catTitle, catTo, inCat, loadShop, money, priceView, productImage, productTo, shopAllTo, shopData, specGroups, specValue, tintOf, unitOf } from "../galio";
import { popularWords, searchScore } from "../shell/gl-search";
import { currentCurrency, isRtl, signOf } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

const MAX_VALUE = 28;
const FEW = 15;

export default {
  name: "GlListing",
  components: { GlIcon, GlCard, GlMini, GlQb, GlEmpty, GlPtitle, GlFilterPanel },
  props: {
    categoryName: { type: String, default: null },
    search: { type: String, default: "" },
    deals: Boolean,
    initialSort: { type: String, default: "" },
  },
  /* fetched: the page's search-engine data (StorefrontSeo.updateProducts). */
  emits: ["fetched"],

  data: () => ({
    data: shopData,
    q: "",
    sugOpen: false,
    tab: "all",
    sort: "featured",
    f: {},
    offer: false,
    stock: [],
    min: 0,
    max: 0,
    sheet: false,
    busy: false,
    animate: false,
    drawn: 0,
    snapshot: null,
    more: {},
  }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    currency() {
      return currentCurrency();
    },
    rtl() {
      return isRtl();
    },
    sign() {
      return signOf(this.currency) || this.currency;
    },
    ready() {
      return this.data.ready;
    },
    kind() {
      if (this.categoryName) return "category";
      if (this.search) return "search";
      if (this.deals) return "deals";
      return "all";
    },
    cats() {
      return this.data.cats.filter((c) => inCat(c.id).length || !this.ready);
    },
    cat() {
      return this.data.cats.find((c) => c.name === this.categoryName) || null;
    },
    title() {
      if (this.kind === "all") return t("galio.ls.allH", "All pastries");
      return catTitle(this.cat) || String(this.categoryName || "");
    },
    crumbs() {
      const home = [t("galio.crumb.home", "Home"), { path: "/" }];
      if (this.kind === "all") return [home, [t("galio.crumb.shop", "Shop")]];
      return [home, [t("galio.crumb.shop", "Shop"), this.allTo], [this.title]];
    },
    off() {
      void this.currency;
      void this.ready;
      return allOff(this.shop);
    },
    catLede() {
      if (this.kind === "all") {
        return this.off
          ? t("galio.ls.allLedeOff", "Every collection, every pastry sold on its own, and right now every one is {off}% off.", { off: this.off })
          : t("galio.ls.allLede", "Every collection, every pastry sold on its own.");
      }
      const desc = this.cat?.description || "";
      const offs = this.base.map((p) => this.pv(p).off);
      const every = offs.length && offs.every((o) => o > 0 && o === offs[0]);
      return [desc, every ? t("galio.ls.everyOff", "Right now every one is {off}% off.", { off: offs[0] }) : ""].filter(Boolean).join(" ");
    },
    dealsLede() {
      if (this.off) return t("galio.ls.dealsLedeAll", "Every pastry is {off}% off right now. The biggest dollar savings come first.", { off: this.off });
      return t("galio.ls.dealsLede", "Pastries on offer, the biggest dollar saving first.");
    },
    /* The products this page starts from. */
    base() {
      const all = this.data.products;
      if (this.kind === "category") return this.cat ? inCat(this.cat.id) : all.filter((p) => String(p.category_id) === String(this.categoryName));
      if (this.kind === "search") return this.matches(this.search);
      if (this.kind === "deals") return all.filter((p) => this.pv(p).save > 0);
      return all;
    },
    prices() {
      return this.base.map((p) => this.pv(p).now);
    },
    lo() {
      return this.prices.length ? Math.floor(Math.min(...this.prices)) : 0;
    },
    hi() {
      return this.prices.length ? Math.ceil(Math.max(...this.prices)) : 0;
    },
    anyOffer() {
      return this.base.some((p) => this.pv(p).save > 0);
    },
    /* Real filters: spec keys with two or more distinct short values here (a sentence is left out; a
       key with one value is no filter), most values first. */
    facets() {
      const map = new Map();
      for (const p of this.base) {
        for (const g of specGroups(p)) {
          for (const [k, v] of g.rows) {
            if (!map.has(k)) map.set(k, []);
            const vals = map.get(k);
            if (String(v).length <= MAX_VALUE && !vals.includes(v)) vals.push(v);
          }
        }
      }
      return [...map.entries()]
        .map(([key, values]) => ({ key, values }))
        .filter((x) => x.values.length >= 2)
        .sort((a, b) => b.values.length - a.values.length);
    },
    /* Stock, from the real quantities: "In stock", and "Only a few left" when some pieces are down to a few. */
    stockValues() {
      const inStock = this.base.filter((p) => Number(p.quantity) > 0);
      if (!inStock.length) return [];
      const few = inStock.some((p) => Number(p.quantity) <= FEW);
      return few ? ["in", "few"] : ["in"];
    },
    sorts() {
      return [
        ["featured", t("galio.ls.sFeatured", "Featured")],
        ["best", t("galio.ls.sBest", "Best sellers")],
        ["review", t("galio.ls.sReview", "Customer review")],
        ["low", t("galio.ls.sLow", "Price: low to high")],
        ["high", t("galio.ls.sHigh", "Price: high to low")],
        ["new", t("galio.ls.sNew", "Newest")],
      ];
    },
    /* The filtered and sorted list. */
    list() {
      const l = this.base.filter((p) => {
        if (this.tab !== "all" && p.category_id !== this.tab) return false;
        if (this.kind !== "category" && this.kind !== "all") return true;
        const now = this.pv(p).now;
        if (this.hi > this.lo && (now < this.min - 0.001 || now > this.max + 0.001)) return false;
        if (this.offer && !(this.pv(p).save > 0)) return false;
        if (this.stock.length) {
          const q = Number(p.quantity);
          const ok = (this.stock.includes("in") && q > 0) || (this.stock.includes("few") && q > 0 && q <= FEW);
          if (!ok) return false;
        }
        for (const k of Object.keys(this.f)) if (this.f[k].length && !this.f[k].includes(specValue(p, k))) return false;
        return true;
      });
      if (this.kind === "deals") return [...l].sort((a, b) => this.pv(b).save - this.pv(a).save || (b.sells || 0) - (a.sells || 0));
      if (this.kind === "search") return l;
      return this.sorted(l);
    },
    /* What the grid shows: the list as of the last change applied. */
    shown() {
      return this.snapshot || this.list;
    },
    active() {
      const out = [];
      if (this.hi > this.lo && (this.min > this.lo || this.max < this.hi))
        out.push({
          id: "price",
          label: `${money(this.min)} – ${money(this.max)}`,
          clear: () => {
            this.min = this.lo;
            this.max = this.hi;
            this.update();
          },
        });
      if (this.offer) out.push({ id: "offer", label: t("galio.ls.onOffer", "On offer"), clear: () => this.setOffer(false) });
      for (const s of this.stock) out.push({ id: "stock:" + s, label: this.stockLabel(s), clear: () => this.toggleStock(s) });
      for (const k of Object.keys(this.f)) for (const v of this.f[k]) out.push({ id: k + ":" + v, label: v, clear: () => this.toggle(k, v) });
      return out;
    },
    panelProps() {
      return {
        lo: this.lo,
        hi: this.hi,
        min: this.min,
        max: this.max,
        sign: this.sign,
        offerOn: this.anyOffer,
        offer: this.offer,
        offLabel: this.off ? t("galio.ls.onOfferOff", "On offer · {off}% off", { off: this.off }) : t("galio.ls.onOffer", "On offer"),
        facets: this.facets,
        picked: this.f,
        stockValues: this.stockValues.map((v) => ({ v, label: this.stockLabel(v) })),
        stock: this.stock,
        more: this.more,
        activeCount: this.active.length,
      };
    },
    panelEvents() {
      return {
        min: (v) => (this.min = v),
        max: (v) => (this.max = v),
        apply: () => this.update(),
        offer: (v) => this.setOffer(v),
        facet: ({ key, value }) => this.toggle(key, value),
        stock: (v) => this.toggleStock(v),
        more: (key) => (this.more = { ...this.more, [key]: !this.more[key] }),
        clear: () => this.reset(),
      };
    },
    popular() {
      return bySells(this.base).slice(0, 3);
    },
    resultCats() {
      return [...new Set(this.base.map((p) => p.category_id))].filter((id) => catOf(id));
    },
    tabCats() {
      const ids = new Set(this.base.map((p) => p.category_id));
      return this.data.cats.filter((c) => ids.has(c.id));
    },
    podium() {
      return [...this.base].sort((a, b) => this.pv(b).save - this.pv(a).save || (b.sells || 0) - (a.sells || 0)).slice(0, 3);
    },
    sugHits() {
      const q = this.q.trim();
      if (!q) return [];
      return this.matches(q).slice(0, 5);
    },
    noMatchLine() {
      const ex = popularWords(this.data.products, this.data.cats, 3).map((w) => w.toLowerCase());
      return ex.length
        ? t("galio.ls.noMatchP", "Try a flavour, such as {examples}, or start from a collection.", { examples: ex.join(", ") })
        : t("galio.ls.noMatchP0", "Try another word, or start from a collection.");
    },
    allTo() {
      return shopAllTo();
    },
  },

  watch: {
    base: {
      handler(list) {
        this.resetRange();
        this.snapshot = null;
        if (this.ready && (this.kind !== "category" || this.cat)) this.$emit("fetched", { parent: this.cat || null, products: list });
      },
      immediate: true,
    },
    search: {
      handler(v) {
        this.q = v || "";
        this.tab = "all";
        this.sugOpen = false;
      },
      immediate: true,
    },
    categoryName() {
      this.f = {};
      this.offer = false;
      this.stock = [];
      this.tab = "all";
      this.animate = false;
    },
  },

  created() {
    loadShop();
    this.sort = { most_sales: "best", newest: "new", cheapest: "low", most_expensive: "high" }[this.initialSort] || "featured";
  },

  mounted() {
    this.onDoc = (e) => {
      if (this.sugOpen && this.$refs.spForm && !this.$refs.spForm.contains(e.target)) this.sugOpen = false;
    };
    document.addEventListener("click", this.onDoc, true);
    this.onResize = () => {
      if (this.sheet && window.innerWidth >= 1280) this.closeSheet();
    };
    window.addEventListener("resize", this.onResize, { passive: true });
  },

  beforeUnmount() {
    document.removeEventListener("click", this.onDoc, true);
    window.removeEventListener("resize", this.onResize);
    clearTimeout(this.timer);
    if (this.sheet) document.documentElement.style.overflow = "";
  },

  methods: {
    t,
    money,
    catOf,
    catTitle,
    catTo,
    tintOf,
    unitOf,
    productTo,
    pv(p) {
      void this.currency;
      return priceView(this.shop, p);
    },
    img(p) {
      return productImage(p);
    },
    thumb(p) {
      return productImage(p, 128);
    },
    stockLabel(v) {
      return v === "few" ? t("galio.ls.few", "Only a few left") : t("galio.ls.inStock", "In stock");
    },
    matches(q) {
      return this.data.products
        .map((p) => ({ p, s: searchScore(p, q, catTitle(catOf(p.category_id))) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s || (b.p.sells || 0) - (a.p.sells || 0))
        .map((x) => x.p);
    },
    sorted(l) {
      const out = [...l];
      const key = this.sort;
      if (key === "best") return bySells(out);
      if (key === "review") return out.sort((a, b) => (b.rate || 0) - (a.rate || 0) || (b.rate_count || 0) - (a.rate_count || 0));
      if (key === "low") return out.sort((a, b) => this.pv(a).now - this.pv(b).now || a.id - b.id);
      if (key === "high") return out.sort((a, b) => this.pv(b).now - this.pv(a).now || a.id - b.id);
      if (key === "new") return out.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")) || b.id - a.id);
      return out;
    },
    resetRange() {
      this.min = this.lo;
      this.max = this.hi;
    },
    /* Dim, say "Updating results…", then draw the new list fading up. */
    update() {
      const still = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (still) {
        this.animate = false;
        this.snapshot = [...this.list];
        return;
      }
      this.busy = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.busy = false;
        this.animate = true;
        this.drawn++;
        this.snapshot = [...this.list];
      }, 420);
    },
    toggle(k, v) {
      const cur = [...(this.f[k] || [])];
      const i = cur.indexOf(v);
      if (i >= 0) cur.splice(i, 1);
      else cur.push(v);
      this.f = { ...this.f, [k]: cur };
      this.update();
    },
    toggleStock(v) {
      this.stock = this.stock.includes(v) ? this.stock.filter((x) => x !== v) : [...this.stock, v];
      this.update();
    },
    setOffer(v) {
      this.offer = v;
      this.update();
    },
    setSort(s) {
      this.sort = s;
      this.update();
    },
    setTab(id) {
      this.tab = id;
      this.snapshot = null;
      this.drawn++;
    },
    reset() {
      this.f = {};
      this.offer = false;
      this.stock = [];
      this.resetRange();
      this.update();
    },
    openSheet() {
      this.sheet = true;
      document.documentElement.style.overflow = "hidden";
      this.$nextTick(() => this.$refs.sheetX?.focus({ preventScroll: true }));
    },
    closeSheet() {
      this.sheet = false;
      document.documentElement.style.overflow = "";
      this.$nextTick(() => this.$refs.fbtn?.focus({ preventScroll: true }));
    },
    onQ(v) {
      this.q = v;
      this.sugOpen = !!v.trim();
    },
    submitSearch() {
      const q = this.q.trim();
      this.sugOpen = false;
      if (!q) return;
      this.$router.push({ name: window.$storefront.routes.SHOP_PAGE, query: { search: q } });
    },
  },
};
</script>
