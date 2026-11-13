<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!--
    Galio Sundae — the product page (galio-design/product-b.html, g/pages-product.js), Glace's single
    product: the crumb strip (Home · Shop · the collection · the product); the gallery with the tabs
    under it and the sticky buy column (GlProductOverview); "Buy together" (this and the best seller
    of two other collections); "More <collection>" (never this product). Selldone's own sections for
    other kinds of product (offers, includes, files, membership, a product landing page) follow when
    the product has them.
  -->
  <div class="gl gl-pdp s--product">
    <slot name="header" :center="true"></slot>
    <span class="gl-pd-admin"><s-product-admin-button v-if="$vuetify.display.mdAndUp"></s-product-admin-button></span>
    <gl-ptitle :crumbs="crumbs" band="straw" crumbs-only />
    <gl-product-overview v-if="product" :key="product.id" can-buy show-cover />
    <section v-else aria-hidden="true" class="pd bg-white gl-pd-skel">
      <div class="wrap pd-in">
        <div class="pd-left"><div class="gal"><div class="gal-main"><div class="gal-plate"></div></div></div></div>
        <div class="pbuy"><i></i><i></i><i></i><i></i></div>
      </div>
    </section>

    <template v-if="product">
      <div v-if="hasSd" class="wrap gl-pd-sd">
        <s-product-offers class="s--product-section"></s-product-offers>
        <s-product-includes></s-product-includes>
        <s-product-files-list></s-product-files-list>
        <s-product-subscription-membership></s-product-subscription-membership>
      </div>
      <s-product-landing></s-product-landing>

      <gl-together :product="product" :variant="current_variant" />

      <section v-if="more.length" aria-labelledby="gl-h-more" class="sec sec--tight bg-mint">
        <div class="wrap">
          <div class="head head--left">
            <span aria-hidden="true" class="kick">{{ t("galio.pd.moreKick", "from the same tray") }}</span>
            <h2 id="gl-h-more" class="h2">{{ t("galio.pd.moreH", "More {name}", { name: catTitle(cat).toLowerCase() }) }}</h2>
          </div>
          <ul class="grid-cards row-cards"><gl-card v-for="p in more" :key="p.id" :product="p" /></ul>
          <div v-if="cat" class="sec-foot"><router-link :to="catTo(cat)" class="btn btn--ghost">{{ t("galio.pd.shopAll", "Shop all {name}", { name: catTitle(cat).toLowerCase() }) }}</router-link></div>
        </div>
      </section>
    </template>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import GlPtitle from "../../components/galio/GlPtitle.vue";
import GlCard from "../../components/galio/GlCard.vue";
import GlProductOverview from "../../components/galio/product/GlProductOverview.vue";
import GlTogether from "../../components/galio/product/GlTogether.vue";
import { bySells, catOf, catTitle, catTo, loadShop, shopAllTo, shopData } from "../../components/galio/galio";
import { rememberViewed } from "../../components/bakini/bakini";
import { t } from "../../components/kalio/i18n/kalio-i18n";
import { GtagEcommerce } from "@selldone/components-vue/plugins/gtag/GtagEcommerce";
import SProductIncludes from "@selldone/components-vue/storefront/product/includes/SProductIncludes.vue";
import SProductFilesList from "@selldone/components-vue/storefront/product/file/list/SProductFilesList.vue";
import SProductSubscriptionMembership from "@selldone/components-vue/storefront/product/subscription/membership/SProductSubscriptionMembership.vue";
import SProductOffers from "@selldone/components-vue/storefront/product/offers/SProductOffers.vue";
import { computed } from "vue";
import SProductAdminButton from "@selldone/components-vue/storefront/product/admin/button/SProductAdminButton.vue";
import { XapiProductGetTypes } from "@selldone/sdk-storefront/product";
import SProductLanding from "@selldone/components-vue/storefront/product/landing/SProductLanding.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { StorefrontSeo } from "../../helpers/StorefrontSeo";

export default {
  name: "StorefrontPageProduct",
  mixins: [CurrencyMixin],

  inject: ["$shop"],
  props: {},
  components: {
    GlPtitle,
    GlCard,
    GlProductOverview,
    GlTogether,
    SProductLanding,
    SProductAdminButton,
    SProductOffers,
    SProductSubscriptionMembership,
    SProductFilesList,
    SProductIncludes,
  },

  /* The product and the chosen variant, for Selldone's sections. */
  provide() {
    return {
      $product: computed(() => this.product),
      $variant: computed(() => this.current_variant),
    };
  },

  data: function () {
    return {
      product: null,
      busy: false,
      data: shopData,
    };
  },

  computed: {
    current_variant() {
      return this.$store.getters.getCurrentSelectedVariant;
    },
    cat() {
      return this.product ? this.product.category || catOf(this.product.category_id) : null;
    },
    crumbs() {
      const out = [[t("galio.crumb.home", "Home"), { path: "/" }], [t("galio.crumb.shop", "Shop"), shopAllTo()]];
      if (this.cat) out.push([catTitle(this.cat), catTo(this.cat)]);
      if (this.product) out.push([this.product.title]);
      return out;
    },
    /* Selldone's own sections for other kinds of product. */
    hasSd() {
      const p = this.product;
      return !!p && ((p.type && p.type !== "PHYSICAL") || (p.includes && p.includes.length) || (p.files && p.files.length) || (p.offers && p.offers.length));
    },
    /* More of the same collection, best sellers first, never this one. */
    more() {
      if (!this.product) return [];
      return bySells(this.data.products.filter((p) => p.category_id === this.product.category_id && p.id !== this.product.id)).slice(0, 4);
    },
  },

  watch: {
    $route() {
      this.getProduct();
    },
  },

  created() {
    loadShop();
    this.getProduct();
  },

  methods: {
    t,
    catTitle,
    catTo,

    getProduct() {
      const seoNavigation = StorefrontSeo.captureNavigation();
      const handleSuccessResponse = ({ product }: XapiProductGetTypes.IResponse) => {
        this.product = product;
        rememberViewed(product.id);

        GtagEcommerce.MeasuringViewsOfProductDetails(this.$shop, product, this.GetUserSelectedCurrency().code, "product-page");

        // Reject initial-load and superseded responses, including SDK cache callbacks.
        StorefrontSeo.updateProduct(product, this.$shop, seoNavigation, this.GetUserSelectedCurrency().code);
      };

      if (window.PRE_LOADED_DATA?.PRODUCT_PACK) {
        console.log("⚡ Turbo load product.");
        handleSuccessResponse(window.PRE_LOADED_DATA.PRODUCT_PACK);
        window.PRE_LOADED_DATA = null; // Clear!
      } else {
        this.busy = true;
      }

      window.$storefront.products
        .optimize(60)
        .get(this.getId(this.$route.params.product_id), {
          "augmented-categories": 3, // Return 3 categories in the parent folder of current category
          "augmented-cross-sells": true, // Return max 3 cross-selling items
        })
        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((e) => {
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
