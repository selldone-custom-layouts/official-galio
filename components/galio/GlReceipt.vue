<!--
  Galio Sundae — the receipt (galio-design/g/shell.js receiptHTML()): the pieces at full price, the
  saving, a shop offer (Selldone's offers, its own line), the delivery line and the total, in the
  amounts the bag or the bill gives (never recomputed from a formula of its own).
-->
<template>
  <dl class="rc">
    <div>
      <dt>{{ t("galio.rc.fullN", { one: "{n} piece at full price", other: "{n} pieces at full price" }, { n: pieces }) }}</dt>
      <dd class="tab-num">{{ fmt(full) }}</dd>
    </div>
    <div v-if="save > 0" class="rc-save">
      <dt>{{ saveLabel || t("galio.rc.youSave", "You save") }}</dt>
      <dd class="tab-num">−{{ fmt(save) }}</dd>
    </div>
    <div v-if="offer > 0" class="rc-save">
      <dt>{{ t("galio.rc.offer", "Offer") }}</dt>
      <dd class="tab-num">−{{ fmt(offer) }}</dd>
    </div>
    <div v-if="discount > 0" class="rc-save">
      <dt>{{ t("galio.rc.discount", "Discount code") }}</dt>
      <dd class="tab-num">−{{ fmt(discount) }}</dd>
    </div>
    <div>
      <dt><bdi>{{ deliveryLabel || t("galio.rc.delivery", "Delivery") }}</bdi></dt>
      <dd class="tab-num">{{ deliveryValue }}</dd>
    </div>
    <div v-if="tax > 0">
      <dt>{{ t("galio.rc.tax", "Tax") }}</dt>
      <dd class="tab-num">{{ fmt(tax) }}</dd>
    </div>
    <div class="rc-total">
      <dt>{{ totalLabel || t("galio.rc.total", "Total") }}</dt>
      <dd class="tab-num">{{ fmt(total) }}</dd>
    </div>
  </dl>
</template>

<script>
import { t } from "../kalio/i18n/kalio-i18n";

export default {
  name: "GlReceipt",
  props: {
    pieces: { type: Number, default: 0 },
    full: { type: Number, default: 0 },
    save: { type: Number, default: 0 },
    offer: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    deliveryLabel: { type: String, default: "" },
    deliveryValue: { type: String, default: "" },
    saveLabel: { type: String, default: "" },
    totalLabel: { type: String, default: "" },
    /** money formatter for these amounts (the bag's or bill's currency) */
    format: { type: Function, required: true },
  },
  methods: {
    t,
    fmt(n) {
      return this.format(n || 0);
    },
  },
};
</script>
