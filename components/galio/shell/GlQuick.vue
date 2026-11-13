<!--
  Galio Sundae — the quick look (galio-design/g/shell.js quickHTML()): a centred card on wide screens, a
  bottom sheet on phones: the collection, the piece on its round tinted plate, its name, "Sold by the
  piece · per <unit>", the price with the price before and the saving, a line about it, the stock, the
  big buy control and "View full details". A product with options goes to its page. Closes on Esc, ✕,
  a click on the scrim or a page change.
-->
<template>
  <template v-if="open && p">
    <div class="scrim scrim--dialog" @click="close"></div>
    <div id="qv" :aria-label="t('galio.qv.aria', 'Quick view: {name}', { name: p.title })" aria-modal="true" class="lay lay--dialog dlg dlg--qv" role="dialog">
      <div class="dlg-head">
        <span class="dlg-kick"><bdi>{{ catTitle(catOf(p.category_id)) }}</bdi></span>
        <button ref="x" :aria-label="t('galio.qv.close', 'Close quick view')" class="x" type="button" @click="close"><gl-icon name="x" /></button>
      </div>
      <div class="qv">
        <div :style="{ '--gl-tint': tintOf(p.category_id) }" class="qv-plate"><img :alt="p.title" :src="img" height="400" width="400" /></div>
        <div class="qv-t">
          <h2>{{ p.title }}</h2>
          <p class="qv-unit">{{ t("galio.qv.unit", "Sold by the piece · per {unit}", { unit: unitOf(p) }) }}</p>
          <div class="qv-price tab-num">
            <b>{{ money(pv.now) }}</b><s v-if="pv.was">{{ money(pv.was) }}</s><span v-if="pv.save > 0" class="save">{{ t("galio.qv.save", "Save {amount}", { amount: money(pv.save) }) }}</span>
          </div>
          <p v-if="look" class="qv-tag">{{ look }}</p>
          <p v-if="stockLine" class="qv-stock"><gl-icon name="box" /><span>{{ stockLine }}</span></p>
          <div class="qv-buy"><gl-qb :product="p" kind="big" /></div>
          <router-link :to="to" class="link" @click="close">{{ t("galio.qv.full", "View full details") }}<gl-icon name="arrow" /></router-link>
        </div>
      </div>
    </div>
  </template>
</template>

<script>
import GlIcon from "../GlIcon.vue";
import GlQb from "../GlQb.vue";
import { catOf, catTitle, closeLayer, layer, lookOf, money, priceView, productImage, productTo, tintOf, unitOf } from "../galio";
import { currentCurrency } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "GlQuick",
  components: { GlIcon, GlQb },
  data: () => ({ layer }),
  computed: {
    open() {
      return this.layer.open === "qv";
    },
    p() {
      return this.layer.quick;
    },
    pv() {
      void currentCurrency();
      return priceView(this.$store.getters.getShop, this.p);
    },
    img() {
      return productImage(this.p);
    },
    to() {
      return productTo(this.p);
    },
    look() {
      return lookOf(this.p);
    },
    /* "In stock · 22 left", "Only 4 left", or nothing when the shop does not count it. */
    stockLine() {
      const q = Number(this.p?.quantity);
      if (!Number.isFinite(q)) return "";
      if (q <= 0) return t("galio.qv.soldOut", "Sold out");
      return q > 15 ? t("galio.qv.inStock", "In stock · {n} left", { n: q }) : t("galio.qv.only", "Only {n} left", { n: q });
    },
  },
  watch: {
    open(on) {
      if (on) this.$nextTick(() => this.$refs.x?.focus({ preventScroll: true }));
    },
  },
  methods: {
    t,
    money,
    catOf,
    catTitle,
    tintOf,
    unitOf,
    close() {
      closeLayer();
    },
  },
};
</script>
