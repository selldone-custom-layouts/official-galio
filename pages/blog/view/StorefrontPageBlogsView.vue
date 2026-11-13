<!--
  Galio Sundae — a journal post (galio-design/article-b.html): the sky crumb strip; one reading column
  with the kicker, date, title and lede; the cover with its date roundel; the shop's own text; "Shop
  this post" (the pastries the post links to or names, else four to try) with "Add all"; share; the
  comments (Selldone's, an honest empty state); then "Read next" on lemon. Only published posts.
-->
<template>
  <div class="gl gl-article">
    <gl-ptitle :crumbs="crumbs" band="sky" crumbs-only />
    <article v-if="article" class="art bg-white">
      <header class="art-head">
        <span aria-hidden="true" class="kick">{{ t("galio.rd.jrKick", "the journal") }}</span>
        <time v-if="article.created_at" :datetime="article.created_at">{{ fmtDate(article.created_at) }}</time>
        <h1>{{ article.title }}</h1>
        <p v-if="lede" class="art-lede">{{ lede }}</p>
      </header>
      <figure v-if="cover" class="art-cover"><gl-cover :post="article" cls="jcov--art" sizes="(max-width: 1160px) 96vw, 1000px" /></figure>
      <div v-if="body" class="art-body" @click="bodyClick" v-html="body"></div>
      <div v-else class="art-body">
        <p v-if="article.description">{{ article.description }}</p>
        <p class="no-body">{{ t("galio.rd.soon", "Only this summary is published so far.") }}</p>
      </div>

      <section v-if="products.list.length" aria-labelledby="gl-h-shop" class="art-shop">
        <div class="as-head">
          <div>
            <span class="pk">{{ products.named ? t("galio.rd.named", "Named in this post") : t("galio.rd.toTry", "Pastries to try") }}</span>
            <h2 id="gl-h-shop">{{ products.named ? t("galio.rd.shopPost", "Shop this post") : t("galio.rd.orderWith", "Order with this read") }}</h2>
          </div>
          <button :disabled="adding" class="btn" type="button" @click="addAll"><gl-icon :name="added ? 'check' : 'bag'" />{{ t("galio.rd.addAll", "Add all {n}", { n: products.list.length }) }}</button>
        </div>
        <ul class="as-list">
          <li v-for="p in products.list" :key="p.id" class="ascard">
            <router-link :style="{ '--gl-tint': tintOf(p.category_id) }" :to="productTo(p)" aria-hidden="true" class="as-plate" tabindex="-1"
              ><img :src="productImage(p, 128) || productImage(p)" alt="" height="400" loading="lazy" width="400"
            /></router-link>
            <router-link :to="productTo(p)" class="as-n">{{ p.title }}</router-link>
            <div class="as-b">
              <span class="as-p tab-num"
                >{{ money(pv(p).now) }}<template v-if="pv(p).was">{{ " " }}<s>{{ money(pv(p).was) }}</s></template></span
              >
              <gl-qb :product="p" kind="round" />
            </div>
          </li>
        </ul>
        <p aria-live="polite" class="as-note">
          <template v-if="added">{{ t("galio.rd.allIn", "All in your bag.") }} <button class="link link--sm" type="button" @click="openBag">{{ t("galio.bt.openBag", "Open the bag") }}</button></template>
        </p>
      </section>

      <div class="art-share">
        <span>{{ t("galio.rd.share", "Share this post") }}</span>
        <button class="chip" type="button" @click="copyLink"><gl-icon :name="copied ? 'check' : 'link'" />{{ copied ? t("galio.rd.copied", "Link copied") : t("galio.rd.copy", "Copy link") }}</button>
        <a :href="mailto" class="chip"><gl-icon name="mail" />{{ t("galio.rd.email", "Email") }}</a>
      </div>

      <section aria-labelledby="gl-h-com" class="art-com">
        <h2 id="gl-h-com">{{ t("galio.rd.comments", "Comments") }}</h2>
        <s-article-comments :article-id="article.id" :article-user-id="article.user_id" class="gl-comments" is-selldone is-shop>
          <template v-slot:login>
            <gl-empty :text="t('galio.rd.comP', 'Sign in to write the first one. Comments show here once the shop approves them.')" :title="t('galio.rd.comT', 'No comments yet')" cls="empty--com" icon="chat">
              <button class="btn" type="button" @click="signIn">{{ t("galio.rd.comSignIn", "Sign in to comment") }}</button>
            </gl-empty>
          </template>
        </s-article-comments>
      </section>
    </article>

    <div v-else-if="busy" aria-hidden="true" class="art bg-white gl-art-skel">
      <header class="art-head"><i></i><i></i></header>
      <div class="art-cover"><span class="jcov jcov--art"></span></div>
    </div>

    <section v-else class="sec sec--tight bg-white">
      <div class="wrap">
        <gl-empty :text="t('galio.rd.goneP', 'The link may be old, or the post has moved. Every other post is in the journal.')" :title="t('galio.rd.goneT', 'We can’t find this post')" icon="doc">
          <router-link :to="journalRoute()" class="btn">{{ t("galio.rd.backJournal", "Back to the journal") }}</router-link>
        </gl-empty>
      </div>
    </section>

    <section v-if="more.length" aria-labelledby="gl-h-next" class="sec sec--tight bg-lemon">
      <div class="wrap">
        <h2 id="gl-h-next" class="h3x">{{ t("galio.rd.readNext", "Read next") }}</h2>
        <ul class="pgrid"><gl-post v-for="b in more" :key="b.id" :post="b" /></ul>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import SArticleComments from "@selldone/components-vue/article/comment/SArticleComments.vue";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { StorefrontSeo } from "../../../helpers/StorefrontSeo";
import GlIcon from "@app-storefront/components/galio/GlIcon.vue";
import GlQb from "@app-storefront/components/galio/GlQb.vue";
import GlEmpty from "@app-storefront/components/galio/GlEmpty.vue";
import GlPtitle from "@app-storefront/components/galio/GlPtitle.vue";
import GlPost from "@app-storefront/components/galio/read/GlPost.vue";
import GlCover from "@app-storefront/components/galio/read/GlCover.vue";
import { bySells, fmtDate, loadShop, mixed, money, openLayer, priceView, productImage, productTo, shopData, tintOf } from "@app-storefront/components/galio/galio";
import { plainText } from "@app-storefront/components/galio/gl-read";
import { addCount, basketLine, mayBuy } from "@app-storefront/components/kalio/kalio-basket";
import { journalPage, journalPost, journalRoute, productsIn } from "@app-storefront/components/kalio/pages/kalio-journal";
import { currentCurrency } from "@app-storefront/components/region-switcher/region";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

/** The product ids a story's text links to, in order, once each. */
function linkedIds(html: string): number[] {
  const ids: number[] = [];
  for (const m of String(html || "").matchAll(/href="[^"]*\/product\/(\d+)[^"]*"/g)) {
    const id = Number(m[1]);
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

export default {
  name: "StorefrontPageBlogsView",
  components: { SArticleComments, GlIcon, GlQb, GlEmpty, GlPtitle, GlPost, GlCover },
  inject: ["$shop"],

  data: () => ({
    article: null as any,
    busy: false,
    more: [] as any[],
    adding: false,
    added: false,
    copied: false,
    data: shopData,
    seoNavigation: StorefrontSeo.captureNavigation(),
  }),

  computed: {
    blogId() {
      return this.$route.params.blog_id;
    },
    shop() {
      return this.$store.getters.getShop;
    },
    /* The shop's text, with the editor's leftovers taken out. */
    body() {
      return String(this.article?.body || "")
        .replace(/\scontenteditable="[^"]*"/g, "")
        .replace(/src="http:/g, 'src="');
    },
    /* The cover, unless the text opens with the same picture. */
    cover() {
      const image = this.article?.image;
      if (!image) return null;
      const file = String(image).split("/").pop()!.split("?")[0].slice(0, 40);
      const first = /<img[^>]+src="([^"]+)"/.exec(this.article.body || "");
      if (first && file && first[1].includes(file)) return null;
      return window.CDN.GET_SHOP_IMAGE_PATH(image, null);
    },
    crumbs() {
      const out = [
        [t("galio.crumb.home", "Home"), { path: "/" }],
        [t("galio.rd.journal", "Journal"), journalRoute()],
      ];
      if (this.article) out.push([this.article.title]);
      return out;
    },
    /* The description, unless it is only the first words of the text. */
    lede() {
      const d = plainText(this.article?.description);
      if (!d) return "";
      const start = plainText(this.article?.body).slice(0, 40);
      return start && d.startsWith(start) ? "" : d;
    },
    /* The pastries the post links to (else the ones it names), at most four; with none, four best
       sellers from different collections to try ("Pastries to try"). */
    products() {
      if (!this.article) return { list: [], named: false };
      const all = this.data.products;
      const byId = new Map(all.map((p: any) => [p.id, p]));
      const linked = linkedIds(this.article.body)
        .map((id) => byId.get(id))
        .filter(Boolean)
        .slice(0, 4);
      if (linked.length) return { list: linked, named: true };
      const named = productsIn(this.article.body, all, 4);
      if (named.length) return { list: named, named: true };
      return { list: mixed(bySells(all.filter((p: any) => p.quantity > 0))).slice(0, 4), named: false };
    },
    mailto() {
      return `mailto:?subject=${encodeURIComponent(this.article?.title || "")}&body=${encodeURIComponent(location.href)}`;
    },
  },

  watch: {
    blogId() {
      this.load();
    },
    "$route.fullPath"() {
      this.seoNavigation = StorefrontSeo.captureNavigation();
    },
  },

  created() {
    loadShop();
    this.load();
  },

  methods: {
    t,
    money,
    fmtDate,
    tintOf,
    openBag(e: any) {
      openLayer("drawer", e?.currentTarget || null);
    },
    productImage,
    productTo,
    journalRoute,
    pv(p: any) {
      void currentCurrency();
      return priceView(this.shop, p);
    },
    load() {
      const asked = this.blogId;
      this.busy = true;
      this.article = null;
      this.more = [];
      journalPost(asked)
        .then((data: any) => {
          if (asked !== this.blogId) return;
          /* only a published post */
          if (data.article?.published === false) throw new Error("unpublished");
          this.article = data.article;
          this.setPageTitle?.(data.article.title);
          StorefrontSeo.updateArticle(data.article, this.$store.getters.getShop, this.seoNavigation);
          journalPage({ page: 1, limit: 4 })
            .then(({ articles }: any) => {
              if (asked === this.blogId) this.more = (articles || []).filter((a: any) => a.id !== data.article.id).slice(0, 3);
            })
            .catch(() => {});
        })
        .catch(() => {})
        .finally(() => {
          if (asked === this.blogId) this.busy = false;
        });
    },
    /* A link inside the story to this shop opens in the app. */
    bodyClick(e: MouseEvent) {
      const a = (e.target as HTMLElement)?.closest?.("a") as HTMLAnchorElement | null;
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      let url: URL;
      try {
        url = new URL(a.getAttribute("href") || "", location.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin) return;
      const m = /\/product\/(\d+)/.exec(url.pathname);
      e.preventDefault();
      if (m) this.$router.push(productTo({ id: Number(m[1]) }));
      else this.$router.push(url.pathname + url.search + url.hash).catch(() => {});
    },
    async addAll() {
      if (!mayBuy(this)) return;
      this.adding = true;
      try {
        for (const p of this.products) {
          if (!(p.quantity > 0)) continue;
          if (basketLine(this, p)?.count > 0) continue;
          await addCount(this, p, null, 1);
        }
        this.added = true;
      } finally {
        this.adding = false;
      }
    },
    copyLink() {
      const done = () => {
        this.copied = true;
        setTimeout(() => (this.copied = false), 1500);
      };
      try {
        navigator.clipboard?.writeText(location.href).then(done, done);
      } catch {
        done();
      }
    },
    signIn() {
      EventBus.$emit("need-login", true);
    },
  },
};
</script>
