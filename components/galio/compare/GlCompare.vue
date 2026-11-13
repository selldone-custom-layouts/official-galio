<!--
  Galio Sundae — the compare page (galio-design/compare-b.html, g/pages-product.js cmpRender()): the
  sky title band; "Only differences" and "Share this comparison"; a sticky row of heads (round tinted
  plate, ✕, name, price, the buy control) with an "Add a pastry" cell (a native select grouped by
  collection) while fewer than four; then the shop's own spec groups row by row, rows that differ
  carrying a dot and rows that agree written once with "· all"; "Why pick it" from the pros and an
  honest Reviews row. Built on Kalio's compare logic, so the address keeps Selldone's ?list= format.
-->
<template>
  <div class="gl gl-cmp-page">
    <gl-ptitle :crumbs="crumbs" :h1="t('galio.cmp.h1', 'Compare pastries')" :lede="t('galio.cmp.lede', 'Side by side, in the shop\'s own groups. Rows that differ carry a dot.')" band="sky" cls="ptitle--short" />

    <section class="sec sec--tight bg-white">
      <div class="wrap">
        <gl-empty
          v-if="!items.length"
          :text="busy ? '' : t('galio.cmp.emptyP', 'Add up to four pastries and see them side by side, row by row.')"
          :title="busy ? t('galio.cmp.loading', 'Opening your comparison…') : t('galio.cmp.emptyT', 'Nothing to compare yet')"
          icon="compare"
        >
          <template v-if="!busy">
            <span class="sel gl-cmp-sel">
              <select :aria-label="t('galio.cmp.addOne', 'Add a pastry')" @change="pickFrom($event)">
                <option value="">{{ t("galio.cmp.addOne", "Add a pastry") }}…</option>
                <optgroup v-for="g in pickGroups" :key="g.id" :label="g.title">
                  <option v-for="p in g.products" :key="p.id" :value="p.id">{{ p.title }}</option>
                </optgroup>
              </select>
              <gl-icon name="down" />
            </span>
            <router-link :to="catalogue" class="btn btn--ghost">{{ t("galio.cmp.browse", "Browse every pastry") }}</router-link>
          </template>
        </gl-empty>

        <template v-else>
          <div class="cmp-bar">
            <label v-if="items.length > 1" class="switch"><input v-model="diffOnly" type="checkbox" /><span>{{ t("galio.cmp.onlyDiff", "Only differences") }}</span></label>
            <span v-else></span>
            <button class="link" type="button" @click="copy('top')">
              <gl-icon :name="copied === 'top' ? 'check' : 'share'" />{{ copied === "top" ? t("galio.cmp.copied", "Link copied") : t("galio.cmp.share", "Share this comparison") }}
            </button>
          </div>

          <div :class="['cmp', { 'only-diff': diffOnly }]" :style="{ '--gl-n': cols }">
            <div ref="head" class="cmp-head" @scroll.passive="sync($event, 'body')">
              <div class="cmp-row cmp-row--head">
                <div class="ch-lab">{{ t("galio.cmp.n", { one: "{n} pastry", other: "{n} pastries" }, { n: items.length }) }}</div>
                <div v-for="it in items" :key="it.key" class="ch-cell">
                  <div class="ch-top">
                    <router-link :style="{ '--gl-tint': tintOf(it.product.category_id) }" :to="productRoute(it)" aria-hidden="true" class="ch-plate" tabindex="-1"
                      ><img :src="it.image" alt="" height="400" width="400"
                    /></router-link>
                    <button v-if="items.length > 1" :aria-label="t('galio.cmp.remove', 'Remove {name} from the comparison', { name: it.product.title })" class="ch-x" type="button" @click="remove(it)">
                      <gl-icon name="x" />
                    </button>
                  </div>
                  <router-link :to="productRoute(it)" class="ch-n">{{ it.product.title }}</router-link>
                  <span v-if="it.variantLabel" class="ch-v">{{ it.variantLabel }}</span>
                  <span class="ch-p tab-num"
                    >{{ fmt(it.price.now) }}<template v-if="it.price.was">{{ " " }}<s>{{ fmt(it.price.was) }}</s></template></span
                  >
                  <gl-pd-qb v-if="it.variant" :product="it.product" :variant="it.variant" kind="btn" />
                  <gl-qb v-else :product="it.product" kind="btn" />
                </div>
                <div v-if="items.length < MAX" class="ch-cell ch-add">
                  <span class="ch-add-ic"><gl-icon name="plus" /></span>
                  <label :for="'gl-cmp-add'">{{ t("galio.cmp.addOne", "Add a pastry") }}</label>
                  <span class="sel">
                    <select id="gl-cmp-add" @change="pickFrom($event)">
                      <option value="">{{ t("galio.cmp.choose", "Choose…") }}</option>
                      <optgroup v-for="g in pickGroups" :key="g.id" :label="g.title">
                        <option v-for="p in g.products" :key="p.id" :value="p.id">{{ p.title }}</option>
                      </optgroup>
                    </select>
                    <gl-icon name="down" />
                  </span>
                </div>
              </div>
            </div>

            <div ref="body" class="cmp-body" @scroll.passive="sync($event, 'head')">
              <div class="cmp-rows">
                <div v-for="g in groups" :key="g.title" class="cg">
                  <h2 class="cg-h">{{ g.title }}</h2>
                  <div v-for="r in g.rows" :key="r.key" :class="['cr', r.diff ? 'cr--diff' : 'cr--same']">
                    <div class="cr-lab">
                      <span v-if="r.diff" :aria-label="t('galio.cmp.differs', 'Differs')" class="dot" role="img"></span><bdi>{{ r.key }}</bdi>
                    </div>
                    <div v-if="r.same" class="cr-all">
                      <bdi>{{ r.values[0] }}</bdi>{{ " " }}<span class="cr-tag">· {{ t("galio.cmp.all", "all") }}</span>
                    </div>
                    <template v-else>
                      <div v-for="(v, i) in r.values" :key="i" class="cr-v"><bdi>{{ v || "—" }}</bdi></div>
                      <div v-if="items.length < MAX" class="cr-v cr-empty"></div>
                    </template>
                  </div>
                </div>

                <div class="cg">
                  <h2 class="cg-h">{{ t("galio.cmp.why", "Why pick it") }}</h2>
                  <div v-if="whyIdx.length" :class="['cr', items.length > 1 ? 'cr--diff' : 'cr--same']">
                    <div class="cr-lab">
                      <span v-if="items.length > 1" :aria-label="t('galio.cmp.differs', 'Differs')" class="dot" role="img"></span>{{ t("galio.cmp.apart", "What sets it apart") }}
                    </div>
                    <div v-for="it in items" :key="it.key" class="cr-v">
                      <ul class="cr-pros">
                        <li v-for="i in whyIdx" v-show="prosOf(it.product)[i]" :key="i">
                          <gl-icon name="check" /><span>{{ prosText(it.product, i) }}</span>
                        </li>
                      </ul>
                    </div>
                    <div v-if="items.length < MAX" class="cr-v cr-empty"></div>
                  </div>
                  <div :class="['cr', reviews.same ? 'cr--same' : 'cr--diff']">
                    <div class="cr-lab">
                      <span v-if="!reviews.same" :aria-label="t('galio.cmp.differs', 'Differs')" class="dot" role="img"></span>{{ t("galio.cmp.reviews", "Reviews") }}
                    </div>
                    <div v-if="reviews.same" class="cr-all">
                      {{ reviews.none ? noneText : reviews.cells[0] }}{{ " " }}<span v-if="items.length > 1" class="cr-tag">· {{ t("galio.cmp.all", "all") }}</span>
                    </div>
                    <template v-else>
                      <div v-for="(c, i) in reviews.cells" :key="i" class="cr-v">{{ c }}</div>
                      <div v-if="items.length < MAX" class="cr-v cr-empty"></div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p v-if="noPer" class="cmp-foot">{{ t("galio.cmp.foot", "Every pastry is sold by the piece, so there is no price per weight.") }}</p>
        </template>
      </div>
    </section>
  </div>
</template>

<script>
import KalioCompare from "../../kalio/compare/KalioCompare.vue";
import GlIcon from "../GlIcon.vue";
import GlQb from "../GlQb.vue";
import GlEmpty from "../GlEmpty.vue";
import GlPtitle from "../GlPtitle.vue";
import GlPdQb from "../product/GlPdQb.vue";
import { catOf, catTitle, catTo, catsBySells, loadShop, money, prosOf, shopData, tintOf } from "../galio";
import { catalogueRoute } from "../../kalio/kalio-catalog";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "GlCompare",
  extends: KalioCompare,
  components: { GlIcon, GlQb, GlEmpty, GlPtitle, GlPdQb },

  data: () => ({ data: shopData }),

  computed: {
    cols() {
      return this.items.length + (this.items.length < this.MAX ? 1 : 0);
    },
    catalogue() {
      return catalogueRoute({});
    },
    crumbs() {
      const out = [[t("galio.crumb.home", "Home"), { path: "/" }]];
      const c = this.items[0] ? catOf(this.items[0].product.category_id) : null;
      if (c) out.push([catTitle(c), catTo(c)]);
      out.push([t("galio.cmp.crumb", "Compare")]);
      return out;
    },
    /* Every collection's pastries not compared yet, the first pick's collection first. */
    pickGroups() {
      const first = this.items[0]?.product.category_id;
      const cats = catsBySells().slice();
      cats.sort((a, b) => (a.id === first ? -1 : b.id === first ? 1 : 0));
      return cats
        .map((c) => ({ id: c.id, title: catTitle(c), products: this.data.products.filter((p) => p.category_id === c.id && !this.ids.includes(p.id)) }))
        .filter((g) => g.products.length);
    },
    /* Up to two pros whose words differ between the picks (all of the first two with one pick). */
    whyIdx() {
      const list = this.items.map((it) => prosOf(it.product));
      return [0, 1, 2, 3]
        .filter((i) => {
          const tx = list.map((l) => (l[i] ? l[i][1] || l[i][0] : ""));
          return tx[0] && (list.length === 1 || tx.some((x) => x !== tx[0]));
        })
        .slice(0, 2);
    },
    reviews() {
      const cells = this.items.map((it) =>
        it.rateCount > 0 ? t("galio.cmp.rated", { one: "{rate} of 5 · {n} review", other: "{rate} of 5 · {n} reviews" }, { rate: it.rate.toFixed(1), n: it.rateCount }) : t("galio.cmp.noReviews", "No reviews yet"),
      );
      const none = this.items.every((it) => !(it.rateCount > 0));
      return { cells, none, same: cells.every((c) => c === cells[0]) };
    },
    noneText() {
      return this.items.length > 1 ? t("galio.cmp.noneAll", "No reviews yet for any of these pastries") : t("galio.cmp.noReviews", "No reviews yet");
    },
    noPer() {
      return this.items.length && this.items.every((it) => !it.per);
    },
  },

  created() {
    loadShop();
  },

  methods: {
    t,
    tintOf,
    prosOf,
    fmt(n) {
      return money(n);
    },
    prosText(p, i) {
      const x = prosOf(p)[i];
      return x ? x[1] || x[0] : "";
    },
    pickFrom(e) {
      const id = Number(e.target.value);
      e.target.value = "";
      const p = this.data.products.find((x) => x.id === id);
      if (p) this.add(p);
    },
    /* The heads and the rows scroll sideways together. */
    sync(e, other) {
      if (this.syncing) return;
      const to = this.$refs[other];
      if (!to) return;
      this.syncing = true;
      to.scrollLeft = e.target.scrollLeft;
      requestAnimationFrame(() => (this.syncing = false));
    },
  },
};
</script>
