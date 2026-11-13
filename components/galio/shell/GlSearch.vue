<!--
  Galio Sundae — search (galio-design/g/shell.js openSearch(), suggestHTML()): beside the rail on wide
  screens, a panel from the top on phones. The field suggests while typing from the live catalogue
  (title, collection and spec words: the matching collections as chips, then the pieces with their
  round tinted plates, collection and price, and "See every result"); before anything is typed, words
  most products share ("Try") and every collection. Enter opens the results page. Closes on Esc, ✕,
  a click outside or a page change.
-->
<template>
  <div id="gsrch" ref="el" :aria-label="t('galio.search.title', 'Search')" :class="['lay', wide ? 'lay--pop' : 'lay--full', 'sg']" :style="pos" role="dialog">
    <form class="sg-form" role="search" @submit.prevent="submit">
      <label class="vh" for="gl-sg-q">{{ t("galio.search.label", "Search the pastries") }}</label>
      <gl-icon name="search" />
      <input
        id="gl-sg-q"
        ref="q"
        :placeholder="t('galio.search.ph', 'Search pastries, flavours, collections')"
        :value="q"
        autocomplete="off"
        enterkeyhint="search"
        type="search"
        @input="q = $event.target.value"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
      />
      <button :aria-label="t('galio.search.close', 'Close search')" class="x" type="button" @click="closeLayer()"><gl-icon name="x" /></button>
    </form>
    <div class="sg-body">
      <template v-if="!query">
        <div v-if="popular.length" class="sg-pop">
          <span class="sg-lbl">{{ t("galio.search.try", "Try") }}</span>
          <router-link v-for="w in popular" :key="w" :to="searchTo(w.toLowerCase())" class="chip">{{ w }}</router-link>
        </div>
        <div v-if="cats.length" class="sg-pop">
          <span class="sg-lbl">{{ t("galio.search.collections", "Collections") }}</span>
          <router-link v-for="c in cats" :key="c.id" :to="catTo(c)" class="chip"><bdi>{{ catTitle(c) }}</bdi></router-link>
        </div>
      </template>
      <template v-else>
        <p v-if="!hits.length && !sugCats.length" class="sg-none">{{ t("galio.search.none", "No pastry matches “{q}”. Try a flavour such as {examples}.", { q: query, examples: noneExamples }) }}</p>
        <template v-else>
          <div v-if="sugCats.length" class="sg-pop">
            <router-link v-for="c in sugCats" :key="c.id" :to="catTo(c)" class="chip"><bdi>{{ catTitle(c) }}</bdi></router-link>
          </div>
          <ul v-if="hits.length" :aria-label="t('galio.search.suggestions', 'Suggestions')" class="sg-list" role="listbox">
            <li v-for="(p, i) in hits" :key="p.id" :aria-selected="i === cursor ? 'true' : 'false'" role="option">
              <router-link :class="{ hl: i === cursor }" :to="productTo(p)">
                <span :style="{ '--gl-tint': tintOf(p.category_id) }" class="mthumb"><img :src="thumb(p)" alt="" height="400" width="400" /></span>
                <span class="sg-t"
                  ><b v-html="mark(p.title)"></b><small><bdi>{{ catTitle(catOf(p.category_id)) }}</bdi> · {{ t("galio.card.per", "per {unit}", { unit: unitOf(p) }) }}</small></span
                >
                <span class="sg-p tab-num">{{ money(pv(p).now) }}</span>
              </router-link>
            </li>
          </ul>
          <router-link :to="searchTo(query)" class="link sg-all">{{ t("galio.search.all", "See every result for “{q}”", { q: query }) }}<gl-icon name="arrow" /></router-link>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import GlIcon from "../GlIcon.vue";
import { catOf, catTitle, catTo, closeLayer, money, priceView, productImage, productTo, routes, shopData, tintOf, unitOf } from "../galio";
import { searchScore, popularWords } from "./gl-search";
import { currentCurrency } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "GlSearch",
  components: { GlIcon },
  emits: ["search", "clear"],
  data: () => ({ q: "", cursor: -1, data: shopData, pos: {}, wide: true }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    query() {
      return this.q.trim();
    },
    cats() {
      return this.data.cats;
    },
    popular() {
      return popularWords(this.data.products, this.data.cats, 5);
    },
    noneExamples() {
      return this.popular
        .slice(0, 2)
        .map((w) => w.toLowerCase())
        .join(t("galio.search.or", " or "));
    },
    hits() {
      const q = this.query;
      if (!q) return [];
      return this.data.products
        .map((p) => ({ p, s: searchScore(p, q, catTitle(catOf(p.category_id))) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s || (b.p.sells || 0) - (a.p.sells || 0))
        .slice(0, 5)
        .map((x) => x.p);
    },
    sugCats() {
      const q = this.query.toLowerCase();
      return q ? this.cats.filter((c) => catTitle(c).toLowerCase().includes(q)) : [];
    },
  },
  watch: {
    query() {
      this.cursor = -1;
    },
  },
  mounted() {
    this.wide = window.innerWidth >= 1100;
    this.place();
    this.$nextTick(() => setTimeout(() => this.$refs.q?.focus({ preventScroll: true }), 30));
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
    closeLayer,
    pv(p) {
      void currentCurrency();
      return priceView(this.shop, p);
    },
    thumb(p) {
      return productImage(p, 128);
    },
    /* Beside the rail, level with the button that opened it. */
    place() {
      if (!this.wide) return;
      const btn = document.querySelector(".gl-shell .side-srch");
      this.$nextTick(() => {
        const h = this.$refs.el?.offsetHeight || 420;
        const r = btn ? btn.getBoundingClientRect() : { top: 120 };
        this.pos = { top: Math.max(16, Math.min(r.top - 20, window.innerHeight - h - 16)) + "px" };
      });
    },
    mark(title) {
      const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
      let out = esc(title);
      for (const w of this.query.split(/\s+/).filter(Boolean)) out = out.replace(new RegExp(`(${esc(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"), "<mark>$1</mark>");
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
