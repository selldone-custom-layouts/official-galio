<!--
  Galio Sundae — page not found (galio-design/404-b.html): on straw, the big 404 and "This page is not
  on the counter", a search, the way home and to the shop, and four best sellers on their plates
  (one per collection, in stock).
-->
<template>
  <div class="gl gl-404">
    <section aria-labelledby="gl-nf-h" class="nf bg-straw">
      <div class="wrap nf-in">
        <div class="nf-t">
          <span aria-hidden="true" class="kick">{{ t("galio.nf.kick", "oops, a crumb") }}</span>
          <h1 id="gl-nf-h"><span aria-hidden="true" class="nf-num">404</span><span class="nf-say">{{ t("galio.nf.say", "This page is not on the counter") }}</span></h1>
          <p>{{ t("galio.nf.p", "The link may be old, or the page has moved. Search for a pastry, or start again from the shop.") }}</p>
          <form class="sp-form sp-form--nf" role="search" @submit.prevent="go">
            <label class="vh" for="gl-nf-q">{{ t("galio.nf.searchLabel", "Search the pastries") }}</label>
            <gl-icon name="search" />
            <input id="gl-nf-q" :placeholder="t('galio.nf.searchPh', 'Search pastries')" :value="q" autocomplete="off" enterkeyhint="search" type="search" @input="q = $event.target.value" />
            <button class="btn" type="submit">{{ t("galio.nf.search", "Search") }}</button>
          </form>
          <div class="nf-acts">
            <router-link :to="{ path: '/' }" class="btn btn--ghost">{{ t("galio.nf.home", "Back to the home page") }}</router-link>
            <router-link :to="shopTo" class="link">{{ t("galio.ab.shopAll", "Shop all pastries") }}<gl-icon name="arrow" /></router-link>
          </div>
        </div>
        <ul v-if="picks.length" :aria-label="t('galio.nf.picksAria', 'Pastries people order most')" class="nf-plates">
          <li v-for="p in picks" :key="p.id">
            <router-link :style="{ '--gl-tint': tintOf(p.category_id) }" :to="productTo(p)"
              ><span class="nf-plate"><img :src="productImage(p, 128) || productImage(p)" alt="" height="400" width="400" /></span><span class="nf-name">{{ p.title }}</span
              ><span class="nf-price tab-num">{{ money(pv(p).now) }}</span></router-link
            >
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import GlIcon from "../../../components/galio/GlIcon.vue";
import { bySells, loadShop, money, priceView, productImage, productTo, shopAllTo, shopData, tintOf } from "../../../components/galio/galio";
import { currentCurrency } from "../../../components/region-switcher/region";
import { t } from "../../../components/kalio/i18n/kalio-i18n";

export default defineComponent({
  name: "StorefrontPageError404",
  components: { GlIcon },
  data: () => ({ q: "", data: shopData }),
  computed: {
    shopTo(): any {
      return shopAllTo();
    },
    /* Four best sellers in stock, one per collection. */
    picks(): any[] {
      const out: any[] = [];
      const used = new Set();
      for (const p of bySells(this.data.products.filter((x: any) => x.quantity > 0))) {
        if (out.length < 4 && !used.has(p.category_id)) {
          out.push(p);
          used.add(p.category_id);
        }
      }
      return out;
    },
  },
  created() {
    loadShop();
    (this as any).setPageTitle?.(t("galio.nf.title", "Page not found"));
  },
  methods: {
    t,
    money,
    tintOf,
    productImage,
    productTo,
    pv(p: any) {
      void currentCurrency();
      return priceView((this as any).$store.getters.getShop, p);
    },
    go() {
      const text = this.q.trim();
      const r = (window as any).$storefront.routes;
      this.$router.push(text ? { name: r.SHOP_PAGE, query: { search: text } } : shopAllTo());
    },
  },
});
</script>
