<!--
  Galio Sundae — one tile of the "How it reaches you" mosaic: the Codex photo when the Layout has it
  (assets/galio/<file>), else a designed fallback (a sorbet tint with the way's own line drawing, or,
  where the photo would show pastries, the shop's own cut-outs kept small), and the caption card with
  the way's icon, its name and its real line (reach, windows, fee, hours).
-->
<template>
  <div :class="['ph', '-tile', '-' + tile.tint, { '-photo': tile.photo }]">
    <img v-if="tile.photo" :src="tile.photo" alt="" class="ph-img" decoding="async" loading="lazy" />
    <gl-cuts v-else-if="tile.picks && tile.picks.length" :class="['-tile', tile.big ? '-big' : '-small']" :items="tile.picks" />
    <span v-else-if="tile.art" aria-hidden="true" class="gl-tile-art"><gl-icon :name="tile.art" /></span>
  </div>
  <figcaption class="cap">
    <gl-icon :name="tile.icon" /><b>{{ tile.title }}</b><span v-if="tile.line">{{ tile.line }}</span>
  </figcaption>
</template>

<script>
import GlIcon from "../GlIcon.vue";
import GlCuts from "./GlCuts.vue";

export default {
  name: "GlTile",
  components: { GlIcon, GlCuts },
  props: { tile: { type: Object, required: true } },
};
</script>
