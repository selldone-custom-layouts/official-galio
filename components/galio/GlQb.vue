<!--
  Galio Sundae — the buy control (galio-design/g/home.js buy()): a round "+" (kind "round", the price
  list's rows) or a full "Add to bag" button (kind "btn", the cards); once the piece is in the bag it
  becomes − n + in place, and the focus stays on the control, so quick taps are never lost. The count
  is the bag's own line (kalio-basket's queue: a tap shows at once, the requests go out one at a time).
  A product with options goes to its page ("Choose"); a sold-out one says so. No toast: the control
  itself answers.
-->
<template>
  <span :class="['add-wrap', 'gl-qb', '-' + kind]">
    <span v-if="q > 0" :aria-label="t('galio.qb.inBag', '{name} in bag', { name: product.title })" class="step" role="group">
      <button ref="dec" :aria-label="t('galio.qb.less', 'One less')" type="button" @click.prevent.stop="less"><gl-icon name="minus" /></button>
      <output aria-live="polite">{{ q }}</output>
      <button ref="inc" :aria-disabled="full ? 'true' : undefined" :aria-label="full ? t('galio.qb.noMore', 'No more in stock') : t('galio.qb.more', 'One more')" type="button" @click.prevent.stop="more"><gl-icon name="plus" /></button>
    </span>
    <router-link v-else-if="choose" :aria-label="kind === 'round' ? t('galio.qb.chooseOf', 'Choose options for {name}', { name: product.title }) : undefined" :class="kind === 'round' ? 'round-add' : 'btn'" :to="productTo">
      <gl-icon :name="kind === 'round' ? 'arrow' : 'bag'" /><template v-if="kind !== 'round'">{{ t("galio.qb.choose", "Choose options") }}</template>
    </router-link>
    <button v-else-if="soldOut" :aria-label="kind === 'round' ? t('galio.qb.soldOutOf', '{name} is sold out', { name: product.title }) : undefined" :class="[kind === 'round' ? 'round-add' : 'btn', '-out']" disabled type="button">
      <template v-if="kind === 'round'"><gl-icon name="x" /></template><template v-else>{{ t("galio.qb.soldOut", "Sold out") }}</template>
    </button>
    <button v-else ref="add" :aria-label="kind === 'round' ? t('galio.qb.addOf', 'Add {name} to bag', { name: product.title }) : undefined" :class="kind === 'round' ? 'round-add' : 'btn'" type="button" @click.prevent.stop="first($event)">
      <gl-icon :name="kind === 'round' ? 'plus' : 'bag'" /><template v-if="kind !== 'round'">{{ t("galio.qb.add", "Add to bag") }}</template>
    </button>
  </span>
</template>

<script>
import BuyMixin from "../bakini/bakini-buy";
import GlIcon from "./GlIcon.vue";
import { t } from "../kalio/i18n/kalio-i18n";

export default {
  name: "GlQb",
  components: { GlIcon },
  mixins: [BuyMixin],
  props: {
    product: { type: Object, required: true },
    kind: { type: String, default: "btn" },
  },
  computed: {
    q() {
      return this.choose ? 0 : this.shown || 0;
    },
    full() {
      const max = Number(this.variant ? this.variant.quantity : this.product.quantity);
      return Number.isFinite(max) && max > 0 && this.q >= max;
    },
  },
  methods: {
    t,
    /* The first piece: the stepper takes the place of the button, and a keyboard press keeps the focus on its "+". */
    first(e) {
      const keyboard = e && e.detail === 0;
      this.add();
      this.$nextTick(() => {
        if (keyboard || document.activeElement === document.body) this.$refs.inc?.focus({ preventScroll: true });
      });
    },
    more() {
      if (this.full) return;
      this.step(1);
    },
    less() {
      if (this.q <= 0) return;
      const last = this.q === 1;
      this.step(-1);
      if (last) this.$nextTick(() => this.$refs.add?.focus({ preventScroll: true }));
    },
  },
};
</script>
