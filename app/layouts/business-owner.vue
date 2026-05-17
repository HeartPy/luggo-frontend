<template>
  <div>
    <div class="grid grid-cols-[240px_1fr]">
      <CommonBusinessOwnerDashboardSideBar
        :current-view="currentView"
        @select="navigate"
      />
      <div>
        <div>
          <CommonBusinessOwnerDashboardTheHeader />
          <CommonBusinessOwnerDashboardAtomsOnboardingBar />
        </div>
        <div :class="contentMarginTopClass">
          <h1 class="px-8 py-4 text-xl font-bold tracking-wide">
            {{ currentTtl }}
          </h1>
          <main class="overflow-auto pb-16 pt-4">
            <slot />
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardNav } from "~/composables/useDashboardNav";

const { currentView, currentTtl, navigate } = useDashboardNav();
const { shouldShowBar } = useOnboardingBar();

// ヘッダー (h-16) とオンボーディングバー (h-9 程度) の積み上げに応じて、本文の上余白を切替。
//   - mt-20: バー無し
//   - mt-28: バー 1 本
const contentMarginTopClass = computed(() =>
  shouldShowBar.value ? "mt-28" : "mt-20",
);
</script>
