<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity"
      @click.self="onCancel"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="price-update-dialog-title"
        aria-describedby="price-update-dialog-message"
        class="relative z-10 w-[min(90vw,700px)] rounded-lg bg-white p-6 shadow-xl"
        @keydown.esc="onCancel"
      >
        <h2
          id="price-update-dialog-title"
          class="mb-4 text-lg font-semibold text-gray-900"
        >
          料金が更新されました
        </h2>
        <div
          id="price-update-dialog-message"
          class="mb-6 space-y-3 text-sm text-gray-700"
        >
          <p>事業者により料金が変更されたため、合計金額が更新されました。</p>
          <div
            v-if="changedItems && changedItems.length > 0"
            class="rounded-md border border-gray-200 bg-gray-50 p-4"
          >
            <p class="mb-2 font-semibold text-gray-800">
              料金が変更された荷物
            </p>
            <ul class="space-y-2">
              <li
                v-for="changedItem in changedItems"
                :key="changedItem.name"
                class="flex items-center justify-between gap-2"
              >
                <span class="text-gray-700">
                  {{ changedItem.name }}
                  <span class="text-gray-500">（×{{ changedItem.count }}）</span>
                </span>
                <span class="flex items-center gap-2 whitespace-nowrap">
                  <span class="text-gray-500 line-through">¥{{ changedItem.oldPrice.toLocaleString() }}</span>
                  <span
                    aria-hidden="true"
                    class="text-gray-400"
                  >→</span>
                  <span class="font-semibold text-gray-900">¥{{ changedItem.newPrice.toLocaleString() }}</span>
                </span>
              </li>
            </ul>
          </div>
          <div
            class="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-4"
          >
            <div class="flex items-center justify-between text-gray-500">
              <span>変更前</span>
              <span class="font-medium line-through">¥{{ oldAmount.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-semibold text-gray-800">変更後の合計金額</span>
              <span class="text-xl font-bold text-gray-900">¥{{ newAmount.toLocaleString() }}</span>
            </div>
          </div>
          <p class="text-gray-600">
            新しい金額で続行する場合は「お支払い情報のご入力へ」、内容を確認しなおす場合は「戻る」を選択してください。
          </p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="button"
            class="flex-1 rounded-md bg-gray-800 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
            @click="onProceed"
          >
            お支払い情報のご入力へ
          </button>
          <button
            type="button"
            class="flex-1 rounded-md border-2 border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            @click="onBack"
          >
            戻る
          </button>
          <button
            type="button"
            class="flex-1 rounded-md bg-transparent px-4 py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
            @click="onCancel"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { PriceUpdateChangedItem } from "~/types/booking";

type Props = {
  modelValue: boolean;
  oldAmount: number;
  newAmount: number;
  changedItems?: PriceUpdateChangedItem[];
};

const props = defineProps<Props>();

type Emits = {
  "update:modelValue": [value: boolean];
  "proceed": [];
  "back": [];
  "cancel": [];
};

const emit = defineEmits<Emits>();

const close = () => {
  emit("update:modelValue", false);
};

const onProceed = () => {
  emit("proceed");
  close();
};

const onBack = () => {
  emit("back");
  close();
};

const onCancel = () => {
  emit("cancel");
  close();
};

const focusFirstButton = () => {
  nextTick(() => {
    const dialog = document.querySelector(
      "[role=\"alertdialog\"]",
    ) as HTMLElement | null;
    if (!dialog) return;
    const firstFocusable = dialog.querySelector(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])",
    ) as HTMLElement | null;
    if (firstFocusable) {
      firstFocusable.focus();
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
