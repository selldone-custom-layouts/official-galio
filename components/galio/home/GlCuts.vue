<!--
  Galio Sundae — a photo slot's designed fallback with live pastries: the slot's own painted ground
  (the mockup's warm --ph-art, or a sorbet tint) and the given products' transparent cut-outs standing
  in a row on a soft shadow, kept small and sharp (never wider than about 240px, so a 640px product
  photo is never blown up into a hero). Decorative: the words around the slot name them.
-->
<template>
  <span aria-hidden="true" class="gl-cuts">
    <span v-for="p in items" :key="p.id" class="gl-cut"><img :src="img(p)" alt="" decoding="async" draggable="false" loading="lazy" /></span>
  </span>
</template>

<script>
import { productImage } from "../galio";

export default {
  name: "GlCuts",
  props: { items: { type: Array, default: () => [] } },
  methods: {
    img(p) {
      return productImage(p);
    },
  },
};
</script>
