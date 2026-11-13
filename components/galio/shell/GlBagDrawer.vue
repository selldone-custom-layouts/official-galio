<!--
  Galio Sundae — the bag drawer, in the mockup's sheet: "Your bag" from the inline end, a row per line
  (the piece on its round tinted plate, the name, the price with the was-price and the saving, the
  line total and − n +); "Often added" (best sellers from collections not in the bag, each with its
  round "+"); the receipt (items at full price, savings, delivery chosen at checkout, the total) with
  "View bag" and "Checkout". Empty: a calm card, "Shop all pastries" and "Start with a favourite".
  The lines are Selldone's own basket (every count through kalio-basket's queue), the amounts in the
  visitor's currency.
-->
<template>
  <div v-if="open" class="sheet-scrim" @click="close"></div>
  <aside v-if="open" id="drawer" :aria-label="t('galio.bag.title', 'Your bag')" aria-modal="true" class="sheet gl-drawer" role="dialog">
    <div class="sheet-head">
      <h2 class="gl-drawer-h">{{ t("galio.bag.title", "Your bag") }}<span v-if="units" class="count">{{ units }}</span></h2>
      <button ref="x" :aria-label="t('galio.bag.close', 'Close bag')" class="x" type="button" @click="close"><gl-icon name="x" /></button>
    </div>
    <div class="gl-drawer-body">
      <template v-if="lines.length">
        <ul class="gl-bag-rows">
          <li v-for="it in lines" :key="it.id" :style="{ '--gl-tint': tintOf(it.product?.category_id) }" class="gl-bag-row">
            <router-link :to="productTo(it)" aria-hidden="true" class="mthumb" tabindex="-1" @click="close"><img :src="image(it)" alt="" loading="lazy" /></router-link>
            <div class="gl-bag-txt">
              <router-link :to="productTo(it)" class="mname" @click="close">{{ it.product?.title }}</router-link>
              <span class="msub"
                ><span class="tab-num">{{ amount(it.price, it) }}</span
                ><template v-if="it.dis > 0">{{ " " }}<s class="tab-num">{{ amount(it.price + it.dis, it) }}</s></template
                >{{ " · " }}{{ t("galio.card.per", "per {unit}", { unit: unitOfLine(it) }) }}</span
              >
            </div>
            <div class="gl-bag-end">
              <span class="gl-bag-lt tab-num">{{ amount(it.price * shown(it), it) }}</span>
              <gl-line-step :item="it" />
            </div>
          </li>
        </ul>
      </template>
      <div v-else class="gl-empty">
        <span class="gl-empty-ic"><gl-icon name="bag" /></span>
        <h3>{{ t("galio.bag.emptyT", "Your bag is empty") }}</h3>
        <p>{{ t("galio.bag.emptyP", "Every pastry is sold on its own, so add exactly the pieces you want.") }}</p>
        <router-link :to="shopTo" class="btn" @click="close">{{ t("galio.bag.shopAll", "Shop all pastries") }}</router-link>
      </div>
      <div v-if="often.length" class="gl-often">
        <h3>{{ lines.length ? t("galio.bag.often", "Often added") : t("galio.bag.favourite", "Start with a favourite") }}</h3>
        <ul class="mlist gl-often-list">
          <li v-for="p in often" :key="p.id" :style="{ '--gl-tint': tintOf(p.category_id) }" class="mrow">
            <router-link :to="productTo2(p)" aria-hidden="true" class="mthumb" tabindex="-1" @click="close"><img :src="thumb(p)" alt="" loading="lazy" /></router-link>
            <div class="mtext">
              <router-link :to="productTo2(p)" class="mname" @click="close">{{ p.title }}</router-link>
              <span class="msub"
                ><span class="tab-num">{{ money(pv(p).now) }}</span><template v-if="pv(p).was">{{ " " }}<s class="tab-num">{{ money(pv(p).was) }}</s></template>{{ " · " }}{{ t("galio.card.per", "per {unit}", { unit: unitOf(p) }) }}</span
              >
            </div>
            <gl-qb :product="p" kind="round" />
          </li>
        </ul>
      </div>
    </div>
    <div v-if="lines.length" class="gl-drawer-ft">
      <dl class="gl-rcpt">
        <div>
          <dt>{{ t("galio.rc.full", "Items at full price") }}</dt>
          <dd class="tab-num">{{ moneyIn(sum.full) }}</dd>
        </div>
        <div v-if="sum.save > 0" class="-save">
          <dt>{{ saveLabel }}</dt>
          <dd class="tab-num">−{{ moneyIn(sum.save) }}</dd>
        </div>
        <div v-if="sum.offer > 0" class="-save">
          <dt>{{ t("galio.rc.offer", "Offer") }}</dt>
          <dd class="tab-num">−{{ moneyIn(sum.offer) }}</dd>
        </div>
        <div>
          <template v-if="freeWay">
            <dt>{{ t("galio.rc.deliveryOf", "Delivery · {way}", { way: freeWay }) }}</dt>
            <dd>{{ t("galio.rc.free", "Free") }}</dd>
          </template>
          <template v-else>
            <dt>{{ t("galio.rc.delivery", "Delivery") }}</dt>
            <dd>{{ t("galio.rc.atCheckout", "Chosen at checkout") }}</dd>
          </template>
        </div>
        <div class="-tot">
          <dt>{{ t("galio.rc.total", "Total") }}</dt>
          <dd class="tab-num">{{ moneyIn(sum.total) }}</dd>
        </div>
      </dl>
      <div class="gl-drawer-acts">
        <router-link :to="bagTo" class="btn btn--ghost" @click="close">{{ t("galio.bag.view", "View bag") }}</router-link>
        <router-link :to="checkoutTo" class="btn" @click="close">{{ t("galio.bag.checkout", "Checkout") }}<gl-icon name="arrow" /></router-link>
      </div>
    </div>
  </aside>
</template>

<script>
import GlIcon from "../GlIcon.vue";
import GlQb from "../GlQb.vue";
import GlLineStep from "./GlLineStep.vue";
import { bagPageTo, bySells, closeLayer, layer, priceView, productImage as productThumb, productTo, shopAllTo, shopData, tintOf, unitOf, wayTitle } from "../galio";
import { shownCount } from "../../kalio/kalio-basket";
import { productImage } from "../../kalio/kalio-catalog";
import { currentCurrency, money as regionMoney } from "../../region-switcher/region";
import { money } from "../galio";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "GlBagDrawer",
  components: { GlIcon, GlQb, GlLineStep },
  data: () => ({ layer, data: shopData }),
  computed: {
    open() {
      return this.layer.open === "drawer";
    },
    shop() {
      return this.$store.getters.getShop;
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
      /* A shop offer (Selldone's offers: a share off when the line qualifies) is its own line of the receipt. */
      const offer = this.lines.reduce((s, it) => s + (Number(it.offer_amount) || 0), 0);
      return { full, save, offer, total: full - save - offer, currency: b.bill?.currency || b.currency };
    },
    /* The bag's chosen way when it costs nothing (pickup, no fee, or over its free-shipping amount):
       the receipt names it. Otherwise the checkout says. */
    freeWay() {
      const type = this.basket?.delivery_info?.type;
      const way = type && (this.shop?.transportations || []).find((w) => w && w.type === type && w.enable !== false);
      if (!way) return "";
      const noFee = !(Number(way.const) > 0) && !(Number(way.distance_rate) > 0) && !(Number(way.weight_rate) > 0);
      const overLimit = !!way.free_shipping && (!(Number(way.free_shipping_limit) > 0) || this.sum.total >= Number(way.free_shipping_limit));
      return type === "Pickup" || noFee || overLimit ? wayTitle(way, this.shop) : "";
    },
    /* "Savings · 25% off" when every line saves the same percent. */
    saveLabel() {
      const offs = this.lines.filter((it) => it.dis > 0).map((it) => Math.round((it.dis / (it.price + it.dis)) * 100));
      if (offs.length && offs.length === this.lines.length && offs.every((x) => x === offs[0])) return t("galio.rc.savingsOff", "Savings · {off}% off", { off: offs[0] });
      return t("galio.rc.savings", "Savings");
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
    money,
    tintOf,
    unitOf,
    close() {
      closeLayer();
    },
    shown(it) {
      return shownCount(it.product || { id: it.product_id }, it);
    },
    amount(n, it) {
      return regionMoney(n, it.currency || this.sum.currency);
    },
    moneyIn(n) {
      return regionMoney(n, this.sum.currency);
    },
    pv(p) {
      void currentCurrency();
      return priceView(this.shop, p);
    },
    image(it) {
      return productImage(it.product || {}, true);
    },
    thumb(p) {
      return productThumb(p, 128);
    },
    unitOfLine(it) {
      return unitOf(it.product || {});
    },
    productTo(it) {
      return productTo({ id: it.product_id });
    },
    productTo2(p) {
      return productTo(p);
    },
  },
};
</script>
