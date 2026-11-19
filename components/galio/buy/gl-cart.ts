/*
 * Galio Sundae — what the bag page and checkout (galio-design/cart-b.html, checkout-b.html) read on
 * top of Selldone's own basket page script (pages/basket/cart/StorefrontPageBasketCart.vue keeps its
 * whole script: bill, basket config, coupons, shipping options, guest email, the payment window).
 * Mixed into that page.
 *
 * - Two stages, as the mockup's two pages: the bag (rows, "How it reaches you", the summary,
 *   "Checkout") and the checkout (step pills, numbered cards, the order summary). ?step=checkout
 *   opens the second; both are the same Selldone basket.
 * - The checkout cards write Selldone's own basket config: the guest email (guest_email), the
 *   receiver phone and note (receiver_info.phone, .message), the delivery way and its window
 *   (delivery_info.type, .custom, .days, .time_spans), the billing address (billing).
 * - Pickup is Selldone's: the pickup point becomes the receiver, so the bag shows the counter.
 */
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";
import { bySells, catImage, catOf, catTitle, catTo, loadShop, productTo, shopData, shopFacts, tintOf, unitOf, wayTitle } from "../galio";
import { catalogueRoute } from "../../kalio/kalio-catalog";
import { shownCount, stepTo } from "../../kalio/kalio-basket";
import { productImage } from "../../kalio/kalio-catalog";
import { money } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

declare const window: any;

/** The shop's own record of a way (its fee and free threshold live there;
    the bill's copy may leave them out). */
export function shopWay(shop: any, way: any): any {
  return (shop?.transportations || []).find((x: any) => x.type === way?.type && (!way?.id || !x.id || x.id === way.id)) || (shop?.transportations || []).find((x: any) => x.type === way?.type) || way;
}

/** A delivery way's icon in the mockup's set. */
export function wayIcon(type: string): string {
  if (type === ShopTransportations.Pickup.code) return "store";
  if (["Global", "Post", "Airplane", "Ship"].includes(type)) return "plane";
  return "scooter";
}

/** A delivery window by the shop's own word ("Morning"), not Selldone's hours. */
export function windowWord(value: string): string {
  const words: Record<string, string> = {
    Morning: t("galio.co.winMorning", "Morning"),
    Evening: t("galio.co.winEvening", "Evening"),
    Night: t("galio.co.winNight", "Night"),
    Instant: t("galio.co.winInstant", "Instant"),
  };
  return words[value] || value;
}

/** The way offers parts of the day to choose from (Selldone's ETA "timeframe" kinds). A window left
    over from another way means nothing for it ("Worldwide shipping · Morning", live 14 Nov 2026). */
export function wayHasWindows(way: any): boolean {
  return ["weekday-timeframe", "timeframe"].includes(way?.eta);
}

/** "<way> · <window>" when the shopper chose one window of a way that has windows. */
export function wayWindowLine(shop: any, info: any): string {
  if (!info?.type) return "";
  const way = shopWay(shop, { type: info.type });
  const name = wayTitle(way, shop);
  const win = info.custom && (info.time_spans || []).length === 1 && wayHasWindows(way) ? windowWord(info.time_spans[0]) : "";
  return win ? `${name} · ${win}` : name;
}

/** The way's reach, from its own data ("Local delivery within 30 km of the
    bakery", "Ships anywhere"). */
export function wayReach(shop: any, given: any): string {
  const item = { ...(given || {}), ...shopWay(shop, given) };
  if (item.message) return item.message;
  /* A pickup has no reach: the counter's address and hours say it (Bakio's
     pickup order SM-40 read "Local delivery within 100 km", 13 Nov 2026). */
  if (item.type === ShopTransportations.Pickup.code) return "";
  if (item.type === "Global") return t("galio.co.shipsAnywhere", "Ships anywhere");
  if (item.distance && item.distance < 1000) return t("galio.co.within", "Local delivery within {km} km of the bakery", { km: item.distance });
  return "";
}

/** The counter's hours for a line after its own note ("open every day 8:00–18:00"), or nothing when
    the note already gives them (Bakio's note says "Open every day 8:00–18:00." itself: the delivery
    sheet said the hours twice, live 14 Nov 2026). */
export function counterHours(note: string, facts: any): string {
  if (!facts?.hours) return "";
  const flat = (x: string) => String(x || "").replace(/[\s–—-]+/g, "").toLowerCase();
  if (flat(note).includes(flat(facts.hours))) return "";
  return facts.everyDay ? t("galio.co.openEvery", "open every day {hours}", { hours: facts.hours }) : facts.hours;
}

/** "Morning, Evening, Night or Instant". */
export function orWords(list: string[]): string {
  if (list.length < 2) return list.join("");
  return list.slice(0, -1).join(", ") + t("galio.co.or", " or ") + list[list.length - 1];
}

/** The small line under a way's name, from its own data. On the bag page (cart-b): "Within 30 km ·
    Morning, Evening, Night or Instant", "Anywhere · Morning or Evening", "1 The Embarcadero,
    8:00–18:00". At checkout (checkout-b): "Within 30 km of the bakery, every day", "Anywhere, every
    day", "1 The Embarcadero, daily 8:00–18:00". */
export function waySmall(shop: any, given: any, stage: "bag" | "checkout", pickup: any = null): string {
  const item = { ...(given || {}), ...shopWay(shop, given) };
  const facts = shopFacts(shop);
  if (item.type === ShopTransportations.Pickup.code) {
    const p = pickup || (item.pickups || [])[0] || facts.pickupPoint;
    const street = p?.address || String(facts.address || "").split(",")[0];
    const hours = facts.hours ? (stage === "checkout" && facts.everyDay ? t("galio.co.dailyHours", "daily {hours}", { hours: facts.hours }) : facts.hours) : "";
    return [street, hours].filter(Boolean).join(", ");
  }
  const days = Array.isArray(item.days) && item.days.length >= 7 ? t("galio.co.everyDay", "every day") : "";
  /* windows only for a way that lets the shopper pick one (the bag said "Anywhere · Morning or Evening"
     for shipping, whose checkout offers no window) */
  const wins = wayHasWindows(item) ? orWords((item.time_spans || []).map(windowWord)) : "";
  const global = ["Global", "Post", "Airplane", "Ship"].includes(item.type);
  const reach = global ? t("galio.co.anywhere", "Anywhere") : item.distance && item.distance < 1000 ? (stage === "checkout" ? t("galio.co.withinOf", "Within {km} km of the bakery", { km: item.distance }) : t("galio.co.withinKm", "Within {km} km", { km: item.distance })) : "";
  if (stage === "bag") return [reach, wins || days].filter(Boolean).join(" · ");
  return [reach, days].filter(Boolean).join(", ");
}

/** True when the order or bill is collected at a pickup counter. */
export function isPickupWay(info: any): boolean {
  return info?.type === ShopTransportations.Pickup.code;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default {
  data: () => ({ gcData: shopData, gc_touched: {} as Record<string, boolean>, gc_billing_other: false, gc_note: "", gc_show_missing: false }),

  computed: {
    crumbsBag(this: any) {
      return [[t("galio.crumb.home", "Home"), { path: "/" }], [t("galio.co.yourBag", "Your bag")]];
    },
    crumbsCheckout(this: any) {
      const q = { ...(this.$route?.query || {}) };
      delete q.step;
      return [[t("galio.crumb.home", "Home"), { path: "/" }], [t("galio.co.yourBag", "Your bag"), { query: q }], [t("galio.co.checkout", "Checkout")]];
    },
    /* The note under the bag page's ways: the windows are picked at checkout; one way to pay for all. */
    gc_bag_note(this: any): string {
      const gws = this.gc_facts.gateways || [];
      const head = t("galio.co.pickLater", "You pick the time window at checkout.");
      if (gws.length === 1 && gws[0].name) return `${head} ${t("galio.co.oneGateway", "{gateway} for every method.", { gateway: gws[0].name })}`;
      return head;
    },
    /* The address card's number: after Contact and Delivery when both are shown. */
    gc_n_address(this: any): number {
      return this.has_delivery && !this.isService && this.bill ? 3 : 2;
    },
    gc_pickup_title(this: any): string {
      const way = this.transportation_list?.find((x: any) => x.type === ShopTransportations.Pickup.code);
      return way?.title || this.receiver_info?.name || this.receiver_info?.title || this.gc_pickup_point?.name || t("galio.co.pickupCounter", "Pickup at the counter");
    },
    /* "Counter at the … entrance, open every day 8:00–18:00": the counter's own note and the hours. */
    gc_pickup_line(this: any): string {
      const note = this.gc_pickup_point?.message || "";
      const hours = counterHours(note, this.gc_facts);
      const line = [note, hours].filter(Boolean).join(", ");
      return line ? line.charAt(0).toUpperCase() + line.slice(1) + (/[.!?]$/.test(line) ? "" : ".") : "";
    },
    gc_no_address_line(this: any): string {
      if (["Global", "Post", "Airplane", "Ship"].includes(this.delivery_info?.type)) return t("galio.co.noAddressGlobal", "Add the address the parcel should go to.");
      return this.no_map ? t("galio.co.noAddressP0", "Add the receiver and the street.") : t("galio.co.noAddressP", "Set your door on the map so the courier finds it.");
    },
    /* A phone number in the shop's own format as the hint, else a neutral one. */
    gc_phone_hint(this: any): string {
      const p = String(this.gc_facts.phone || "");
      return p ? p.replace(/-/g, " ").replace(/\d\d$/, "00") : "+1 …";
    },
    gc_stage(this: any): "bag" | "checkout" {
      return this.$route?.query?.step === "checkout" ? "checkout" : "bag";
    },
    gc_facts(this: any) {
      return shopFacts(this.$shop);
    },
    gc_lines(this: any): any[] {
      return (this.basket?.items || []).filter((it: any) => shownCount(it.product || { id: it.product_id }, it) > 0);
    },
    gc_currency(this: any): string {
      return this.bill?.currency || this.basket?.currency;
    },
    /* The receipt, in Selldone's own sums: full price, the items' savings,
       offers, delivery, the total. */
    gc_rc(this: any) {
      const b = this.bill || {};
      return {
        full: Number(b.items_price) || 0,
        save: Number(b.items_discount) || 0,
        offer: Number(b.offer) || 0,
        delivery: typeof b.delivery_price === "number" ? b.delivery_price : -1,
        total: Number(b.sum) || 0,
      };
    },
    /* "You save 25%" when every line saves the same percent. */
    gc_save_label(this: any): string {
      const offs = this.gc_lines.filter((it: any) => it.dis > 0).map((it: any) => Math.round((it.dis / (it.price + it.dis)) * 100));
      if (offs.length && offs.length === this.gc_lines.length && offs.every((x: number) => x === offs[0]))
        return t("galio.co.youSaveOff", "You save {off}%", { off: offs[0] });
      return t("galio.co.youSave", "You save");
    },
    /* The pieces in the bag (the counts the rows show). */
    gc_pieces(this: any): number {
      return this.gc_lines.reduce((n: number, it: any) => n + shownCount(it.product || { id: it.product_id }, it), 0);
    },
    gc_way(this: any) {
      return this.transportation_now || null;
    },
    gc_is_pickup(this: any): boolean {
      return this.delivery_info?.type === ShopTransportations.Pickup.code;
    },
    gc_pickup_point(this: any) {
      const way = this.transportation_list?.find((x: any) => x.type === ShopTransportations.Pickup.code);
      return way?.pickups?.[0] || this.gc_facts.pickupPoint || null;
    },
    /* The receiver is the pickup counter (left from choosing pickup). */
    gc_receiver_is_pickup(this: any): boolean {
      const r = this.receiver_info;
      const pickups = this.transportation_list?.filter((x: any) => x.type === ShopTransportations.Pickup.code).flatMap((x: any) => x.pickups || []) || [];
      return !!r?.address && pickups.some((p: any) => p.address === r.address && (p.name || "") === (r.name || ""));
    },
    gc_has_address(this: any): boolean {
      return !!(this.receiver_info?.address && this.is_valid_location && !this.gc_receiver_is_pickup);
    },
    gc_email: {
      get(this: any): string {
        return this.user ? this.user.email || "" : this.guest_email || "";
      },
      set(this: any, v: string) {
        if (this.user) return;
        this.guest_email = (v || "").trim();
      },
    },
    gc_phone: {
      get(this: any): string {
        const r = this.receiver_info || {};
        if (this.gc_receiver_is_pickup && r.phone === this.gc_pickup_point?.phone) return "";
        return r.phone || "";
      },
      set(this: any, v: string) {
        if (!this.basket) return;
        if (!this.basket.receiver_info || Array.isArray(this.basket.receiver_info)) this.basket.receiver_info = {};
        this.basket.receiver_info.phone = v;
      },
    },
    gc_note_value: {
      get(this: any): string {
        const r = this.receiver_info || {};
        /* the counter's own note (left from choosing pickup) is not the buyer's */
        if (this.gc_receiver_is_pickup && r.message && r.message === this.gc_pickup_point?.message) return "";
        return r.message || "";
      },
      set(this: any, v: string) {
        if (!this.basket) return;
        if (!this.basket.receiver_info || Array.isArray(this.basket.receiver_info)) this.basket.receiver_info = {};
        this.basket.receiver_info.message = v;
      },
    },
    gc_email_ok(this: any): boolean {
      return !!this.user || EMAIL.test(this.guest_email || "");
    },
    gc_phone_ok(this: any): boolean {
      return String(this.gc_phone || "").replace(/\D/g, "").length >= 7;
    },
    gc_billing_custom(this: any): boolean {
      return !!this.billing?.custom || this.gc_billing_other;
    },
    /* What is still needed before Pay, named (the mockup's list). */
    gc_missing(this: any): { key: string; label: string }[] {
      const m: { key: string; label: string }[] = [];
      if (!this.user && !this.has_guest_payment) m.push({ key: "signin", label: t("galio.co.needSignIn", "Sign in to place the order") });
      if (!this.user && this.has_guest_payment && !this.gc_email_ok)
        m.push({ key: "email", label: this.guest_email ? t("galio.co.needEmailValid", "Check your email address") : t("galio.co.needEmail", "Add your email address") });
      if (this.has_delivery && !this.isService && !this.gc_phone_ok) m.push({ key: "phone", label: t("galio.co.needPhone", "Add a phone number") });
      if (this.has_delivery && !this.isService && !this.gc_is_pickup && !this.gc_has_address)
        m.push({ key: "address", label: this.no_map ? t("galio.co.needAddress0", "Add the delivery address") : t("galio.co.needAddress", "Add the delivery address on the map") });
      if (this.gc_billing_custom && !(this.billing?.address && this.billing?.name)) m.push({ key: "billing", label: t("galio.co.needBilling", "Add the billing address") });
      return m;
    },
    /* Step pills (the mockup's three): Bag, Details, Pay on delivery (or Payment). */
    gc_steps(this: any) {
      const at = this.gc_stage === "checkout" ? 1 : 0;
      const pay = this.gc_cod_only ? (this.gc_is_pickup ? t("galio.co.stepPayPickup", "Pay at pickup") : t("galio.co.stepPayCod", "Pay on delivery")) : t("galio.co.stepPayment", "Payment");
      return [
        { key: "bag", label: t("galio.co.stepBag", "Bag"), icon: "bag" },
        { key: "details", label: t("galio.co.stepDetails", "Details"), icon: "doc" },
        { key: "pay", label: pay, icon: this.gc_cod_only ? "cash" : "card" },
      ].map((x, i) => ({ ...x, state: i < at ? "done" : i === at ? "now" : "next" }));
    },
    /* Every way to pay is cash on delivery (Bakio): the button says so. */
    gc_cod_only(this: any): boolean {
      const ways = this.payment_ways;
      return !!ways && ways.length > 0 && ways.every((g: any) => g.cod);
    },
    gc_no_gateway(this: any): boolean {
      return !!this.payment_ways && !this.payment_ways.length && this.gc_rc.total > 0 && !this.is_service_need_pricing && !this.isSubscription;
    },
    gc_place_label(this: any): string {
      const total = this.gc_money(this.gc_rc.total);
      if (this.is_service_need_pricing) return this.$t("basket_page.pre_confirm_service");
      if (!this.gc_cod_only) return t("galio.co.place", "Place order · pay {total}", { total });
      return this.gc_is_pickup ? t("galio.co.placePickup", "Place order · pay {total} on pickup", { total }) : t("galio.co.placeCod", "Place order · pay {total} on delivery", { total });
    },
    gc_way_line(this: any): string {
      const way = this.gc_way;
      if (!way) return "";
      const name = wayTitle(way, this.$shop);
      const spans = this.delivery_info?.custom && this.delivery_info?.time_spans?.length === 1 && wayHasWindows({ ...way, ...shopWay(this.$shop, way) }) ? windowWord(this.delivery_info.time_spans[0]) : "";
      return spans ? `${name} · ${spans}` : name;
    },
    gc_delivery_label(this: any): string {
      const way = this.gc_way;
      return way ? wayTitle(way, this.$shop) : t("galio.co.delivery", "Delivery");
    },
    /* The receipt's delivery value. Selldone sends -1 for "paid on delivery"
       (the way's SOD switch); a way with no fee at all (no fixed fee, no rate
       by distance or weight) is free either way, as its card says. */
    gc_delivery_value(this: any): string {
      const d = this.gc_rc.delivery;
      if (d > 0) return this.gc_money(d);
      if (d === 0 || this.gc_way_is_free) return t("galio.co.free", "Free");
      return t("galio.co.atDoor", "On delivery");
    },
    /* The chosen way costs nothing: no fixed fee, no rate by distance or weight. */
    gc_way_is_free(this: any): boolean {
      const way = this.gc_way ? { ...this.gc_way, ...shopWay(this.$shop, this.gc_way) } : null;
      if (!way) return false;
      if (way.type === ShopTransportations.Pickup.code) return true;
      return !(Number(way.const) > 0) && !(Number(way.distance_rate) > 0) && !(Number(way.weight_rate) > 0);
    },
    /* The bag's delivery ways in the checkout's order: the ways, then pickup. */
    gc_ways_in_order(this: any): any[] {
      const list = this.transportation_list || [];
      const pickup = ShopTransportations.Pickup.code;
      return [...list.filter((w: any) => w.type !== pickup), ...list.filter((w: any) => w.type === pickup)];
    },
    shopTo(): any {
      return catalogueRoute({});
    },
    gc_often(this: any): any[] {
      const inBag = new Set(this.gc_lines.map((it: any) => it.product_id));
      return bySells(this.gcData.products.filter((p: any) => p.quantity > 0 && !inBag.has(p.id))).slice(0, 12);
    },
  },

  created() {
    loadShop();
  },

  methods: {
    catTitle,
    /* A way's name on the cards: the merchant's title, "Pickup at the counter" for a counter. */
    gc_way_name(this: any, way: any): string {
      if (way?.title) return way.title;
      if (way?.type === ShopTransportations.Pickup.code) return t("galio.co.pickupCounter", "Pickup at the counter");
      return wayTitle(way, this.$shop);
    },
    gc_way_small(this: any, way: any, stage: "bag" | "checkout"): string {
      return waySmall(this.$shop, way, stage);
    },
    gc_anchor(key: string): string {
      return ({ email: "co-f-email", phone: "co-f-phone", address: "f-addr", billing: "co-billing" } as Record<string, string>)[key] || "co-details";
    },
    gc_open_sheet(this: any) {
      this.delivery_sheet = true;
    },
    gc_close_sheet(this: any) {
      this.delivery_sheet = false;
    },
    t,
    tintOf,
    catTo,
    wayIcon,
    catImg(c: any) {
      return catImage(c, 128);
    },
    /* The way's own title, else words from its kind (gl-data.ts). */
    wayTitleOf(this: any, way: any): string {
      return wayTitle(way, this.$shop);
    },
    unitOf,
    productTo,
    gc_cat(this: any, it: any): string {
      return catTitle(catOf(it.product?.category_id));
    },
    gc_img(it: any): string | null {
      return productImage(it.product || {}, true);
    },
    gc_money(this: any, n: number): string {
      return money(Number(n) || 0, this.gc_currency);
    },
    gc_shown(it: any): number {
      return shownCount(it.product || { id: it.product_id }, it);
    },
    gc_remove(this: any, it: any) {
      stepTo(this, { id: it.product_id, type: it.product?.type }, it, 0);
    },
    gc_unit(it: any): string {
      return unitOf(it.product || {});
    },
    gc_go_checkout(this: any) {
      this.$router.push({ query: { ...this.$route.query, step: "checkout" } }).catch(() => {});
      window.scrollTo({ top: 0 });
    },
    gc_go_bag(this: any) {
      const q = { ...this.$route.query };
      delete q.step;
      this.$router.push({ query: q }).catch(() => {});
    },
    gc_scroll_to(this: any, id: string) {
      const el = document.getElementById(id);
      if (!el) return;
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      const input = el.querySelector("input, textarea, button") as HTMLElement | null;
      try {
        input?.focus({ preventScroll: true });
      } catch {
        /* nothing to focus */
      }
    },
    gc_goto(this: any, key: string) {
      this.gc_touched = { ...this.gc_touched, [key]: true };
      if (key === "signin") return this.NeedLogin();
      if (key === "address") return this.gc_scroll_to("co-address");
      if (key === "billing") return this.gc_scroll_to("co-billing");
      return this.gc_scroll_to("co-f-" + key);
    },
    gc_save_contact(this: any) {
      this.gc_touched = { ...this.gc_touched, email: true, phone: true };
      if (!this.user && this.guest_email && !this.gc_email_ok) return;
      this.setBasketConfig();
    },
    gc_set_billing(this: any, custom: boolean) {
      this.gc_billing_other = custom;
      if (!custom) {
        this.billing = { ...(this.billing || {}), custom: false };
        this.setBasketConfig();
      }
    },
    /* Bag stage: choosing a way here writes Selldone's delivery type (and,
       for pickup, the pickup point as the receiver, as Selldone's own
       pickup choice does). */
    gc_pick_way(this: any, way: any) {
      if (!this.basket || !way) return;
      /* the buyer's own phone and note go with them from way to way */
      const phone = this.gc_phone;
      const note = this.gc_note_value;
      const fromPickup = this.gc_receiver_is_pickup;
      this.delivery_info.type = way.type;
      if (way.type === ShopTransportations.Pickup.code && way.pickups?.length) {
        const point = way.pickups[0];
        this.basket.receiver_info = Object.assign({}, point, { phone: phone || point.phone, message: note || point.message });
      } else if (fromPickup) {
        /* leaving pickup: the counter's address is not a delivery address */
        this.basket.receiver_info = { phone, message: note };
      }
      this.setBasketConfig();
    },
    gc_way_fee(this: any, given: any): string {
      if (!given) return "";
      const way = { ...given, ...shopWay(this.$shop, given) };
      const free = !!way.free_shipping && !(Number(way.free_shipping_limit) > 0);
      if (way.type === ShopTransportations.Pickup.code || free) return t("galio.co.free", "Free");
      const fee = Number(way.const) || 0;
      /* priced by distance or weight: the address sets it */
      if (!fee && (Number(way.distance_rate) > 0 || Number(way.weight_rate) > 0)) return way.sod ? t("galio.co.atDoor", "On delivery") : t("galio.co.byAddress", "Set by your address");
      const over = way.free_shipping && Number(way.free_shipping_limit) > 0 ? money(Number(way.free_shipping_limit), way.currency, { short: "auto" }) : "";
      if (!fee) return over ? t("galio.co.freeOver", "Free over {amount}", { amount: over }) : t("galio.co.free", "Free");
      const base = money(fee, way.currency);
      return over ? t("galio.co.feeFreeOver", "{fee}, free over {amount}", { fee: base, amount: over }) : base;
    },
    /* Place order: what is missing first (named, the first one focused),
       then Selldone's own Pay (the payment window). */
    gc_place(this: any) {
      const miss = this.gc_missing;
      if (miss.length) {
        const touched: Record<string, boolean> = { ...this.gc_touched };
        miss.forEach((x: any) => (touched[x.key] = true));
        this.gc_touched = touched;
        this.gc_show_missing = true;
        if (miss[0].key === "signin") return this.NeedLogin();
        /* the list of what is missing comes into view; the first field takes the focus */
        this.$nextTick(() => {
          this.$el?.querySelector?.("#errsum")?.scrollIntoView({ block: "nearest" });
          const first = this.$el?.querySelector?.('[aria-invalid="true"]') || this.$el?.querySelector?.(".addr--err button") || null;
          try {
            first?.focus({ preventScroll: true });
          } catch {
            /* nothing to focus */
          }
        });
        return;
      }
      this.setBasketConfig();
      /* Selldone's payment window shows the bill the page holds: open it only once the last update has come
         back (busy_save), so a way chosen a moment ago is the one priced (1.0.7). At most 15 s, then open anyway. */
      if (this.gc_pay_waiting) return;
      this.gc_pay_waiting = true;
      const open = () => {
        if (!this.gc_pay_waiting) return;
        this.gc_pay_waiting = false;
        stop();
        clearTimeout(timer);
        this.onPay();
      };
      const stop = this.$watch(
        () => this.busy_save || this.busy_bill,
        (busy: boolean) => {
          if (!busy) open();
        },
      );
      const timer = setTimeout(open, 15000);
      if (!this.busy_save && !this.busy_bill) open();
    },
  },
};
