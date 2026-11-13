<!--
  Galio Sundae — Contact & visit (galio-design/contact-b.html): the mint title band; four lemon blocks
  (Visit with directions, Call, Write, Hours) from the shop's own facts; the photo slot beside "Send a
  message" (Selldone's contact form: name, email, message; honest errors and a thank-you); then the
  real map with the counter's card. The shop's own "contact us" text, when it has one, sits above
  the form.
-->
<template>
  <div class="gl gl-contact">
    <gl-ptitle :crumbs="crumbs" :h1="t('galio.ct.h1', 'Contact & visit')" :kick="t('galio.ct.kick', 'say hello')" :lede="lede" band="mint" />
    <section class="sec sec--tight bg-white">
      <div class="wrap">
        <ul class="cblocks">
          <li v-if="f.address" class="cblock">
            <span class="cb-ic"><gl-icon name="pin" /></span>
            <h2>{{ t("galio.ct.visit", "Visit") }}</h2>
            <p><bdi>{{ fullAddress }}</bdi></p>
            <a v-if="directions" :href="directions" class="link link--sm" rel="noopener" target="_blank">{{ t("galio.home.directions", "Get directions") }}<gl-icon name="arrow" /></a>
          </li>
          <li v-if="f.phone" class="cblock">
            <span class="cb-ic"><gl-icon name="phone" /></span>
            <h2>{{ t("galio.ct.call", "Call") }}</h2>
            <p dir="ltr">{{ f.phone }}</p>
            <a :href="telOf(f.phone)" class="link link--sm">{{ t("galio.ct.callBakery", "Call the bakery") }}<gl-icon name="arrow" /></a>
          </li>
          <li v-if="f.email" class="cblock">
            <span class="cb-ic"><gl-icon name="mail" /></span>
            <h2>{{ t("galio.ct.write", "Write") }}</h2>
            <p>{{ f.email }}</p>
            <a :href="'mailto:' + f.email" class="link link--sm">{{ t("galio.ct.sendEmail", "Send an email") }}<gl-icon name="arrow" /></a>
          </li>
          <li v-if="open" class="cblock">
            <span class="cb-ic"><gl-icon name="clock" /></span>
            <h2>{{ t("galio.ct.hours", "Hours") }}</h2>
            <p>{{ open }}</p>
            <span v-if="counterNote" class="cb-note">{{ counterNote }}</span>
          </li>
        </ul>

        <div class="cform-row">
          <div class="cf-ph">
            <div :class="['ph', 'cf-photo', { '-photo': tablePhoto }]">
              <img v-if="tablePhoto" :src="tablePhoto" alt="" class="ph-img" loading="lazy" />
              <gl-cuts v-else :items="picks" class="-banner -square" />
            </div>
          </div>
          <form class="cform" novalidate @submit.prevent="send">
            <span aria-hidden="true" class="kick">{{ t("galio.ct.formKick", "write to us") }}</span>
            <h2 class="h3x">{{ t("galio.ct.formH", "Send a message") }}</h2>
            <div v-if="own" class="gl-own prose" v-html="ownHtml"></div>
            <p v-else class="cf-sub">{{ t("galio.ct.formSub", "About an order, a question on allergens, or anything else.") }}</p>
            <template v-if="!sent">
              <div class="fgrid">
                <div class="fld">
                  <label for="gl-c-name">{{ t("galio.ct.name", "Your name") }}</label>
                  <input id="gl-c-name" v-model.trim="form.name" :aria-describedby="errs.name ? 'gl-c-e-name' : undefined" :aria-invalid="errs.name ? 'true' : undefined" autocomplete="name" name="name" />
                  <span v-if="errs.name" id="gl-c-e-name" class="err">{{ errs.name }}</span>
                </div>
                <div class="fld">
                  <label for="gl-c-mail">{{ t("galio.ct.email", "Email") }}</label>
                  <input id="gl-c-mail" v-model.trim="form.email" :aria-describedby="errs.email ? 'gl-c-e-mail' : undefined" :aria-invalid="errs.email ? 'true' : undefined" autocomplete="email" name="email" type="email" />
                  <span v-if="errs.email" id="gl-c-e-mail" class="err">{{ errs.email }}</span>
                </div>
                <div class="fld full">
                  <label for="gl-c-msg">{{ t("galio.ct.message", "Message") }}</label>
                  <textarea id="gl-c-msg" v-model="form.message" :aria-describedby="errs.message ? 'gl-c-e-msg' : undefined" :aria-invalid="errs.message ? 'true' : undefined" name="message"></textarea>
                  <span v-if="errs.message" id="gl-c-e-msg" class="err">{{ errs.message }}</span>
                </div>
              </div>
              <p v-if="failed" class="err" role="alert">{{ failed }}</p>
              <button :disabled="busy" class="btn" type="submit"><gl-icon name="send" />{{ t("galio.ct.send", "Send the message") }}</button>
            </template>
            <div v-else class="lg-ok" role="status">
              <b>{{ t("galio.ct.thanks", "Thank you.") }}</b>
              {{ t("galio.ct.sentP", "Your message is on its way. The bakery replies at the email you gave.") }}
              <button class="link link--sm" type="button" @click="sent = false">{{ t("galio.ct.another", "Send another message") }}</button>
            </div>
          </form>
        </div>
      </div>
    </section>

    <section v-if="f.location || f.address" aria-labelledby="gl-h-find" class="sec sec--tight bg-sky">
      <div class="wrap">
        <h2 id="gl-h-find" class="vh">{{ t("galio.ct.find", "Find the counter") }}</h2>
        <div class="cmap">
          <gl-map :location="f.location" :place="mapPlace" />
          <div class="visit-card">
            <h3><bdi>{{ visitTitle }}</bdi></h3>
            <ul class="facts">
              <li v-if="f.address">
                <gl-icon name="pin" /><span
                  ><bdi>{{ fullAddress }}</bdi><small v-if="counterNote">{{ counterNote }}</small></span
                >
              </li>
              <li v-if="open">
                <gl-icon name="clock" /><span>{{ open }}<small v-if="f.pickup && f.pickup.fee === 0">{{ t("galio.home.pickupFree", "Pickup is free") }}</small></span>
              </li>
              <li v-if="f.phone">
                <gl-icon name="phone" /><span><a :href="telOf(f.phone)" dir="ltr">{{ f.phone }}</a></span>
              </li>
              <li v-if="f.email">
                <gl-icon name="mail" /><span><a :href="'mailto:' + f.email">{{ f.email }}</a></span>
              </li>
            </ul>
            <div class="acts">
              <a v-if="directions" :href="directions" class="btn" rel="noopener" target="_blank">{{ t("galio.home.directions", "Get directions") }}</a>
              <router-link :to="{ name: 'ShopFAQ' }" class="btn btn--ghost">{{ t("galio.ct.questions", "Questions") }}</router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import GlIcon from "@app-storefront/components/galio/GlIcon.vue";
import GlPtitle from "@app-storefront/components/galio/GlPtitle.vue";
import GlCuts from "@app-storefront/components/galio/home/GlCuts.vue";
import GlMap from "@app-storefront/components/galio/home/GlMap.vue";
import { bySells, catsBySells, directionsTo, inCat, loadShop, openLine, shopData, shopFacts, shortAddress, streetOf, telOf } from "@app-storefront/components/galio/galio";
import { photo } from "@app-storefront/components/galio/gl-photos";
import { cityLine, ownText, shopName, shopProfile } from "@app-storefront/components/galio/gl-read";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

export default {
  name: "StorefrontPageOfficialContactUs",
  components: { GlIcon, GlPtitle, GlCuts, GlMap },
  inject: ["$shop"],

  data: () => ({
    profile: null as any,
    data: shopData,
    form: { name: "", email: "", message: "" },
    errs: { name: "", email: "", message: "" } as Record<string, string>,
    busy: false,
    sent: false,
    failed: "",
  }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    f() {
      return shopFacts(this.shop);
    },
    name() {
      return shopName(this.shop);
    },
    street() {
      return streetOf(this.f);
    },
    crumbs() {
      return [[t("galio.crumb.home", "Home"), { path: "/" }], [t("galio.ct.crumb", "Contact")]];
    },
    /* "1 The Embarcadero, San Francisco, CA 94111". */
    fullAddress() {
      return [this.street, cityLine(this.f)].filter(Boolean).join(", ") || this.f.address;
    },
    counterNote() {
      const note = String(this.f.pickupNote || "").trim();
      if (!note) return "";
      const first = note.split(/(?<=\.)\s/)[0];
      return /\d{1,2}[:.]\d{2}/.test(first) ? "" : first.replace(/\.$/, "");
    },
    visitTitle() {
      const p = this.f.pickupPoint;
      return p?.name || p?.title || [this.name, this.f.city].filter(Boolean).join(" ");
    },
    mapPlace() {
      return shortAddress(this.f) || this.name;
    },
    directions() {
      return directionsTo(this.f);
    },
    tablePhoto() {
      return photo("galio-mosaic-table.webp");
    },
    /* One best seller from each of three collections, for the drawn photo slot. */
    picks() {
      void this.data.products.length;
      return catsBySells()
        .map((c: any) => bySells(inCat(c.id))[0])
        .filter(Boolean)
        .slice(0, 3);
    },
    open() {
      return openLine(this.f);
    },
    lede() {
      return this.f.pickup
        ? t("galio.ct.lede", "Call, write or come by the counter. The bakery answers every message.")
        : t("galio.ct.lede0", "Call or write to the bakery. It answers every message.");
    },
    own() {
      return ownText(this.profile?.body);
    },
    ownHtml() {
      return String(this.profile?.body || "").replace(/\scontenteditable="[^"]*"/g, "");
    },
  },

  created() {
    loadShop();
    this.setPageTitle?.(t("galio.ct.crumb", "Contact"));
    shopProfile(this.$shop.name, "contact-us").then((p) => (this.profile = p));
    const u = this.USER?.();
    if (u) {
      this.form.name = u.name || "";
      this.form.email = u.email || "";
    }
  },

  methods: {
    t,
    telOf,
    check() {
      const f = this.form;
      this.errs = {
        name: f.name.length > 1 ? "" : t("galio.ct.errName", "Add your name"),
        email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email) ? "" : f.email ? t("galio.ct.errEmailBad", "Check the email address") : t("galio.ct.errEmail", "Add your email"),
        message: f.message.trim().length > 3 ? "" : t("galio.ct.errMessage", "Write a message"),
      };
      const first = ["name", "email", "message"].find((k) => this.errs[k]);
      if (first) (this.$el.querySelector(`.cform [name="${first}"]`) as HTMLElement | null)?.focus();
      return !first;
    },
    send() {
      this.failed = "";
      if (!this.check()) return;
      this.busy = true;
      window.axios
        .post(window.XAPI.POST_CONTACT_US_FORM(this.$shop.name), {
          name: this.form.name,
          email: this.form.email,
          phone: this.USER?.()?.phone || null,
          message: this.form.message.trim(),
          category: "Contact",
          url: window.location.href,
        })
        .then(({ data }: any) => {
          if (data?.error) {
            this.failed = t("galio.ct.failed", "That did not go through. Please try again.");
            return;
          }
          this.form.message = "";
          this.sent = true;
        })
        .catch(() => (this.failed = t("galio.ct.failedLater", "That did not go through. Please try again in a moment.")))
        .finally(() => (this.busy = false));
    },
  },
};
</script>
