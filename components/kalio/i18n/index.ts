/*
 * Galio's words, per language: the shared Kalio base (base/<lang>.ts, a copy of
 * new-shop-kits/i18n/kalio-base), the Bakini words Galio still uses (bakini.<lang>.ts) and Galio's own
 * (galio.<lang>.ts). English is bundled; every other language is its own small chunk, fetched only when
 * a visitor picks it (lang-<code>.ts merges its files). Bakio sells in English only. Arabic is kept so a
 * right-to-left language works the day a shop enables one (and the kit's checks run with a forced
 * "ar"). A language the owner enables later: copy base/<code>.ts from the kit, write bakini.<code>.ts and
 * galio.<code>.ts, add lang-<code>.ts and one line below.
 */
import baseEn from "./base/en";
import bakiniEn from "./bakini.en";
import galioEn from "./galio.en";

export const EN: Record<string, string> = { ...baseEn, ...bakiniEn, ...galioEn };

export const LOADERS: Record<string, () => Promise<any>> = {
  ar: () => import("./lang-ar"),
};
