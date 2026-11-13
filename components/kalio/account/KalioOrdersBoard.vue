<!--
  Galio Sundae — the order list (the account's Orders; account-b.html's last-order card for each
  order): filter chips (All, On the way, To pay, Delivered, Cancelled), then a card per order with
  its code, date and state, the four steps, up to three of its pieces, what it costs and how it is
  paid, the way and window; "View order" (or "Pay now"), "Buy again" once it is over, and the
  messages. Selldone's orders, read by kalio-account.ts.
-->
<template>
  <section :class="{ '-compact': compact }" class="gl-orders">
    <div v-if="!compact && account.orders.length" :aria-label="t('galio.acc.show', 'Show')" class="chips gl-ord-filters" role="tablist">
      <button v-for="f in filters" :key="f.key" :aria-selected="filter === f.key ? 'true' : 'false'" class="chip" role="tab" type="button" @click="pick(f.key)">
        {{ f.word }}<span v-if="counts[f.key]" class="fcount">{{ counts[f.key] }}</span>
      </button>
    </div>

    <!-- Waiting for the first read -->
    <div v-if="!account.loaded && !account.failed" aria-busy="true" class="panel lastord gl-wait"></div>

    <!-- A guest whose device holds no order is not an error (Selldone refuses the read when the shop
         takes no guest orders). -->
    <gl-empty
      v-else-if="account.failed && !account.orders.length && !USER()"
      :text="t('galio.acc.deviceP', 'No orders on this device yet. Sign in to see the orders on your account.')"
      :title="t('galio.acc.noOrders', 'No orders yet')"
      icon="box"
    >
      <button class="btn" type="button" @click="askSignIn">{{ t("galio.acc.signIn", "Sign in") }}</button>
    </gl-empty>

    <gl-empty v-else-if="account.failed && !account.orders.length" :title="t('galio.acc.loadFailed', 'Your orders did not load.')" icon="info">
      <button class="btn btn--ghost" type="button" @click="retry">{{ t("galio.acc.tryAgain", "Try again") }}</button>
    </gl-empty>

    <gl-empty
      v-else-if="!visible.length"
      :icon="filter === 'all' ? 'box' : 'filter'"
      :text="filter === 'all' ? t('galio.acc.noOrdersP', 'When you place an order, it appears here with its delivery window and progress.') : ''"
      :title="filter === 'all' ? t('galio.acc.noOrders', 'No orders yet') : emptyWords"
    >
      <router-link v-if="filter === 'all'" :to="{ path: '/' }" class="btn">{{ t("galio.acc.startShopping", "Start shopping") }}</router-link>
      <button v-else class="btn btn--ghost" type="button" @click="pick('all')">{{ t("galio.acc.showAll", "Show all orders") }}</button>
    </gl-empty>

    <template v-else>
      <article v-for="order in visible" :key="order.id" :class="['panel', 'gl-ord', { lastord: order === visible[0] && filter === 'all' }]">
        <div class="panel-head">
          <div>
            <span class="pk">{{ t("galio.acc.codeDate", "{code} · {date}", { code: code(order), date: longDate(order.reserved_at || order.created_at) }) }}</span>
            <h2>{{ standing(order).word }}</h2>
          </div>
          <router-link v-if="standing(order).tone === 'pay'" :to="orderRoute(order)" class="btn"><gl-icon name="lock" />{{ t("galio.acc.payNow", "Pay now") }}</router-link>
          <router-link v-else :to="orderRoute(order)" class="btn btn--ghost">{{ t("galio.acc.viewOrder", "View order") }}</router-link>
        </div>
        <ol v-if="standing(order).tone !== 'off'" :aria-label="t('galio.ord.progress', 'Order progress')" class="track track--sm">
          <li v-for="(s, i) in glSteps" :key="s.key" :aria-current="stepState(order, i) === 'now' ? 'step' : undefined" :class="['tk', 'tk--' + stepState(order, i)]">
            <span class="tk-dot"><gl-icon :name="s.icon" /></span><span class="tk-l">{{ s.label }}</span>
          </li>
        </ol>
        <div class="lo-foot">
          <ul :aria-label="t('galio.acc.inOrder', 'In this order')" class="lo-thumbs">
            <li v-for="pic in thumbs(order, 3)" :key="pic.id" class="mthumb"><img v-if="pic.src" :src="pic.src" alt="" height="400" loading="lazy" width="400" /></li>
          </ul>
          <p>
            <b class="tab-num">{{ payOf(order).amount }}</b>{{ payOf(order).words ? " " + payOf(order).words : "" }}<br /><small>{{ footOf(order) }}</small>
          </p>
        </div>
        <div class="gl-ord-acts">
          <button v-if="['ok', 'off'].includes(standing(order).tone)" :disabled="busy[order.id]" class="link link--sm" type="button" @click="buyAgain(order)">
            <gl-icon :name="done[order.id] ? 'check' : 'bag'" />{{ done[order.id] ? t("galio.acc.inBag", "In your bag") : t("galio.acc.buyAgain", "Buy again") }}
          </button>
          <router-link :to="orderRoute(order)" class="link link--sm">
            <gl-icon name="chat" />{{ chatCount(order) ? t("galio.acc.messages", { one: "{n} message", other: "{n} messages" }, { n: chatCount(order) }) : t("galio.acc.ask", "Write to the bakery") }}
          </router-link>
        </div>
      </article>
    </template>

    <div v-if="canShowMore" class="gl-ord-more">
      <button :disabled="account.loading" class="btn btn--ghost" type="button" @click="more">
        <span v-if="account.loading" aria-hidden="true" class="gl-spin gl-spin--ink"></span>{{ t("galio.acc.older", "Show older orders") }}
      </button>
    </div>
    <router-link v-if="compact && filtered.length > limit" :to="allRoute" class="link">
      {{ t("galio.acc.seeAll", { one: "See all {n} orders", other: "See all {n} orders" }, { n: account.total }) }}<gl-icon name="arrow" />
    </router-link>
  </section>
</template>

<script>
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { reorder } from "../kalio-basket";
import { t } from "../i18n/kalio-i18n";
import { productImage, vendors } from "../kalio-catalog";
import GlIcon from "../../galio/GlIcon.vue";
import GlEmpty from "../../galio/GlEmpty.vue";
import { glStepAt, glStepState, glSteps, longDate, orderPay, orderWay } from "../../galio/account/gl-account";
import {
  ORDERS_DESK,
  FILTERS,
  account,
  joinNames,
  loadDetail,
  loadDetails,
  loadOlder,
  loadOrders,
  orderCode,
  paidWords,
  placeOf,
  productIds,
  sellersOf,
  standing,
  STATES,
  stepOf,
  TRAIL,
  unitsOf,
  when,
} from "./kalio-account";

const STEP = 10;

export default {
  name: "KalioOrdersBoard",
  components: { GlIcon, GlEmpty },
  inject: ["$shop"],

  props: {
    mode: { type: String, default: ORDERS_DESK ? "cards" : "table" },
    /** On the Overview: the first few, no head or filters. */
    compact: Boolean,
    limit: { type: Number, default: 5 },
  },

  data() {
    return {
      account,
      trail: TRAIL,
      filters: FILTERS,
      filter: "all",
      showing: STEP,
      sellers: new Map(),
      busy: {},
      done: {},
    };
  },

  computed: {
    glSteps() {
      return glSteps();
    },
    title() {
      return ORDERS_DESK ? t("account.yourOrders", "Your orders") : t("orders.history", "Order history");
    },
    line() {
      if (!account.loaded || !ORDERS_DESK) return null;
      const n = account.total;
      if (!n) return null;
      const moving = account.orders.filter((o) => ["go", "prep"].includes(standing(o).tone)).length;
      const orders = t("orders.line.count", { one: "{n} order", other: "{n} orders" }, { n });
      return moving ? t("orders.line.moving", { one: "{orders} · {n} on its way to you", other: "{orders} · {n} on their way to you" }, { n: moving, orders }) : orders;
    },
    counts() {
      const out = {};
      for (const f of FILTERS) out[f.key] = account.orders.filter(f.test).length;
      out.all = account.total || out.all;
      return out;
    },
    filtered() {
      const f = FILTERS.find((x) => x.key === this.filter) || FILTERS[0];
      return account.orders.filter(f.test);
    },
    visible() {
      return this.filtered.slice(0, this.compact ? this.limit : this.showing);
    },
    canShowMore() {
      if (this.compact) return false;
      return this.filtered.length > this.showing || (this.filter === "all" && account.orders.length < account.total);
    },
    emptyWords() {
      if (this.filter === "all") return t("orders.empty.all", "No orders yet. What you buy shows up here, with where it is.");
      return {
        go: t("orders.empty.go", "Nothing on the way right now."),
        pay: t("orders.empty.pay", "Nothing waiting for payment."),
        ok: t("orders.empty.ok", "Nothing delivered yet."),
        off: t("orders.empty.off", "No cancelled orders."),
      }[this.filter];
    },
    allRoute() {
      return { name: window.$storefront.routes.HISTORY_ORDERS_PHYSICAL };
    },
  },

  watch: {
    visible: {
      handler(list) {
        loadDetails(this, list);
      },
      immediate: true,
    },
  },

  created() {
    loadOrders(this);
    vendors().then((list) => (this.sellers = new Map(list.map((v) => [v.id, v]))));
  },

  methods: {
    /** The app's sign-in sheet (KalioSignIn). This board has no AuthMixin, so
     *  NeedLogin() was not a function and the guest's "Sign in" did nothing. */
    askSignIn() {
      EventBus.$emit("need-login", true);
    },
    standing,
    productIds,
    paidWords,
    when,
    units: unitsOf,
    code(order) {
      return orderCode(this, order);
    },
    orderRoute(order) {
      return { name: "MyPhysicalOrderInfoPage", params: { basket_id: order.id } };
    },
    chatCount(order) {
      return order.chat?.length || 0;
    },
    /** One picture per product, with how many, from the full order when read. */
    longDate,
    /* Galio Sundae: B's four steps; the amount and how it is paid; the way and the pieces. */
    stepState(order, i) {
      return glStepState(i, glStepAt((account.details[order.id] || order).delivery_state), 3);
    },
    payOf(order) {
      return orderPay(order);
    },
    footOf(order) {
      const pieces = t("galio.acc.pieces", { one: "{n} piece", other: "{n} pieces" }, { n: unitsOf(order) });
      return [orderWay(this.$shop, order, account.details[order.id]), pieces].filter(Boolean).join(" · ");
    },
    thumbs(order, max) {
      const full = account.details[order.id];
      const byProduct = new Map();
      for (const item of order.items || []) {
        const at = byProduct.get(item.product_id) || { id: item.product_id, count: 0, src: null };
        at.count += item.count || 0;
        byProduct.set(item.product_id, at);
      }
      if (full) {
        for (const item of full.items || []) {
          const at = byProduct.get(item.product_id);
          if (!at) continue;
          at.src = item.variant?.image ? window.CDN.GET_SHOP_IMAGE_PATH(item.variant.image, 128) : productImage(item.product, true) || at.src;
        }
      }
      for (const at of byProduct.values()) if (!at.src) at.src = this.getProductImage(at.id);
      return [...byProduct.values()].slice(0, max);
    },
    headline(order) {
      const s = standing(order);
      const full = account.details[order.id];
      if (s.tone === "ok") return full?.delivery_at ? t("orders.headline.reached", "Reached you {when}", { when: when(full.delivery_at) }) : t("orders.headline.delivered", "Delivered");
      if (s.tone === "go") return t("orders.headline.onItsWay", "On its way to you");
      if (s.tone === "pay") return t("orders.headline.pay", "Pay to keep this order");
      if (s.tone === "off") return order.reject ? t("orders.headline.rejected", "The shop could not take this order") : t("orders.headline.cancelled", "This order was cancelled");
      if (s.key === "preparing") return t("orders.headline.packing", "The shop is packing it");
      if (s.key === "confirmed") return t("orders.headline.accepted", "The shop has accepted it");
      return t("orders.headline.waiting", "Waiting for the shop to accept it");
    },
    subline(order) {
      const n = unitsOf(order);
      const names = joinNames(sellersOf(order, this.sellers));
      const place = placeOf(order);
      const items = names
        ? t("orders.subline.itemsFrom", { one: "{n} item from {names}", other: "{n} items from {names}" }, { n, names })
        : t("orders.items", { one: "{n} item", other: "{n} items" }, { n });
      return [items, place && standing(order).tone !== "pay" ? t("orders.subline.to", "to {place}", { place }) : null].filter(Boolean).join(" · ");
    },
    /** Selldone's own name for a step, for the tooltip. */
    stepName(i) {
      const name = STATES[i]?.name;
      return name ? this.$t(name) : null;
    },
    barClass(order, i) {
      const step = stepOf(order);
      if (i < step || (i === step && step === 4)) return "-on";
      if (i === step) return "-now";
      return "";
    },
    pick(key) {
      this.filter = key;
      this.showing = STEP;
    },
    more() {
      if (this.filtered.length > this.showing) this.showing += STEP;
      else loadOlder(this).then(() => (this.showing += STEP));
    },
    retry() {
      loadOrders(this, true);
    },
    async buyAgain(order) {
      this.busy[order.id] = true;
      try {
        const full = account.details[order.id] || (await loadDetail(this, order.id));
        if (!full) throw new Error("no order");
        const { added, failed } = await reorder(this, full.items);
        if (added) {
          this.done[order.id] = true;
          setTimeout(() => (this.done[order.id] = false), 2400);
        }
        if (failed) NotificationService.showErrorAlert(null, t("orders.reorder.failed", { one: "{n} item is not sold any more and stayed out.", other: "{n} items are not sold any more and stayed out." }, { n: failed }));
      } catch (e) {
        NotificationService.showErrorAlert(null, t("orders.reorder.error", "This order could not be added again."));
      } finally {
        this.busy[order.id] = false;
      }
    },
  },
};
</script>
