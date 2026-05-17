<template>
  <NuxtLink
    v-if="shouldShowBar && isLinkable && linkTo"
    :to="linkTo"
    :class="[
      barClass,
      topClass,
      'fixed z-10 block w-full p-2 text-sm duration-200 hover:opacity-80',
    ]"
  >
    {{ messageText }}
  </NuxtLink>
  <button
    v-else-if="shouldShowBar && currentStep === 'consent'"
    type="button"
    :class="[
      barClass,
      topClass,
      'fixed z-10 block w-full p-2 text-left text-sm duration-200 hover:opacity-80',
    ]"
    @click="handleBarClick"
  >
    {{ messageText }}
  </button>
  <div
    v-else-if="shouldShowBar"
    :class="[barClass, topClass, 'fixed z-10 block w-full p-2 text-sm']"
  >
    {{ messageText }}
  </div>
</template>

<script setup lang="ts">
import { usePolicyAgreement } from "~/composables/usePolicyAgreement";

const {
  shouldShowBar,
  messageText,
  barClass,
  currentStep,
  isLinkable,
  linkTo,
  handleBarClick,
} = useOnboardingBar();

const { policyUpdateRequired } = usePolicyAgreement();

// PolicyBannerが出ているときは下にずらす
// それ以外はヘッダー直下に固定
const topClass = computed(() =>
  policyUpdateRequired.value ? "top-[6.25rem]" : "top-16",
);
</script>
