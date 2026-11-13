<!--
  Galio Sundae — one line icon from the mockup's set (gl-icons.ts), or a collection's line drawing
  (`coll`: the collection; matched by its name or slug, a generic pastry otherwise).
-->
<template>
  <svg v-if="coll" aria-hidden="true" class="gl-coll" focusable="false" viewBox="0 0 64 64" v-html="collPath"></svg>
  <svg v-else :class="['i', cls]" aria-hidden="true" focusable="false" viewBox="0 0 24 24" v-html="path"></svg>
</template>

<script>
import { ICONS, collSvg } from "./gl-icons";

export default {
  name: "GlIcon",
  props: {
    name: { type: String, default: "" },
    cls: { type: String, default: "" },
    coll: { type: Object, default: null },
  },
  computed: {
    path() {
      return ICONS[this.name] || "";
    },
    collPath() {
      return collSvg(this.coll).replace(/^<svg[^>]*>|<\/svg>$/g, "");
    },
  },
};
</script>
