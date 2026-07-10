<template>
  <div class="mb-10 md:mb-14">
    <div class="mx-auto flex w-fit items-start justify-center gap-x-6">
      <div
        v-for="(step, index) in steps"
        :key="step.number"
        class="relative"
      >
        <div class="flex flex-col items-center">
          <span
            class="mb-2 block h-3 w-3 rounded-full"
            :class="{
              'bg-gray-700': currentStep >= step.number,
              'bg-gray-200': currentStep < step.number,
            }"
          />
          <p
            class="text-center text-sm text-gray-500"
            v-html="step.label"
          />
        </div>
        <span
          v-if="index < steps.length - 1"
          class="absolute left-full top-1.5 block h-0.5 w-6"
          :class="currentStep > step.number ? 'bg-gray-700' : 'bg-gray-200'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

type Step = {
  number: number;
  label: string;
};

const { t } = useI18n();

const steps = computed<Step[]>(() => [
  { number: 1, label: t("progress.step1") },
  { number: 2, label: t("progress.step2") },
  { number: 3, label: t("progress.step3") },
]);

defineProps<{
  currentStep: number;
}>();
</script>
