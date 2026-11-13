<!--
  Galio Sundae — the filter panel (galio-design/g/pages-shop.js panelHTML()), the same at the side of
  the shop and in the phone's filter sheet: "Filter" with "Clear all"; the price per piece (a two-thumb
  range whose line runs through the thumbs' centres, with short Min and Max boxes); On offer; the
  collection's own spec keys as chips (the first 6, "Show N more" past 7); Stock. The parent owns the
  state; the panel only says what changed.
-->
<template>
  <div class="fpanel">
    <div class="fp-head">
      <h2>{{ t("galio.ls.filter", "Filter") }}</h2>
      <button v-if="activeCount" class="link" type="button" @click="$emit('clear')">{{ t("galio.ls.clearAll", "Clear all") }}</button>
    </div>
    <fieldset v-if="hi > lo" class="fgrp">
      <legend>{{ t("galio.ls.pricePer", "Price per piece") }}</legend>
      <div :style="rangeStyle" class="range">
        <span class="range-track"></span>
        <input :aria-label="t('galio.ls.minPrice', 'Lowest price')" :max="hi" :min="lo" :value="min" step="0.5" type="range" @change="$emit('apply')" @input="onLo($event.target.value)" />
        <input :aria-label="t('galio.ls.maxPrice', 'Highest price')" :max="hi" :min="lo" :value="max" step="0.5" type="range" @change="$emit('apply')" @input="onHi($event.target.value)" />
      </div>
      <div class="range-boxes">
        <label
          ><span>{{ t("galio.ls.min", "Min") }}</span
          ><span class="rb"
            >{{ sign }}<input :aria-label="t('galio.ls.minPriceIn', 'Lowest price in {currency}', { currency: sign })" :max="hi" :min="lo" :value="fixed(min)" inputmode="decimal" step="0.5" type="number" @change="boxLo($event.target.value)"
          /></span>
        </label>
        <span aria-hidden="true" class="rb-dash"></span>
        <label
          ><span>{{ t("galio.ls.max", "Max") }}</span
          ><span class="rb"
            >{{ sign }}<input :aria-label="t('galio.ls.maxPriceIn', 'Highest price in {currency}', { currency: sign })" :max="hi" :min="lo" :value="fixed(max)" inputmode="decimal" step="0.5" type="number" @change="boxHi($event.target.value)"
          /></span>
        </label>
      </div>
    </fieldset>
    <div v-if="offerOn" class="fgrp fgrp--sw">
      <label class="switch"><input :checked="offer" type="checkbox" @change="$emit('offer', $event.target.checked)" /><span>{{ offLabel }}</span></label>
    </div>
    <fieldset v-for="f in facets" :key="f.key" class="fgrp">
      <legend>
        <bdi>{{ f.key }}</bdi><span v-if="(picked[f.key] || []).length" class="fcount">{{ (picked[f.key] || []).length }}</span>
      </legend>
      <div class="fchips">
        <button
          v-for="v in shownValues(f)"
          :key="v"
          :aria-pressed="(picked[f.key] || []).includes(v) ? 'true' : 'false'"
          class="chip fchip"
          type="button"
          @click="$emit('facet', { key: f.key, value: v })"
        >
          <bdi>{{ v }}</bdi>
        </button>
        <button v-if="f.values.length > LIMIT + 1" :aria-expanded="more[f.key] ? 'true' : 'false'" class="more-btn" type="button" @click="$emit('more', f.key)">
          <span class="more-ic"><gl-icon :name="more[f.key] ? 'up' : 'down'" /></span>{{ more[f.key] ? t("galio.ls.fewer", "Show fewer") : t("galio.ls.moreN", "Show {n} more", { n: f.values.length - LIMIT }) }}
        </button>
      </div>
    </fieldset>
    <fieldset v-if="stockValues.length" class="fgrp">
      <legend>{{ t("galio.ls.stock", "Stock") }}<span v-if="stock.length" class="fcount">{{ stock.length }}</span></legend>
      <div class="fchips">
        <button v-for="s in stockValues" :key="s.v" :aria-pressed="stock.includes(s.v) ? 'true' : 'false'" class="chip fchip" type="button" @click="$emit('stock', s.v)">{{ s.label }}</button>
      </div>
    </fieldset>
  </div>
</template>

<script>
import GlIcon from "../GlIcon.vue";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "GlFilterPanel",
  components: { GlIcon },
  props: {
    idPrefix: { type: String, default: "side" },
    lo: { type: Number, default: 0 },
    hi: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    sign: { type: String, default: "$" },
    offerOn: Boolean,
    offer: Boolean,
    offLabel: { type: String, default: "" },
    facets: { type: Array, default: () => [] },
    picked: { type: Object, default: () => ({}) },
    stockValues: { type: Array, default: () => [] },
    stock: { type: Array, default: () => [] },
    more: { type: Object, default: () => ({}) },
    activeCount: { type: Number, default: 0 },
  },
  emits: ["min", "max", "apply", "offer", "facet", "stock", "more", "clear"],
  data: () => ({ LIMIT: 6 }),
  computed: {
    rangeStyle() {
      const span = this.hi - this.lo || 1;
      return { "--gl-a": ((this.min - this.lo) / span) * 100 + "%", "--gl-b": ((this.max - this.lo) / span) * 100 + "%" };
    },
  },
  methods: {
    t,
    fixed(v) {
      return Number(v).toFixed(2).replace(/\.00$/, "");
    },
    shownValues(f) {
      return f.values.length > this.LIMIT + 1 && !this.more[f.key] ? f.values.slice(0, this.LIMIT) : f.values;
    },
    onLo(v) {
      this.$emit("min", Math.min(Number(v), this.max - 0.5));
    },
    onHi(v) {
      this.$emit("max", Math.max(Number(v), this.min + 0.5));
    },
    boxLo(v) {
      const n = parseFloat(v);
      this.$emit("min", isNaN(n) ? this.lo : Math.max(this.lo, Math.min(n, this.max - 0.5)));
      this.$emit("apply");
    },
    boxHi(v) {
      const n = parseFloat(v);
      this.$emit("max", isNaN(n) ? this.hi : Math.min(this.hi, Math.max(n, this.min + 0.5)));
      this.$emit("apply");
    },
  },
};
</script>
