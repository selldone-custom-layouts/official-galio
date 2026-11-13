<!--
  Galio Sundae — the product page's buy control (galio-design/g/shell.js buy(id, "big")): "Add to bag",
  then − n + in place (a bin at one piece), following the page's own chosen variant (Selldone's
  current_variant), so a product with real options adds the option the shopper picked. "+" at 0 adds
  (kalio-basket addVariant: the guest gate, the queue); quick taps are never lost; stock caps the +.
  `kind`: "big" (the buy column) or "btn" (the phone's buy bar).
-->
<template>
  <span :class="['add-wrap', 'gl-qb', '-' + kind]">
    <span v-if="q > 0" :aria-label="t('galio.qb.inBag', '{name} in bag', { name: product.title })" :class="['step', { 'step--big': kind === 'big' }]" role="group">
      <button :aria-label="q === 1 ? t('galio.qb.remove1', 'Remove from bag') : t('galio.qb.less', 'One less')" type="button" @click.prevent.stop="less"><gl-icon :name="q === 1 ? 'trash' : 'minus'" /></button>
      <output aria-live="polite">{{ q }}</output>
      <button ref="inc" :aria-label="full ? t('galio.qb.noMore', 'No more in stock') : t('galio.qb.more', 'One more')" :disabled="full" type="button" @click.prevent.stop="more"><gl-icon name="plus" /></button>
    </span>
    <button v-else ref="add" :class="['btn', { 'btn--big': kind === 'big', '-out': soldOut }]" :disabled="soldOut || needsChoice" type="button" @click.prevent.stop="first($event)">
      <gl-icon v-if="!soldOut" name="bag" />{{ label }}
    </button>
  </span>
</template>

<script>
import GlIcon from "../GlIcon.vue";
import { addVariant, basketLine, pendingLine, pendingLineFor, shownCount, stepTo } from "../../kalio/kalio-basket";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "GlPdQb",
  components: { GlIcon },
  props: {
    product: { type: Object, required: true },
    /** The page's chosen variant (null for a product without options). */
    variant: { type: Object, default: null },
    /** The product has options but none is chosen yet. */
    needsChoice: { type: Boolean, default: false },
    kind: { type: String, default: "big" },
  },
  computed: {
    line() {
      const p = this.product;
      if (!p) return null;
      if (this.variant) return basketLine(this, p, { id: this.variant.id }) || pendingLineFor(p, this.variant.id);
      if (this.needsChoice) return null;
      return basketLine(this, p) || pendingLine(p);
    },
    q() {
      return shownCount(this.product, this.line);
    },
    stock() {
      const n = this.variant ? this.variant.quantity : this.product.quantity;
      return Number.isFinite(Number(n)) ? Number(n) : 0;
    },
    soldOut() {
      return !(this.stock > 0);
    },
    full() {
      return !this.soldOut && this.q >= Math.min(this.stock, 99);
    },
    label() {
      if (this.soldOut) return t("galio.qb.soldOut", "Sold out");
      if (this.needsChoice) return t("galio.pd.chooseFirst", "Choose an option first");
      return t("galio.qb.add", "Add to bag");
    },
  },
  methods: {
    t,
    first(e) {
      if (this.soldOut || this.needsChoice) return;
      const keyboard = e && e.detail === 0;
      addVariant(this, this.product, this.variant);
      this.$nextTick(() => {
        if (keyboard || document.activeElement === document.body) this.$refs.inc?.focus({ preventScroll: true });
      });
    },
    more() {
      if (this.full || !this.line) return;
      stepTo(this, this.product, this.line, this.q + 1);
    },
    less() {
      if (this.q > 0 && this.line) {
        const last = this.q === 1;
        stepTo(this, this.product, this.line, this.q - 1);
        if (last) this.$nextTick(() => this.$refs.add?.focus({ preventScroll: true }));
      }
    },
  },
};
</script>
