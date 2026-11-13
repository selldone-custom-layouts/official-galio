<!--
  Galio Sundae — the search panel (the rail's and the menu's "Search"): a field with suggestions while
  typing, from the live catalogue (title, collection and spec words), each with its round tinted plate,
  collection and price; "Popular" words the products share before anything is typed; Enter (or "See
  every result") opens the listing for the words. Closes on Esc, a click outside or a page change.
-->
<template>
  <div id="gsrch" :aria-label="t('galio.search.title', 'Search')" class="gl-search" role="search">
    <form class="gl-search-form" @submit.prevent="submit">
      <gl-icon name="search" />
      <input
        ref="q"
        :aria-label="t('galio.search.label', 'Search the bakery')"
        :placeholder="t('galio.search.ph', 'Search {examples}…', { examples })"
        :value="q"
        autocomplete="off"
        enterkeyhint="search"
        type="search"
        @input="q = $event.target.value"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
      />
      <button class="btn" type="submit">{{ t("galio.search.go", "Search") }}</button>
      <button :aria-label="t('galio.search.close', 'Close search')" class="gl-search-x" type="button" @click="closeLayer()"><gl-icon name="x" /></button>
    </form>
    <div class="gl-search-body">
      <div v-if="!query && popular.length" class="gl-search-pop">
        <span class="lbl">{{ t("galio.search.popular", "Popular") }}</span>
        <router-link v-for="w in popular" :key="w" :to="searchTo(w)" class="chip">{{ w }}</router-link>
      </div>
      <template v-else-if="query">
        <div v-if="sugCats.length" class="gl-search-pop">
          <router-link v-for="c in sugCats" :key="c.id" :to="catTo(c)" class="chip"><bdi>{{ catTitle(c) }}</bdi></router-link>
        </div>
        <ul v-if="hits.length" class="gl-search-list" role="listbox">
          <li v-for="(p, i) in hits" :key="p.id" :aria-selected="i === cursor ? 'true' : 'false'" role="option">
            <router-link :class="{ hl: i === cursor }" :to="productTo(p)">
              <span :style="{ '--gl-tint': tintOf(p.category_id) }" class="th"><img :src="thumb(p)" alt="" /></span>
              <span class="nm"
                ><b v-html="mark(p.title)"></b><small><bdi>{{ catTitle(catOf(p.category_id)) }}</bdi> · {{ t("galio.card.per", "per {unit}", { unit: unitOf(p) }) }}</small></span
              >
              <span class="pr tab-num">{{ money(priceView(shop, p).now) }}</span>
            </router-link>
          </li>
        </ul>
        <p v-if="!hits.length && !sugCats.length" class="gl-search-none">{{ t("galio.search.none", "Nothing matches “{q}”. Try another word.", { q: query }) }}</p>
        <div v-else class="gl-search-all">
          <router-link :to="searchTo(query)" class="link">{{ t("galio.search.all", "See every result for “{q}”", { q: query }) }}<gl-icon name="arrow" /></router-link>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import GlIcon from "../GlIcon.vue";
import { catOf, catTitle, catTo, closeLayer, money, priceView, productImage, productTo, routes, shopData, tintOf, unitOf } from "../galio";
import { t } from "../../kalio/i18n/kalio-i18n";

/* Words that say nothing about a pastry, left out of "Popular". */
const STOP = new Set(["and", "with", "the", "of", "a", "an", "in", "on", "mini", "classic", "double", "cake", "cakes"]);

export default {
  name: "GlSearch",
  components: { GlIcon },
  emits: ["search", "clear"],
  data: () => ({ q: "", cursor: -1, data: shopData }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    query() {
      return this.q.trim();
    },
    examples() {
      return this.data.cats.slice(0, 2).map((c) => catTitle(c).toLowerCase()).join(", ") || t("galio.search.pastries", "pastries");
    },
    /* The words most product titles share (flavours), from the live catalogue. */
    popular() {
      const count = new Map();
      const catWords = new Set(this.data.cats.flatMap((c) => catTitle(c).toLowerCase().split(/\s+/)).concat(this.data.cats.flatMap((c) => catTitle(c).toLowerCase().replace(/s$/, "").split(/\s+/))));
      for (const p of this.data.products) {
        const seen = new Set();
        for (const w of String(p.title || "").split(/[^\p{L}]+/u)) {
          const k = w.toLowerCase();
          if (k.length < 4 || STOP.has(k) || catWords.has(k) || catWords.has(k + "s") || seen.has(k)) continue;
          seen.add(k);
          count.set(k, (count.get(k) || 0) + 1);
        }
      }
      return [...count.entries()]
        .filter(([, n]) => n >= 2)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 6)
        .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
    },
    hits() {
      const q = this.query.toLowerCase();
      if (!q) return [];
      const words = q.split(/\s+/).filter(Boolean);
      const score = (p) => {
        const title = String(p.title || "").toLowerCase();
        const hay = (title + " " + catTitle(catOf(p.category_id)) + " " + Object.values(p.spec || {}).flat().join(" ")).toLowerCase();
        let s = 0;
        for (const w of words) {
          if (title.includes(w)) s += 3;
          else if (hay.includes(w)) s += 1;
          else return 0;
        }
        return s;
      };
      return this.data.products
        .map((p) => ({ p, s: score(p) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s || (b.p.sells || 0) - (a.p.sells || 0))
        .slice(0, 6)
        .map((x) => x.p);
    },
    sugCats() {
      const q = this.query.toLowerCase();
      return q ? this.data.cats.filter((c) => catTitle(c).toLowerCase().includes(q)) : [];
    },
  },
  watch: {
    query() {
      this.cursor = -1;
    },
  },
  mounted() {
    this.$nextTick(() => setTimeout(() => this.$refs.q?.focus({ preventScroll: true }), 40));
  },
  methods: {
    t,
    money,
    priceView,
    catOf,
    catTitle,
    catTo,
    unitOf,
    productTo,
    tintOf,
    closeLayer,
    thumb(p) {
      return productImage(p, 128);
    },
    mark(title) {
      const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
      let out = esc(title);
      for (const w of this.query.split(/\s+/).filter(Boolean)) out = out.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"), "<mark>$1</mark>");
      return out;
    },
    move(d) {
      const n = this.hits.length;
      if (!n) return;
      this.cursor = (this.cursor + d + n) % n;
    },
    searchTo(q) {
      return { name: routes().SHOP_PAGE, query: { search: q } };
    },
    submit() {
      if (this.cursor >= 0 && this.hits[this.cursor]) {
        this.$router.push(productTo(this.hits[this.cursor]));
        return;
      }
      const text = this.query;
      closeLayer(true);
      if (!text) return this.$emit("clear");
      this.$emit("search", { search: text, search_type: null });
    },
  },
};
</script>
