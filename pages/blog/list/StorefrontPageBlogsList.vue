<!--
  Galio Sundae — the journal (galio-design/blog-b.html): the sky title band; the newest post large
  (its cover with the date roundel, "Newest", the date, title, description, "Read the post"); then
  "Every post" on lemon, three across. Only the shop's published posts, from Selldone's journal; a
  topic, tag, author or search shows its own posts under its own name.
-->
<template>
  <div class="gl gl-journal">
    <gl-ptitle :crumbs="crumbs" :h1="filtered ? heading : t('galio.rd.jrH', 'From the journal')" :kick="filtered ? '' : t('galio.rd.jrKick', 'the journal')" :lede="lede" band="sky" />

    <template v-if="articles.length">
      <section v-if="feature" :aria-label="t('galio.rd.newestAria', 'Newest post')" class="sec sec--tight bg-white">
        <div class="wrap">
          <router-link :to="postRoute(feature)" class="feat">
            <gl-cover :post="feature" cls="jcov--big" sizes="(max-width: 760px) 92vw, 760px" />
            <span class="feat-t">
              <span class="feat-k">{{ t("galio.rd.newest", "Newest") }}</span>
              <time v-if="feature.created_at" :datetime="feature.created_at">{{ fmtDate(feature.created_at) }}</time>
              <h2>{{ feature.title }}</h2>
              <p v-if="feature.description">{{ feature.description }}</p>
              <span aria-hidden="true" class="btn">{{ t("galio.rd.readPost", "Read the post") }}</span>
            </span>
          </router-link>
        </div>
      </section>
      <section v-if="rest.length" :aria-labelledby="'gl-h-all'" :class="['sec', 'sec--tight', feature ? 'bg-lemon' : 'bg-white']">
        <div class="wrap">
          <h2 v-if="feature" id="gl-h-all" class="h3x">{{ t("galio.rd.every", "Every post") }}</h2>
          <h2 v-else id="gl-h-all" class="vh">{{ t("galio.rd.posts", "Posts") }}</h2>
          <ul class="pgrid"><gl-post v-for="b in rest" :key="b.id" :post="b" /></ul>
          <div v-if="articles.length < total" class="gl-more">
            <button :disabled="busy" class="btn btn--ghost" type="button" @click="loadMore">{{ t("galio.rd.morePosts", "More posts") }}</button>
          </div>
        </div>
      </section>
    </template>

    <section v-else-if="busy" aria-hidden="true" class="sec sec--tight bg-white">
      <div class="wrap">
        <ul class="pgrid gl-skel-posts">
          <li v-for="n in 3" :key="n"><span class="jcov"></span></li>
        </ul>
      </div>
    </section>

    <section v-else class="sec sec--tight bg-white">
      <div class="wrap">
        <gl-empty
          :text="filtered ? t('galio.rd.noMatchP', 'Nothing in the journal matches this yet.') : t('galio.rd.noPostsP', 'The bakery has not published any posts yet.')"
          :title="filtered ? t('galio.rd.noMatchT', 'No posts here yet') : t('galio.rd.noPostsT', 'No posts yet')"
          icon="doc"
        >
          <router-link v-if="filtered" :to="journalRoute()" class="btn">{{ t("galio.rd.allPosts", "Every post") }}</router-link>
          <router-link v-else :to="{ path: '/' }" class="btn">{{ t("galio.rd.backShop", "Back to the shop") }}</router-link>
        </gl-empty>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import GlPtitle from "@app-storefront/components/galio/GlPtitle.vue";
import GlEmpty from "@app-storefront/components/galio/GlEmpty.vue";
import GlPost from "@app-storefront/components/galio/read/GlPost.vue";
import GlCover from "@app-storefront/components/galio/read/GlCover.vue";
import { fmtDate } from "@app-storefront/components/galio/galio";
import { journalExtra, journalPage, journalRoute, postRoute } from "@app-storefront/components/kalio/pages/kalio-journal";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

/* One featured story and a grid of three across: 1 + 12 on the first page. */
const FIRST = 13;

export default {
  name: "StorefrontPageBlogsList",
  components: { GlPtitle, GlEmpty, GlPost, GlCover },
  inject: ["$shop"],

  data: () => ({ articles: [] as any[], total: 0, busy: false, page: 1, categories: [] as any[] }),

  computed: {
    current_category() {
      return this.$route.query.category || null;
    },
    current_tag() {
      return this.$route.query.tags || null;
    },
    current_search() {
      return this.$route.query.search || "";
    },
    current_author() {
      return this.$route.params.author || null;
    },
    current_author_id() {
      return this.$route.params.author_id || null;
    },
    filtered() {
      return !!(this.current_category || this.current_tag || this.current_search || this.current_author_id);
    },
    category() {
      return this.categories.find((it: any) => String(it.id) === String(this.current_category)) || null;
    },
    heading() {
      if (this.current_category) return this.category?.title || this.category?.name || t("bakini.n.rd.topic", "Topic");
      if (this.current_author_id) return this.articles[0]?.user?.name || this.current_author || t("bakini.n.rd.author", "Author");
      if (this.current_tag) return `#${this.current_tag}`;
      return t("bakini.n.rd.searchFor", "“{q}”", { q: String(this.current_search) });
    },
    lede() {
      if (this.current_category) return this.category?.description || t("bakini.n.rd.ledeTopic", "Every story on this topic, newest first.");
      if (this.filtered) return t("bakini.n.rd.ledeMatch", "The stories that match, newest first.");
      return t("galio.rd.jrLede", "Notes on the pastries, the collections and how an order reaches you.");
    },
    crumbs() {
      const home = [t("galio.crumb.home", "Home"), { path: "/" }];
      if (!this.filtered) return [home, [t("galio.rd.journal", "Journal")]];
      return [home, [t("galio.rd.journal", "Journal"), journalRoute()], [this.heading]];
    },
    feature() {
      return this.filtered ? null : this.articles[0] || null;
    },
    rest() {
      return this.feature ? this.articles.slice(1) : this.articles;
    },
  },

  watch: {
    "$route.fullPath"() {
      this.load();
    },
  },

  created() {
    this.setPageTitle?.(t("galio.rd.journal", "Journal"));
    this.load();
    journalExtra()
      .then(({ categories }: any) => (this.categories = categories || []))
      .catch(() => {});
  },

  methods: {
    t,
    fmtDate,
    postRoute,
    journalRoute,
    query(offsetPage: number, limit: number) {
      return {
        page: offsetPage,
        limit,
        category: this.current_category,
        author: this.current_author,
        author_id: this.current_author_id,
        tag: this.current_tag,
        search: this.current_search,
      };
    },
    load() {
      const asked = this.$route.fullPath;
      this.busy = true;
      this.page = 1;
      journalPage(this.query(1, FIRST))
        .then(({ articles, total }: any) => {
          if (asked !== this.$route.fullPath) return;
          this.articles = articles || [];
          this.total = total || this.articles.length;
        })
        .catch(() => {
          this.articles = [];
          this.total = 0;
        })
        .finally(() => (this.busy = false));
    },
    /* The next thirteen. */
    loadMore() {
      if (this.busy) return;
      this.busy = true;
      this.page = (this.page || 1) + 1;
      journalPage(this.query(this.page, FIRST))
        .then(({ articles }: any) => {
          const seen = new Set(this.articles.map((a: any) => a.id));
          const fresh = (articles || []).filter((a: any) => !seen.has(a.id));
          this.articles = this.articles.concat(fresh);
          if (!fresh.length) this.total = this.articles.length;
        })
        .catch(() => {})
        .finally(() => (this.busy = false));
    },
  },
};
</script>
