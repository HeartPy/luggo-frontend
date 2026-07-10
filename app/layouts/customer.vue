<template>
  <div>
    <CommonCustomerTheHeader @change-locale="onChangeLocale" />
    <main class="pb-16">
      <slot />
    </main>
    <CommonCustomerTheFooter />
  </div>
</template>

<script setup lang="ts">
import { useAppLocale } from "~/composables/useLocale";

const { setLocale, bcp47Locale, bodyFontFamily } = useAppLocale();

const onChangeLocale = (localeName: string): void => {
  setLocale(localeName);
};

useHead(computed(() => ({
  htmlAttrs: {
    lang: bcp47Locale.value,
  },
  style: [
    {
      key: "locale-font-family",
      innerHTML: `html { font-family: "${bodyFontFamily.value}", sans-serif; }`,
    },
  ],
})));
</script>
