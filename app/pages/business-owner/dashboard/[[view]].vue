<template>
  <div>
    <BusinessOwnerDashboardReservationsList v-if="currentView === 'reservations'" />
    <BusinessOwnerDashboardDriversList v-else-if="currentView === 'drivers'" />
    <BusinessOwnerDashboardRevenueManagement v-else-if="currentView === 'revenue'" />
    <BusinessOwnerDashboardPricingSettings v-else-if="currentView === 'pricing-settings'" />
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
  () => route.params.view,
  () => syncFromRoute(),
);
</script>
