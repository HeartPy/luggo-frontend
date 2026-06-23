<template>
  <div class="space-y-1 py-1.5 first:pt-0">
    <dt class="text-xs font-medium text-gray-500">
      {{ label }}
    </dt>
    <dd class="whitespace-pre-wrap break-words text-sm text-gray-900">
      {{ displayValue }}
    </dd>
  </div>
</template>

<script setup lang="ts">
type Props = {
  label: string;
  value: string | null | undefined;
};

const props = defineProps<Props>();

const displayValue = computed(() => {
  const value = props.value;
  if (value === null || value === undefined || value === "") return "—";
  return value;
});
</script>
