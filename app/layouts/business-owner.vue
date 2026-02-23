<template>
  <div>
    <div class="grid grid-cols-[240px_1fr]">
      <CommonBusinessOwnerDashboardSideBar />
      <div>
        <CommonBusinessOwnerDashboardTheHeader />
        <CommonBusinessOwnerDashboardAtomsStripeBar />
        <CommonBusinessOwnerDashboardAtomsDashBoardTtl>
          <slot name="ttl" />
        </CommonBusinessOwnerDashboardAtomsDashBoardTtl>
        <main class="pb-16 pt-8">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
