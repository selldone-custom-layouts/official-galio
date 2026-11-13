<!--
  Galio Sundae — the account desk (galio-design/account-b.html, addresses-b.html, login-b.html): the
  mint title band ("welcome back" / "Your account", or the open section's name), then the desk: the
  menu on a mint card (the shopper's initial and email; Overview, Orders, Addresses, Profile, then
  Selldone's other sections; Sign out) and the open section beside it. A guest gets the sign-in
  entry: three reasons to sign in, "Sign in" and "Continue as guest", then the orders placed on this
  device when there are some.
-->
<template>
  <div class="gl gl-acct">
    <gl-ptitle :crumbs="crumbs" :h1="heading.h1" :kick="heading.kick" band="mint" cls="ptitle--short" />
    <section class="sec sec--tight bg-white">
      <div class="wrap">
        <div v-if="guest" class="signin-in">
          <ul class="why3">
            <li v-for="w in why" :key="w.icon">
              <span class="empty-ic"><gl-icon :name="w.icon" /></span>
              <div>
                <h2>{{ w.h }}</h2>
                <p>{{ w.p }}</p>
              </div>
            </li>
          </ul>
          <div class="signin-acts">
            <button class="btn btn--big" type="button" @click="signIn">{{ t("galio.acc.signIn", "Sign in") }}</button>
            <router-link :to="guestTo" class="btn btn--ghost btn--big">{{ t("galio.acc.asGuest", "Continue as guest") }}</router-link>
          </div>
        </div>

        <div v-if="!guest" class="desk">
          <nav :aria-label="t('galio.acc.nav', 'Account')" class="desk-nav">
            <div class="dn-who">
              <span aria-hidden="true" class="av av--me">
                <img v-if="avatar" :src="avatar" alt="" class="gl-av-img" @error="avatar_failed = true" />
                <span v-else class="mark">{{ initial }}<span class="dot"></span></span>
              </span>
              <div>
                <b>{{ user ? user.name : t("galio.acc.moment", "One moment…") }}</b>
                <small v-if="user">{{ user.email || user.phone }}</small>
              </div>
            </div>
            <ul>
              <li v-for="item in mainItems" :key="item.key">
                <router-link :aria-current="isOn(item) ? 'page' : undefined" :to="item.route"><gl-icon :name="item.icon" /><span>{{ item.word }}</span></router-link>
              </li>
              <li v-for="item in moreItems" :key="item.key" class="dn-more">
                <router-link :aria-current="isOn(item) ? 'page' : undefined" :to="item.route"><gl-icon :name="item.icon" /><span>{{ item.word }}</span></router-link>
              </li>
              <li v-if="user">
                <button :disabled="busy_out" type="button" @click="signOut"><gl-icon name="out" /><span>{{ t("galio.acc.signOut", "Sign out") }}</span></button>
              </li>
            </ul>
          </nav>
          <div class="desk-main">
            <router-view />
          </div>
        </div>
        <div v-else-if="!atHome" class="desk-main gl-guest-orders">
          <router-view />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { t } from "../i18n/kalio-i18n";
import GlIcon from "../../galio/GlIcon.vue";
import GlPtitle from "../../galio/GlPtitle.vue";
import { bagPageTo, shopAllTo } from "../../galio/galio";
import { ACCOUNT_HOME, ACCOUNT_STYLE, account, greeting, loadAddresses, loadOrders, sections, standing } from "./kalio-account";

export default {
  name: "KalioAccountShell",
  components: { GlIcon, GlPtitle },
  inject: ["$shop"],

  data() {
    return {
      style: ACCOUNT_STYLE,
      ACCOUNT_HOME,
      account,
      avatar_failed: false,
      busy_out: false,
    };
  },

  computed: {
    user() {
      return this.USER();
    },
    /** Still asking who is signed in (just after a reload). */
    pending() {
      return !this.user && !!this.$store.getters.getBusyUser;
    },
    firstName() {
      return (this.user?.name || "").trim().split(/\s+/)[0] || t("account.greeting.there", "there");
    },
    initials() {
      const parts = (this.user?.name || "").trim().split(/\s+/).filter(Boolean);
      return parts.length ? (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() : "";
    },
    avatar() {
      return this.user && !this.avatar_failed ? this.getUserAvatar(this.user.id) : null;
    },
    hello() {
      return greeting();
    },
    /* ── Galio Sundae ── */
    guest() {
      return !this.user && !this.pending;
    },
    atHome() {
      return this.$route.name === ACCOUNT_HOME;
    },
    initial() {
      return (this.user?.name || this.user?.email || "").trim().charAt(0).toLowerCase();
    },
    crumbs() {
      const home = [t("galio.crumb.home", "Home"), { path: "/" }];
      if (this.guest || this.atHome) return [home, [t("galio.acc.crumb", "Account")]];
      return [home, [t("galio.acc.crumb", "Account"), { name: ACCOUNT_HOME }], [this.heading.h1]];
    },
    /* The three reasons to sign in (login-b). */
    why() {
      return [
        { icon: "box", h: t("galio.acc.whyOrders", "Your orders"), p: t("galio.acc.whyOrdersP", "Follow each order from the oven to your door, and chat with the bakery.") },
        { icon: "pin", h: t("galio.acc.whyAddresses", "Saved addresses"), p: t("galio.acc.whyAddressesP", "Pick a saved address at checkout instead of typing it.") },
        { icon: "bag", h: t("galio.acc.whyGuest", "Guest checkout too"), p: t("galio.acc.whyGuestP", "No account needed to order: checkout works as a guest.") },
      ];
    },
    /* Continue as guest: the bag when it holds something, else the shop. */
    guestTo() {
      const bag = (this.getBaskets?.() || []).find((b) => b?.type === "PHYSICAL");
      return bag?.items?.length ? { ...bagPageTo(), query: { step: "checkout" } } : shopAllTo();
    },
    /* ── Galio Sundae ── */
    /* The mockup's menu: Overview, Orders, Addresses, Profile. */
    mainItems() {
      const r = window.$storefront.routes;
      const items = [];
      if (this.user) items.push({ key: "home", word: t("galio.acc.overview", "Overview"), icon: "user", route: { name: ACCOUNT_HOME } });
      items.push({ key: "orders", word: t("galio.acc.orders", "Orders"), icon: "box", route: { name: r.HISTORY_ORDERS_PHYSICAL } });
      if (this.user) {
        items.push({ key: "addresses", word: t("galio.acc.addresses", "Addresses"), icon: "pin", route: { name: r.USER_ADDRESSES_PAGE } });
        items.push({ key: "profile", word: t("galio.acc.profile", "Profile"), icon: "edit", route: { name: r.USER_PROFILE_PAGE } });
      }
      return items;
    },
    /* Selldone's other sections, kept reachable under the menu. */
    moreItems() {
      if (!this.user) return [];
      const r = window.$storefront.routes;
      return [
        { key: "saved", word: t("galio.acc.saved", "Saved"), icon: "heart", route: { name: r.USER_FAVORITES_PAGE } },
        { key: "wallet", word: t("galio.acc.wallet", "Wallet"), icon: "wallet", route: { name: r.USER_WALLETS_PAGE } },
        { key: "gift", word: t("galio.acc.gift", "Gift cards"), icon: "gift", route: { name: r.USER_GIFTCARDS_PAGE } },
        { key: "returns", word: t("galio.acc.returns", "Returns"), icon: "undo", route: { name: r.USER_RETURN_REQUESTS } },
        { key: "reviews", word: t("galio.acc.reviews", "Reviews"), icon: "star", route: { name: r.USER_COMMENTS_PAGE } },
      ];
    },
    /* The open section's own words, as the mockup's heading. */
    /* The open section's own words, as the title band's. */
    heading() {
      const r = window.$storefront.routes;
      const name = this.$route.name;
      if (this.guest) return { kick: t("galio.acc.kickGuest", "hello again"), h1: t("galio.acc.hAccount", "Your account") };
      if (name === ACCOUNT_HOME) return { kick: t("galio.acc.kickHome", "welcome back"), h1: t("galio.acc.hAccount", "Your account") };
      if (this.$route.matched.some((m) => m.name === r.ORDERS_PAGE)) return { kick: "", h1: t("galio.acc.hOrders", "Your orders") };
      const words = {
        [r.USER_ADDRESSES_PAGE]: t("galio.acc.hAddresses", "Addresses"),
        [r.USER_PROFILE_PAGE]: t("galio.acc.hProfile", "Profile"),
        [r.USER_FAVORITES_PAGE]: t("galio.acc.hSaved", "Saved for later"),
        [r.USER_WALLETS_PAGE]: t("galio.acc.hWallet", "Your wallet"),
        [r.USER_GIFTCARDS_PAGE]: t("galio.acc.hGift", "Gift cards"),
        [r.USER_RETURN_REQUESTS]: t("galio.acc.hReturns", "Your returns"),
        [r.USER_COMMENTS_PAGE]: t("galio.acc.hReviews", "Your reviews"),
      };
      return { kick: "", h1: words[name] || t("galio.acc.hAccount", "Your account") };
    },
    shown() {
      return sections().filter((item) => this.user || !item.user);
    },
    groups() {
      const groups = [];
      for (const item of this.shown) {
        let group = groups.find((g) => g.name === item.group);
        if (!group) groups.push((group = { name: item.group, items: [] }));
        group.items.push(item);
      }
      return groups;
    },
    /** What is happening to the orders, in a sentence. */
    summary() {
      if (this.pending) return t("account.summary.opening", "One moment, opening your account…");
      if (!account.loaded) return this.user ? t("account.summary.default", "Your orders, money and addresses in one place.") : t("account.summary.guest", "The orders placed on this device.");
      const tones = account.orders.map((o) => standing(o).tone);
      const moving = tones.filter((tone) => tone === "go" || tone === "prep").length;
      const paying = tones.filter((tone) => tone === "pay").length;
      if (moving && paying)
        return t("account.summary.both", "{moving}, {paying}.", {
          moving: t("account.summary.movingLead", { one: "One order is on its way to you", other: "{n} orders are on their way to you" }, { n: moving }),
          paying: t("account.summary.payingToo", { one: "one is waiting for payment", other: "{n} are waiting for payment" }, { n: paying }),
        });
      if (moving) return t("account.summary.moving", { one: "One order is on its way to you.", other: "{n} orders are on their way to you." }, { n: moving });
      if (paying) return t("account.summary.paying", { one: "One order is waiting for payment.", other: "{n} orders are waiting for payment." }, { n: paying });
      if (!account.total) return t("bakini.k.account.none", "No orders yet. Your first order is a few taps away.");
      return tones[0] === "ok" ? t("account.summary.allDelivered", "Everything you ordered has reached you.") : t("account.summary.default", "Your orders, money and addresses in one place.");
    },
  },

  watch: {
    // Signed in (or out) here, or known only now after a reload.
    "user.id"() {
      loadOrders(this);
      if (this.user) loadAddresses();
    },
    "$route.fullPath"() {
      this.showActive();
    },
  },

  mounted() {
    this.showActive();
  },

  created() {
    loadOrders(this);
    if (this.user) loadAddresses();
  },

  methods: {
    t,
    /** On a phone the sections are one row that scrolls sideways: bring the
     *  open one into view (Wallet, Profile… were off the right edge). */
    showActive() {
      this.$nextTick(() => {
        for (const nav of this.$el?.querySelectorAll?.(".desk-nav ul") || []) {
          const on = nav.querySelector('[aria-current="page"]');
          if (!on || nav.scrollWidth <= nav.clientWidth + 1) continue;
          const delta = on.getBoundingClientRect().left - nav.getBoundingClientRect().left;
          nav.scrollLeft = Math.max(0, nav.scrollLeft + delta - (nav.clientWidth - on.offsetWidth) / 2);
        }
      });
    },
    isOn(item) {
      if (item.key === "home") return this.$route.name === ACCOUNT_HOME;
      if (item.key === "orders") return this.$route.matched.some((m) => m.name === window.$storefront.routes.ORDERS_PAGE);
      return this.$route.name === item.route.name;
    },
    countOf(item) {
      if (item.key === "orders") return account.total || null;
      if (item.key === "addresses") return account.addresses?.length || null;
      return null;
    },
    signIn() {
      EventBus.$emit("need-login", true);
    },
    signOut() {
      this.busy_out = true;
      this.Logout(() => {
        this.busy_out = false;
        this.$router.push({ path: "/" });
      });
    },
  },
};
</script>
