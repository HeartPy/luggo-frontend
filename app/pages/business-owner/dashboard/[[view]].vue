<template>
  <div class="pb-16">
    <BusinessOwnerDashboardBookingsList
      v-if="currentView === 'bookings'"
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
