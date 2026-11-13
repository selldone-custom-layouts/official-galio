<!--
  Galio Sundae — − n + for a line already in the bag (the drawer, later the bag page), the mockup's
  .step. It steps the bag's own line through kalio-basket's queue (a tap shows at once; quick taps are
  never lost); "−" at 1 takes the line out.
-->
<template>
  <span :aria-label="t('galio.qb.inBag', '{name} in bag', { name })" class="step gl-line-step" role="group">
    <button
      :aria-label="n > 1 ? t('galio.qb.lessOf', 'One less {name}', { name }) : t('galio.qb.remove', 'Remove {name} from the bag', { name })"
      type="button"
      @click.prevent.stop="step(-1)"
    >
      <gl-icon name="minus" />
    </button>
    <output aria-live="polite">{{ n }}</output>
    <button
      :aria-disabled="n >= max ? 'true' : undefined"
      :aria-label="n >= max ? t('galio.qb.noMore', 'No more in stock') : t('galio.qb.moreOf', 'One more {name}', { name })"
      type="button"
      @click.prevent.stop="n < max && step(1)"
    >
      <gl-icon name="plus" />
    </button>
  </span>
</template>

<script>
import GlIcon from "../GlIcon.vue";
import { shownCount, stepTo } from "../../kalio/kalio-basket";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "GlLineStep",
  components: { GlIcon },
  props: { item: { type: Object, required: true } },
  computed: {
    product() {
      return this.item.product || { id: this.item.product_id };
    },
    name() {
      return this.product.title || "";
    },
    n() {
      return shownCount(this.product, this.item);
    },
    max() {
      const q = this.item.vendor_product?.quantity ?? this.item.variant?.quantity ?? this.item.product?.quantity;
      return Number.isFinite(Number(q)) && Number(q) > 0 ? Number(q) : 99;
    },
  },
  methods: {
    t,
    step(d) {
      stepTo(this, { id: this.item.product_id, type: this.item.product?.type }, this.item, this.n + d);
    },
  },
};
</script>
