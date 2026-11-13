<!--
  The compare page is Galio Sundae's (GlCompare: galio-design/compare-b.html), built on Kalio's
  compare logic. The address keeps Selldone's ?list= format, so old links still open here.
-->
<template>
  <gl-compare />
</template>

<script lang="ts">
import GlCompare from "../../components/galio/compare/GlCompare.vue";

export default {
  name: "StorefrontPageComparison",
  components: { GlCompare },
};
</script>
