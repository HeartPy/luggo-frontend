<template>
  <div class="mb-10 w-fit rounded-md bg-gray-200 p-4">
    <div class="flex flex-col items-start gap-y-4">
      <div
        v-for="step in steps"
        :key="step.number"
        class="flex items-center gap-x-2"
      >
        <span
          class="flex h-6 w-6 items-center justify-center rounded-full border bg-white"
          :class="{
            'border-green-600': currentStep > step.number,
          }"
        >
          <img
            v-if="currentStep > step.number"
            src="/img/check-green.svg"
            class="h-3 w-3 object-contain"
          >
          <img
            v-else
            src="/img/check-gray.svg"
            class="h-3 w-3 object-contain"
          >
        </span>
        <p class="text-sm text-gray-800">
          {{ step.label }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Step = {
  number: number;
  label: string;
};

defineProps<{
  steps: Step[];
  currentStep: number;
}>();
</script>
