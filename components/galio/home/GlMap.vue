<!--
  Galio Sundae — the counter on a real map (home "Visit the counter"). The mockup draws a made-up
  street map; the Layout shows the shop's real place instead, so any bakery gets its own street: a
  static map of the shop's location from Selldone's map service (its token; the street style in
  light, the dark style in dark mode; Mapbox's attribution kept on the image), drawn at the box's own
  size with the place moved to the right of the card on wide screens (the middle on phones, where the
  card sits under the map; there the picture stops above the card's overlap, so Mapbox's mark and
  attribution stay in sight), and the mockup's pin over it. Without a location: the calm land colour and
  the pin, nothing invented.
-->
<template>
  <div ref="box" :class="['map', 'gl-map', { '-none': !src }]">
    <img v-if="src" :style="imgStyle" :alt="t('galio.map.alt', 'Map of the streets around {place}', { place: place })" :src="src" class="gl-map-img" decoding="async" loading="lazy" />
    <svg :style="pinStyle" aria-hidden="true" class="gl-map-pin" viewBox="-48 -92 96 140">
      <circle fill="var(--gl-act)" opacity=".16" r="44" />
      <path d="M0 0 C -6 -14, -26 -22, -26 -42 a26 26 0 0 1 52 0 C 26 -22, 6 -14, 0 0z" fill="var(--gl-act)" />
      <circle cy="-42" fill="var(--gl-act-on)" r="10" />
    </svg>
  </div>
</template>

<script>
import { SetupService } from "@selldone/core-js/server";
import { themeState } from "../../theme-switcher/theme-switcher";
import { t } from "../../kalio/i18n/kalio-i18n";

const ZOOM = 15;

export default {
  name: "GlMap",
  props: {
    location: { type: Object, default: null },
    place: { type: String, default: "" },
  },
  data: () => ({ theme: themeState, w: 0, h: 0, wide: true, cut: 0 }),
  computed: {
    dark() {
      return this.theme.mode === "dark" || document.documentElement.classList.contains("gl-dark");
    },
    /* Where the place sits in the box: right of the card on wide screens, the middle on phones. */
    fx() {
      if (!this.wide) return 0.5;
      return document.documentElement.dir === "rtl" ? 0.32 : 0.68;
    },
    fy() {
      return 0.62;
    },
    src() {
      const l = this.location;
      if (!l || !Number(l.lat) || !Number(l.lng) || !this.w || !this.h) return null;
      const token = SetupService.MapToken();
      if (!token) return null;
      const W = Math.min(1280, this.w);
      const H = Math.min(1280, this.h);
      /* Degrees per pixel at this zoom (512px tiles), so the centre can move and the place land at fx, fy. */
      const per = 360 / (512 * Math.pow(2, ZOOM));
      const lng = Number(l.lng) + (0.5 - this.fx) * W * per;
      const lat = Number(l.lat) - (0.5 - this.fy) * H * per * Math.cos((Number(l.lat) * Math.PI) / 180);
      const style = this.dark ? "dark-v11" : "streets-v12";
      return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${lng.toFixed(6)},${lat.toFixed(6)},${ZOOM},0,0/${W}x${H}@2x?access_token=${token}`;
    },
    pinStyle() {
      return { left: this.fx * 100 + "%", top: this.cut ? `calc((100% - ${this.cut}px) * ${this.fy})` : this.fy * 100 + "%" };
    },
    imgStyle() {
      return this.cut ? { height: `calc(100% - ${this.cut}px)` } : null;
    },
  },
  mounted() {
    this.measure();
    this.onResize = () => {
      clearTimeout(this.rt);
      this.rt = setTimeout(() => this.measure(), 200);
    };
    window.addEventListener("resize", this.onResize, { passive: true });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
    clearTimeout(this.rt);
  },
  methods: {
    t,
    /* The box's size, in steps of 40px (a few image sizes, not one per pixel of a resize). */
    measure() {
      const el = this.$refs.box;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const step = (v) => Math.max(200, Math.round(v / 40) * 40);
      this.wide = window.innerWidth > 760;
      /* On phones the card overlaps the map's foot (b.css .visit-card margin-top: -26px). */
      this.cut = this.wide ? 0 : 26;
      this.w = step(r.width);
      this.h = step(r.height - this.cut);
    },
  },
};
</script>
