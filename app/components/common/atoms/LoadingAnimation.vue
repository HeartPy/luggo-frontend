<template>
  <div
    class="flex flex-col items-center justify-center"
    :class="containerPaddingClass"
  >
    <div
      class="relative"
      :class="spinnerSizeClass"
    >
      <div class="absolute inset-0 rounded-full border-4 border-gray-200" />
      <div
        class="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-gray-800"
        :style="{ animationDuration: '1s' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
type Size = "sm" | "md" | "lg";

const props = withDefaults(
  defineProps<{
    size?: Size;
  }>(),
  {
    size: "md",
  },
);

const spinnerSizeClass = computed(() => {
  switch (props.size) {
    case "sm":
      return "h-6 w-6";
    case "md":
      return "h-12 w-12";
    case "lg":
      return "h-16 w-16";
    default:
      return "h-12 w-12";
  }
});

const containerPaddingClass = computed(() => {
  switch (props.size) {
    case "sm":
      return "p-0";
    case "md":
    case "lg":
      return "py-8";
    default:
      return "py-8";
  }
});
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
