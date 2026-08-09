<template>
  <div class="pb-16">
    <BusinessOwnerDashboardReservationsList
      v-if="currentView === 'reservations'"
    />
    <BusinessOwnerDashboardDriversList v-else-if="currentView === 'drivers'" />
    <BusinessOwnerDashboardDailyAssignmentPanel v-else-if="currentView === 'assignment'" />
    <BusinessOwnerDashboardRevenueManagement
      v-else-if="currentView === 'revenue'"
    />
    <BusinessOwnerDashboardBusinessInfo
      v-else-if="currentView === 'business-info'"
    />
    <BusinessOwnerDashboardPaymentInfo
      v-else-if="currentView === 'payment-info'"
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
