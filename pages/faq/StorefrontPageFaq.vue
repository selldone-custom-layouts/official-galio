<!--
  Galio Sundae — Questions (galio-design/faq-b.html): the straw title band; the shop's own questions
  (Selldone's FAQ, grouped by their first tag) as an accordion, the first one open; else sample
  questions written from the shop's facts, under the label "Sample text — the shop has not written
  this page yet"; beside them "Still a question?" with the shop's phone, email and hours.
-->
<template>
  <div class="gl gl-faq">
    <gl-ptitle :crumbs="crumbs" :h1="t('galio.fq.h1', 'Questions')" :kick="t('galio.fq.kick', 'good to know')" band="straw">
      <p v-if="!busy && !own" class="pt-lede"><gl-sample /></p>
    </gl-ptitle>
    <section class="sec sec--tight bg-white">
      <div class="wrap faqw">
        <div class="faq">
          <template v-if="!busy">
            <div v-for="g in grouped" :key="g.name" class="fq-g">
              <h2 v-if="g.name">{{ g.name }}</h2>
              <ul class="fq-list">
                <li v-for="q in g.items" :key="q.key" class="fq">
                  <h3>
                    <button :id="'gl-fq-' + q.key" :aria-controls="'gl-fa-' + q.key" :aria-expanded="isOpen(q) ? 'true' : 'false'" class="fq-q" type="button" @click="toggle(q)">
                      <span>{{ q.q }}</span><span class="fq-ic"><gl-icon :name="isOpen(q) ? 'minus' : 'plus'" /></span>
                    </button>
                  </h3>
                  <div :id="'gl-fa-' + q.key" :aria-labelledby="'gl-fq-' + q.key" :hidden="!isOpen(q)" class="fq-a" role="region">
                    <div v-if="q.html" class="gl-own prose" v-html="q.a"></div>
                    <p v-else>{{ q.a }}</p>
                  </div>
                </li>
              </ul>
            </div>
          </template>
          <div v-else aria-hidden="true" class="gl-fq-skel"><i v-for="n in 4" :key="n"></i></div>
        </div>
        <aside class="fq-side">
          <span class="empty-ic"><gl-icon name="chat" /></span>
          <h2>{{ t("galio.fq.stillH", "Still a question?") }}</h2>
          <p>{{ stillP }}</p>
          <router-link :to="{ name: contactRoute }" class="btn">{{ t("galio.ab.contact", "Contact the bakery") }}</router-link>
        </aside>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import GlIcon from "@app-storefront/components/galio/GlIcon.vue";
import GlPtitle from "@app-storefront/components/galio/GlPtitle.vue";
import GlSample from "@app-storefront/components/galio/read/GlSample.vue";
import { money, shopFacts } from "@app-storefront/components/galio/galio";
import { guestCheckout, sampleFaq } from "@app-storefront/components/galio/gl-read";
import { withRetry } from "@app-storefront/components/bakini/bakini";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

export default {
  name: "StorefrontPageFaq",
  components: { GlIcon, GlPtitle, GlSample },
  props: { shop: { type: Object } },

  data: () => ({ faqs: [] as any[], busy: true, group: "", open: {} as Record<string, boolean>, touched: false }),

  computed: {
    theShop() {
      return this.$store.getters.getShop || this.shop;
    },
    f() {
      return shopFacts(this.theShop);
    },
    own() {
      return this.faqs.length > 0;
    },
    /* The shop's questions (its first tag is the topic), else the sample. */
    items() {
      if (this.own)
        return this.faqs.map((x: any) => ({
          key: "f" + x.id,
          group: (x.tags && x.tags[0]) || "",
          q: x.question,
          a: x.answer || "",
          html: /<[a-z][\s\S]*>/i.test(String(x.answer || "")),
        }));
      return sampleFaq(this.theShop, this.f, (n: number) => money(n, true), guestCheckout(this.theShop)).map((x, i) => ({ key: "s" + i, group: x.group, q: x.q, a: x.a, html: false }));
    },
    /* The questions under their topics, in the order the shop gave them. */
    grouped() {
      const out: { name: string; items: any[] }[] = [];
      for (const q of this.items) {
        let g = out.find((x) => x.name === q.group);
        if (!g) out.push((g = { name: q.group, items: [] }));
        g.items.push(q);
      }
      return out;
    },
    crumbs() {
      return [[t("galio.crumb.home", "Home"), { path: "/" }], [t("galio.fq.h1", "Questions")]];
    },
    stillP() {
      const f = this.f;
      const parts: string[] = [];
      if (f.phone && f.email) parts.push(t("galio.fq.callWrite", "Call {phone} or write to {email}.", { phone: f.phone, email: f.email }));
      else if (f.phone) parts.push(t("galio.fq.call", "Call {phone}.", { phone: f.phone }));
      else if (f.email) parts.push(t("galio.fq.write", "Write to {email}.", { email: f.email }));
      if (f.pickup && f.hours) parts.push(f.everyDay ? t("galio.fq.openEvery", "The counter is open every day {hours}.", { hours: f.hours }) : t("galio.fq.openHours", "The counter is open {hours}.", { hours: f.hours }));
      return parts.join(" ") || t("galio.fq.stillP", "The bakery answers about orders, ingredients and allergens.");
    },
    contactRoute() {
      return window.$storefront.routes.SHOP_CONTACT_US;
    },
  },

  created() {
    this.setPageTitle?.(t("galio.fq.h1", "Questions"));
    withRetry(() => window.axios.get(window.XAPI.GET_FAQ(this.theShop.name), { params: { offset: 0, limit: 50 } }))
      .then(({ data }: any) => (this.faqs = data?.faqs || []))
      .catch(() => (this.faqs = []))
      .finally(() => (this.busy = false));
  },

  methods: {
    t,
    /* The first question starts open; the shopper opens and closes the rest. */
    isOpen(q: any) {
      if (q.key in this.open) return this.open[q.key];
      return !this.touched && this.items[0]?.key === q.key;
    },
    toggle(q: any) {
      const now = this.isOpen(q);
      this.open = { ...this.open, [q.key]: !now };
    },
  },
};
</script>
