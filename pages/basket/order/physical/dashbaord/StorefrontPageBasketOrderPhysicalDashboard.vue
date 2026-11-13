<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<!--
  Galio Sundae — an order (galio-design/order-b.html): the sky title band ("Order SM-12", when it was
  placed); the lemon track card with the state, the way and window, what is paid or to pay, and the
  four steps; the pieces with Selldone's sums; Payment, Delivery and Receiver; Kalio's delivery card
  (the address, "Has it arrived?", the trip), returns and Selldone's other order parts; the chat
  with the bakery beside it. All of it the order's own data.
-->
<template>
  <div class="gl-order">
    <gl-ptitle :crumbs="crumbs" :h1="t('galio.ord.h1', 'Order {code}', { code: getBasketOrderCode(basket) })" :kick="kick" :lede="lede" band="sky" cls="ptitle--short" />
    <section class="sec sec--tight bg-white">
      <div class="wrap">
        <div class="ord-track">
          <div class="ot-head">
            <div>
              <h2>{{ headWord }}</h2>
              <p v-if="wayLine">{{ wayLine }}</p>
            </div>
            <span v-if="payHead" class="ot-pay">{{ payHead.words }} <b class="tab-num">{{ payHead.amount }}</b></span>
          </div>
          <ol v-if="tone !== 'off'" :aria-label="t('galio.ord.progress', 'Order progress')" class="track">
            <li v-for="(s, i) in steps" :key="s.key" :aria-current="stepState(i) === 'now' ? 'step' : undefined" :class="['tk', 'tk--' + stepState(i)]">
              <span class="tk-dot"><gl-icon :name="s.icon" /></span><span class="tk-l">{{ s.label }}</span>
            </li>
          </ol>
          <p v-else class="ot-off">{{ t("galio.ord.cancelledP", "Nothing more will happen with this order. Write to the bakery if you have a question.") }}</p>
        </div>

        <div class="gl-ord-tools">
          <button :disabled="busy_invoice" class="link link--sm" type="button" @click="downloadInvoice"><gl-icon name="doc" />{{ t("galio.ord.invoice", "Invoice") }}</button>
          <s-shop-share-order-button :basket="basket" class="gl-share"></s-shop-share-order-button>
          <router-link :to="{ name: window.$storefront.routes.SHOP_PAGE }" class="link link--sm">{{ t("galio.ord.continue", "Continue shopping") }}<gl-icon name="arrow" /></router-link>
        </div>

        <div class="ord">
          <div class="ord-main">
            <div class="panel">
              <div class="panel-head">
                <h2>{{ t("galio.ord.pieces", { one: "{n} piece", other: "{n} pieces" }, { n: units }) }}</h2>
              </div>
              <ul class="sum-items sum-items--lg">
                <li v-for="item in basket.items" :key="item.id">
                  <router-link :style="{ '--gl-tint': tintOf(item.product?.category_id) }" :to="productRoute(item.product_id)" aria-hidden="true" class="mthumb" tabindex="-1"
                    ><img v-if="image(item)" :src="image(item)" alt="" height="400" width="400"
                  /></router-link>
                  <span class="si-n"
                    ><router-link :to="productRoute(item.product_id)">{{ item.product?.title }}</router-link
                    ><small class="tab-num">{{ amount(item.price) }} × {{ item.count }}<template v-if="size(item)">{{ " · " + size(item) }}</template></small></span
                  >
                  <b class="tab-num">{{ amount(item.price * item.count - (item.offer_amount || 0)) }}</b>
                </li>
              </ul>
              <gl-receipt
                :delivery-label="deliveryLabel"
                :delivery-value="basket.delivery_price > 0 ? amount(basket.delivery_price) : t('galio.ord.free', 'Free')"
                :discount="sums.other > 0.004 ? sums.other : 0"
                :format="amount"
                :full="sums.full"
                :pieces="units"
                :save="sums.save"
                :save-label="saveLabel"
                :tax="basket.tax_included ? 0 : Number(basket.tax) || 0"
                :total="Number(basket.price) || 0"
                :total-label="tone === 'ok' && basket.status === 'COD' ? t('galio.ord.totalToPay', 'Total to pay') : ''"
              />
            </div>

            <div class="ord-facts">
              <div v-if="payCard" class="panel">
                <h3><gl-icon :name="payCard.icon" />{{ t("galio.ord.payment", "Payment") }}</h3>
                <p>{{ payCard.title }}</p>
                <small v-if="payCard.line">{{ payCard.line }}</small>
              </div>
              <div v-if="way" class="panel">
                <h3><gl-icon :name="wayIconOf(way.type)" />{{ isPickup ? t("galio.ord.pickup", "Pickup") : t("galio.ord.delivery", "Delivery") }}</h3>
                <p>{{ wayLine }}</p>
                <small v-if="waySub">{{ waySub }}</small>
              </div>
              <div v-if="receiver" class="panel">
                <h3><gl-icon :name="isPickup ? 'store' : 'home'" />{{ isPickup ? t("galio.ord.counter", "Counter") : t("galio.ord.receiver", "Receiver") }}</h3>
                <p>
                  <bdi>{{ receiver.head }}</bdi>
                </p>
                <small v-if="receiver.line"><bdi>{{ receiver.line }}</bdi></small>
              </div>
            </div>

            <kalio-order-receipt v-if="!payCard" :basket="basket" class="gl-ord-receipt" />

            <section v-if="transfers.length" class="panel">
              <div class="panel-head">
                <h2>{{ t("galio.ord.transfer", "Pay by bank transfer") }}</h2>
              </div>
              <table class="gl-ord-legacy">
                <tbody>
                  <s-shop-row-customer-pending-payment v-for="tr in transfers" :key="tr.id" :order="basket" :transaction="tr" />
                </tbody>
              </table>
            </section>

            <kalio-order-delivery :basket="basket" class="gl-ord-delivery" />
            <s-basket-vendor-orders v-if="basket.vendor_orders?.length" :basket="basket" class="gl-ord-box"></s-basket-vendor-orders>
            <s-order-basket-return :basket="basket" class="gl-ord-box" />
            <s-shop-customer-order-withdraw :order="basket" :payment="basket.payment" class="gl-ord-box" @request:refresh="$emit('request:refresh')" />
          </div>

          <aside class="gl-ord-side">
            <kalio-order-chat :basket="basket" class="gl-ord-chat" />
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import SOrderBasketReturn from "@selldone/components-vue/storefront/order/basket/return/SOrderBasketReturn.vue";
import SShopRowCustomerPendingPayment from "@selldone/components-vue/storefront/order/payment/rows/SShopRowCustomerPendingPayment.vue";
import SShopCustomerOrderWithdraw from "@selldone/components-vue/storefront/order/payment/withdraw/SShopCustomerOrderWithdraw.vue";
import KalioOrderDelivery from "../../../../../components/kalio/order/KalioOrderDelivery.vue";
import KalioOrderChat from "../../../../../components/kalio/order/KalioOrderChat.vue";
import KalioOrderReceipt from "../../../../../components/kalio/order/KalioOrderReceipt.vue";

import SShopShareOrderButton from "@selldone/components-vue/storefront/order/share-order/SShopShareOrderButton.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import SBasketVendorOrders from "@selldone/components-vue/storefront/order/vendor-order/SBasketVendorOrders.vue";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { Basket } from "@selldone/core-js";
import { productImage, vendorImage, vendors } from "../../../../../components/kalio/kalio-catalog";
import { t } from "../../../../../components/kalio/i18n/kalio-i18n";
import GlIcon from "../../../../../components/galio/GlIcon.vue";
import GlPtitle from "../../../../../components/galio/GlPtitle.vue";
import GlReceipt from "../../../../../components/galio/GlReceipt.vue";
import { loadShop, shopFacts, tintOf, wayTitle } from "../../../../../components/galio/galio";
import { money } from "../../../../../components/region-switcher/region";
import { isPickupWay, wayIcon, wayWindowLine } from "../../../../../components/galio/buy/gl-cart";
import { glPickupSteps, glStepState, glSteps } from "../../../../../components/galio/account/gl-account";
import { ACCOUNT_HOME } from "../../../../../components/kalio/account/kalio-account";

/* The size of a variant in words: its volume, weight, pack, colour or style. */
function sizeOf(variant) {
  if (!variant) return null;
  return variant.volume || variant.weight || variant.pack || variant.type || variant.style || null;
}

export default {
  name: "StorefrontPageBasketOrderPhysicalDashboard",
  components: {
    SBasketVendorOrders: SBasketVendorOrders,
    SShopShareOrderButton,
    SShopRowCustomerPendingPayment,
    SShopCustomerOrderWithdraw,
    SOrderBasketReturn,
    KalioOrderDelivery,
    KalioOrderChat,
    KalioOrderReceipt,
    GlIcon,
    GlPtitle,
    GlReceipt,
  },

  emits: ["request:refresh"],

  props: {
    basket: {
      type: Object,
      require: true,
    },
  },

  data: function () {
    return {
      ProductType: ProductType,

      orderType: ProductType.PHYSICAL,
      busy_invoice: false,
      sellers: new Map(),
    };
  },
  computed: {
    shop() {
      return this.getShop();
    },

    // ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Galio Sundae ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
    isPickup() {
      return isPickupWay(this.basket?.delivery_info);
    },
    /* The mockup's four steps over Selldone's five delivery states (a pickup ends at the counter). */
    steps() {
      return this.isPickup ? glPickupSteps() : glSteps();
    },
    crumbs() {
      const home = [t("galio.crumb.home", "Home"), { path: "/" }];
      const code = t("galio.ord.h1", "Order {code}", { code: this.getBasketOrderCode(this.basket) });
      if (this.USER()) return [home, [t("galio.acc.crumb", "Account"), { name: ACCOUNT_HOME }], [code]];
      return [home, [t("galio.acc.hOrders", "Your orders"), { name: window.$storefront.routes.HISTORY_ORDERS_PHYSICAL }], [code]];
    },
    /* "thank you" while the order is new. */
    kick() {
      return this.tone === "ok" && this.stepAt === 0 ? t("galio.ord.thanks", "thank you") : "";
    },
    lede() {
      return this.placedAt ? t("galio.ord.placedOn", "Placed {date}", { date: this.placedAt }) : "";
    },
    headWord() {
      if (this.tone === "off") return t("galio.ord.cancelled", "Cancelled");
      if (this.tone === "wait") return t("galio.ord.waiting", "Waiting for payment");
      const words = this.isPickup
        ? [t("galio.ord.hPlaced", "Order placed"), t("galio.ord.hBaking", "In the oven"), t("galio.ord.hReady", "Ready at the counter"), t("galio.ord.hCollected", "Collected")]
        : [t("galio.ord.hPlaced", "Order placed"), t("galio.ord.hBaking", "In the oven"), t("galio.ord.hWay", "On the way"), t("galio.ord.hDone", "Delivered")];
      return words[this.stepAt];
    },
    /* "Pay on delivery $17.25" (or paid, or to pay) on the track card. */
    payHead() {
      const b = this.basket || {};
      const amount = this.amount(b.price);
      if (b.status === "COD") return { words: this.isPickup ? t("galio.ord.payPickupW", "Pay at pickup") : t("galio.ord.payDeliveryW", "Pay on delivery"), amount };
      if (b.status === "Payed") return { words: t("galio.ord.paidW", "Paid"), amount };
      if (b.status === "Reserved") return { words: t("galio.ord.toPayW", "To pay"), amount };
      return null;
    },
    /* "Free, within 30 km of the bakery". */
    waySub() {
      const w = this.way || {};
      const fee = this.basket?.delivery_price > 0 ? this.amount(this.basket.delivery_price) : t("galio.ord.free", "Free");
      if (this.isPickup) {
        const f = shopFacts(this.shop);
        return f.hours ? (f.everyDay ? t("galio.ord.openEvery", "Open every day {hours}", { hours: f.hours }) : f.hours) : "";
      }
      const reach = ["Global", "Post", "Airplane", "Ship"].includes(w.type) ? t("galio.ord.anywhere", "anywhere") : w.distance && w.distance < 1000 ? t("galio.ord.within", "within {km} km of the bakery", { km: w.distance }) : "";
      return [fee, reach].filter(Boolean).join(", ");
    },
    receiver() {
      const r = this.basket?.receiver_info;
      if (!r || Array.isArray(r) || !(r.name || r.address)) return null;
      const place = [r.address, r.no, r.unit].filter(Boolean).join(", ");
      const line = [place, r.city, [r.state, r.postal].filter(Boolean).join(" "), r.country].filter(Boolean).join(", ");
      return { head: [r.name, r.phone].filter(Boolean).join(" · "), line };
    },
    saveLabel() {
      const items = this.basket?.items || [];
      const offs = items.filter((it) => it.dis > 0).map((it) => Math.round((it.dis / (it.price + it.dis)) * 100));
      if (offs.length && offs.length === items.length && offs.every((x) => x === offs[0])) return t("galio.co.youSaveOff", "You save {off}%", { off: offs[0] });
      return t("galio.co.youSave", "You save");
    },
    stepAt() {
      const at = this.steps.findIndex((s) => s.codes.includes(this.basket?.delivery_state));
      return at < 0 ? 0 : at;
    },
    units() {
      return (this.basket?.items || []).reduce((n, it) => n + (it.count || 0), 0);
    },
    currency() {
      return this.basket?.currency;
    },
    /* Selldone's sums: the items at full price, their savings, any other
       discount (offers, codes, coupons, the club, the wallet) as what is
       left between them and the order's price. */
    sums() {
      const items = this.basket?.items || [];
      const full = items.reduce((s, it) => s + (it.price + (it.dis || 0)) * it.count, 0);
      const save = items.reduce((s, it) => s + (it.dis || 0) * it.count, 0);
      const delivery = this.basket?.delivery_price > 0 ? this.basket.delivery_price : 0;
      const other = full - save + delivery + (this.basket?.tax_included ? 0 : this.basket?.tax || 0) - (this.basket?.price || 0);
      return { full, save, other: other > 0 ? other : 0 };
    },
    way() {
      const type = this.basket?.delivery_info?.type;
      return (this.shop?.transportations || []).find((x) => x.type === type) || (type ? { type } : null);
    },
    wayLine() {
      return this.way ? wayWindowLine(this.shop, this.basket?.delivery_info) : "";
    },
    deliveryLabel() {
      return this.way ? wayTitle(this.way, this.shop) : t("galio.ord.delivery", "Delivery");
    },
    /* Cash on delivery or paid: one calm card. Waiting for an online
       payment: KalioOrderReceipt with "Pay now". */
    payCard() {
      const b = this.basket || {};
      if (b.status === "Payed") {
        const g = b.payment?.gateway;
        return { icon: "check", title: t("galio.ord.paid", "Paid {amount}", { amount: this.amount(b.price) }), line: g?.name || "" };
      }
      /* Cancelled first: its cash-on-delivery transaction stays pending, but
         nothing is owed (Bakio's cancelled test order SM-39 still said "Pay on
         delivery", 13 Nov 2026). */
      if (b.status === "Canceled") return { icon: "close", title: t("galio.ord.notCharged", "Nothing to pay"), line: "" };
      const cod = (b.transactions_pending || []).find((x) => x.cod) || (b.status === "COD" ? {} : null);
      if (cod) {
        /* Collected at the counter: paid there, not to a courier (the cash
           gateway's own words are about the courier). */
        if (isPickupWay(b.delivery_info))
          return { icon: "cash", title: t("galio.ord.payAtPickup", "Pay at pickup {amount}", { amount: this.amount(b.price) }), line: t("galio.ord.payAtCounter", "You pay in cash at the counter when you collect it.") };
        const facts = shopFacts(this.shop);
        return { icon: "cash", title: t("galio.ord.payOnDelivery", "Pay on delivery {amount}", { amount: this.amount(b.price) }), line: facts.gateway?.description || cod.name || "" };
      }
      return null;
    },

    // ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Kalio ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
    states() {
      return Object.values(Basket.PhysicalOrderStates || {});
    },
    stateIndex() {
      const at = this.states.findIndex((state) => state.code === this.basket?.delivery_state);
      return at < 0 ? 0 : at;
    },
    /** ok: paid or paying on delivery · wait: not paid yet · off: cancelled */
    tone() {
      const status = this.basket?.status;
      if (status === "Canceled") return "off";
      if (status === "Payed" || status === "COD") return "ok";
      return "wait";
    },
    toneIcon() {
      return { ok: "check", wait: "schedule", off: "close" }[this.tone];
    },
    heroNote() {
      if (this.tone !== "ok") return null;
      const state = this.states[this.stateIndex];
      return state ? this.$t(state.name) : null;
    },
    /** Bank transfers still waiting: their details and the receipt upload. */
    transfers() {
      return (this.basket?.transactions_pending || []).filter((t) => t.dir && t.status !== "Succeeded");
    },
    placedAt() {
      const at = this.basket?.reserved_at || this.basket?.created_at;
      if (!at) return null;
      return new Date(at).toLocaleString(document.documentElement.lang || "en", { day: "numeric", month: "long", year: "numeric" });
    },
    /* The items by seller, as the basket page shows them. */
    groups() {
      const groups = new Map();
      for (const item of this.basket?.items || []) {
        const key = item.vendor_id || 0;
        if (!groups.has(key)) {
          const vendor = this.sellers.get(item.vendor_id);
          groups.set(key, {
            key,
            name: vendor?.name || this.shop?.title || "",
            logo: vendor ? vendorImage(vendor, true) : null,
            items: [],
            units: 0,
            subtotal: 0,
          });
        }
        const group = groups.get(key);
        group.items.push(item);
        group.units += item.count || 0;
        group.subtotal += (item.price || 0) * (item.count || 0) - (item.offer_amount || 0);
      }
      return [...groups.values()];
    },
  },
  created() {
    loadShop();
    vendors().then((list) => {
      this.sellers = new Map(list.map((vendor) => [vendor.id, vendor]));
    });
  },
  methods: {
    t,
    tintOf,
    wayIconOf(type) {
      return wayIcon(type);
    },
    stepState(i) {
      return glStepState(i, this.stepAt, this.steps.length - 1);
    },
    amount(n) {
      return money(Number(n) || 0, this.currency);
    },
    image(item) {
      if (item.variant?.image) return window.CDN.GET_SHOP_IMAGE_PATH(item.variant.image, 128);
      return productImage(item.product, true);
    },
    size(item) {
      return sizeOf(item.variant);
    },
    productRoute(id) {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: id } };
    },

    downloadInvoice() {
      this.busy_invoice = true;

      axios
        .get(
          window.XAPI.GET_ORDER_BASKET_RECEIPT(
            this.shop.name,
            this.basket.id,
          ),
          {
            params: {
              code: this.basket.code || undefined,
              signature: this.$route.query.signature,
              timestamp: this.$route.query.timestamp,
            },
            responseType: "blob",
          },
        )
        .then(({ data }) => {
          const download_url = window.URL.createObjectURL(
            new Blob([data], { type: "application/pdf" }),
          );
          const link = document.createElement("a");
          link.href = download_url;
          link.download = `${this.getBasketOrderCode(this.basket)}.pdf`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.setTimeout(
            () => window.URL.revokeObjectURL(download_url),
            0,
          );
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_invoice = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
