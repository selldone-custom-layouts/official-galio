<!--
  Galio Sundae: the shop's privacy page (GlLegal: the shop's own text when it has
  written one, else sample copy from its facts, labelled as sample).
-->
<template>
  <gl-legal kind="privacy" />
</template>

<script lang="ts">
import GlLegal from "@app-storefront/components/galio/read/GlLegal.vue";

export default {
  name: "StorefrontPageOfficialPrivacy",
  components: { GlLegal },
};
</script>
