<template>
  <div :key="componentKey">
    <CommonCustomerTheHeader @change-locale="onChangeLocale" />
    <main class="pb-16">
      <slot />
    </main>
    <CommonCustomerTheFooter />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { locale } = useI18n();
const router = useRouter();
const componentKey = ref(0);

const onChangeLocale = (localeName: string): void => {
  componentKey.value++;
  switch (localeName) {
    case "ja":
      locale.value = "ja";
      break;
    case "en":
      locale.value = "en";
      break;
    default:
      locale.value = "ja";
  }
};

if (import.meta.client) {
  watch(locale, (newLocale: string) => {
    if (newLocale === "ja") {
      router.push("/");
    } else if (newLocale === "en") {
      router.push("/en/");
    } else {
      router.push("/");
    }
  });
}
</script>
