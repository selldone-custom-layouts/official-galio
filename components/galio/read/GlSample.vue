<!--
  Galio Sundae — the yellow label on text the shop has not written itself (galio-design/g/pages-read.js
  SAMPLE): "Sample text — the shop has not written this page yet". It goes away by itself once the shop
  writes its own page in Selldone.
-->
<template>
  <span class="sample"><gl-icon name="info" />{{ text || t("galio.rd.sample", "Sample text — the shop has not written this page yet") }}</span>
</template>

<script>
import GlIcon from "../GlIcon.vue";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "GlSample",
  components: { GlIcon },
  props: { text: { type: String, default: "" } },
  methods: { t },
};
</script>
