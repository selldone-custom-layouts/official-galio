<!--
  Galio Sundae — the footer (galio-design/g/home.js footer()): the cocoa band with the wordmark, one
  line about the shop (its address and days, from its own data), the newsletter (Selldone's own
  audience list, the same endpoint as the page builder's newsletter form, with honest success and error
  words), the links, the phone and email; then the Theme strip (the owner's rule of 10 November 2026:
  palettes, a custom colour and Light / Dark in a band of its own above the legal row; the kit's
  ThemeSwitcherRow, only on the showcase shop); then the legal row: the copyright, the way to pay and
  the ways an order travels, the shop's social links, Selldone's cookie settings and a small credit.
  A shop with custom footer code keeps Selldone's footer.
-->
<template>
  <div :dir="rtl ? 'rtl' : 'ltr'" class="gl gl-ftr">
    <footer class="foot">
      <div class="wrap foot-in">
        <gl-mark />
        <p v-if="footLine" class="foot-line">{{ footLine }}</p>
        <form class="news" novalidate @submit.prevent="subscribe">
          <label :for="mailId">{{ t("galio.ftr.newsLabel", "New pastries and journal notes by email") }}</label>
          <input
            :id="mailId"
            :aria-describedby="state ? mailId + '-msg' : undefined"
            :aria-invalid="state === 'invalid' ? 'true' : undefined"
            :placeholder="t('galio.ftr.newsPh', 'Your email address')"
            :value="email"
            autocomplete="email"
            inputmode="email"
            type="email"
            @input="onInput"
          />
          <button :disabled="state === 'busy'" class="btn" type="submit">{{ state === "busy" ? t("galio.ftr.sending", "Sending…") : t("galio.ftr.send", "Send") }}</button>
          <span :id="mailId + '-msg'" :class="['ok', state ? '-' + state : '']" aria-live="polite">{{ message }}</span>
        </form>
        <nav :aria-label="t('galio.ftr.links', 'Footer')" class="foot-links">
          <router-link v-for="l in links" :key="l.key" :to="l.to">{{ l.name }}</router-link>
        </nav>
        <div v-if="facts.phone || facts.email" class="foot-contact">
          <a v-if="facts.phone" :href="telOf(facts.phone)" dir="ltr"><gl-icon name="phone" />{{ facts.phone }}</a>
          <a v-if="facts.email" :href="'mailto:' + facts.email"><gl-icon name="mail" />{{ facts.email }}</a>
        </div>
      </div>

      <!-- The theme switcher (the owner, 10 November 2026: in the footer on every Layout), only on the
           Layout's showcase shop. -->
      <div v-if="theme.enabled" class="theme-strip">
        <div class="wrap"><theme-switcher-row /></div>
      </div>

      <div class="legal">
        <div class="wrap legal-in">
          <span class="gl-legal-sd">
            <span>© {{ year }} <bdi>{{ shopName }}</bdi></span>
            <s-storefront-social-buttons class="gl-social"></s-storefront-social-buttons>
            <s-footer-section-gdpr class="gl-gdpr"></s-footer-section-gdpr>
            <s-footer-section-selldone class="gl-made"></s-footer-section-selldone>
          </span>
          <span v-if="waysLine">{{ waysLine }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import GlMark from "../GlMark.vue";
import GlIcon from "../GlIcon.vue";
import ThemeSwitcherRow from "../../theme-switcher/ThemeSwitcherRow.vue";
import { themeState } from "../../theme-switcher/theme-switcher";
import SStorefrontSocialButtons from "@selldone/components-vue/storefront/social/SStorefrontSocialButtons.vue";
import SFooterSectionGdpr from "@selldone/components-vue/storefront/footer/section/gdpr/SFooterSectionGdpr.vue";
import SFooterSectionSelldone from "@selldone/components-vue/storefront/footer/section/selldone/SFooterSectionSelldone.vue";
import { journalRoute } from "../../kalio/pages/kalio-journal";
import { isRtl, regionState } from "../../region-switcher/region";
import { loadShop, openLine, routes, shopAllTo, shopFacts, shopName, shortAddress, telOf } from "../galio";
import { t } from "../../kalio/i18n/kalio-i18n";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default {
  name: "GlFooter",
  components: { GlMark, GlIcon, ThemeSwitcherRow, SStorefrontSocialButtons, SFooterSectionGdpr, SFooterSectionSelldone },
  data: () => ({ theme: themeState, region: regionState, email: "", state: "", message: "", mailId: "gl-news-" + Math.random().toString(36).slice(2, 8) }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    rtl() {
      void this.region.language;
      return isRtl();
    },
    facts() {
      return shopFacts(this.shop);
    },
    shopName() {
      return shopName(this.shop);
    },
    year() {
      return new Date().getFullYear();
    },
    /* "A pâtisserie at 1 The Embarcadero, San Francisco. Open every day, 8:00–18:00." */
    footLine() {
      const at = shortAddress(this.facts);
      const open = openLine(this.facts);
      return [at ? t("galio.ftr.at", "A pâtisserie at {address}.", { address: at }) : "", open ? open + "." : ""].filter(Boolean).join(" ");
    },
    links() {
      const r = routes();
      const out = [
        { key: "home", name: t("galio.ftr.home", "Home"), to: { path: "/" } },
        { key: "shop", name: t("galio.ftr.shop", "Shop"), to: shopAllTo() },
        { key: "journal", name: t("galio.ftr.journal", "Journal"), to: journalRoute() },
        { key: "about", name: t("galio.ftr.about", "About us"), to: { name: r.SHOP_PROFILE_PAGE_ABOUT_US } },
        { key: "contact", name: t("galio.ftr.contact", "Contact"), to: { name: r.SHOP_CONTACT_US } },
      ];
      if (this.$router.hasRoute("ShopFAQ")) out.push({ key: "faq", name: t("galio.ftr.faq", "FAQ"), to: { name: "ShopFAQ" } });
      out.push({ key: "privacy", name: t("galio.ftr.privacy", "Privacy"), to: { name: r.SHOP_PROFILE_PAGE_PRIVACY } });
      out.push({ key: "terms", name: t("galio.ftr.terms", "Terms of use"), to: { name: r.SHOP_PROFILE_PAGE_TERMS } });
      return out;
    },
    /* "Cash on delivery · Courier · Pickup · Worldwide shipping", from the shop's own gateway and ways. */
    waysLine() {
      const f = this.facts;
      const parts = [];
      if (f.gateway?.name) parts.push(f.gateway.name);
      if (f.courier) parts.push(t("galio.ftr.courier", "Courier"));
      if (f.pickup) parts.push(t("galio.ftr.pickup", "Pickup"));
      if (f.shipping) parts.push(f.shipping.type === "Global" ? t("galio.ftr.worldwide", "Worldwide shipping") : t("galio.ftr.shipping", "Shipping"));
      return parts.join(" · ");
    },
  },
  created() {
    loadShop();
  },
  methods: {
    t,
    telOf,
    onInput(e) {
      this.email = e.target.value;
      if (this.state === "invalid" || this.state === "error") {
        this.state = "";
        this.message = "";
      }
    },
    /* Selldone's newsletter list (the page builder's newsletter form posts the same): the address joins
       the shop's "newsletter" audience. The words say only what the server answered. */
    async subscribe() {
      const email = this.email.trim();
      if (!EMAIL.test(email)) {
        this.state = "invalid";
        this.message = t("galio.ftr.newsInvalid", "Type an email address, then press Send.");
        return;
      }
      if (!this.shop?.id || !window.XAPI?.POST_STREAM_USER_ADD_NEWSLETTER) {
        this.state = "error";
        this.message = t("galio.ftr.newsDown", "The list can't be reached right now. Try again in a moment.");
        return;
      }
      this.state = "busy";
      this.message = "";
      try {
        const { data } = await window.axios.post(window.XAPI.POST_STREAM_USER_ADD_NEWSLETTER(this.shop.id, "newsletter"), { email, tags: ["newsletter"] });
        if (data?.error) throw new Error(data.error_msg || "error");
        this.state = "ok";
        this.message = t("galio.ftr.newsOk", "Thanks. {email} is on the list for new pastries and journal notes.", { email });
        this.email = "";
      } catch (e) {
        const msg = e?.response?.data?.error_msg || e?.response?.data?.message || "";
        this.state = "error";
        this.message = msg
          ? t("galio.ftr.newsErrorMsg", "That didn't go through: {reason}", { reason: msg })
          : t("galio.ftr.newsError", "That didn't go through. Check the address and try again in a moment.");
      }
    },
  },
};
</script>
