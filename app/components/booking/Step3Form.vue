<template>
  <div class="space-y-6">
    <!-- お名前 -->
    <div>
      <label
        for="customerName"
        class="mb-2 block font-semibold text-gray-800"
      >
        お名前<span class="ml-[0.2em] text-red-600">*</span>
      </label>
      <input
        id="customerName"
        :value="formData.customer_name"
        type="text"
        name="customerName"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.customer_name }"
        placeholder="例) 山田 太郎"
        required
        aria-required="true"
        aria-describedby="customer_name-error"
        @input="handleInput('customer_name', $event)"
      >
      <div
        v-if="errors.customer_name"
        id="customer_name-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.customer_name }}
      </div>
    </div>

    <!-- メールアドレス -->
    <div>
      <label
        for="customerEmail"
        class="mb-2 block font-semibold text-gray-800"
      >
        メールアドレス<span class="ml-[0.2em] text-red-600">*</span>
      </label>
      <input
        id="customerEmail"
        :value="formData.customer_email"
        type="email"
        name="customerEmail"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.customer_email }"
        placeholder="例) example@example.com"
        required
        aria-required="true"
        aria-describedby="customer_email-error"
        @input="handleInput('customer_email', $event)"
      >
      <div
        v-if="errors.customer_email"
        id="customer_email-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.customer_email }}
      </div>
    </div>

    <!-- 電話番号 -->
    <div>
      <label
        for="customerPhoneNumber"
        class="mb-2 block font-semibold text-gray-800"
      >
        電話番号<span class="ml-[0.2em] text-red-600">*</span>
      </label>
      <input
        id="customerPhoneNumber"
        :value="formData.customer_phone_number"
        type="tel"
        name="customerPhoneNumber"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.customer_phone_number }"
        required
        aria-required="true"
        aria-describedby="customer_phone_number-error"
        placeholder="例) 00000000000"
        @input="handleInput('customer_phone_number', $event)"
        @blur="handlePhoneBlur($event)"
      >
      <p class="mt-1 text-xs text-gray-500">
        半角数字で入力してください（ハイフンなし）
      </p>
      <div
        v-if="errors.customer_phone_number"
        id="customer_phone_number-error"
        aria-live="polite"
        class="mt-1 text-sm text-red-600"
      >
        {{ errors.customer_phone_number }}
      </div>
    </div>

    <!-- 国籍 -->
    <div>
      <label
        for="customerNationality"
        class="mb-2 block font-semibold text-gray-800"
      >
        国籍<span class="ml-[0.2em] text-red-600">*</span>
      </label>
      <div class="relative">
        <select
          id="customerNationality"
          :value="formData.customer_nationality"
          name="customerNationality"
          class="w-full cursor-pointer appearance-none rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors.customer_nationality }"
          required
          aria-required="true"
          aria-describedby="customer_nationality-error"
          @change="handleInput('customer_nationality', $event)"
        >
          <option
            value=""
            disabled
          >
            国籍を選択してください
          </option>
          <option
            v-for="nationalityItem in nationalityItems"
            :key="nationalityItem.value"
            :value="nationalityItem.value"
          >
            {{ nationalityItem.label }}
          </option>
        </select>
        <img
          class="pointer-events-none absolute right-5 top-1/2 h-3 w-3 -translate-y-1/2"
          src="/img/down-arrow.svg"
          alt=""
        >
      </div>
      <div
        v-if="errors.customer_nationality"
        id="customer_nationality-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.customer_nationality }}
      </div>
    </div>

    <!-- 宿泊予約者名 -->
    <div>
      <label
        for="guestName"
        class="mb-2 block font-semibold text-gray-800"
      >
        宿泊予約者名（ローマ字）<span class="ml-[0.2em] text-red-600">*</span>
      </label>
      <input
        id="guestName"
        :value="formData.guest_name"
        type="text"
        name="guestName"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.guest_name }"
        placeholder="例) Taro Yamada"
        required
        aria-required="true"
        aria-describedby="guest_name-error"
        @input="handleInput('guest_name', $event)"
      >
      <div
        v-if="errors.guest_name"
        id="guest_name-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.guest_name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import countries from "i18n-iso-countries";
import ja from "i18n-iso-countries/langs/ja.json";
import type { Step3FormData } from "../../types/booking";
import { useNumericInput } from "../../composables/useNumericInput";

type Props = {
  formData: Step3FormData;
  errors: Partial<Record<keyof Step3FormData, string>>;
};

const props = defineProps<Props>();

type Emits = {
  "update:form-data": [formData: Step3FormData];
};

const emit = defineEmits<Emits>();

const { normalizeNumericInput } = useNumericInput();

// 電話番号のフォーカスアウトハンドラー
const handlePhoneBlur = (event: Event) => {
  normalizeNumericInput(event, (value: string) => {
    emit("update:form-data", {
      ...props.formData,
      customer_phone_number: value,
    });
  });
};

// 国籍の選択肢を作成
countries.registerLocale(ja);

const nationalityItems = Object.entries(countries.getNames("ja"))
  .map(([code, name]) => ({ value: code, label: name as string }))
  .sort((a, b) => a.label.localeCompare(b.label, "ja"));

// 入力ハンドラー
const handleInput = (key: keyof Step3FormData, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLSelectElement;
  const updatedData = { ...props.formData, [key]: target.value };
  emit("update:form-data", updatedData);
};
</script>
