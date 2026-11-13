<!--
  Galio Sundae — the hero slider (galio-design/g/home.js hero(), heroGo(), heroPaint()).

  The slides are the shop's own collections: the ones with their Codex photo first, then by sales
  (Bakio without photos: its three best-selling collections), three at most. Each slide: the photo
  (wide on desktop and tablet, square on phones) or a designed fallback (the warm painted ground with
  the collection's own best sellers kept small, never a product photo blown up), the collection's
  name as a big script word fitted to one line, and the white plate: "From $x · 25% off", the name
  (h1 on the first slide only), its best sellers by short name, "Shop <collection>" and "See the
  prices" (the price list below, on that collection's tab).

  The slides sit on one grid cell (a fixed height, the page never jumps); a hidden slide is
  visibility: hidden and inert (its links are never tabbed to). Under it: pause / play, the tabs
  whose colour fills while a slide plays (from the right in Arabic), previous and next. It pauses
  while the pointer is over it, while it has the keyboard's focus (not a click's), while the tab is
  hidden, and starts paused for reduced motion. The fill's animation is the clock: its end moves on.
-->
<template>
  <section
    :aria-label="t('galio.hero.aria', '{shop} collections', { shop: shopName })"
    :class="['hero', { playing: user, paused: !running }]"
    aria-roledescription="carousel"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    @animationend="onAnimEnd"
  >
    <div class="wrap">
      <div class="hero-stage">
        <article
          v-for="(s, i) in slides"
          :id="'gl-slide-' + i"
          :key="s.cat.id"
          :aria-hidden="i === at ? undefined : 'true'"
          :aria-label="t('galio.hero.slideOf', '{n} of {total}', { n: i + 1, total: slides.length })"
          :class="['slide', { 'is-on': i === at }]"
          :inert="i === at ? undefined : true"
          aria-roledescription="slide"
          role="group"
        >
          <div :class="['ph', 'slide-ph', 'ph--wide-only', { '-photo': s.photos.wide }]">
            <img v-if="s.photos.wide" :src="s.photos.wide" alt="" class="ph-img" decoding="async" :loading="i === 0 ? 'eager' : 'lazy'" />
            <gl-cuts v-else :items="s.picks" class="-hero" />
          </div>
          <div :class="['ph', 'slide-ph', 'ph--square-only', { '-photo': s.photos.square }]">
            <img v-if="s.photos.square" :src="s.photos.square" alt="" class="ph-img" decoding="async" :loading="i === 0 ? 'eager' : 'lazy'" />
            <gl-cuts v-else :items="s.picks" class="-hero -square" />
          </div>
          <span aria-hidden="true" class="slide-script"><bdi>{{ catTitle(s.cat).toLowerCase() }}</bdi></span>
          <div class="slide-plate">
            <span aria-hidden="true" class="script-in"><bdi>{{ catTitle(s.cat).toLowerCase() }}</bdi></span>
            <span v-if="s.meta" class="meta">{{ s.meta }}</span>
            <component :is="i === 0 ? 'h1' : 'h2'"><bdi>{{ catTitle(s.cat) }}</bdi></component>
            <p v-if="s.line">{{ s.line }}</p>
            <div class="acts">
              <router-link :to="catTo(s.cat)" class="btn">{{ t("galio.hero.shop", "Shop {name}", { name: catTitle(s.cat).toLowerCase() }) }}</router-link>
              <a class="link" href="#menu" @click.prevent="$emit('prices', s.cat)">{{ t("galio.hero.prices", "See the prices") }}<gl-icon name="arrow" /></a>
            </div>
          </div>
        </article>
      </div>
      <div v-if="slides.length > 1" class="hero-ctl">
        <button :aria-label="user ? t('galio.hero.pause', 'Pause the slides') : t('galio.hero.play', 'Play the slides')" class="cbtn play" type="button" @click="toggle">
          <gl-icon :name="user ? 'pause' : 'play'" />
        </button>
        <div :aria-label="t('galio.hero.tabs', 'Slides')" class="hero-tabs" role="tablist" @keydown="onTabKeys">
          <button
            v-for="(s, i) in slides"
            :id="'gl-htab-' + i"
            :key="s.cat.id"
            :aria-controls="'gl-slide-' + i"
            :aria-selected="i === at ? 'true' : 'false'"
            :tabindex="i === at ? 0 : -1"
            class="htab"
            role="tab"
            type="button"
            @click="go(i)"
          >
            <span :key="'f' + (i === at ? gen : 0)" class="fill" :style="{ '--gl-slide-ms': ms + 'ms' }"></span><span class="t"><bdi>{{ catTitle(s.cat) }}</bdi></span>
          </button>
        </div>
        <button :aria-label="t('galio.hero.prev', 'Previous slide')" class="cbtn prev" type="button" @click="go(at - 1)"><gl-icon name="left" /></button>
        <button :aria-label="t('galio.hero.next', 'Next slide')" class="cbtn next" type="button" @click="go(at + 1)"><gl-icon name="right" /></button>
      </div>
    </div>
  </section>
</template>

<script>
import GlIcon from "../GlIcon.vue";
import GlCuts from "./GlCuts.vue";
import { allOff, bySells, catTitle, catTo, catsBySells, fitLine, fromPrice, inCat, listJoin, money, shopName, shortNames } from "../galio";
import { hasHeroPhoto, heroPhotos } from "../gl-photos";
import { currentCurrency } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "GlHero",
  components: { GlIcon, GlCuts },
  props: {
    ready: { type: Boolean, default: false },
  },
  emits: ["prices"],
  data: () => ({
    at: 0,
    gen: 0,
    user: true,
    hover: false,
    focus: false,
    hidden: false,
    ms: 6500,
  }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    shopName() {
      return shopName(this.shop);
    },
    slides() {
      void currentCurrency();
      void this.ready;
      const cats = catsBySells();
      const ordered = [...cats.filter((c) => hasHeroPhoto(c)), ...cats.filter((c) => !hasHeroPhoto(c))].slice(0, 3);
      const off = allOff(this.shop);
      return ordered.map((cat) => {
        const from = fromPrice(this.shop, cat.id);
        const names = shortNames(cat.id, 3);
        const meta = from ? [t("galio.hero.from", "From {price}", { price: money(from.now) }), off ? t("galio.hero.off", "{off}% off", { off }) : ""].filter(Boolean).join(" · ") : "";
        const line = names.length ? t("galio.hero.line", "{names}, each sold by the piece.", { names: listJoin(names) }) : "";
        return { cat, photos: heroPhotos(cat), meta, line, picks: bySells(inCat(cat.id)).slice(0, 3) };
      });
    },
    running() {
      return this.user && !this.hover && !this.focus && !this.hidden && this.slides.length > 1;
    },
  },
  watch: {
    "slides.length"(n) {
      if (this.at >= n) this.at = 0;
      this.$nextTick(() => this.fitAll());
    },
  },
  created() {
    this.user = !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  },
  mounted() {
    this.onVis = () => (this.hidden = document.hidden);
    document.addEventListener("visibilitychange", this.onVis);
    this.onResize = () => {
      clearTimeout(this.rt);
      this.rt = setTimeout(() => this.fitAll(), 120);
    };
    window.addEventListener("resize", this.onResize, { passive: true });
    this.$nextTick(() => this.fitAll());
    document.fonts?.ready?.then(() => this.fitAll());
  },
  beforeUnmount() {
    document.removeEventListener("visibilitychange", this.onVis);
    window.removeEventListener("resize", this.onResize);
    clearTimeout(this.rt);
  },
  methods: {
    t,
    catTitle,
    catTo,
    go(i) {
      const n = this.slides.length;
      if (!n) return;
      this.at = (i + n) % n;
      this.gen++;
    },
    toggle() {
      this.user = !this.user;
      this.gen++;
    },
    onAnimEnd(e) {
      if (e.animationName === "gl-hfill" && this.running) this.go(this.at + 1);
    },
    /* Only a keyboard's focus pauses (a click on a tab or arrow does not). */
    onFocusIn(e) {
      try {
        if (e.target.matches(":focus-visible")) this.focus = true;
      } catch {
        /* old browser */
      }
    },
    onFocusOut(e) {
      if (!this.$el.contains(e.relatedTarget)) this.focus = false;
    },
    /* The tabs' arrow keys (mirrored right to left), Home and End. */
    onTabKeys(e) {
      const rtl = getComputedStyle(this.$el).direction === "rtl";
      const n = this.slides.length;
      let next = null;
      if (e.key === "ArrowRight") next = this.at + (rtl ? -1 : 1);
      else if (e.key === "ArrowLeft") next = this.at + (rtl ? 1 : -1);
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = n - 1;
      if (next == null) return;
      e.preventDefault();
      this.go(next);
      this.$nextTick(() => document.getElementById("gl-htab-" + this.at)?.focus());
    },
    /* The script word stays on one line inside its box: the font shrinks until it fits. */
    fitAll() {
      this.$el?.querySelectorAll?.(".slide-script").forEach((el) => fitLine(el));
    },
  },
};

</script>
