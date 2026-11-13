<!--
  Galio Sundae — the collections menu beside the rail ("Shop" in the rail; galio-design/g/shell.js
  openShop()): every collection as a tinted card with its line drawing and "From $x", "Shop all
  pastries", Deals with the saving, and the three pieces ordered most. A popover: no scrim, a click
  outside, Esc, ✕ or a page change closes it.
-->
<template>
  <div id="gshop" :aria-label="t('galio.fly.aria', 'Collections')" class="lay lay--pop fly" role="dialog">
    <div class="fly-head">
      <span aria-hidden="true" class="kick">{{ t("galio.fly.kick", "the collections") }}</span>
      <h2>{{ t("galio.fly.h", "Shop the counter") }}</h2>
      <button ref="x" :aria-label="t('galio.fly.close', 'Close the collections menu')" class="x" type="button" @click="closeLayer()"><gl-icon name="x" /></button>
    </div>
    <ul class="fly-colls">
      <li v-for="c in cats" :key="c.id">
        <router-link :style="{ '--gl-tint': tintOf(c.id) }" :to="catTo(c)" class="fly-coll">
          <span class="coll-ic"><gl-icon :coll="c" /></span>
          <span class="fc-t"
            ><b><bdi>{{ catTitle(c) }}</bdi></b><span v-if="fromOf(c)">{{ t("galio.fly.from", "From {price}", { price: fromOf(c) }) }}</span></span
          >
        </router-link>
      </li>
    </ul>
    <div class="fly-foot">
      <router-link :to="shopAllTo" class="btn">{{ t("galio.fly.shopAll", "Shop all pastries") }}</router-link>
      <router-link :to="dealsTo" class="link">{{ off ? t("galio.fly.dealsOff", "Deals · {off}% off", { off }) : t("galio.fly.deals", "Deals") }}<gl-icon name="arrow" /></router-link>
    </div>
    <div v-if="best.length" class="fly-best">
      <h3>{{ t("galio.fly.best", "Most ordered") }}</h3>
      <ul class="minis"><gl-mini v-for="p in best" :key="p.id" :product="p" /></ul>
    </div>
  </div>
</template>

<script>
import GlIcon from "../GlIcon.vue";
import GlMini from "../GlMini.vue";
import { allOff, bySells, catTitle, catTo, closeLayer, fromPrice, inCat, money, shopAllTo, shopData, tintOf } from "../galio";
import { dealsRoute } from "../../kalio/kalio-catalog";
import { currentCurrency } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "GlFly",
  components: { GlIcon, GlMini },
  data: () => ({ data: shopData }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    cats() {
      return this.data.cats.filter((c) => inCat(c.id).length || !this.data.ready);
    },
    best() {
      return bySells(this.data.products).slice(0, 3);
    },
    off() {
      void currentCurrency();
      return allOff(this.shop);
    },
    shopAllTo() {
      return shopAllTo();
    },
    dealsTo() {
      return dealsRoute();
    },
  },
  mounted() {
    this.$nextTick(() => this.$refs.x?.focus({ preventScroll: true }));
  },
  methods: {
    t,
    catTitle,
    catTo,
    tintOf,
    closeLayer,
    fromOf(c) {
      void currentCurrency();
      const f = fromPrice(this.shop, c.id);
      return f ? money(f.now) : "";
    },
  },
};
</script>
