<!--
  Galio Sundae — a journal cover (galio-design/g/pages-read.js cover()): the post's photo with the
  yellow date roundel (the month over the day, fitted inside its circle). `cls` "jcov--big" is the
  journal's newest post, "jcov--art" the article's cover.
-->
<template>
  <span :class="['jcov', cls]">
    <img v-if="src" :alt="alt" :src="src" :srcset="srcset" :sizes="sizes" height="563" loading="lazy" width="1000" @error="dropSrcset" />
    <span v-else aria-hidden="true" class="jcov-fb"><gl-icon name="doc" /></span>
    <span v-if="date" ref="roll" aria-hidden="true" class="droll"><span>{{ month }}</span><b>{{ day }}</b></span>
  </span>
</template>

<script>
import GlIcon from "../GlIcon.vue";
import { fitInCircle } from "../../bakini/fit-in-circle";
import { dropSrcset, photoSrcset } from "../../kalio/kalio-catalog";

export default {
  name: "GlCover",
  components: { GlIcon },
  props: {
    post: { type: Object, required: true },
    cls: { type: String, default: "" },
    sizes: { type: String, default: "(max-width: 760px) 92vw, 420px" },
    alt: { type: String, default: "" },
  },
  computed: {
    src() {
      return this.post?.image ? window.CDN.GET_SHOP_IMAGE_PATH(this.post.image, null) : null;
    },
    srcset() {
      return this.src ? photoSrcset(this.src) : undefined;
    },
    date() {
      const d = new Date(this.post?.created_at || this.post?.updated_at || "");
      return isNaN(d.getTime()) ? null : d;
    },
    lang() {
      return document.documentElement.lang || "en";
    },
    month() {
      try {
        return this.date.toLocaleDateString(this.lang, { month: "short" });
      } catch {
        return "";
      }
    },
    day() {
      try {
        return this.date.toLocaleDateString(this.lang, { day: "numeric" });
      } catch {
        return String(this.date.getDate());
      }
    },
  },
  watch: {
    month() {
      this.$nextTick(this.fit);
    },
  },
  mounted() {
    this.fit();
    document.fonts?.ready?.then(() => this.fit());
    this.onResize = () => this.fit();
    window.addEventListener("resize", this.onResize, { passive: true });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    dropSrcset,
    fit() {
      if (this.$refs.roll) fitInCircle(this.$refs.roll);
    },
  },
};
</script>
