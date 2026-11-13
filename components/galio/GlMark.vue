<!--
  Galio Sundae — the wordmark (galio-design/g/b.css `.mark`): the shop's own live title in lower case,
  in the fat retro display face, then a round lemon dot. Nothing is written in: the word is BRAND.name
  when the Layout sets one (kalio-brand.ts), else the shop's title, so another bakery that imports the
  Layout gets its own name drawn the same way. A long name shrinks until it fits its place (the rail,
  the top bar, the footer), never cut.
-->
<template>
  <component :is="to ? 'router-link' : 'span'" :aria-label="to ? label : undefined" :to="to" class="gl-mark-a">
    <span ref="mark" :aria-hidden="to ? 'true' : undefined" class="mark"
      ><span class="mark-w">{{ word.toLowerCase() }}</span><span class="dot"></span
    ></span>
  </component>
</template>

<script>
import { BRAND } from "../kalio/kalio-brand";
import { t } from "../kalio/i18n/kalio-i18n";

export default {
  name: "GlMark",
  inject: { $shop: { default: null } },
  props: {
    to: { type: [Object, String], default: () => ({ path: "/" }) },
  },
  computed: {
    word() {
      return String(BRAND.name || this.$shop?.title || "").trim();
    },
    label() {
      return t("galio.mark.home", "{name}, home", { name: this.word });
    },
  },
  watch: {
    word() {
      this.$nextTick(() => this.fit());
    },
  },
  mounted() {
    this.onResize = () => this.fit();
    window.addEventListener("resize", this.onResize, { passive: true });
    this.fit();
    document.fonts?.ready?.then(() => this.fit());
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    /* Shrink the word until it fits the room its place gives it. */
    fit() {
      const el = this.$refs.mark;
      if (!el || !el.isConnected) return;
      el.style.fontSize = "";
      const box = this.$el?.parentElement;
      if (!box || !el.offsetWidth) return;
      const cs = getComputedStyle(box);
      const room = box.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0) - 4;
      let s = parseFloat(getComputedStyle(el).fontSize) || 40;
      while (el.scrollWidth > room && s > 18) {
        s -= 2;
        el.style.fontSize = s + "px";
      }
    },
  },
};
</script>
