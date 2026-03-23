<template>
  <div
    class="flex flex-col items-center justify-center"
    :class="containerPaddingClass"
  >
    <div class="relative" :class="spinnerSizeClass">
      <div
        class="absolute inset-0 rounded-full border-gray-200"
        :class="spinnerBorderClass"
      />
      <div
        class="absolute inset-0 animate-spin rounded-full border-transparent border-t-gray-800"
        :class="spinnerBorderClass"
        :style="{ animationDuration: '1s' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
type Size = "xs" | "sm" | "md" | "lg";

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
    case "xs":
      return "h-4 w-4";
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

const spinnerBorderClass = computed(() =>
  props.size === "xs" ? "border-2" : "border-4",
);

const containerPaddingClass = computed(() => {
  switch (props.size) {
    case "xs":
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
