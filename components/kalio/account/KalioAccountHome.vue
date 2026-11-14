<!--
  Galio Sundae — the account's Overview (galio-design/account-b.html): the last order on a lemon card
  (its code and state, the four steps, up to three of its pieces, what it costs and how it is paid,
  the way and window); then the saved address and the profile side by side; then "Order again" with
  the last order's pastries as the shop sells them now. All of it Selldone's own data.
-->
<template>
  <div class="gl-ahome">
    <article v-if="latest" class="panel lastord">
      <div class="panel-head">
        <div>
          <span class="pk">{{ t("galio.acc.lastOrder", "Last order · {code}", { code: code(latest) }) }}</span>
          <h2>{{ tone.word }}</h2>
        </div>
        <router-link :to="orderRoute(latest)" class="btn btn--ghost">{{ t("galio.acc.viewOrder", "View order") }}</router-link>
      </div>
      <ol v-if="tone.tone !== 'off'" :aria-label="t('galio.ord.progress', 'Order progress')" class="track track--sm">
        <li v-for="(s, i) in steps" :key="s.key" :aria-current="stepState(i) === 'now' ? 'step' : undefined" :class="['tk', 'tk--' + stepState(i)]">
          <span class="tk-dot"><gl-icon :name="s.icon" /></span><span class="tk-l">{{ s.label }}</span>
        </li>
      </ol>
      <div v-if="tone.tone === 'pay'" class="lo-pay">
        <span>{{ t("galio.acc.waitingPay", "This order is waiting for payment.") }}</span>
        <router-link :to="orderRoute(latest)" class="btn"><gl-icon name="lock" />{{ t("galio.acc.payNow", "Pay now") }}</router-link>
      </div>
      <div class="lo-foot">
        <ul v-if="thumbs.length" :aria-label="t('galio.acc.inOrder', 'In this order')" class="lo-thumbs">
          <li v-for="th in thumbs" :key="th.key" :style="{ '--gl-tint': tintOf(th.category) }" :title="th.title" class="mthumb"><img v-if="th.src" :alt="th.title" :src="th.src" height="400" width="400" /></li>
        </ul>
        <p>
          <b class="tab-num">{{ pay.amount }}</b>{{ pay.words ? " " + pay.words : "" }}<template v-if="way"><br /><small>{{ way }}</small></template>
        </p>
      </div>
    </article>

    <gl-empty
      v-else-if="account.loaded"
      :text="t('galio.acc.noOrdersP', 'When you place an order, it appears here with its delivery window and progress.')"
      :title="t('galio.acc.noOrders', 'No orders yet')"
      icon="box"
    >
      <router-link :to="shopTo" class="btn">{{ t("galio.acc.startShopping", "Start shopping") }}</router-link>
    </gl-empty>
    <div v-else aria-busy="true" class="panel lastord gl-wait"></div>

    <div class="desk-two">
      <article class="panel">
        <div class="panel-head">
          <h2>{{ t("galio.acc.savedAddresses", "Saved addresses") }}</h2>
          <router-link :to="sectionRoute('USER_ADDRESSES_PAGE')" class="link link--sm">{{ address ? t("galio.acc.manage", "Manage") : t("galio.acc.add", "Add") }}<gl-icon name="arrow" /></router-link>
        </div>
        <ul v-if="address" class="abooks">
          <li class="abook">
            <div class="ab-h">
              <span class="ab-ic"><gl-icon name="home" /></span><b><bdi>{{ address.title || address.name || t("galio.acc.addressUntitled", "Address") }}</bdi></b>
            </div>
            <p>
              <bdi>{{ [address.name, address.phone].filter(Boolean).join(" · ") }}</bdi><br /><bdi>{{ addressLine(address) }}</bdi>
            </p>
          </li>
        </ul>
        <p v-else class="gl-none">{{ account.addresses ? t("galio.acc.noAddress", "No saved address yet. Save one and pick it at checkout in a tap.") : t("galio.acc.moment", "One moment…") }}</p>
      </article>
      <article class="panel">
        <div class="panel-head">
          <h2>{{ t("galio.acc.profile", "Profile") }}</h2>
          <router-link :to="sectionRoute('USER_PROFILE_PAGE')" class="link link--sm">{{ t("galio.acc.edit", "Edit") }}<gl-icon name="arrow" /></router-link>
        </div>
        <dl class="prof">
          <div>
            <dt>{{ t("galio.acc.name", "Name") }}</dt>
            <dd>{{ user?.name || "—" }}</dd>
          </div>
          <div v-if="user?.email">
            <dt>{{ t("galio.acc.email", "Email") }}</dt>
            <dd>{{ user.email }}</dd>
          </div>
          <div v-if="user?.phone">
            <dt>{{ t("galio.acc.phone", "Phone") }}</dt>
            <dd dir="ltr">{{ user.phone }}</dd>
          </div>
        </dl>
      </article>
    </div>

    <article v-if="again.length" class="panel">
      <div class="panel-head">
        <h2>{{ t("galio.acc.again", "Order again") }}</h2>
      </div>
      <ul class="minis minis--3"><gl-mini v-for="p in again" :key="p.id" :product="p" /></ul>
    </article>
  </div>
</template>

<script>
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { reorder } from "../kalio-basket";
import { t } from "../i18n/kalio-i18n";
import { productImage, productsById, vendors } from "../kalio-catalog";
import GlIcon from "../../galio/GlIcon.vue";
import GlMini from "../../galio/GlMini.vue";
import GlEmpty from "../../galio/GlEmpty.vue";
import { shopAllTo, tintOf } from "../../galio/galio";
import { glStepAt, glStepState, glSteps, longDate, orderPay, orderWay } from "../../galio/account/gl-account";
import {
  STATES,
  account,
  loadAddresses,
  loadDetail,
  loadGiftcards,
  loadOrders,
  loadWallets,
  orderCode,
  paidWords,
  standing,
  stepOf,
  userKnown,
  when,
} from "./kalio-account";

const LINES = 4;

export default {
  name: "KalioAccountHome",
  components: { GlIcon, GlMini, GlEmpty },
  mixins: [CurrencyMixin],
  inject: ["$shop"],

  data() {
    return {
      account,
      states: STATES,
      sellers: new Map(),
      catalogue: new Map(),
      busy_again: false,
      again_done: false,
    };
  },

  computed: {
    // ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Galio Sundae ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
    user() {
      return this.USER();
    },
    steps() {
      return glSteps();
    },
    stepAt() {
      return glStepAt((this.detail || this.latest)?.delivery_state);
    },
    shopTo() {
      return shopAllTo();
    },
    pay() {
      return orderPay(this.latest);
    },
    way() {
      return orderWay(this.$shop, this.latest, this.detail);
    },
    /* Up to three of the last order's photos. */
    thumbs() {
      const items = (this.detail?.items || this.latest?.items || []).slice(0, 3);
      return items.map((item, i) => {
        const product = item.product || this.catalogue.get(item.product_id);
        return {
          key: i,
          src: this.detail ? this.image(item) : (product && productImage(product, true)) || this.getProductImage(item.product_id),
          category: product?.category_id,
          title: product?.title || item.product?.title || "",
        };
      });
    },
    address() {
      return (account.addresses || [])[0] || null;
    },
    /* The last order's products, as the shop sells them now. */
    again() {
      const items = this.detail?.items || this.latest?.items || [];
      const ids = [...new Set(items.map((it) => it.product_id))];
      /* The shop's listing when it has the product; else the order's own copy. */
      return ids
        .map((id) => this.catalogue.get(id) || items.find((it) => it.product_id === id && it.product?.title)?.product)
        .filter((p) => p && p.status !== "Close")
        .slice(0, 3);
    },
    currency() {
      return this.latest?.currency || this.GetUserSelectedCurrency()?.code || this.$shop.currency;
    },
    latest() {
      return account.orders[0] || null;
    },
    detail() {
      return this.latest ? account.details[this.latest.id] : null;
    },
    tone() {
      return standing(this.latest);
    },
    lines() {
      const detail = this.detail;
      if (detail) {
        return (detail.items || []).slice(0, LINES).map((item) => ({
          key: item.id,
          src: this.image(item),
          title: item.product?.title || t("account.home.anItem", "An item"),
          count: item.count,
          price: item.price,
          total: this.lineTotal(item),
          seller: this.sellerName(item),
          currency: detail.currency,
        }));
      }
      // Before the full order (or without it): the list's products and counts.
      const missing = !!account.missing[this.latest?.id];
      return (this.latest?.items || []).slice(0, LINES).map((item, i) => {
        const product = this.catalogue.get(item.product_id);
        return {
          key: `l${i}`,
          src: (product && productImage(product, true)) || this.getProductImage(item.product_id),
          title: product?.title || (missing ? t("account.home.anItem", "An item") : null),
          count: item.count,
          price: null,
          total: null,
          seller: null,
          currency: this.latest.currency,
        };
      });
    },
    moreLines() {
      return Math.max(0, (this.detail?.items || this.latest?.items || []).length - LINES);
    },
    footWords() {
      const parts = [paidWords(this.latest)];
      if (this.detail?.discount > 0) parts.push(t("account.home.youSaved", "you saved {amount}", { amount: this.money(this.detail.discount, this.detail.currency) }));
      return parts.filter(Boolean).join(" · ");
    },
    moving() {
      return account.orders.filter((o) => ["go", "prep"].includes(standing(o).tone)).length;
    },
    /** "orders · 2 on the way", under the count of orders. */
    ordersWords() {
      const orders = t("account.home.tile.orders", { one: "order", other: "orders" }, { n: account.total });
      return this.moving ? t("account.home.tile.ordersMoving", "{orders} · {n} on the way", { orders, n: this.moving }) : orders;
    },
    waiting() {
      return account.orders.find((o) => standing(o).tone === "pay") || null;
    },
    /** What deals took off, over the orders read in full (not cancelled). */
    saved() {
      return Object.values(account.details)
        .filter((o) => o.status !== "Canceled")
        .reduce((sum, o) => sum + (o.discount || 0), 0);
    },
    savedWords() {
      const read = Object.keys(account.details).length;
      return read < account.total ? t("account.home.tile.savedRecent", "saved on recent orders") : t("account.home.tile.savedDeals", "saved with deals");
    },
    wallet() {
      const list = account.wallets || [];
      const mine = list.find((w) => w.currency === this.currency) || list[0];
      return { amount: mine?.balance || 0, currency: mine?.currency || this.currency };
    },
    ordersRoute() {
      return { name: window.$storefront.routes.HISTORY_ORDERS_PHYSICAL };
    },
  },

  watch: {
    latest: {
      handler(order) {
        if (order) loadDetail(this, order.id);
      },
      immediate: true,
    },
  },

  created() {
    this.setPageTitle?.(t("account.pageTitle.home", "My account"));
    vendors().then((list) => (this.sellers = new Map(list.map((v) => [v.id, v]))));
    productsById().then((map) => (this.catalogue = map));
    // After a reload the shopper is read first; a guest has only the
    // orders kept on this device.
    userKnown(this).then(() => {
      if (!this.USER()) {
        this.$router.replace(this.ordersRoute);
        return;
      }
      loadOrders(this);
      loadAddresses();
      loadWallets(this);
      loadGiftcards(this);
    });
  },

  methods: {
    t,
    tintOf,
    longDate,
    when,
    code(order) {
      return orderCode(this, order);
    },
    orderRoute(order) {
      return { name: "MyPhysicalOrderInfoPage", params: { basket_id: order.id } };
    },
    sectionRoute(name) {
      return { name: window.$storefront.routes[name] };
    },
    stepState(i) {
      return glStepState(i, this.stepAt, this.steps.length - 1);
    },
    /** The times Selldone records: placed, sent, delivered. */
    stepTime(i) {
      const trip = this.detail?.transportation_order;
      const at = i === 0 ? this.latest.reserved_at : i === 3 ? trip?.send_at : i === 4 ? this.detail?.delivery_at || trip?.deliver_at : null;
      if (!at || this.stepState(i) !== "done") return null;
      return new Date(at).toLocaleTimeString(document.documentElement.lang || "en", { hour: "numeric", minute: "2-digit" });
    },
    image(item) {
      if (item.variant?.image) return window.CDN.GET_SHOP_IMAGE_PATH(item.variant.image, 128);
      return productImage(item.product, true);
    },
    sellerName(item) {
      return this.sellers.get(item.vendor_id)?.name || null;
    },
    lineTotal(item) {
      return (item.price || 0) * (item.count || 0) - (item.offer_amount || 0);
    },
    money(amount, currency) {
      try {
        return new Intl.NumberFormat(document.documentElement.lang || "en", { style: "currency", currency: currency || "USD" }).format(amount || 0);
      } catch (e) {
        return `${amount}`;
      }
    },
    addressLine(a) {
      const street = [a.address, a.no, a.unit].filter(Boolean).join(", ");
      const place = [a.city, [a.state_code || a.state, a.postal].filter(Boolean).join(" ")].filter(Boolean).join(", ");
      return [street, place, a.country ? this.countryName(a.country) : null].filter(Boolean).join(", ");
    },
    countryName(code) {
      try {
        return new Intl.DisplayNames([document.documentElement.lang || "en"], { type: "region" }).of(code) || code;
      } catch (e) {
        return code;
      }
    },
    async buyAgain() {
      this.busy_again = true;
      try {
        const full = this.detail || (await loadDetail(this, this.latest.id));
        if (!full) throw new Error("no order");
        const { added, failed } = await reorder(this, full.items);
        if (added) {
          this.again_done = true;
          setTimeout(() => (this.again_done = false), 2400);
        }
        if (failed) NotificationService.showErrorAlert(null, t("orders.reorder.failed", { one: "{n} item is not sold any more and stayed out.", other: "{n} items are not sold any more and stayed out." }, { n: failed }));
      } catch (e) {
        NotificationService.showErrorAlert(null, t("orders.reorder.error", "This order could not be added again."));
      } finally {
        this.busy_again = false;
      }
    },
  },
};
</script>
