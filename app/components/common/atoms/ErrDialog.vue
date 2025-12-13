<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity"
      @click.self="handleClose"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="error-dialog-title"
        aria-describedby="error-dialog-message"
        class="relative z-10 w-[min(90vw,600px)] rounded-lg bg-white p-6 shadow-xl"
        @keydown.esc="handleClose"
      >
        <h2
          id="error-dialog-title"
          class="mb-4 text-lg font-semibold text-gray-900"
        >
          エラー
        </h2>
        <p
          id="error-dialog-message"
          class="mb-6 whitespace-pre-line text-sm text-red-600"
        >
          {{ msg }}
        </p>

        <div class="flex justify-end">
          <button
            type="button"
            class="rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
            @click="handleClose"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
type Props = {
  modelValue: boolean;
  msg: string;
};

const props = defineProps<Props>();

type Emits = {
  "update:modelValue": [value: boolean];
};

const emit = defineEmits<Emits>();

const handleClose = () => {
  emit("update:modelValue", false);
};

// ダイアログが開いた時にフォーカスを管理
const focusFirstButton = () => {
  nextTick(() => {
    const dialog = document.querySelector(
      '[role="alertdialog"]',
    ) as HTMLElement;
    if (dialog) {
      const firstFocusable = dialog.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  });
};

// ダイアログが開いている間、背景のスクロールを無効化し、フォーカスを管理
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      focusFirstButton();
    } else {
      document.body.style.overflow = "";
    }
  },
);
</script>
