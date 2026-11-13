<!--
  Galio Sundae — the top of the product page (galio-design/product-b.html, g/pages-product.js): the
  gallery (the piece on a round plate in its collection's tint, the tilted saving sticker, one row of
  round thumbnails: Selldone's own photos of the product), the tabs under it (Why you'll love it: the
  product's own pros; the description when the product has one; Specification: the spec in the
  shop's groups; Reviews: an honest empty state with the shop's rating criteria until there is one);
  and the buy column on the strawberry card, which stays in view while the page scrolls: the
  collection, the name, "Sold by the piece · per <unit>", the price with the price before and the
  saving, the deal's clock only when the deal has a real end date, the stock, the options only when
  the product really has variants (tiles with their own photo, the chosen one ringed inside and
  tinted, no tick; Selldone's own picker in the same dress when they differ in more than one way),
  "Add to bag" (then − n +) and Compare, the shop's delivery, pickup, shipping and payment lines with
  their icons on one edge, and the SKU, the collection and "Copy link". On a phone, once the Add
  button has scrolled away, a buy bar at the foot.

  Every behaviour is Selldone's SProductOverview (through Kalio's): the chosen variant, the store, the
  basket line. A product that needs more than a count (a service, a valuation form, extra pricing, a
  subscription) keeps Selldone's own buy section here.
-->
<template>
  <section class="pd bg-white gl-pd">
    <div class="wrap pd-in">
      <div class="pd-left">
        <div class="gal">
          <div class="gal-main">
            <div :style="{ '--gl-tint': tint }" class="gal-plate">
              <img v-if="photo" :key="photo.src" :alt="photo.alt + (at ? ', ' + t('galio.pd.photoN', 'photo {n}', { n: at + 1 }) : '')" :src="photo.src" decoding="async" height="400" loading="eager" width="400" />
            </div>
            <span v-if="pv.off > 0" ref="sticker" :aria-label="t('galio.card.offAria', '{off} percent off', { off: pv.off })" class="sticker sticker--big" role="img"><span dir="ltr">−{{ pv.off }}%</span></span>
          </div>
          <div v-if="photos.length > 1" :aria-label="t('galio.pd.photos', 'Photos')" class="gal-thumbs" role="group">
            <button
              v-for="(ph, i) in photos"
              :key="ph.src"
              :aria-label="t('galio.pd.photoOf', 'Photo {n} of {total}', { n: i + 1, total: photos.length })"
              :aria-pressed="i === at ? 'true' : 'false'"
              :style="{ '--gl-tint': tint }"
              class="gthumb"
              type="button"
              @click="at = i"
            >
              <img :src="ph.thumb" alt="" height="120" loading="lazy" width="120" />
            </button>
          </div>
        </div>

        <div class="ptabs">
          <div :aria-label="t('galio.pd.details', 'Product details')" class="ptab-list" role="tablist" @keydown="onTabKeys">
            <button
              v-for="tb in tabs"
              :id="'gl-tab-' + tb.key"
              :key="tb.key"
              :aria-controls="'gl-pan-' + tb.key"
              :aria-selected="tab === tb.key ? 'true' : 'false'"
              :tabindex="tab === tb.key ? 0 : -1"
              class="ptab"
              role="tab"
              type="button"
              @click="tab = tb.key"
            >
              {{ tb.label }}
            </button>
          </div>
          <div v-if="pros.length" v-show="tab === 'pros'" id="gl-pan-pros" aria-labelledby="gl-tab-pros" class="ptab-pan" role="tabpanel">
            <ul class="pros">
              <li v-for="(x, i) in pros" :key="i">
                <span class="pro-ic"><gl-icon name="check" /></span><span><b>{{ x[0] }}</b><small>{{ x[1] }}</small></span>
              </li>
            </ul>
          </div>
          <div v-if="articleBody" v-show="tab === 'desc'" id="gl-pan-desc" aria-labelledby="gl-tab-desc" class="ptab-pan" role="tabpanel">
            <div class="art-body gl-pd-article" v-html="articleBody"></div>
          </div>
          <div v-if="groups.length" v-show="tab === 'spec'" id="gl-pan-spec" aria-labelledby="gl-tab-spec" class="ptab-pan" role="tabpanel">
            <div v-for="g in groups" :key="g.group" class="spec-g">
              <h3 v-if="g.group">{{ g.group }}</h3>
              <dl class="spec">
                <div v-for="r in g.rows" :key="r[0]">
                  <dt>{{ r[0] }}</dt>
                  <dd>{{ r[1] }}</dd>
                </div>
              </dl>
            </div>
          </div>
          <div v-show="tab === 'rev'" id="gl-pan-rev" aria-labelledby="gl-tab-rev" class="ptab-pan" role="tabpanel">
            <div v-if="!rated" class="rev">
              <div class="rev-empty">
                <span class="empty-ic"><gl-icon name="star" /></span>
                <div>
                  <h3>{{ t("galio.pd.noReviewsH", "No reviews yet") }}</h3>
                  <p>
                    {{
                      criteria.length
                        ? t("galio.pd.noReviewsP", "Nobody has reviewed the {name} yet. Reviews rate it on the points below.", { name: $product.title })
                        : t("galio.pd.noReviewsP0", "Nobody has reviewed the {name} yet.", { name: $product.title })
                    }}
                  </p>
                </div>
              </div>
              <ul v-if="criteria.length" class="rev-crit">
                <li v-for="c in criteria" :key="c">
                  <span>{{ c }}</span><span aria-hidden="true" class="rev-bar"></span><span class="rev-none">{{ t("galio.pd.notRated", "Not rated") }}</span>
                </li>
              </ul>
              <button v-if="!writing" class="btn btn--ghost" type="button" @click="write">
                {{ user ? t("galio.pd.writeFirst", "Write the first review") : t("galio.pd.signInReview", "Sign in to write a review") }}
              </button>
            </div>
            <div v-if="rated || writing" class="gl-rev-sd"><kalio-reviews /></div>
          </div>
        </div>
      </div>

      <div id="pbuy" class="pbuy">
        <router-link v-if="cat" :to="catTo(cat)" class="pb-cat"><bdi>{{ catName }}</bdi></router-link>
        <h1 class="pb-h">{{ $product.title }}</h1>
        <p class="pb-unit">{{ t("galio.pd.unitLine", "Sold by the piece · per {unit}", { unit }) }}</p>

        <div v-if="isSubscription" class="gl-sd-sub">
          <s-subscription-price-select
            v-model="selected_subscription_price"
            :disabled="!$product.quantity"
            :subscription-prices="subscription_prices"
            return-object
          ></s-subscription-price-select>
        </div>
        <template v-else>
          <div class="pb-price tab-num">
            <b>{{ money(pv.now) }}</b><s v-if="pv.was">{{ money(pv.was) }}</s
            ><span v-if="pv.save > 0" class="save">{{ t("galio.pd.save", "Save {amount} ({off}%)", { amount: money(pv.save), off: pv.off }) }}</span>
          </div>
          <p v-if="dealEndsAt" class="pb-stock"><gl-icon name="clock" /><span>{{ t("galio.pd.dealEnds", "Deal ends in") }}{{ " " }}<bakini-deal-clock :end="dealEndsAt" mode="bare" /></span></p>
        </template>

        <p class="pb-stock"><gl-icon name="box" /><span>{{ stockLine }}</span></p>
        <p v-if="!has_original_warranty" class="pb-unit">{{ $t("product_info.fake") }}</p>

        <!-- Options: only for a product that really has them. -->
        <div v-if="tiles.length" class="opts">
          <p class="opts-lbl">
            {{ dimWord }}<template v-if="currentLabel">: <b>{{ currentLabel }}</b></template>
          </p>
          <div :aria-label="dimWord" class="opt-tiles" role="radiogroup">
            <button
              v-for="tl in tiles"
              :key="tl.v.id"
              :aria-checked="current_variant && current_variant.id === tl.v.id ? 'true' : 'false'"
              class="opt-tile"
              role="radio"
              type="button"
              @click="current_variant = tl.v"
            >
              <span class="opt-img"><img v-if="tl.img" :src="tl.img" alt="" height="120" loading="lazy" width="120" /><i v-else-if="tl.swatch" :style="{ background: tl.swatch }" aria-hidden="true" class="gl-sw"></i></span>
              <span class="opt-n">{{ tl.label }}</span>
              <small v-if="tl.price !== null" class="opt-n tab-num">{{ money(tl.price) }}</small>
            </button>
          </div>
        </div>
        <div v-else-if="product_variants.length" class="opts gl-sd-variants">
          <s-product-section-variants v-model:current-variant="current_variant" v-model:filter="filter" v-model:selection-values="selection_values"></s-product-section-variants>
        </div>

        <div class="gl-sd-more">
          <s-product-section-service v-model:preferences="preferences"></s-product-section-service>
          <s-product-section-valuation
            v-if="preferences && preferences.valuation"
            :correspondingBasketItem="corresponding_basket_item"
            :current-variant="current_variant"
            :preferences="preferences"
          ></s-product-section-valuation>
          <s-product-section-extra-pricings
            :current-variant="current_variant"
            :preferences="preferences"
            :quantity="corresponding_basket_item?.count"
            :selected-vendor-product="selected_vendor_product"
            @select="(val) => $refs.buy_section?.triggerBuyButton(val.min)"
          ></s-product-section-extra-pricings>
        </div>

        <div id="pb-acts" ref="add" class="pb-acts">
          <gl-pd-qb v-if="simple" :needs-choice="needsChoice" :product="$product" :variant="current_variant" kind="big" />
          <s-product-section-buy-button
            v-else
            ref="buy_section"
            :can-buy="canBuy"
            :current-variant="current_variant"
            :hss-sticky-but-button="hssStickyButButton"
            :preferences="preferences"
            :quick-buy-mode="quickBuyMode"
            :selected-subscription-price="selected_subscription_price"
            :selected-vendor-product="selected_vendor_product"
            class="gl-sd-buy"
          ></s-product-section-buy-button>
          <button class="btn btn--cmp" type="button" @click="compareNow"><gl-icon name="compare" />{{ t("galio.pd.compare", "Compare") }}</button>
        </div>

        <ul v-if="lines.length" class="dlines">
          <li v-for="l in lines" :key="l.key">
            <gl-icon :name="l.icon" /><span
              ><b>{{ l.title }}</b><small v-if="l.line">{{ l.line }}</small></span
            >
          </li>
        </ul>

        <dl class="pb-meta">
          <div v-if="$product.sku">
            <dt>{{ t("galio.pd.sku", "SKU") }}</dt>
            <dd>{{ $product.sku }}</dd>
          </div>
          <div v-if="cat">
            <dt>{{ t("galio.pd.collection", "Collection") }}</dt>
            <dd><router-link :to="catTo(cat)"><bdi>{{ catName }}</bdi></router-link></dd>
          </div>
          <div>
            <dt>{{ t("galio.pd.share", "Share") }}</dt>
            <dd>
              <button class="link link--sm" type="button" @click="copyLink"><gl-icon :name="copied ? 'check' : 'link'" />{{ copied ? t("galio.pd.copied", "Link copied") : t("galio.pd.copy", "Copy link") }}</button>
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- The phone's buy bar, once the Add button has scrolled away. -->
    <div id="fbar" :aria-hidden="barOn ? undefined : 'true'" :class="['fbar', { on: barOn }]" :inert="barOn ? undefined : true">
      <div class="fbar-in">
        <span :style="{ '--gl-tint': tint }" class="fbar-plate"><img v-if="photos[0]" :src="photos[0].thumb" alt="" height="400" width="400" /></span>
        <span class="fbar-t"
          ><b>{{ $product.title }}</b
          ><span class="tab-num"
            >{{ money(pv.now) }}<template v-if="pv.was">{{ " " }}<s>{{ money(pv.was) }}</s></template></span
          ></span
        >
        <gl-pd-qb v-if="simple" :needs-choice="needsChoice" :product="$product" :variant="current_variant" kind="btn" />
        <button v-else class="btn" type="button" @click="toAdd">{{ t("galio.qb.add", "Add to bag") }}</button>
      </div>
    </div>
  </section>
</template>

<script>
import KalioProductOverview from "../../kalio/product/KalioProductOverview.vue";
import KalioReviews from "../../kalio/product/KalioReviews.vue";
import BakiniDealClock from "../../bakini/BakiniDealClock.vue";
import GlIcon from "../GlIcon.vue";
import GlPdQb from "./GlPdQb.vue";
import { catOf, catTitle, catTo, money, priceView, prosOf, ratingNames, shopData, specGroups, tintOf, unitOf } from "../galio";
import { deliveryLines, galleryOf } from "../gl-product";
import { colourName, dealEnd, moneyOf, swatchBg, variantDimension } from "../../bakini/bakini";
import { fitInCircle } from "../../bakini/fit-in-circle";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { currentCurrency } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "GlProductOverview",
  extends: KalioProductOverview,
  components: { BakiniDealClock, GlIcon, GlPdQb, KalioReviews },

  data() {
    return { at: 0, copied: false, barOn: false, data: shopData, tab: "", writing: false };
  },

  computed: {
    currency() {
      return currentCurrency();
    },
    user() {
      return this.$store.getters.getUser;
    },
    cat() {
      return this.$product?.category || catOf(this.$product?.category_id);
    },
    catName() {
      return catTitle(this.cat);
    },
    tint() {
      return tintOf(this.$product?.category_id);
    },
    unit() {
      return unitOf(this.$product);
    },
    pv() {
      void this.currency;
      return priceView(this.shop || this.$shop, this.$product, this.current_variant);
    },
    dealEndsAt() {
      return dealEnd(this.$product, this.current_variant);
    },
    photos() {
      return galleryOf(this.$product, this.current_variant);
    },
    photo() {
      return this.photos[Math.min(this.at, this.photos.length - 1)] || null;
    },
    stock() {
      const n = this.current_variant ? this.current_variant.quantity : this.$product.quantity;
      return Number(n) || 0;
    },
    stockLine() {
      const n = this.stock;
      if (n <= 0) return t("galio.pd.soldOut", "Sold out");
      return n > 15 ? t("galio.pd.inStockN", "In stock · {n} left", { n }) : t("galio.pd.onlyN", "Only {n} left", { n });
    },
    lines() {
      return deliveryLines(this.shop || this.$shop);
    },
    pros() {
      return prosOf(this.$product).filter((x) => x[0] || x[1]);
    },
    groups() {
      return specGroups(this.$product);
    },
    articleBody() {
      const body = this.$product?.article_pack?.article?.body;
      return body && String(body).replace(/<[^>]*>/g, "").trim() ? body : null;
    },
    criteria() {
      return ratingNames(this.$product);
    },
    rated() {
      return Number(this.$product?.rate_count) > 0;
    },
    tabs() {
      const out = [];
      if (this.pros.length) out.push({ key: "pros", label: t("galio.pd.tabPros", "Why you'll love it") });
      if (this.articleBody) out.push({ key: "desc", label: t("galio.pd.tabDesc", "Description") });
      if (this.groups.length) out.push({ key: "spec", label: t("galio.pd.tabSpec", "Specification") });
      out.push({ key: "rev", label: t("galio.pd.tabRev", "Reviews ({n})", { n: Number(this.$product?.rate_count) || 0 }) });
      return out;
    },
    enabledVariants() {
      return this.product_variants.filter((v) => v.enable !== false && v.enable !== 0);
    },
    dimension() {
      return variantDimension(this.enabledVariants);
    },
    dimWord() {
      const k = this.dimension?.key;
      if (k === "color") return t("galio.pd.colour", "Colour");
      const w = this.dimension?.word || t("galio.pd.option", "Option");
      return w.charAt(0).toUpperCase() + w.slice(1);
    },
    /* One dimension: a tile per variant with its own photo and price. */
    tiles() {
      const d = this.dimension;
      if (!d || d.key === "mixed") return [];
      return this.enabledVariants.map((v) => {
        const own = v.pricing && v.price != null;
        return {
          v,
          img: v.image ? window.CDN.GET_SHOP_IMAGE_PATH(v.image, 128) : d.key === "color" ? null : window.CDN.GET_SHOP_IMAGE_PATH(this.$product.icon, 128),
          swatch: d.key === "color" ? swatchBg(v.color) : null,
          label: d.key === "color" ? colourName(v.color) || t("galio.pd.colour", "Colour") : v[d.key],
          price: own ? moneyOf(this.shop, this.$product, v, this.currency).now : null,
        };
      });
    },
    currentLabel() {
      const x = this.tiles.find((y) => this.current_variant && y.v.id === this.current_variant.id);
      return x ? x.label : "";
    },
    needsChoice() {
      return this.product_variants.length > 0 && !this.current_variant;
    },
    /* A plain product: the buy control; anything Selldone's own button knows more about keeps it. */
    simple() {
      const p = this.$product;
      if (!p || this.isSubscription) return false;
      if ((p.type || "PHYSICAL") !== "PHYSICAL") return false;
      if (this.preferences && (this.preferences.valuation || this.preferences.service)) return false;
      if (p.valuation || (p.extra_pricings && p.extra_pricings.length)) return false;
      return true;
    },
    comparing() {
      return (this.$store.getters.getProductsComparison || []).some((p) => p.id === this.$product.id);
    },
  },

  watch: {
    "$product.id": {
      handler() {
        this.at = 0;
        this.copied = false;
        this.writing = false;
        this.tab = this.tabs[0]?.key || "rev";
      },
      immediate: true,
    },
    "current_variant.id"() {
      this.at = 0;
    },
    "pv.off"() {
      this.$nextTick(() => this.fit());
    },
  },

  mounted() {
    /* A scroll check, not an IntersectionObserver: a jump past the button (no frame in view) must still show the bar. */
    this.onScroll = () => {
      if (this.tick) return;
      this.tick = true;
      requestAnimationFrame(() => {
        this.tick = false;
        const el = this.$refs.add;
        this.barOn = !!el && el.getBoundingClientRect().bottom < 0;
      });
    };
    window.addEventListener("scroll", this.onScroll, { passive: true });
    this.fit();
    document.fonts?.ready?.then(() => this.fit());
  },

  beforeUnmount() {
    window.removeEventListener("scroll", this.onScroll);
    clearTimeout(this.copyTimer);
  },

  methods: {
    t,
    money,
    catTo,
    fit() {
      if (this.$refs.sticker) fitInCircle(this.$refs.sticker);
    },
    onTabKeys(e) {
      const keys = this.tabs.map((x) => x.key);
      const i = keys.indexOf(this.tab);
      const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
      let next = null;
      if (e.key === "ArrowRight") next = i + (rtl ? -1 : 1);
      else if (e.key === "ArrowLeft") next = i + (rtl ? 1 : -1);
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = keys.length - 1;
      if (next == null) return;
      e.preventDefault();
      this.tab = keys[(next + keys.length) % keys.length];
      this.$nextTick(() => document.getElementById("gl-tab-" + this.tab)?.focus());
    },
    write() {
      if (!this.user) {
        EventBus.$emit("need-login", true);
        return;
      }
      this.writing = true;
    },
    /* Add this pastry to Selldone's comparison and open the Layout's compare page: what the shopper
       already compares, else this with two of its own collection's best sellers. */
    compareNow() {
      if (!this.comparing) this.addToProductComparison(this.$product, this.current_variant, true);
      const stored = (this.$store.getters.getProductsComparison || []).map((p) => ({ p: p.id, v: p.variant?.id || null }));
      let refs = stored.filter((r) => r.p !== this.$product.id);
      refs.unshift({ p: this.$product.id, v: this.current_variant?.id || null });
      if (refs.length < 2) {
        const mates = this.data.products
          .filter((p) => p.category_id === this.$product.category_id && p.id !== this.$product.id)
          .sort((a, b) => (b.sells || 0) - (a.sells || 0))
          .slice(0, 2);
        refs = refs.concat(mates.map((p) => ({ p: p.id, v: null })));
      }
      const list = refs
        .slice(0, 4)
        .map((r) => `p${r.p}${r.v ? `v${r.v}` : ""}`)
        .join("_");
      this.$router.push({ name: window.$storefront.routes.COMPARISON_PAGE, query: { list } });
    },
    copyLink() {
      const url = window.location.href;
      const done = () => {
        this.copied = true;
        clearTimeout(this.copyTimer);
        this.copyTimer = setTimeout(() => (this.copied = false), 1600);
      };
      try {
        navigator.clipboard.writeText(url).then(done, done);
      } catch {
        done();
      }
    },
    toAdd() {
      this.$refs.add?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  },
};
</script>
