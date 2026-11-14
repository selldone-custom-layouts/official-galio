<!--
  Galio Sundae — the product card (galio-design/g/shell.js card()): the white card, the piece on its
  round plate in its collection's tint, the tilted saving sticker (fit inside its circle), the quick
  look button in the plate's free corner (`quick`), the collection, the name (two lines), a line about
  the piece (or "Save $x on each <unit>" with `save`), the price, the price before and the unit, and
  "Add to bag", which becomes − n + in place.
-->
<template>
  <li :class="['card', { 'card--nocat': nocat }]">
    <div class="plate-wrap">
      <router-link :aria-label="product.title" :style="{ '--gl-tint': tintOf(product.category_id) }" :to="to" class="plate"
        ><img :sizes="sizes" :src="img" :srcset="srcset" alt="" height="400" loading="lazy" width="400" @error="dropSrcset"
      /></router-link>
      <span v-if="pv.off > 0" ref="sticker" :aria-label="t('galio.card.offAria', '{off} percent off', { off: pv.off })" class="sticker" role="img"><span dir="ltr">−{{ pv.off }}%</span></span>
      <button v-if="quick" :aria-label="t('galio.card.quick', 'Quick view: {name}', { name: product.title })" class="qv-btn" type="button" @click="openQuick(product, $event.currentTarget)">
        <gl-icon name="search" />
      </button>
    </div>
    <span v-if="!nocat" class="cat"><bdi>{{ catTitle(catOf(product.category_id)) }}</bdi></span>
    <h3><router-link :to="to">{{ product.title }}</router-link></h3>
    <p v-if="save && pv.save > 0" class="tag tag--save">{{ t("galio.card.saveEach", "Save {amount} on each {unit}", { amount: money(pv.save), unit: unitOf(product) }) }}</p>
    <p v-else-if="look" class="tag">{{ look }}</p>
    <div class="price tab-num">
      {{ money(pv.now) }}<s v-if="pv.was">{{ money(pv.was) }}</s><span class="per">{{ t("galio.card.per", "per {unit}", { unit: unitOf(product) }) }}</span>
    </div>
    <div class="buy"><gl-qb :product="product" kind="btn" /></div>
  </li>
</template>

<script>
import GlIcon from "./GlIcon.vue";
import GlQb from "./GlQb.vue";
import { catOf, catTitle, lookOf, money, openQuick, priceView, productImage, productTo, tintOf, unitOf } from "./galio";
import { fitInCircle } from "../bakini/fit-in-circle";
import { dropSrcset, productSrcset } from "../kalio/kalio-catalog";
import { currentCurrency } from "../region-switcher/region";
import { t } from "../kalio/i18n/kalio-i18n";

export default {
  name: "GlCard",
  components: { GlIcon, GlQb },
  props: {
    product: { type: Object, required: true },
    quick: Boolean,
    nocat: Boolean,
    save: Boolean,
    sizes: { type: String, default: "(max-width: 760px) 40vw, 240px" },
  },
  computed: {
    pv() {
      void currentCurrency();
      return priceView(this.$store.getters.getShop, this.product);
    },
    to() {
      return productTo(this.product);
    },
    img() {
      return productImage(this.product);
    },
    srcset() {
      return productSrcset(this.product);
    },
    look() {
      return lookOf(this.product);
    },
  },
  watch: {
    "pv.off"() {
      this.$nextTick(() => this.fit());
    },
  },
  mounted() {
    this.fit();
    document.fonts?.ready?.then(() => this.fit());
    /* The sticker fits again when the window changes (fit-in-circle.ts asks for it). */
    this.onResize = () => this.fit();
    window.addEventListener("resize", this.onResize, { passive: true });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    t,
    money,
    catOf,
    catTitle,
    tintOf,
    unitOf,
    openQuick,
    dropSrcset,
    fit() {
      if (this.$refs.sticker) fitInCircle(this.$refs.sticker);
    },
  },
};
</script>
