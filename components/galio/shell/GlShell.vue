<!--
  Galio Sundae — the shell of every page, the home included (galio-design/g/shell.js side(), top(),
  openMenu(), openShop(), openSearch(), openRegion(), openBag(), openQuick()):

  - Wide screens (1100px and up): the fixed cocoa side rail with its scalloped awning edge: the
    wordmark (the shop's live title), Home, Shop (opens the collections menu beside the rail) with the
    collections under it, Deals, Journal, Visit (the contact page) and Search; Account, the bag with
    its count (opens the drawer), the double-ringed "Order now" and the EN · USD pill; the counter's
    days and hours and the phone at its foot. On a short window the rail tightens, then scrolls.
  - Below: the cocoa top bar (the wordmark, Search, the bag with its count, the menu) and the menu
    sheet from the inline end: Home, Shop all, Deals; the collections with their line drawings and
    "from" prices (the first 6, "Show N more" past 8); Journal, About us, Contact & visit, Questions,
    Account and the "Language & currency" row, which opens a bottom sheet; hours and phone.
  - The layers: the collections menu, search (a panel beside the rail, or from the top on phones),
    the region popover, the bag drawer and the quick look.

  Every layer opens on a click and closes on a second click, Esc, ✕, a click outside or a page change
  (gl-data.ts layers). The layers are teleported to <body>. No bottom tab bar, and never a theme button
  here: the Theme row is in the footer (the owner's rule). A shop with custom header code keeps
  Selldone's header (StorefrontLayout).
-->
<template>
  <div v-if="!$store.getters.getIsNative" :dir="rtl ? 'rtl' : 'ltr'" class="gl gl-shell">
    <a class="gl-skip" href="#main" @click.prevent="skip">{{ t("galio.shell.skip", "Skip to content") }}</a>

    <!-- The side rail (wide screens) -->
    <aside :aria-label="t('galio.shell.site', 'Site')" class="side">
      <div class="side-in">
        <gl-mark />
        <nav :aria-label="t('galio.shell.main', 'Main')" class="side-nav">
          <router-link :aria-current="onHome ? 'page' : undefined" to="/">{{ t("galio.shell.home", "Home") }}</router-link>
          <button
            :aria-current="onShop ? 'page' : undefined"
            :aria-expanded="is('gshop') ? 'true' : 'false'"
            aria-controls="gshop"
            aria-haspopup="dialog"
            class="side-shop"
            type="button"
            @click="toggle('gshop', $event)"
          >
            {{ t("galio.shell.shop", "Shop") }}
          </button>
          <div v-if="railCats.length" class="side-sub">
            <router-link v-for="c in railCats" :key="c.id" :aria-current="c.name === currentCat ? 'page' : undefined" :to="catTo(c)"><bdi>{{ catTitle(c) }}</bdi></router-link>
            <router-link v-if="railMore" :to="shopAllTo" class="side-more">{{ t("galio.shell.allCollections", "All collections") }}</router-link>
          </div>
          <router-link :aria-current="onDeals ? 'page' : undefined" :to="dealsTo">{{ t("galio.shell.deals", "Deals") }}</router-link>
          <router-link :aria-current="onJournal ? 'page' : undefined" :to="blogTo">{{ t("galio.shell.journal", "Journal") }}</router-link>
          <router-link :aria-current="onVisit ? 'page' : undefined" :to="contactTo">{{ t("galio.shell.visit", "Visit") }}</router-link>
          <button :aria-expanded="is('gsrch') ? 'true' : 'false'" aria-controls="gsrch" aria-haspopup="dialog" class="side-srch" type="button" @click="toggle('gsrch', $event)">
            {{ t("galio.shell.search", "Search") }}
          </button>
        </nav>
        <div class="side-acts">
          <div class="side-me">
            <router-link :aria-current="onAccount ? 'page' : undefined" :to="accountTo" class="side-acct"><gl-icon name="user" /><span>{{ t("galio.shell.account", "Account") }}</span></router-link>
            <button :aria-label="bagAria" aria-controls="drawer" aria-haspopup="dialog" class="side-bag gl-bag-btn" type="button" @click="toggle('drawer', $event)">
              <gl-icon name="bag" /><span aria-hidden="true">{{ t("galio.shell.bagN", "Bag ({n})", { n: units }) }}</span>
            </button>
          </div>
          <router-link :to="shopAllTo" class="btn-order">{{ t("galio.shell.order", "Order now") }}</router-link>
          <button
            v-if="regionOn"
            :key="regionKey"
            :aria-expanded="is('gregion') ? 'true' : 'false'"
            :aria-label="t('galio.shell.regionAria', 'Language and currency: {value}', { value: regionLabel })"
            aria-controls="gregion"
            aria-haspopup="dialog"
            class="pill-region rs-pick__btn"
            type="button"
            @click="toggle('gregion', $event)"
          >
            <gl-icon name="globe" />{{ regionLabel }}
          </button>
        </div>
        <div v-if="openText || facts.phone" class="side-foot">
          <span v-if="openText" class="ln"><gl-icon name="clock" /><span>{{ openText[0] }}<br v-if="openText[1]" />{{ openText[1] }}</span></span>
          <span v-if="facts.phone" class="ln"><gl-icon name="phone" /><a :href="telOf(facts.phone)" dir="ltr">{{ facts.phone }}</a></span>
        </div>
      </div>
    </aside>

    <!-- The top bar (tablet, phone) -->
    <header class="top">
      <div class="top-in">
        <gl-mark />
        <button :aria-expanded="is('gsrch') ? 'true' : 'false'" :aria-label="t('galio.shell.search', 'Search')" aria-controls="gsrch" aria-haspopup="dialog" class="top-btn srch-btn" type="button" @click="toggle('gsrch', $event)">
          <gl-icon name="search" />
        </button>
        <button :aria-label="bagAria" aria-controls="drawer" aria-haspopup="dialog" class="top-btn gl-bag-btn bag-btn" type="button" @click="toggle('drawer', $event)">
          <gl-icon name="bag" /><span v-if="units > 0" class="count">{{ units > 99 ? "99+" : units }}</span>
        </button>
        <button
          :aria-expanded="is('pmenu') ? 'true' : 'false'"
          :aria-label="t('galio.shell.menu', 'Menu')"
          aria-controls="pmenu"
          aria-haspopup="dialog"
          class="top-btn menu-btn"
          type="button"
          @click="toggle('pmenu', $event)"
        >
          <gl-icon name="menu" />
        </button>
      </div>
    </header>

    <teleport to="body">
      <div :dir="rtl ? 'rtl' : 'ltr'" class="gl gl-layers">
        <!-- The menu sheet (tablet, phone) -->
        <div v-if="is('pmenu')" class="scrim scrim--sheet" @click="closeLayer()"></div>
        <div v-if="is('pmenu')" id="pmenu" :aria-label="t('galio.shell.menu', 'Menu')" aria-modal="true" class="lay lay--sheet sheet" role="dialog">
          <div class="sheet-head">
            <gl-mark />
            <button ref="sheetX" :aria-label="t('galio.shell.closeMenu', 'Close menu')" class="x" type="button" @click="closeLayer()"><gl-icon name="x" /></button>
          </div>
          <nav :aria-label="t('galio.shell.main', 'Main')" class="sheet-list">
            <router-link to="/"><span class="ico"><gl-icon name="home" /></span><span>{{ t("galio.shell.home", "Home") }}</span><small></small></router-link>
            <router-link :to="shopAllTo"><span class="ico"><gl-icon name="bag" /></span><span>{{ t("galio.shell.shopAll", "Shop all") }}</span><small></small></router-link>
            <router-link :to="dealsTo"
              ><span class="ico"><gl-icon name="gift" /></span><span>{{ t("galio.shell.deals", "Deals") }}</span><small>{{ off ? t("galio.shell.offN", "{off}% off", { off }) : "" }}</small></router-link
            >
          </nav>
          <template v-if="cats.length">
            <h3>{{ t("galio.shell.collections", "Collections") }}</h3>
            <nav :aria-label="t('galio.shell.collections', 'Collections')" class="sheet-list">
              <router-link v-for="c in menuCats" :key="c.id" :to="catTo(c)">
                <span class="ico"><gl-icon :coll="c" /></span><span><bdi>{{ catTitle(c) }}</bdi></span><small>{{ fromOf(c) ? t("galio.shell.from", "from {price}", { price: fromOf(c) }) : "" }}</small>
              </router-link>
              <button v-if="menuRest.length" :aria-expanded="moreOpen ? 'true' : 'false'" class="sheet-more" type="button" @click="moreOpen = !moreOpen">
                <span class="ico"><span class="more-disc"><gl-icon :name="moreOpen ? 'up' : 'down'" /></span></span>
                <span>{{ moreOpen ? t("galio.shell.fewer", "Show fewer") : t("galio.shell.more", "Show {n} more", { n: menuRest.length }) }}</span><small></small>
              </button>
            </nav>
          </template>
          <h3>{{ t("galio.shell.moreH", "More") }}</h3>
          <nav :aria-label="t('galio.shell.moreH', 'More')" class="sheet-list">
            <router-link :to="blogTo"><span class="ico"><gl-icon name="doc" /></span><span>{{ t("galio.shell.journal", "Journal") }}</span><small></small></router-link>
            <router-link :to="aboutTo"><span class="ico"><gl-icon name="store" /></span><span>{{ t("galio.shell.about", "About us") }}</span><small></small></router-link>
            <router-link :to="contactTo"><span class="ico"><gl-icon name="pin" /></span><span>{{ t("galio.shell.contactVisit", "Contact & visit") }}</span><small></small></router-link>
            <router-link :to="faqTo"><span class="ico"><gl-icon name="question" /></span><span>{{ t("galio.shell.questions", "Questions") }}</span><small></small></router-link>
            <router-link :to="accountTo"
              ><span class="ico"><gl-icon name="user" /></span><span>{{ user ? firstName || t("galio.shell.account", "Account") : t("galio.shell.account", "Account") }}</span><small>{{ user ? "" : t("galio.shell.signInLine", "Sign in or order as a guest") }}</small></router-link
            >
            <button v-if="regionOn" ref="regionRow" :aria-expanded="sheetRegion ? 'true' : 'false'" aria-haspopup="dialog" class="rs-row" type="button" @click.stop="openSheetRegion">
              <span class="ico"><gl-icon name="globe" /></span><span>{{ t("region.title", "Language & currency") }}</span><small>{{ regionLabel }}</small>
            </button>
          </nav>
          <div v-if="openText || facts.phone" class="sheet-foot">
            <span v-if="openText" class="ln"><gl-icon name="clock" /><span>{{ openText.join(", ") }}</span></span>
            <span v-if="facts.phone" class="ln"><gl-icon name="phone" /><a :href="telOf(facts.phone)" dir="ltr">{{ facts.phone }}</a></span>
          </div>
        </div>

        <!-- The language & currency sheet over the menu (phones) -->
        <template v-if="sheetRegion && regionOn">
          <div class="scrim scrim--region" @click="closeSheetRegion"></div>
          <div ref="regionSheet" :aria-label="t('region.title', 'Language & currency')" aria-modal="true" class="region-sheet rs-sheet" role="dialog" @keydown.esc.stop.prevent="closeSheetRegion">
            <div class="rs-head">
              <h2>{{ t("region.title", "Language & currency") }}</h2>
              <button :aria-label="t('galio.shell.close', 'Close')" class="x" type="button" @click="closeSheetRegion"><gl-icon name="x" /></button>
            </div>
            <region-chips :key="regionKey" @picked="closeSheetRegion" />
            <p>{{ regionNote }}</p>
          </div>
        </template>

        <!-- The region popover (the rail's pill) -->
        <div v-if="regionOn && is('gregion')" id="gregion" ref="gregion" :aria-label="t('region.title', 'Language & currency')" :style="popPos" class="region-pop rs-pop" role="dialog">
          <h3>{{ regionTitle }}</h3>
          <region-chips :key="regionKey" @picked="closeLayer()" />
          <p>{{ regionNote }}</p>
        </div>

        <!-- The collections menu beside the rail -->
        <gl-fly v-if="is('gshop')" />

        <!-- Search -->
        <gl-search v-if="is('gsrch')" @clear="$emit('clear')" @search="(e) => $emit('search', e)" />

        <!-- The bag -->
        <gl-bag-drawer />

        <!-- The quick look -->
        <gl-quick />
      </div>
    </teleport>
  </div>
</template>

<script>
import GlMark from "../GlMark.vue";
import GlIcon from "../GlIcon.vue";
import GlBagDrawer from "./GlBagDrawer.vue";
import GlSearch from "./GlSearch.vue";
import GlFly from "./GlFly.vue";
import GlQuick from "./GlQuick.vue";
import RegionChips from "../../region-switcher/RegionChips.vue";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { currencies, currentCurrency, currentLanguage, hasChoice, isRtl, languages, regionState, showLanguages } from "../../region-switcher/region";
import { journalRoute } from "../../kalio/pages/kalio-journal";
import { dealsRoute } from "../../kalio/kalio-catalog";
import { allOff, catTitle, catTo, closeLayer, closeOnRoute, fromPrice, layer, loadShop, money, openLayer, routes, shopAllTo, shopData, shopFacts, telOf, toggleLayer, wireLayers } from "../galio";
import { t } from "../../kalio/i18n/kalio-i18n";
import { bootJoins } from "./gl-joins";

export default {
  name: "GlShell",
  components: { GlMark, GlIcon, GlBagDrawer, GlSearch, GlFly, GlQuick, RegionChips },
  props: {
    showSearch: { type: Boolean, default: true },
  },
  emits: ["search", "clear"],

  data: () => ({ layer, data: shopData, region: regionState, moreOpen: false, sheetRegion: false, popPos: {} }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    user() {
      return this.$store.getters.getUser;
    },
    firstName() {
      return String(this.user?.name || "").split(/\s+/)[0].slice(0, 16);
    },
    facts() {
      return shopFacts(this.shop);
    },
    rtl() {
      void this.region.language;
      return isRtl();
    },
    off() {
      void this.data.ready;
      void this.region.currency;
      return allOff(this.shop);
    },
    cats() {
      return this.data.cats;
    },
    /* The rail lists the collections under Shop: all of them up to 8, else the first 7 and "All collections". */
    railCats() {
      return this.cats.length <= 8 ? this.cats : this.cats.slice(0, 7);
    },
    railMore() {
      return this.cats.length > 8;
    },
    /* The menu sheet: all up to 8, else the first 6 and "Show N more" (the owner's rule). */
    menuCats() {
      if (this.cats.length <= 8) return this.cats;
      return this.moreOpen ? this.cats : this.cats.slice(0, 6);
    },
    menuRest() {
      return this.cats.length <= 8 ? [] : this.cats.slice(6);
    },
    routeName() {
      return String(this.$route?.name || "");
    },
    currentCat() {
      return this.$route?.params?.category_name || null;
    },
    onHome() {
      return this.routeName === routes().SHOP_PAGE && !Object.keys(this.$route.query || {}).length && !this.currentCat;
    },
    onDeals() {
      return this.routeName === routes().SHOP_PAGE && /only_has_discount/.test(String(this.$route.query?.filter || "")) && !this.currentCat;
    },
    onShop() {
      if (this.onHome || this.onDeals) return false;
      return this.routeName === routes().SHOP_CATEGORY_PAGE || this.routeName === routes().SHOP_PAGE || this.routeName === routes().PRODUCT_PAGE || this.routeName === routes().COMPARISON_PAGE;
    },
    onJournal() {
      return this.routeName.toLowerCase().includes("blog");
    },
    onVisit() {
      return this.routeName === routes().SHOP_CONTACT_US;
    },
    onAccount() {
      return this.$route?.matched?.some((r) => String(r.path || "").includes("/user")) || /order/i.test(this.routeName);
    },
    units() {
      return this.getBaskets().reduce((sum, b) => sum + (b?.items || []).reduce((n, it) => n + (it.count || 0), 0), 0);
    },
    bagAria() {
      return t("galio.shell.bagAria", { one: "Bag, {n} piece", other: "Bag, {n} pieces" }, { n: this.units });
    },
    /* ["Open every day", "8:00–18:00"] from the shop's days and the counter's hours. */
    openText() {
      const f = this.facts;
      if (!f.days.length && !f.hours) return null;
      const days = f.everyDay ? t("galio.facts.everyDayShort", "Open every day") : t("galio.facts.daysShort", "Open {days}", { days: f.days.map((d) => d.slice(0, 3)).join(", ") });
      return f.hours ? [days, f.hours] : [days];
    },
    regionKey() {
      return t("region.title", "Language & currency") + this.region.words;
    },
    regionOn() {
      void this.shop;
      return hasChoice();
    },
    /* "EN · USD" (the mockup's pill), with the visitor's language and currency. */
    regionLabel() {
      void this.region.currency;
      void this.region.language;
      void this.shop;
      return `${currentLanguage().toUpperCase()} · ${currentCurrency()}`;
    },
    regionTitle() {
      void this.shop;
      return showLanguages() ? t("region.title", "Language & currency") : t("region.currency", "Currency");
    },
    regionNote() {
      void this.shop;
      void this.region.currency;
      const lang = languages().find((l) => l.code === currentLanguage());
      if (currencies().length <= 1 && !showLanguages())
        return t("galio.shell.sellsIn", "{shop} sells in {language} and in {currency}. Other currencies and languages show here when the shop adds them.", {
          shop: this.shop?.title ? this.shop.title.charAt(0).toUpperCase() + this.shop.title.slice(1) : "",
          language: lang?.title || "",
          currency: currentCurrency(),
        });
      return t("region.note", "Prices everywhere change at once: cards, filters, bag and checkout.");
    },
    shopAllTo() {
      return shopAllTo();
    },
    dealsTo() {
      return dealsRoute();
    },
    blogTo() {
      return journalRoute();
    },
    accountTo() {
      return { name: "KalioAccountHome" };
    },
    aboutTo() {
      return { name: routes().SHOP_PROFILE_PAGE_ABOUT_US };
    },
    contactTo() {
      return { name: routes().SHOP_CONTACT_US };
    },
    faqTo() {
      return this.$router.hasRoute("ShopFAQ") ? { name: "ShopFAQ" } : this.contactTo;
    },
  },

  watch: {
    "layer.open"(id) {
      if (id === "gregion") this.$nextTick(() => this.placePop());
      if (id === "pmenu") this.$nextTick(() => this.$refs.sheetX?.focus({ preventScroll: true }));
      if (id !== "pmenu") {
        this.moreOpen = false;
        this.sheetRegion = false;
      }
    },
  },

  created() {
    loadShop();
    wireLayers();
    closeOnRoute(this.$router);
  },

  mounted() {
    /* Awning (1.0.4): the rounded joins where a band meets the rail beside white page */
    bootJoins();
    this.onResize = () => {
      if (this.layer.open === "gregion") this.placePop();
      /* A layer of the other size closes when the window crosses the rail's breakpoint. */
      if (window.innerWidth >= 1100 && this.layer.open === "pmenu") closeLayer(true);
      if (window.innerWidth < 1100 && (this.layer.open === "gshop" || this.layer.open === "gregion")) closeLayer(true);
    };
    window.addEventListener("resize", this.onResize, { passive: true });
    /* Any part of the page can open the bag. */
    this.openBag = () => openLayer("drawer");
    EventBus.$on("bakini:open-cart", this.openBag);
    EventBus.$on("galio:open-cart", this.openBag);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
    EventBus.$off("bakini:open-cart", this.openBag);
    EventBus.$off("galio:open-cart", this.openBag);
  },

  methods: {
    t,
    catTitle,
    catTo,
    telOf,
    closeLayer,
    is(id) {
      return this.layer.open === id;
    },
    toggle(id, e) {
      toggleLayer(id, e?.currentTarget || null);
    },
    fromOf(c) {
      void this.region.currency;
      const f = fromPrice(this.shop, c.id);
      return f ? money(f.now) : "";
    },
    /* Beside its pill, never within 12px of an edge; above it when there is no room below. */
    placePop() {
      const btn = document.querySelector('.gl-shell [aria-controls="gregion"]');
      const el = this.$refs.gregion;
      if (!btn || !el) return;
      const r = btn.getBoundingClientRect();
      const w = el.offsetWidth || 248;
      const h = el.offsetHeight || 160;
      let left = this.rtl ? r.right - w : r.left;
      left = Math.min(Math.max(12, left), window.innerWidth - w - 12);
      let top = r.bottom + 8;
      if (top + h > window.innerHeight - 12) top = Math.max(12, r.top - h - 8);
      this.popPos = { left: `${left}px`, top: `${top}px` };
      this.$nextTick(() => el.querySelector("button[aria-checked='true'], button")?.focus({ preventScroll: true }));
    },
    openSheetRegion() {
      this.sheetRegion = true;
      this.$nextTick(() => this.$refs.regionSheet?.querySelector("button[aria-checked='true'], .rs-chip, button")?.focus({ preventScroll: true }));
    },
    closeSheetRegion() {
      this.sheetRegion = false;
      this.$nextTick(() => this.$refs.regionRow?.focus({ preventScroll: true }));
    },
    skip() {
      const m = document.getElementById("main") || document.querySelector("main");
      if (m) {
        m.setAttribute("tabindex", "-1");
        m.focus();
      }
    },
  },
};
</script>
