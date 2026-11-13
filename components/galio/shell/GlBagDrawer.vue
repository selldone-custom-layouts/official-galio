<!--
  Galio Sundae — the bag drawer (galio-design/g/shell.js drawerInner()): "Your bag · n pieces" from the
  inline end; a row per line (GlBagRow); the receipt on the lemon card (the pieces at full price, the
  saving, a shop offer as its own line, the delivery, the total) with the way to pay; "Often added"
  (best sellers from collections not in the bag); the total, "View bag" and "Checkout" at its foot.
  Empty: the empty state with "Continue shopping" and the collections, then "Often added". The lines
  are Selldone's own basket, the amounts in the visitor's currency.
-->
<template>
  <template v-if="open">
    <div class="scrim scrim--drawer" @click="close"></div>
    <aside id="drawer" :aria-label="t('galio.bag.title', 'Your bag')" aria-modal="true" class="lay lay--drawer drawer" role="dialog">
      <div class="dr-head">
        <h2>
          {{ t("galio.bag.title", "Your bag") }}<span v-if="lines.length" class="dr-n">{{ t("galio.bag.pieces", { one: "{n} piece", other: "{n} pieces" }, { n: units }) }}</span>
        </h2>
        <button ref="x" :aria-label="t('galio.bag.close', 'Close the bag')" class="x" type="button" @click="close"><gl-icon name="x" /></button>
      </div>
      <div v-if="lines.length" class="dr-body">
        <ul class="brows">
          <gl-bag-row v-for="it in lines" :key="it.id" :currency="sum.currency" :item="it" @go="close" />
        </ul>
        <div class="dr-rc">
          <gl-receipt
            :delivery-label="deliveryLabel"
            :delivery-value="deliveryValue"
            :format="moneyIn"
            :full="sum.full"
            :offer="sum.offer"
            :pieces="units"
            :save="sum.save"
            :save-label="saveLabel"
            :total="sum.total"
          />
          <p v-if="payNote" class="dr-note"><gl-icon name="cash" /><span>{{ payNote }}</span></p>
        </div>
        <div v-if="often.length" class="dr-often">
          <h3>{{ t("galio.bag.often", "Often added") }}</h3>
          <ul class="minis"><gl-mini v-for="p in often" :key="p.id" :product="p" /></ul>
        </div>
      </div>
      <div v-else class="dr-body dr-body--empty">
        <gl-empty :text="t('galio.bag.emptyP', 'Every pastry is sold on its own, so start with one you like and add more as you go.')" :title="t('galio.bag.emptyT', 'Your bag is empty')" cls="empty--bag" icon="bag">
          <router-link :to="shopTo" class="btn" @click="close">{{ t("galio.bag.continue", "Continue shopping") }}</router-link>
          <div v-if="cats.length" class="chips">
            <router-link v-for="c in cats" :key="c.id" :to="catTo(c)" class="chip" @click="close"><bdi>{{ catTitle(c) }}</bdi></router-link>
          </div>
        </gl-empty>
        <div v-if="often.length" class="dr-often">
          <h3>{{ t("galio.bag.often", "Often added") }}</h3>
          <ul class="minis"><gl-mini v-for="p in often" :key="p.id" :product="p" /></ul>
        </div>
      </div>
      <div v-if="lines.length" class="dr-foot">
        <div class="dr-tot">
          <span>{{ t("galio.rc.total", "Total") }}</span><b class="tab-num">{{ moneyIn(sum.total) }}</b>
        </div>
        <router-link :to="bagTo" class="link" @click="close">{{ t("galio.bag.view", "View bag") }}</router-link>
        <router-link :to="checkoutTo" class="btn" @click="close">{{ t("galio.bag.checkout", "Checkout") }}<gl-icon name="arrow" /></router-link>
      </div>
    </aside>
  </template>
</template>

<script>
import GlIcon from "../GlIcon.vue";
import GlMini from "../GlMini.vue";
import GlEmpty from "../GlEmpty.vue";
import GlReceipt from "../GlReceipt.vue";
import GlBagRow from "./GlBagRow.vue";
import { bagPageTo, bySells, catTitle, catTo, closeLayer, inCat, layer, shopAllTo, shopData, shopFacts, wayTitle } from "../galio";
import { shownCount } from "../../kalio/kalio-basket";
import { money } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "GlBagDrawer",
  components: { GlIcon, GlMini, GlEmpty, GlReceipt, GlBagRow },
  data: () => ({ layer, data: shopData }),
  computed: {
    open() {
      return this.layer.open === "drawer";
    },
    shop() {
      return this.$store.getters.getShop;
    },
    cats() {
      return this.data.cats.filter((c) => inCat(c.id).length || !this.data.ready);
    },
    basket() {
      return this.getBaskets().find((b) => b?.type === "PHYSICAL") || this.getBaskets().find((b) => b?.items?.length) || null;
    },
    lines() {
      return (this.basket?.items || []).filter((it) => shownCount(it.product || { id: it.product_id }, it) > 0);
    },
    units() {
      return this.lines.reduce((n, it) => n + this.shown(it), 0);
    },
    sum() {
      const b = this.basket || {};
      let full = 0;
      let save = 0;
      for (const it of this.lines) {
        const n = this.shown(it);
        full += (it.price + (it.dis || 0)) * n;
        save += (it.dis || 0) * n;
      }
      /* A shop offer (Selldone's offers: a share off when the line qualifies) is its own line. */
      const offer = this.lines.reduce((s, it) => s + (Number(it.offer_amount) || 0), 0);
      return { full, save, offer, total: full - save - offer, currency: b.bill?.currency || b.currency };
    },
    /* The bag's chosen way, when the bag has one: free (pickup, no fee, or over its free amount) or at checkout. */
    way() {
      const type = this.basket?.delivery_info?.type;
      return (type && (this.shop?.transportations || []).find((w) => w && w.type === type && w.enable !== false)) || null;
    },
    wayFree() {
      const way = this.way;
      if (!way) return false;
      const noFee = !(Number(way.const) > 0) && !(Number(way.distance_rate) > 0) && !(Number(way.weight_rate) > 0);
      const overLimit = !!way.free_shipping && (!(Number(way.free_shipping_limit) > 0) || this.sum.total >= Number(way.free_shipping_limit));
      return way.type === "Pickup" || noFee || overLimit;
    },
    deliveryLabel() {
      if (!this.way) return t("galio.rc.delivery", "Delivery");
      return this.way.type === "Pickup" ? t("galio.rc.pickupCounter", "Pickup at the counter") : wayTitle(this.way, this.shop);
    },
    deliveryValue() {
      return this.way && this.wayFree ? t("galio.rc.free", "Free") : t("galio.rc.atCheckout", "Chosen at checkout");
    },
    /* "Savings · 25% off" when every line saves the same percent. */
    saveLabel() {
      const offs = this.lines.filter((it) => it.dis > 0).map((it) => Math.round((it.dis / (it.price + it.dis)) * 100));
      if (offs.length && offs.length === this.lines.length && offs.every((x) => x === offs[0])) return t("galio.rc.youSaveOff", "You save {off}%", { off: offs[0] });
      return t("galio.rc.youSave", "You save");
    },
    /* "Cash on delivery: pay $5.06 when the order arrives. Pickup and shipping are chosen at checkout." */
    payNote() {
      const g = shopFacts(this.shop).gateway;
      const later = t("galio.bag.chosenLater", "Pickup and shipping are chosen at checkout.");
      if (g?.cod) return t("galio.bag.payNote", "{gateway}: pay {amount} when the order arrives.", { gateway: g.name, amount: this.moneyIn(this.sum.total) }) + " " + later;
      return later;
    },
    /* Three best sellers, one per collection not already in the bag. */
    often() {
      const inBag = new Set(this.lines.map((it) => it.product_id));
      const cats = new Set(this.lines.map((it) => it.product?.category_id));
      const picks = [];
      const used = new Set();
      const all = bySells(this.data.products.filter((p) => p.quantity > 0));
      for (const p of all) {
        if (picks.length < 3 && !inBag.has(p.id) && !cats.has(p.category_id) && !used.has(p.category_id)) {
          picks.push(p);
          used.add(p.category_id);
        }
      }
      for (const p of all) if (picks.length < 3 && !inBag.has(p.id) && !picks.includes(p)) picks.push(p);
      return picks;
    },
    bagTo() {
      return bagPageTo();
    },
    checkoutTo() {
      return { ...bagPageTo(), query: { step: "checkout" } };
    },
    shopTo() {
      return shopAllTo();
    },
  },
  watch: {
    open(on) {
      if (on) this.$nextTick(() => this.$refs.x?.focus({ preventScroll: true }));
    },
  },
  methods: {
    t,
    catTitle,
    catTo,
    close() {
      closeLayer();
    },
    shown(it) {
      return shownCount(it.product || { id: it.product_id }, it);
    },
    moneyIn(n) {
      return money(n, this.sum.currency);
    },
  },
};
</script>
