<template>
  <div class="space-y-6">
    <StripeAccountAtomsFormTtl>銀行口座情報</StripeAccountAtomsFormTtl>
    <div class="grid max-w-sm grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3">
      <div v-if="isFieldRequired('bank_code')" class="max-w-60 sm:max-w-full">
        <label class="mb-1 block text-sm font-medium"
          >銀行コード<span class="ml-[0.2em] text-red-600">*</span></label
        >
        <input
          :value="formData.bank_code"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.bank_code }"
          placeholder="例) 0001"
          maxlength="4"
          required
          aria-describedby="bank_code-error"
          @input="updateFormData('bank_code', $event)"
          @blur="handleNumericBlur('bank_code', $event)"
        />
        <p class="mt-1 text-xs text-gray-500">半角数字で入力してください</p>
        <div
          v-if="errors?.bank_code"
          id="bank_code-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors.bank_code }}
        </div>
      </div>
      <div v-if="isFieldRequired('branch_code')" class="max-w-60 sm:max-w-full">
        <label class="mb-1 block text-sm font-medium"
          >支店コード<span class="ml-[0.2em] text-red-600">*</span></label
        >
        <input
          :value="formData.branch_code"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.branch_code }"
          placeholder="例) 001"
          maxlength="3"
          required
          aria-describedby="branch_code-error"
          @input="updateFormData('branch_code', $event)"
          @blur="handleNumericBlur('branch_code', $event)"
        />
        <p class="mt-1 text-xs text-gray-500">半角数字で入力してください</p>
        <div
          v-if="errors?.branch_code"
          id="branch_code-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors.branch_code }}
        </div>
      </div>
    </div>
    <div class="grid max-w-sm grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3">
      <div
        v-if="isFieldRequired('account_type')"
        class="max-w-60 sm:max-w-full"
      >
        <label class="mb-1 block text-sm font-medium"
          >口座種別<span class="ml-[0.2em] text-red-600">*</span></label
        >
        <select
          :value="formData.account_type"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.account_type }"
          required
          aria-describedby="account_type-error"
          @change="updateFormData('account_type', $event)"
        >
          <option value="">選択してください</option>
          <option value="futsu">普通</option>
          <option value="toza">当座</option>
        </select>
        <div
          v-if="errors?.account_type"
          id="account_type-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors.account_type }}
        </div>
      </div>
      <div
        v-if="isFieldRequired('account_number')"
        class="max-w-60 sm:max-w-full"
      >
        <label class="mb-1 block text-sm font-medium"
          >口座番号<span class="ml-[0.2em] text-red-600">*</span></label
        >
        <input
          :value="formData.account_number"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.account_number }"
          placeholder="例) 1234567"
          maxlength="7"
          required
          aria-describedby="account_number-error"
          @input="updateFormData('account_number', $event)"
          @blur="handleNumericBlur('account_number', $event)"
        />
        <p class="mt-1 text-xs text-gray-500">半角数字で入力してください</p>
        <div
          v-if="errors?.account_number"
          id="account_number-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors.account_number }}
        </div>
      </div>
    </div>
    <div v-if="isFieldRequired('account_holder_name')" class="max-w-sm">
      <label class="mb-1 block text-sm font-medium"
        >口座名義（カナ）<span class="ml-[0.2em] text-red-600">*</span></label
      >
      <input
        :value="formData.account_holder_name"
        type="text"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors?.account_holder_name }"
        required
        aria-describedby="account_holder_name-error"
        @input="updateFormData('account_holder_name', $event)"
      />
      <div
        v-if="errors?.account_holder_name"
        id="account_holder_name-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.account_holder_name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Step3FormData } from "~/types/account-register";
import { useNumericInput } from "~/composables/useNumericInput";

type Props = {
  formData: Step3FormData;
  errors?: Record<string, string>;
  requiredFields?: string[];
};

const props = defineProps<Props>();

// フィールドが必須かどうかを判定
const isFieldRequired = (fieldName: string): boolean => {
  if (!props.requiredFields || props.requiredFields.length === 0) {
    return true;
  }
  // bank_infoが含まれている場合は全フィールドを表示
  if (props.requiredFields.includes("bank_info")) {
    return true;
  }
  return props.requiredFields.includes(fieldName);
};

type Emits = {
  "update:form-data": [formData: Step3FormData];
};

const emit = defineEmits<Emits>();

const { normalizeNumericInput } = useNumericInput();

const updateFormData = (key: keyof Step3FormData, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLSelectElement;
  const updatedData = { ...props.formData, [key]: target.value };
  emit("update:form-data", updatedData);
};

// 数値入力フィールドのフォーカスアウトハンドラー
const handleNumericBlur = (key: keyof Step3FormData, event: Event) => {
  normalizeNumericInput(event, (value: string) => {
    emit("update:form-data", {
      ...props.formData,
      [key]: value,
    });
  });
};
</script>
