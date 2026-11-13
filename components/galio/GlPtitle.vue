<!--
  Galio Sundae — the page-title band (galio-design/g/shell.js ptitle()): sorbet stripes with a
  scalloped lower edge like the rail's awning; the breadcrumbs, a handwritten kicker, the page's h1,
  a line under it and anything the page adds (a search box, the checkout steps). `crumbsOnly`: the
  short strip of the product and article pages.
-->
<template>
  <component :is="crumbsOnly ? 'div' : 'section'" :class="['ptitle', 'band-' + band, cls, { 'ptitle--crumbs': crumbsOnly }]">
    <div class="wrap ptitle-in">
      <nav v-if="crumbs && crumbs.length" :aria-label="t('galio.crumbs', 'Breadcrumb')" class="crumbs">
        <ol>
          <li v-for="(c, i) in crumbs" :key="i">
            <router-link v-if="c[1] && i < crumbs.length - 1" :to="c[1]"><bdi>{{ c[0] }}</bdi></router-link>
            <span v-else aria-current="page"><bdi>{{ c[0] }}</bdi></span>
          </li>
        </ol>
      </nav>
      <template v-if="!crumbsOnly">
        <span v-if="kick" aria-hidden="true" class="kick">{{ kick }}</span>
        <h1 class="pt-h"><slot name="h1"><bdi>{{ h1 }}</bdi></slot></h1>
        <p v-if="lede || $slots.lede" class="pt-lede"><slot name="lede">{{ lede }}</slot></p>
        <slot></slot>
      </template>
    </div>
  </component>
</template>

<script>
import { t } from "../kalio/i18n/kalio-i18n";

export default {
  name: "GlPtitle",
  props: {
    band: { type: String, default: "lemon" },
    cls: { type: [String, Array, Object], default: "" },
    crumbs: { type: Array, default: () => [] },
    kick: { type: String, default: "" },
    h1: { type: String, default: "" },
    lede: { type: String, default: "" },
    crumbsOnly: Boolean,
  },
  methods: { t },
};
</script>
