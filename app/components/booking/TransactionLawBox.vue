<template>
  <section :aria-labelledby="titleId">
    <h2
      :id="titleId"
      class="mb-4 text-center text-lg font-bold text-gray-800"
    >
      {{ props.title }}
    </h2>

    <div
      class="h-64 overflow-y-auto rounded-md border border-gray-300 bg-white p-4"
      tabindex="0"
      role="region"
      :aria-label="props.title"
      :aria-busy="isLoading"
    >
      <div
        v-if="isLoading"
        class="py-8"
        role="status"
        aria-live="polite"
      >
        <CommonAtomsLoadingAnimation
          size="sm"
          aria-hidden="true"
        />
        <p class="sr-only">
          {{ props.title }}を読み込んでいます
        </p>
      </div>

      <p
        v-else-if="fetchErr"
        role="alert"
        class="text-center text-sm text-red-600"
      >
        {{ fetchErr }}
      </p>

      <ul
        v-else
        class="space-y-6"
        role="list"
      >
        <li
          v-for="item in items"
          :key="item.id"
          role="listitem"
        >
          <h3 class="mb-1 text-sm font-bold text-gray-800">
            {{ item.ttl }}
          </h3>
          <div
            class="text-sm text-gray-700"
            v-html="item.txt"
          />
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TransactionLawItem } from "~/composables/useTransactionLaw";

const props = withDefaults(
  defineProps<{
    items: TransactionLawItem[];
    isLoading: boolean;
    fetchErr: string;
    title?: string;
  }>(),
  {
    title: "ご予約に関する重要事項",
  },
);

// 同一ページ内に複数配置されるため、aria 用に一意な ID を払い出す
const uid = useId();
const titleId = computed(() => `transaction-law-box-${uid}`);
</script>
