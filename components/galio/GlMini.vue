<!--
  Galio Sundae — a compact product row (galio-design/g/shell.js mini()): the piece on a small round
  tinted plate, its name, price and price before (and an optional line under it), and the round "+"
  that becomes − n +. "Often added", "Most ordered", "Order again".
-->
<template>
  <li class="mini">
    <router-link :style="{ '--gl-tint': tintOf(product.category_id) }" :to="to" aria-hidden="true" class="mthumb" tabindex="-1"><img :src="img" alt="" height="400" loading="lazy" width="400" /></router-link>
    <div class="mini-t">
      <router-link :to="to" class="mini-n">{{ product.title }}</router-link>
      <span class="mini-p tab-num"
        >{{ money(pv.now) }}<s v-if="pv.was">{{ money(pv.was) }}</s><span v-if="sub" class="mini-s">{{ sub }}</span></span
      >
    </div>
    <gl-qb :product="product" kind="round" />
  </li>
</template>

<script>
import GlQb from "./GlQb.vue";
import { money, priceView, productImage, productTo, tintOf } from "./galio";
import { currentCurrency } from "../region-switcher/region";

export default {
  name: "GlMini",
  components: { GlQb },
  props: { product: { type: Object, required: true }, sub: { type: String, default: "" } },
  computed: {
    pv() {
      void currentCurrency();
      return priceView(this.$store.getters.getShop, this.product);
    },
    to() {
      return productTo(this.product);
    },
    img() {
      return productImage(this.product, 128);
    },
  },
  methods: { money, tintOf },
};
</script>
