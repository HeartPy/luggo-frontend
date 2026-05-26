<template>
  <div class="pb-16">
    <BusinessOwnerDashboardReservationsList
      v-if="currentView === 'reservations'"
    />
    <BusinessOwnerDashboardDriversList v-else-if="currentView === 'drivers'" />
    <BusinessOwnerDashboardRevenueManagement
      v-else-if="currentView === 'revenue'"
    />
    <BusinessOwnerDashboardPricingSettings
      v-else-if="currentView === 'pricing-settings'"
    />
    <BusinessOwnerDashboardBusinessSettings
      v-else-if="currentView === 'business-settings'"
    />
    <BusinessOwnerDashboardBusinessInfo
      v-else-if="currentView === 'business-info'"
    />
    <BusinessOwnerDashboardPaymentInfo
      v-else-if="currentView === 'payment-info'"
    />
    <div v-else />

    <!-- 料金設定・事業設定で未保存のまま別タブへ切り替えようとしたときの確認 -->
    <CommonAtomsConfirmDialog
      v-model="showLeaveConfirm"
      title="確認"
      message="変更が保存されていません。ページを離れますか？"
      confirm-label="離れる"
      cancel-label="キャンセル"
      @confirm="confirmLeaveToOtherTab"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeRouteUpdate } from "vue-router";
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

const showLeaveConfirm = ref(false);
const pendingLeaveToPath = ref<string | null>(null);
const isNavigatingAfterConfirm = ref(false);

const pricingCanSaveState = useState("pricingSettingsCanSave", () => false);
const businessSettingsCanSaveState = useState(
  "businessSettingsCanSave",
  () => false,
);

function getViewParam(view: string | string[] | undefined): string | undefined {
  if (view === undefined || view === "") return undefined;
  return Array.isArray(view) ? view[0] : view;
}

// 同じダッシュボード内で別タブへ切り替えようとしたときに、未保存があれば確認
onBeforeRouteUpdate((to, from, next) => {
  if (isNavigatingAfterConfirm.value) {
    isNavigatingAfterConfirm.value = false;
    next();
    return;
  }
  const fromView = getViewParam(from.params.view);
  const hasUnsavedChanges
    = (fromView === "pricing-settings" && pricingCanSaveState.value)
      || (fromView === "business-settings" && businessSettingsCanSaveState.value);

  if (hasUnsavedChanges) {
    next(false);
    pendingLeaveToPath.value = to.fullPath;
    showLeaveConfirm.value = true;
  }
  else {
    next();
  }
});

const confirmLeaveToOtherTab = () => {
  const path = pendingLeaveToPath.value;
  pendingLeaveToPath.value = null;
  showLeaveConfirm.value = false;
  if (path) {
    isNavigatingAfterConfirm.value = true;
    navigateTo(path, { replace: true });
  }
};
</script>
