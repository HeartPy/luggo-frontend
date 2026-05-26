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
          <CommonBusinessOwnerDashboardAtomsPolicyUpdateBanner />
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

    <CommonBusinessOwnerDashboardAtomsPublicInfoConsentPopup />
    <CommonBusinessOwnerDashboardAtomsPolicyUpdateDialog />
    <CommonBusinessOwnerDashboardAtomsBookingTemplateUpdateDialog />
  </div>
</template>

<script setup lang="ts">
import { useDashboardNav } from "~/composables/useDashboardNav";
import { usePolicyAgreement } from "~/composables/usePolicyAgreement";

const { currentView, currentTtl, navigate } = useDashboardNav();
const { shouldShowBar } = useOnboardingBar();
const { policyUpdateRequired } = usePolicyAgreement();

// 各種バーの積み上げに応じて、本文の上余白を切替
const contentMarginTopClass = computed(() => {
  const bars =
    (policyUpdateRequired.value ? 1 : 0) + (shouldShowBar.value ? 1 : 0);
  if (bars === 2) return "mt-36";
  if (bars === 1) return "mt-28";
  return "mt-20";
});
</script>
