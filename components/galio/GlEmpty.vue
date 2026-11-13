<!--
  Galio Sundae — an empty state (galio-design/g/shell.js emptyBlock()): the icon in a soft 56px
  circle, 14px to the title, 8px to the words, 20px to the actions.
-->
<template>
  <div :class="['empty', cls]">
    <span class="empty-ic"><gl-icon :name="icon" /></span>
    <h3>{{ title }}</h3>
    <p v-if="text || $slots.text"><slot name="text">{{ text }}</slot></p>
    <div v-if="$slots.default" class="empty-acts"><slot></slot></div>
  </div>
</template>

<script>
import GlIcon from "./GlIcon.vue";

export default {
  name: "GlEmpty",
  components: { GlIcon },
  props: {
    icon: { type: String, default: "info" },
    title: { type: String, default: "" },
    text: { type: String, default: "" },
    cls: { type: String, default: "" },
  },
};
</script>
