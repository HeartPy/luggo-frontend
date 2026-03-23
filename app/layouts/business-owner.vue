<template>
  <div>
    <div class="grid grid-cols-[240px_1fr]">
      <CommonBusinessOwnerDashboardSideBar
        :current-view="currentView"
        @select="navigate"
      />
      <div>
        <CommonBusinessOwnerDashboardTheHeader />
        <CommonBusinessOwnerDashboardAtomsStripeBar />
        <h1 class="m-4 mr-0 px-4 text-xl font-bold tracking-wide">
          {{ currentTtl }}
        </h1>
        <main class="pb-16 pt-4">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardNav } from "~/composables/useDashboardNav";

const { currentView, currentTtl, navigate } = useDashboardNav();
</script>
