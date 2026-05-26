<template>
  <button
    v-if="policyUpdateRequired"
    type="button"
    class="fixed top-16 z-10 block w-full bg-blue-50 p-2 text-left text-sm text-blue-900 duration-200 hover:opacity-80"
    @click="openPolicyDialog"
  >
    {{ bannerText }}
  </button>
</template>

<script setup lang="ts">
import { usePolicyAgreement } from "~/composables/usePolicyAgreement";

const {
  policyUpdateRequired,
  termsUpdateRequired,
  privacyUpdateRequired,
  openPolicyDialog,
} = usePolicyAgreement();

const bannerText = computed(() => {
  if (termsUpdateRequired.value && privacyUpdateRequired.value) {
    return "利用規約とプライバシーポリシーが更新されました。内容をご確認ください。";
  }
  if (termsUpdateRequired.value) {
    return "利用規約が更新されました。内容をご確認ください。";
  }
  if (privacyUpdateRequired.value) {
    return "プライバシーポリシーが更新されました。内容をご確認ください。";
  }
  return "";
});
</script>
