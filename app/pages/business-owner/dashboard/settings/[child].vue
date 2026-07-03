<template>
  <div class="pb-16">
    <BusinessOwnerDashboardPricingSettings
      v-if="currentView === 'settings-pricing'"
    />
    <BusinessOwnerDashboardBusinessSettings
      v-else-if="currentView === 'settings-business'"
    />
    <BusinessOwnerDashboardInvoiceSettings
      v-else-if="currentView === 'settings-invoice'"
    />
    <div v-else />
  </div>
</template>

<script setup lang="ts">
import { useDashboardNav } from "~/composables/useDashboardNav";

definePageMeta({
  layout: "business-owner",
  middleware: "business-owner",
});

const route = useRoute();
const { currentView, syncFromRoute } = useDashboardNav();

syncFromRoute();

watch(
  () => route.path,
  () => syncFromRoute(),
);
</script>
