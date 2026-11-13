<!--
  Galio Sundae — "Buy together" (galio-design/g/pages-product.js togetherHTML()): this piece and the
  best seller of the two best-selling other collections, each on its round plate with a tick to leave
  it out; the live total with the price before; "Add all three to bag" (or two, or one), and then
  "In your bag" with a button that opens the bag. The page's product needs a chosen option first when
  it has options.
-->
<template>
  <section v-if="items.length > 1" aria-labelledby="gl-h-bt" class="sec sec--tight bg-lemon">
    <div class="wrap">
      <div class="head head--left">
        <span aria-hidden="true" class="kick">{{ t("galio.bt.kick", "goes well with") }}</span>
        <h2 id="gl-h-bt" class="h2">{{ t("galio.bt.h", "Buy together") }}</h2>
        <p class="lede">{{ lede }}</p>
      </div>
      <div class="bt">
        <ul class="bt-items">
          <template v-for="(x, i) in items" :key="x.p.id">
            <li :style="{ '--gl-tint': tintOf(x.p.category_id) }" class="bt-item">
              <label class="bt-chk chk"
                ><input :checked="picked[x.p.id]" :disabled="x.p.id === product.id && !mainReady" type="checkbox" @change="picked = { ...picked, [x.p.id]: $event.target.checked }" /><span class="vh">{{
                  t("galio.bt.include", "Include {name}", { name: x.p.title })
                }}</span></label
              >
              <router-link :to="productTo(x.p)" aria-hidden="true" class="bt-plate" tabindex="-1"><img :src="img(x.p)" alt="" height="400" width="400" /></router-link>
              <div class="bt-t">
                <span class="bt-this">{{ i === 0 ? t("galio.bt.this", "This pastry") : catTitle(catOf(x.p.category_id)) }}</span>
                <router-link :to="productTo(x.p)" class="bt-n">{{ x.p.title }}</router-link>
                <span class="bt-p tab-num"
                  >{{ money(x.v.now) }}<template v-if="x.v.was">{{ " " }}<s>{{ money(x.v.was) }}</s></template></span
                >
              </div>
            </li>
            <li v-if="i < items.length - 1" aria-hidden="true" class="bt-plus"><gl-icon name="plus" /></li>
          </template>
        </ul>
        <div class="bt-sum">
          <p class="bt-tot">
            <span>{{ totLabel }}</span><b class="tab-num">{{ money(sum.now) }}</b><s v-if="chosen.length && sum.was > sum.now" class="tab-num">{{ money(sum.was) }}</s>
          </p>
          <button :disabled="!chosen.length || busy" class="btn" type="button" @click="addAll">{{ addLabel }}</button>
          <p aria-live="polite" class="bt-note">
            <template v-if="done">{{ t("galio.bt.inBag", "In your bag.") }} <button class="link link--sm" type="button" @click="openBag">{{ t("galio.bt.openBag", "Open the bag") }}</button></template>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import GlIcon from "../GlIcon.vue";
import { catOf, catTitle, loadShop, money, openLayer, priceView, productImage, productTo, shopData, tintOf, unitOf } from "../galio";
import { togetherFor } from "../gl-product";
import { addCount } from "../../kalio/kalio-basket";
import { currentCurrency } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "GlTogether",
  components: { GlIcon },
  props: {
    product: { type: Object, required: true },
    variant: { type: Object, default: null },
  },
  data: () => ({ data: shopData, picked: {}, busy: false, done: false }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    /* The page's product needs a chosen option before it can join. */
    mainReady() {
      return !(this.product.product_variants || []).length || !!this.variant;
    },
    items() {
      void currentCurrency();
      void this.data.products.length;
      const list = [{ p: this.product, variant: this.variant }].concat(togetherFor(this.product).map((p) => ({ p, variant: null })));
      return list.map((x) => ({ ...x, v: priceView(this.shop, x.p, x.variant) }));
    },
    chosen() {
      return this.items.filter((x) => this.picked[x.p.id] && (x.p.id !== this.product.id || this.mainReady));
    },
    sum() {
      let now = 0;
      let was = 0;
      for (const x of this.chosen) {
        now += x.v.now;
        was += x.v.was || x.v.now;
      }
      return { now, was };
    },
    lede() {
      const unit = unitOf(this.product).toLowerCase();
      const n = this.items.length - 1;
      return n === 1
        ? t("galio.bt.lede1", "One {unit} and a favourite from another collection.", { unit })
        : t("galio.bt.lede", "One {unit} and two favourites from other collections.", { unit });
    },
    totLabel() {
      const n = this.chosen.length;
      if (!n) return t("galio.bt.nothing", "Nothing picked");
      if (n === this.items.length) return n === 3 ? t("galio.bt.allThree", "All three") : t("galio.bt.together", "Together");
      return t("galio.bt.pieces", { one: "{n} piece", other: "{n} pieces" }, { n });
    },
    addLabel() {
      const n = this.chosen.length;
      if (!n) return t("galio.bt.pick", "Pick a pastry");
      if (n === 3) return t("galio.bt.addThree", "Add all three to bag");
      if (n === 2) return t("galio.bt.addTwo", "Add two to bag");
      return t("galio.bt.addOne", "Add one to bag");
    },
  },
  watch: {
    items: {
      handler(list) {
        const next = { ...this.picked };
        for (const x of list) if (!(x.p.id in next)) next[x.p.id] = true;
        this.picked = next;
      },
      immediate: true,
    },
    "product.id"() {
      this.picked = {};
      this.done = false;
    },
  },
  created() {
    loadShop();
  },
  methods: {
    t,
    money,
    catOf,
    catTitle,
    tintOf,
    productTo,
    img(p) {
      return productImage(p, 128);
    },
    openBag(e) {
      openLayer("drawer", e?.currentTarget || null);
    },
    async addAll() {
      if (!this.chosen.length) return;
      this.busy = true;
      try {
        for (const x of this.chosen) await addCount(this, x.p, x.variant, 1);
        this.done = true;
      } finally {
        this.busy = false;
      }
    },
  },
};
</script>
