<template>
  <div class="space-y-6">
    <StripeAccountAtomsFormTtl>代表者情報</StripeAccountAtomsFormTtl>
    <div
      v-if="
        isFieldRequired('first_name_kanji') ||
        isFieldRequired('last_name_kanji')
      "
      class="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3"
    >
      <div
        v-if="isFieldRequired('last_name_kanji')"
        class="max-w-sm sm:max-w-full"
      >
        <label class="mb-1 block text-sm font-medium"
          >姓<span class="ml-[0.2em] text-red-600">*</span></label
        >
        <input
          :value="formData.last_name_kanji"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.last_name_kanji }"
          required
          aria-describedby="last_name_kanji-error"
          @input="updateFormData('last_name_kanji', $event)"
        />
        <div
          v-if="errors?.last_name_kanji"
          id="last_name_kanji-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors.last_name_kanji }}
        </div>
      </div>
      <div
        v-if="isFieldRequired('first_name_kanji')"
        class="max-w-sm sm:max-w-full"
      >
        <label class="mb-1 block text-sm font-medium"
          >名<span class="ml-[0.2em] text-red-600">*</span></label
        >
        <input
          :value="formData.first_name_kanji"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.first_name_kanji }"
          required
          aria-describedby="first_name_kanji-error"
          @input="updateFormData('first_name_kanji', $event)"
        />
        <div
          v-if="errors?.first_name_kanji"
          id="first_name_kanji-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors.first_name_kanji }}
        </div>
      </div>
    </div>
    <div
      v-if="
        isFieldRequired('first_name_kana') || isFieldRequired('last_name_kana')
      "
      class="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3"
    >
      <div
        v-if="isFieldRequired('last_name_kana')"
        class="max-w-sm sm:max-w-full"
      >
        <label class="mb-1 block text-sm font-medium"
          >姓（カナ）<span class="ml-[0.2em] text-red-600">*</span></label
        >
        <input
          :value="formData.last_name_kana"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.last_name_kana }"
          required
          aria-describedby="last_name_kana-error"
          @input="updateFormData('last_name_kana', $event)"
        />
        <div
          v-if="errors?.last_name_kana"
          id="last_name_kana-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors.last_name_kana }}
        </div>
      </div>
      <div
        v-if="isFieldRequired('first_name_kana')"
        class="max-w-sm sm:max-w-full"
      >
        <label class="mb-1 block text-sm font-medium"
          >名（カナ）<span class="ml-[0.2em] text-red-600">*</span></label
        >
        <input
          :value="formData.first_name_kana"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.first_name_kana }"
          required
          aria-describedby="first_name_kana-error"
          @input="updateFormData('first_name_kana', $event)"
        />
        <div
          v-if="errors?.first_name_kana"
          id="first_name_kana-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors.first_name_kana }}
        </div>
      </div>
    </div>
    <div v-if="isFieldRequired('rep_dob')" class="max-w-60">
      <label class="mb-1 block text-sm font-medium"
        >生年月日<span class="ml-[0.2em] text-red-600">*</span></label
      >
      <div
        class="flex w-full justify-center rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{
          'border-red-500':
            errors?.rep_dob ||
            errors?.['rep_dob.year'] ||
            errors?.['rep_dob.month'] ||
            errors?.['rep_dob.day'],
        }"
      >
        <div>
          <input
            ref="yearInputRef"
            :value="formData.rep_dob.year || ''"
            type="number"
            class="px-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            placeholder="年"
            min="1900"
            :max="new Date().getFullYear()"
            required
            aria-describedby="rep_dob-year-error"
            @input="handleYearInput($event)"
          />
        </div>
        <span class="text-sm">/</span>
        <div>
          <input
            ref="monthInputRef"
            :value="formData.rep_dob.month || ''"
            type="number"
            class="px-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            placeholder="月"
            min="1"
            max="12"
            required
            aria-describedby="rep_dob-month-error"
            @input="handleMonthInput($event)"
          />
        </div>
        <span class="text-sm">/</span>
        <div>
          <input
            ref="dayInputRef"
            :value="formData.rep_dob.day || ''"
            type="number"
            class="px-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            placeholder="日"
            min="1"
            max="31"
            required
            aria-describedby="rep_dob-day-error"
            @input="handleDayInput($event)"
          />
        </div>
      </div>
      <p class="mt-1 text-xs text-gray-500">半角数字で入力してください</p>
      <div
        v-if="
          errors?.rep_dob ||
          errors?.['rep_dob.year'] ||
          errors?.['rep_dob.month'] ||
          errors?.['rep_dob.day']
        "
        class="mt-1 text-sm text-red-500"
        aria-live="polite"
      >
        {{
          errors?.["rep_dob.year"] ||
          errors?.["rep_dob.month"] ||
          errors?.["rep_dob.day"] ||
          errors?.rep_dob ||
          "生年月日を正しく入力してください"
        }}
      </div>
    </div>
    <div v-if="isFieldRequired('rep_phone')" class="max-w-60">
      <label class="mb-1 block text-sm font-medium"
        >電話番号<span class="ml-[0.2em] text-red-600">*</span></label
      >
      <input
        :value="formData.rep_phone"
        type="tel"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors?.rep_phone }"
        placeholder="例) 09012345678"
        required
        aria-describedby="rep_phone-error"
        @input="updateFormData('rep_phone', $event)"
        @blur="handlePhoneBlur($event)"
      />
      <p class="mt-1 text-xs text-gray-500">半角数字で入力してください</p>
      <div
        v-if="errors?.rep_phone"
        id="rep_phone-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.rep_phone }}
      </div>
    </div>
    <div v-if="isFieldRequired('rep_email')" class="max-w-sm">
      <label class="mb-1 block text-sm font-medium"
        >メールアドレス<span class="ml-[0.2em] text-red-600">*</span></label
      >
      <input
        :value="formData.rep_email"
        type="email"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors?.rep_email }"
        required
        aria-describedby="rep_email-error"
        @input="updateFormData('rep_email', $event)"
      />
      <div
        v-if="errors?.rep_email"
        id="rep_email-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.rep_email }}
      </div>
    </div>
    <div v-if="isAddressRequired()" class="space-y-6">
      <div class="max-w-60">
        <label class="mb-1 block text-sm font-medium"
          >郵便番号<span class="ml-[0.2em] text-red-600">*</span></label
        >
        <input
          :value="formData.address_kanji.postal_code"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.['address_kanji.postal_code'] }"
          placeholder="例) 1234567"
          aria-describedby="address_kanji.postal_code-error"
          @input="handlePostalCodeInput($event)"
        />
        <p class="mt-1 text-xs text-gray-500">半角数字で入力してください</p>
        <div
          v-if="errors?.['address_kanji.postal_code']"
          id="address_kanji.postal_code-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors["address_kanji.postal_code"] }}
        </div>
      </div>
      <div class="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3">
        <div class="max-w-sm sm:max-w-full">
          <label class="mb-1 block text-sm font-medium"
            >都道府県<span class="ml-[0.2em] text-red-600">*</span></label
          >
          <input
            :value="formData.address_kanji.state"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors?.['address_kanji.state'] }"
            aria-describedby="address_kanji.state-error"
            @input="updateAddressKanjiFormData('state', $event)"
          />
          <div
            v-if="errors?.['address_kanji.state']"
            id="address_kanji.state-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors["address_kanji.state"] }}
          </div>
        </div>
        <div class="max-w-sm sm:max-w-full">
          <label class="mb-1 block text-sm font-medium"
            >都道府県（カナ）<span class="ml-[0.2em] text-red-600"
              >*</span
            ></label
          >
          <input
            :value="formData.address_kana.state"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors?.['address_kana.state'] }"
            aria-describedby="address_kana.state-error"
            @input="updateAddressKanaFormData('state', $event)"
          />
          <div
            v-if="errors?.['address_kana.state']"
            id="address_kana.state-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors["address_kana.state"] }}
          </div>
        </div>
      </div>
      <div class="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3">
        <div class="max-w-sm sm:max-w-full">
          <label class="mb-1 block text-sm font-medium"
            >市区町村<span class="ml-[0.2em] text-red-600">*</span></label
          >
          <input
            :value="formData.address_kanji.city"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors?.['address_kanji.city'] }"
            aria-describedby="address_kanji.city-error"
            @input="updateAddressKanjiFormData('city', $event)"
          />
          <div
            v-if="errors?.['address_kanji.city']"
            id="address_kanji.city-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors["address_kanji.city"] }}
          </div>
        </div>
        <div class="max-w-sm sm:max-w-full">
          <label class="mb-1 block text-sm font-medium"
            >市区町村（カナ）<span class="ml-[0.2em] text-red-600"
              >*</span
            ></label
          >
          <input
            :value="formData.address_kana.city"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors?.['address_kana.city'] }"
            aria-describedby="address_kana.city-error"
            @input="updateAddressKanaFormData('city', $event)"
          />
          <div
            v-if="errors?.['address_kana.city']"
            id="address_kana.city-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors["address_kana.city"] }}
          </div>
        </div>
      </div>
      <div class="max-w-xl">
        <label class="mb-1 block text-sm font-medium"
          >町名番地<span class="ml-[0.2em] text-red-600">*</span></label
        >
        <input
          :value="formData.address_kanji.line1"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.['address_kanji.line1'] }"
          aria-describedby="address_kanji.line1-error"
          @input="updateAddressKanjiFormData('line1', $event)"
        />
        <div
          v-if="errors?.['address_kanji.line1']"
          id="address_kanji.line1-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors["address_kanji.line1"] }}
        </div>
      </div>
      <div class="max-w-xl">
        <label class="mb-1 block text-sm font-medium"
          >町名番地（カナ）<span class="ml-[0.2em] text-red-600">*</span></label
        >
        <input
          :value="formData.address_kana.line1"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.['address_kana.line1'] }"
          aria-describedby="address_kana.line1-error"
          @input="updateAddressKanaFormData('line1', $event)"
        />
        <div
          v-if="errors?.['address_kana.line1']"
          id="address_kana.line1-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors["address_kana.line1"] }}
        </div>
      </div>
      <div class="max-w-xl">
        <label class="mb-1 block text-sm font-medium">建物名・部屋番号</label>
        <input
          :value="formData.address_kanji.line2"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="updateAddressKanjiFormData('line2', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Step2FormData } from "~/types/stripe-account-register";
import { usePostalCodeSearch } from "~/composables/usePostalCodeSearch";
import { useNumericInput } from "~/composables/useNumericInput";

type Props = {
  formData: Step2FormData;
  errors?: Record<string, string>;
  requiredFields?: string[];
};

const props = defineProps<Props>();

// フィールドが必須かどうかを判定
const isFieldRequired = (fieldName: string): boolean => {
  if (!props.requiredFields || props.requiredFields.length === 0) {
    // requiredFieldsが空の場合は全フィールドを表示（初回登録時）
    return true;
  }
  return props.requiredFields.includes(fieldName);
};

// 住所関連フィールドのいずれかが必須かどうかを判定
const isAddressRequired = (): boolean => {
  if (!props.requiredFields || props.requiredFields.length === 0) {
    return true;
  }
  const addressFields = [
    "address_kanji.postal_code",
    "address_kanji.state",
    "address_kana.state",
    "address_kanji.city",
    "address_kana.city",
    "address_kanji.line1",
    "address_kana.line1",
    "address_kanji.line2",
  ];
  return addressFields.some((field) => props.requiredFields?.includes(field));
};

type Emits = {
  "update:form-data": [formData: Step2FormData];
};

const emit = defineEmits<Emits>();

const { searchAddress, handlePostalCode } = usePostalCodeSearch();
const { normalizeNumericInput } = useNumericInput();

const yearInputRef = ref<HTMLInputElement | null>(null);
const monthInputRef = ref<HTMLInputElement | null>(null);
const dayInputRef = ref<HTMLInputElement | null>(null);

const updateFormData = (key: keyof Step2FormData, event: Event) => {
  const target = event.target as HTMLInputElement;
  const updatedData = { ...props.formData, [key]: target.value };
  emit("update:form-data", updatedData);
};

// 電話番号のフォーカスアウトハンドラー
const handlePhoneBlur = (event: Event) => {
  normalizeNumericInput(event, (value: string) => {
    emit("update:form-data", {
      ...props.formData,
      rep_phone: value,
    });
  });
};

// 年の入力ハンドラー
const handleYearInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value = target.value;
  if (value.length > 4) {
    value = value.slice(0, 4);
    target.value = value;
  }
  const year = value ? Number.parseInt(value, 10) : 0;
  emit("update:form-data", {
    ...props.formData,
    rep_dob: {
      ...props.formData.rep_dob,
      year: year,
    },
  });
  // 4桁入力されたら月のフィールドにフォーカス移動
  if (value.length === 4 && monthInputRef.value) {
    monthInputRef.value.focus();
  }
};

// 月の入力ハンドラー
const handleMonthInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value = target.value;
  if (value.length > 2) {
    value = value.slice(0, 2);
    target.value = value;
  }
  const month = value ? Number.parseInt(value, 10) : 0;
  emit("update:form-data", {
    ...props.formData,
    rep_dob: {
      ...props.formData.rep_dob,
      month: month,
    },
  });
  // 3-9を入力した時点で確定するので即座に切り替え
  // または、2桁入力され、かつ有効な月の値（1-12）の場合に切り替え
  if (
    (value.length === 1 && month >= 3 && month <= 9) ||
    (value.length === 2 && month >= 1 && month <= 12)
  ) {
    if (dayInputRef.value) {
      dayInputRef.value.focus();
    }
  }
};

// 日の入力ハンドラー
const handleDayInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value = target.value;
  if (value.length > 2) {
    value = value.slice(0, 2);
    target.value = value;
  }
  const day = value ? Number.parseInt(value, 10) : 0;
  emit("update:form-data", {
    ...props.formData,
    rep_dob: {
      ...props.formData.rep_dob,
      day: day,
    },
  });
};

// 漢字住所フィールドを更新
const updateAddressKanjiFormData = (
  field: keyof Step2FormData["address_kanji"],
  event: Event,
) => {
  const target = event.target as HTMLInputElement;
  emit("update:form-data", {
    ...props.formData,
    address_kanji: {
      ...props.formData.address_kanji,
      [field]: target.value,
    },
    // postal_code は address_kana にも同期
    ...(field === "postal_code" && {
      address_kana: {
        ...props.formData.address_kana,
        postal_code: target.value,
      },
    }),
  });
};

// カナ住所フィールドを更新
const updateAddressKanaFormData = (
  field: keyof Step2FormData["address_kana"],
  event: Event,
) => {
  const target = event.target as HTMLInputElement;
  emit("update:form-data", {
    ...props.formData,
    address_kana: {
      ...props.formData.address_kana,
      [field]: target.value,
    },
    // postal_code は address_kanji にも同期
    ...(field === "postal_code" && {
      address_kanji: {
        ...props.formData.address_kanji,
        postal_code: target.value,
      },
    }),
  });
};

// 郵便番号入力ハンドラー
const handlePostalCodeInput = (event: Event) => {
  handlePostalCode(event, {
    onPostalCodeUpdate: (postalCode: string) => {
      emit("update:form-data", {
        ...props.formData,
        address_kanji: {
          ...props.formData.address_kanji,
          postal_code: postalCode,
        },
        address_kana: {
          ...props.formData.address_kana,
          postal_code: postalCode,
        },
      });
    },
    onSearch: async (postalCode: string) => {
      await searchAddressByPostalCode(postalCode);
    },
  });
};

// 郵便番号から住所を検索
const searchAddressByPostalCode = async (postalCode: string) => {
  const result = await searchAddress(postalCode, true);
  if (result) {
    emit("update:form-data", {
      ...props.formData,
      address_kanji: {
        ...props.formData.address_kanji,
        postal_code: result.postal_code,
        state: result.state,
        city: result.city,
        line1: result.line1,
      },
      address_kana: {
        ...props.formData.address_kana,
        postal_code: result.postal_code,
        state: result.state_kana || "",
        city: result.city_kana || "",
        line1: result.line1_kana || "",
      },
    });
  }
};
</script>
