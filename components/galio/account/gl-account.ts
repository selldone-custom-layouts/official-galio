/*
 * Galio Sundae — what the account desk and the order page read (account-b.html, order-b.html): the
 * mockup's four steps over Selldone's delivery states, and the one-line summary of an order
 * ("Bakio courier · Morning"). The data is Kalio's (components/kalio/account/kalio-account.ts).
 */
import { t } from "../../kalio/i18n/kalio-i18n";
import { money } from "../../region-switcher/region";
import { wayWindowLine } from "../buy/gl-cart";

/** Placed · Baking · On the way · Delivered (Selldone: CheckQueue and OrderConfirm, PreparingOrder,
    SentOrder, ToCustomer). */
export function glSteps(): { key: string; label: string; icon: string; codes: string[] }[] {
  return [
    { key: "placed", label: t("galio.ord.stPlaced", "Placed"), icon: "check", codes: ["CheckQueue", "OrderConfirm"] },
    { key: "baking", label: t("galio.ord.stBaking", "Baking"), icon: "oven", codes: ["PreparingOrder"] },
    { key: "way", label: t("galio.ord.stWay", "On the way"), icon: "scooter", codes: ["SentOrder"] },
    { key: "done", label: t("galio.ord.stDone", "Delivered"), icon: "home", codes: ["ToCustomer"] },
  ];
}

/** A pickup order: Placed · Baking · Ready · Collected. */
export function glPickupSteps(): { key: string; label: string; icon: string; codes: string[] }[] {
  return [
    { key: "placed", label: t("galio.ord.stPlaced", "Placed"), icon: "check", codes: ["CheckQueue", "OrderConfirm"] },
    { key: "baking", label: t("galio.ord.stBaking", "Baking"), icon: "oven", codes: ["PreparingOrder"] },
    { key: "ready", label: t("galio.ord.stReady", "Ready at the counter"), icon: "store", codes: ["SentOrder"] },
    { key: "done", label: t("galio.ord.stCollected", "Collected"), icon: "check", codes: ["ToCustomer"] },
  ];
}

export function glStepAt(state: string): number {
  const at = glSteps().findIndex((s) => s.codes.includes(state));
  return at < 0 ? 0 : at;
}

/** A step's state on the track: done, now or next (the last one, once reached, is done). */
export function glStepState(i: number, at: number, last: number): "done" | "now" | "next" {
  if (i < at || (i === at && i === last)) return "done";
  return i === at ? "now" : "next";
}

/** "Bakio courier · Morning", from what is known. */
export function orderWay(shop: any, order: any, full: any): string {
  return wayWindowLine(shop, full?.delivery_info || order?.delivery_info);
}

/** "$14.89" with how it is paid: "to pay on delivery", "paid", "to pay". */
export function orderPay(order: any): { amount: string; words: string } {
  const amount = money(Number(order?.price) || 0, order?.currency);
  if (order?.status === "COD") return { amount, words: t("galio.acc.onDelivery", "to pay on delivery") };
  if (order?.status === "Payed") return { amount, words: t("galio.acc.paid", "paid") };
  if (order?.status === "Reserved") return { amount, words: t("galio.acc.toPay", "to pay") };
  if (order?.status === "Canceled") return { amount, words: t("galio.acc.cancelled", "cancelled") };
  return { amount, words: "" };
}

/** "12 November 2026", in the page's language. */
export function longDate(at: string): string {
  if (!at) return "";
  return new Date(at).toLocaleDateString(document.documentElement.lang || "en", { day: "numeric", month: "long", year: "numeric" });
}
