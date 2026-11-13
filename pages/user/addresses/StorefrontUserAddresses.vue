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

<!--
  Galio Sundae — the address book (galio-design/addresses-b.html): the saved addresses as the
  mockup's sky cards (an icon from the address's name, who receives it and the phone, the address
  in lines; Edit and Remove, which asks once, in the card) and "Add an address".
  Add and Edit open Kalio's address sheet (KalioAddressSheet, `titled`,
  dressed like map-b), the same fields as the checkout's: the name of the
  address, the map with its pin when the shop uses maps, every field,
  saved in one step. Selldone keeps no "default" address, so none is shown.
-->
<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="gl-abook">
    <article class="panel">
      <div class="panel-head">
        <h2>{{ t("galio.acc.book", "Address book") }}</h2>
        <button class="btn" type="button" @click="showAdd"><gl-icon name="plus" />{{ t("galio.acc.addAddress", "Add an address") }}</button>
      </div>
      <div v-if="busy && !loaded" aria-busy="true" class="abook gl-wait"></div>
      <ul v-else-if="addresses.length" class="abooks abooks--2">
        <li v-for="(address, i) in addresses" :key="address.id" class="abook">
          <div class="ab-h">
            <span class="ab-ic"><gl-icon :name="iconOf(address)" /></span><b><bdi>{{ address.title || t("galio.acc.addressUntitled", "Address") }}</bdi></b>
          </div>
          <p>
            <bdi>{{ [address.name, address.phone].filter(Boolean).join(" · ") }}</bdi
            ><template v-for="(line, j) in linesOf(address)" :key="j"><br /><bdi>{{ line }}</bdi></template>
          </p>
          <p v-if="address.message" class="ab-note">“{{ address.message }}”</p>
          <div class="ab-acts">
            <template v-if="confirming === address.id">
              <span class="ab-ask">{{ t("galio.acc.deleteAsk", "Delete this address?") }}</span>
              <button :disabled="busy_delete" class="link link--sm" type="button" @click="remove(address)"><gl-icon name="trash" />{{ t("galio.acc.delete", "Delete") }}</button>
              <button class="link link--sm" type="button" @click="confirming = null">{{ t("galio.acc.keep", "Keep") }}</button>
            </template>
            <template v-else>
              <button class="link link--sm" type="button" @click="showEdit(address)"><gl-icon name="edit" />{{ t("galio.acc.edit", "Edit") }}</button>
              <button
                :aria-label="address.title ? t('galio.acc.removeNamed', 'Remove {name}', { name: address.title }) : t('galio.acc.removeThis', 'Remove this address')"
                class="link link--sm"
                type="button"
                @click="confirming = address.id"
              >
                <gl-icon name="trash" />{{ t("galio.acc.remove", "Remove") }}
              </button>
            </template>
          </div>
        </li>
      </ul>
      <p v-else class="gl-none">{{ noMap ? t("galio.acc.noBookTyped", "No saved address yet. Add one here, typed in as at checkout.") : t("galio.acc.noBook", "No saved address yet. Set one on the map or type it in.") }}</p>
    </article>

    <kalio-address-sheet
      v-model="sheet"
      :busy="busy_save"
      :center="center"
      :countries="$shop?.countries?.length ? $shop.countries : null"
      :heading="editing ? t('galio.acc.editTitle', 'Edit address') : t('galio.acc.addAddress', 'Add an address')"
      :lede="t('galio.acc.sameFields', 'Same fields as checkout')"
      :no-map="noMap"
      :phone-required="false"
      :receiver-info="editing"
      :saved-list="false"
      :title="editing?.title || ''"
      titled
      @save="onSave"
    />
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { MapHelper } from "@selldone/core-js/helper";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import KalioAddressSheet from "@app-storefront/components/kalio/checkout/KalioAddressSheet.vue";
import { t } from "../../../components/kalio/i18n/kalio-i18n";
import GlIcon from "../../../components/galio/GlIcon.vue";

/* The fields an address keeps (Selldone's address book). */
const FIELDS = ["country", "state", "state_code", "city", "address", "location", "no", "unit", "name", "phone", "message", "postal"];

export default {
  name: "StorefrontUserAddresses",
  components: { KalioAddressSheet, GlIcon },
  inject: ["$shop"],

  data() {
    return {
      addresses: [],
      busy: false,
      loaded: false,

      sheet: false,
      editing: null,
      busy_save: false,

      confirming: null,
      busy_delete: false,
    };
  },

  computed: {
    noMap() {
      return !ShopOptionsHelper.HasMap(this.$shop);
    },
    /* Edit starts at the address; a new one at the last address saved. */
    center() {
      const at = (this.editing || this.addresses[0])?.location;
      return at?.lat ? { lat: at.lat, lng: at.lng } : null;
    },
  },

  created() {
    this.setPageTitle(t("account.pageTitle.addresses", "My address book")); // Set Page Title!
    this.fetchAddressBook();
  },

  methods: {
    t,
    /* Galio Sundae: the card's icon from the address's own name. */
    iconOf(address) {
      const title = (address.title || "").toLowerCase();
      if (/work|office|shop|store|studio/.test(title)) return "store";
      if (/home|house|flat|apartment/.test(title) || !title) return "home";
      return "pin";
    },
    /* The address in the mockup's lines: street and unit; city, state and
       postcode; the country. */
    linesOf(a) {
      const street = [[a.address, a.no].filter(Boolean).join(" "), a.unit].filter(Boolean).join(", ");
      const place = [a.city, [a.state_code || a.state, a.postal].filter(Boolean).join(" ")].filter(Boolean).join(", ");
      let country = a.country;
      try {
        country = a.country ? new Intl.DisplayNames([document.documentElement.lang || "en"], { type: "region" }).of(a.country) : "";
      } catch (e) {}
      return [street, place, country].filter(Boolean);
    },
    getFullAddress(address) {
      return MapHelper.GenerateFullAddressFromMapInfo(address);
    },

    /* The spot on a small map, with Kalio's green pin (Mapbox's static
       image, the token Selldone's page used). */
    mapOf(address) {
      const { lng, lat } = address.location;
      const pin = (getComputedStyle(document.documentElement).getPropertyValue("--bk-blue").trim() || "#a0522d").replace("#", ""); /* the theme's colour */
      return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+${pin}(${lng},${lat})/${lng},${lat},14,0,0/160x160@2x?access_token=pk.eyJ1IjoicGFqdWhhYW4iLCJhIjoiY2sxaHNtbnU3MDFjcjNta2V0OTZ0d2ExYiJ9.YKRh0EP7NnhbmuSil7AvSw`;
    },

    fetchAddressBook() {
      this.busy = true;
      window.axios
        .get(window.ADDRESS_API.GET_MY_ADDRESSES())
        .then(({ data }) => {
          if (data.error) return NotificationService.showErrorAlert(null, data.error_msg);
          this.addresses = data.addresses || [];
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => {
          this.busy = false;
          this.loaded = true;
        });
    },

    showAdd() {
      this.editing = null;
      this.confirming = null;
      this.sheet = true;
    },

    showEdit(address) {
      this.editing = address;
      this.confirming = null;
      this.sheet = true;
    },

    onSave(pack) {
      const body = { title: pack.title };
      for (const key of FIELDS) body[key] = pack[key] ?? null;
      const editing = this.editing;
      this.busy_save = true;
      (editing
        ? window.axios.put(window.ADDRESS_API.PUT_ADDRESS(editing.id), body)
        : window.axios.post(window.ADDRESS_API.POST_ADDRESS(), body)
      )
        .then(({ data }) => {
          if (data.error) return NotificationService.showErrorAlert(null, data.error_msg);
          NotificationService.showSuccessAlert(
            null,
            editing
              ? this.$t("global.map_view.notifications.edit_success", { title: data.address?.title || body.title })
              : this.$t("global.map_view.notifications.save_in_list"),
          );
          this.sheet = false;
          this.fetchAddressBook();
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy_save = false));
    },

    remove(address) {
      this.busy_delete = true;
      window.axios
        .delete(window.ADDRESS_API.DELETE_MY_ADDRESSES(address.id))
        .then(({ data }) => {
          if (data.error) return NotificationService.showErrorAlert(null, data.error_msg);
          this.addresses = this.addresses.filter((it) => it.id !== address.id);
          this.confirming = null;
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy_delete = false));
    },
  },
};
</script>
