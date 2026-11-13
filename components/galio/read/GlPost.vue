<!--
  Galio Sundae — a journal post card (galio-design/g/pages-read.js postCard()): the cover with its date
  roundel, the date, the title, the description and "Read the post"; the whole card is one link.
-->
<template>
  <li>
    <router-link :to="to" class="pcard">
      <gl-cover :post="post" />
      <span class="pc-t">
        <time v-if="post.created_at" :datetime="post.created_at">{{ fmtDate(post.created_at) }}</time>
        <h3>{{ post.title }}</h3>
        <p v-if="post.description">{{ post.description }}</p>
        <span aria-hidden="true" class="link">{{ t("galio.rd.readPost", "Read the post") }}<gl-icon name="arrow" /></span>
      </span>
    </router-link>
  </li>
</template>

<script>
import GlIcon from "../GlIcon.vue";
import GlCover from "./GlCover.vue";
import { fmtDate } from "../galio";
import { postRoute } from "../../kalio/pages/kalio-journal";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "GlPost",
  components: { GlIcon, GlCover },
  props: { post: { type: Object, required: true } },
  computed: {
    to() {
      return postRoute(this.post);
    },
  },
  methods: { t, fmtDate },
};
</script>
