<!--
  Galio Sundae — Terms of use and Privacy (galio-design/terms-b.html, privacy-b.html). The shop's own
  text (Selldone's shop profiles "terms" and "privacy") when it has written one, with its own headings
  as the index. Otherwise a sample written only from the shop's live facts, with the label "Sample
  text — the shop has not written this page yet": Terms as numbered sections beside a sticky index;
  Privacy as four "at a glance" cards, then the sections behind a row of chips.
-->
<template>
  <div :class="['gl', 'gl-legal', '-' + kind]">
    <gl-ptitle :band="kind === 'terms' ? 'lemon' : 'sky'" :crumbs="crumbs" :h1="h1" :kick="kick">
      <p v-if="!busy" class="pt-lede">
        <gl-sample v-if="!own" /><template v-else>{{ updated ? t("galio.lg.updated", "Last updated {date}", { date: updated }) : "" }}</template>
      </p>
    </gl-ptitle>

    <!-- The shop's own text, its headings as the index -->
    <section v-if="own" class="sec sec--tight bg-white">
      <div :class="['wrap', toc.length > 1 ? 'legaldoc' : 'gl-legal-one']">
        <nav v-if="toc.length > 1" :aria-label="t('galio.lg.sections', 'Sections')" class="toc">
          <h2>{{ t("galio.lg.sections", "Sections") }}</h2>
          <ol>
            <li v-for="(s, i) in toc" :key="s.id">
              <a :aria-current="active === s.id ? 'true' : undefined" :href="'#' + s.id" @click.prevent="jump(s.id)"
                ><span class="toc-n">{{ i + 1 }}</span><span>{{ s.title }}</span></a
              >
            </li>
          </ol>
        </nav>
        <div ref="own" class="ld-body gl-own prose" v-html="ownHtml"></div>
      </div>
    </section>

    <!-- Terms: numbered sections with an index -->
    <section v-else-if="kind === 'terms'" class="sec sec--tight bg-white">
      <div class="wrap legaldoc">
        <nav :aria-label="t('galio.lg.sections', 'Sections')" class="toc">
          <h2>{{ t("galio.lg.sections", "Sections") }}</h2>
          <ol>
            <li v-for="(s, i) in sections" :key="i">
              <a :aria-current="active === 't' + (i + 1) ? 'true' : undefined" :href="'#t' + (i + 1)" @click.prevent="jump('t' + (i + 1))"
                ><span class="toc-n">{{ i + 1 }}</span><span>{{ s.title }}</span></a
              >
            </li>
          </ol>
        </nav>
        <div class="ld-body">
          <section v-for="(s, i) in sections" :id="'t' + (i + 1)" :key="i" class="ld-sec">
            <h2><span class="ld-n">{{ i + 1 }}</span>{{ s.title }}</h2>
            <p>{{ s.text }}</p>
          </section>
          <p class="ld-foot">
            {{ t("galio.lg.questions", "Questions?") }} <router-link :to="contactTo" class="link">{{ t("galio.ab.contact", "Contact the bakery") }}<gl-icon name="arrow" /></router-link>
          </p>
        </div>
      </div>
    </section>

    <!-- Privacy: at a glance, then the sections behind chips -->
    <template v-else>
      <section aria-labelledby="gl-h-glance" class="sec sec--tight bg-white">
        <div class="wrap">
          <h2 id="gl-h-glance" class="h3x">{{ t("galio.lg.glance", "At a glance") }}</h2>
          <ul class="glance">
            <li v-for="g in glance" :key="g.icon">
              <span class="empty-ic"><gl-icon :name="g.icon" /></span>
              <h3>{{ g.title }}</h3>
              <p>{{ g.text }}</p>
            </li>
          </ul>
        </div>
      </section>
      <section class="sec sec--tight bg-straw">
        <div class="wrap privdoc">
          <nav :aria-label="t('galio.lg.onPage', 'On this page')" class="pchips">
            <span class="pk">{{ t("galio.lg.onPage", "On this page") }}</span>
            <div class="chips">
              <a v-for="(s, i) in sections" :key="i" :href="'#p' + (i + 1)" class="chip" @click.prevent="jump('p' + (i + 1))">{{ s.title }}</a>
            </div>
          </nav>
          <section v-for="(s, i) in sections" :id="'p' + (i + 1)" :key="i" class="pv-sec">
            <h2>{{ s.title }}</h2>
            <p>{{ s.text }}</p>
          </section>
        </div>
      </section>
    </template>
  </div>
</template>

<script lang="ts">
import GlIcon from "../GlIcon.vue";
import GlPtitle from "../GlPtitle.vue";
import GlSample from "./GlSample.vue";
import { money, shopFacts } from "../galio";
import { guestCheckout, ownText, samplePrivacy, sampleTerms, shopProfile } from "../gl-read";
import { currentCurrency } from "../../region-switcher/region";
import { formatDate, t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "GlLegal",
  components: { GlIcon, GlPtitle, GlSample },
  inject: ["$shop"],
  props: {
    /** "terms" | "privacy" */
    kind: { type: String, required: true },
  },

  data: () => ({ profile: null as any, busy: true, toc: [] as { id: string; title: string }[], active: "" }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    f() {
      return shopFacts(this.shop);
    },
    guest() {
      return guestCheckout(this.shop);
    },
    own() {
      return ownText(this.profile?.body);
    },
    ownHtml() {
      return String(this.profile?.body || "").replace(/\scontenteditable="[^"]*"/g, "");
    },
    updated() {
      if (!this.own) return "";
      const d = this.profile?.updated_at || this.profile?.created_at;
      return d ? formatDate(d) : "";
    },
    h1() {
      return this.kind === "terms" ? t("galio.lg.termsH", "Terms of use") : t("galio.lg.privH", "Privacy");
    },
    kick() {
      return this.kind === "terms" ? t("galio.lg.termsKick", "the small print") : t("galio.lg.privKick", "your details");
    },
    crumbs() {
      return [[t("galio.crumb.home", "Home"), { path: "/" }], [this.h1]];
    },
    sections() {
      return this.kind === "terms" ? sampleTerms(this.shop, this.f, (n: number) => money(n, true), currentCurrency()) : samplePrivacy(this.f);
    },
    /* Privacy at a glance, from the shop's facts. */
    glance() {
      const f = this.f;
      const ask = f.email || f.phone;
      return [
        { icon: "user", title: t("galio.lg.gKeepT", "What we keep"), text: t("galio.lg.gKeep", "Your name, email, phone and delivery address, and the orders you place.") },
        { icon: "box", title: t("galio.lg.gWhyT", "Why"), text: f.pickup ? t("galio.lg.gWhy", "To prepare, deliver or hand over your order, and to answer your messages.") : t("galio.lg.gWhy0", "To prepare and deliver your order, and to answer your messages.") },
        { icon: "lock", title: t("galio.lg.gWhoT", "Who sees it"), text: t("galio.lg.gWho", "The bakery and the courier who brings your order. Nothing is sold.") },
        {
          icon: "edit",
          title: t("galio.lg.gChoiceT", "Your choice"),
          text: ask ? t("galio.lg.gChoice", "Ask the bakery to see, correct or delete your details at any time.") : t("galio.lg.gChoice0", "Your details can be corrected or deleted on request."),
        },
      ];
    },
    contactTo() {
      return { name: window.$storefront.routes.SHOP_CONTACT_US };
    },
  },

  created() {
    this.setPageTitle?.(this.h1);
    shopProfile(this.$shop.name, this.kind).then((p) => {
      this.profile = p;
      this.busy = false;
      this.$nextTick(() => this.index());
    });
  },

  mounted() {
    this.$nextTick(() => this.follow());
  },

  beforeUnmount() {
    this.io?.disconnect();
  },

  methods: {
    t,
    /* The shop's own headings become the index. */
    index() {
      const root = this.$refs.own as HTMLElement | undefined;
      if (root) {
        const heads = [...root.querySelectorAll("h2")];
        const list = heads.length > 1 ? heads : [...root.querySelectorAll("h3")];
        this.toc = list.map((el, i) => {
          el.id = `l${i + 1}`;
          el.classList.add("ld-anchor");
          return { id: el.id, title: (el.textContent || "").trim() };
        });
      }
      this.$nextTick(() => this.follow());
    },
    /* The index follows the section being read. */
    follow() {
      this.io?.disconnect();
      if (!("IntersectionObserver" in window)) return;
      const ids = this.own ? this.toc.map((s: any) => s.id) : this.sections.map((_: any, i: number) => (this.kind === "terms" ? "t" : "p") + (i + 1));
      this.io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (this.active = (e.target as HTMLElement).id)), { rootMargin: "-30% 0px -60% 0px" });
      ids.forEach((id: string) => {
        const el = document.getElementById(id);
        if (el) this.io.observe(el);
      });
    },
    jump(id: string) {
      const el = document.getElementById(id);
      if (!el) return;
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      this.active = id;
    },
  },
};
</script>
