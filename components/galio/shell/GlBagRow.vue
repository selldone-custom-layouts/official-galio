<!--
  Galio Sundae — a bag row (galio-design/g/shell.js bagRow()): the piece on its round tinted plate, the
  name, the price per piece with the price before and the unit, "Only n in stock" at the stock's end,
  − n + with the line total under it, and remove in its own column (never on the words). The row is
  Selldone's own basket line; every count goes through kalio-basket's queue.
-->
<template>
  <li :class="['brow', { 'brow--page': page }]">
    <router-link :style="{ '--gl-tint': tintOf(product.category_id) }" :to="to" aria-hidden="true" class="mthumb" tabindex="-1" @click="$emit('go')"><img :src="img" alt="" height="400" width="400" /></router-link>
    <div class="brow-t">
      <router-link :to="to" class="brow-n" @click="$emit('go')">{{ product.title }}</router-link>
      <span class="brow-u tab-num"
        >{{ amount(item.price) }}<template v-if="item.dis > 0">{{ " " }}<s>{{ amount(item.price + item.dis) }}</s></template>{{ " " }}{{ t("galio.card.per", "per {unit}", { unit: unitOf(product) }) }}</span
      >
      <span v-if="max < 99 && n >= max" class="brow-stock">{{ t("galio.bag.onlyN", "Only {n} in stock", { n: max }) }}</span>
    </div>
    <div class="brow-q">
      <gl-line-step :item="item" />
      <b class="brow-l tab-num">{{ amount(item.price * n) }}</b>
    </div>
    <button :aria-label="t('galio.bag.removeOf', 'Remove {name}', { name: product.title })" class="brow-x" type="button" @click="remove"><gl-icon :name="trash ? 'trash' : 'x'" /></button>
  </li>
</template>

<script>
import GlIcon from "../GlIcon.vue";
import GlLineStep from "./GlLineStep.vue";
import { productImage, tintOf, unitOf } from "../galio";
import { shownCount, stepTo } from "../../kalio/kalio-basket";
import { money } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "GlBagRow",
  components: { GlIcon, GlLineStep },
  props: {
    item: { type: Object, required: true },
    currency: { type: String, default: "" },
    trash: Boolean,
    page: Boolean,
  },
  emits: ["go"],
  computed: {
    product() {
      return this.item.product || { id: this.item.product_id, title: "" };
    },
    n() {
      return shownCount(this.product, this.item);
    },
    max() {
      const q = this.item.vendor_product?.quantity ?? this.item.variant?.quantity ?? this.item.product?.quantity;
      return Number.isFinite(Number(q)) && Number(q) > 0 ? Math.min(99, Number(q)) : 99;
    },
    to() {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: this.item.product_id } };
    },
    img() {
      return productImage(this.product, 128) || productImage(this.product);
    },
  },
  methods: {
    t,
    tintOf,
    unitOf,
    amount(v) {
      return money(v, this.item.currency || this.currency);
    },
    remove() {
      stepTo(this, { id: this.item.product_id, type: this.item.product?.type }, this.item, 0);
    },
  },
};
</script>
