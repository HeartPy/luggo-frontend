<template>
  <nav
    v-if="totalPages > 1"
    class="flex items-center justify-center gap-2 py-6"
    aria-label="ページネーション"
  >
    <button
      type="button"
      class="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="page <= 1"
      aria-label="前のページ"
      @click="emit('change', page - 1)"
    >
      ‹
    </button>
    <template
      v-for="(displayedPage, idx) in pageItems"
      :key="`${displayedPage}-${idx}`"
    >
      <span
        v-if="displayedPage === '...'"
        class="px-1 text-gray-400"
        aria-hidden="true"
      > … </span>
      <button
        v-else
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors"
        :class="
          displayedPage === page
            ? 'border-gray-800 bg-gray-800 text-white'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        "
        :aria-label="`${displayedPage}ページ目`"
        :aria-current="displayedPage === page ? 'page' : undefined"
        @click="emit('change', displayedPage)"
      >
        {{ displayedPage }}
      </button>
    </template>
    <button
      type="button"
      class="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="page >= totalPages"
      aria-label="次のページ"
      @click="emit('change', page + 1)"
    >
      ›
    </button>
  </nav>
</template>

<script setup lang="ts">
import { displayedPages } from "~/utils/pagination";

const props = defineProps<{
  page: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  change: [page: number];
}>();

const pageItems = computed(() => displayedPages(props.totalPages, props.page));
</script>
