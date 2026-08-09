<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity"
      @click.self="handleCancel"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        class="relative z-10 w-[min(90vw,400px)] rounded-lg bg-white p-6 shadow-xl"
        @keydown.esc="handleCancel"
      >
        <h2
          id="confirm-dialog-title"
          class="mb-4 text-lg font-semibold text-gray-900"
        >
          {{ title }}
        </h2>
        <p
          id="confirm-dialog-message"
          class="text-sm text-gray-700"
          :class="$slots.default ? 'mb-4' : 'mb-6'"
        >
          {{ message }}
        </p>

        <!-- 確認内容に追加の入力（選択肢など）を差し込むためのスロット -->
        <div
          v-if="$slots.default"
          class="mb-6"
        >
          <slot />
        </div>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
            @click="handleConfirm"
          >
            {{ confirmLabelDisplay }}
          </button>
          <button
            v-if="!hideCancel"
            type="button"
            class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            @click="handleCancel"
          >
            {{ cancelLabelDisplay }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

type Props = {
  modelValue: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  hideCancel?: boolean;
};

const { t } = useI18n();

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: undefined,
  cancelLabel: undefined,
  hideCancel: false,
});

const confirmLabelDisplay = computed(() => props.confirmLabel ?? t("common.yes"));
const cancelLabelDisplay = computed(() => props.cancelLabel ?? t("common.cancel"));

type Emits = {
  "update:modelValue": [value: boolean];
  "confirm": [];
  "cancel": [];
};

const emit = defineEmits<Emits>();

const handleConfirm = () => {
  emit("confirm");
  emit("update:modelValue", false);
};

const handleCancel = () => {
  emit("cancel");
  emit("update:modelValue", false);
};

const focusFirstButton = () => {
  nextTick(() => {
    const dialog = document.querySelector("[role=\"dialog\"]") as HTMLElement;
    if (dialog) {
      const firstFocusable = dialog.querySelector(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])",
      ) as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  });
};

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      focusFirstButton();
    }
    else {
      document.body.style.overflow = "";
    }
  },
);
</script>
