<template>
  <div class="space-y-10">
    <div>
      <label class="inline-flex items-center gap-2">
        <input
          :checked="formData.accept_tos"
          type="checkbox"
          class="h-4 w-4"
          aria-describedby="accept_tos-error"
          @change="updateAcceptTos($event)"
        />
        <span class="text-sm text-gray-700"
          ><a
            class="text-[#0f83fd]"
            href="https://stripe.com/jp/legal/ssa"
            target="_blank"
            rel="nofollow noopener noreferrer"
            >Stripeの利用規約</a
          >、<a
            class="text-[#0f83fd]"
            href="https://stripe.com/jp/legal/connect-account"
            target="_blank"
            rel="nofollow noopener noreferrer"
            >Stripe Connectアカウント契約</a
          >、<a
            class="text-[#0f83fd]"
            href="https://stripe.com/jp/legal/privacy-center"
            target="_blank"
            rel="nofollow noopener noreferrer"
            >Stripeのプライバシーポリシー</a
          >に同意します</span
        >
      </label>
      <div
        v-if="errors?.accept_tos"
        id="accept_tos-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.accept_tos }}
      </div>
    </div>
    <div v-if="isBusinessSectionRequired()" class="space-y-6">
      <StripeAccountAtomsFormTtl>
        ビジネス情報（公開されます）
      </StripeAccountAtomsFormTtl>
      <div v-if="isFieldRequired('product_name')" class="max-w-sm">
        <label class="mb-1 block text-sm font-medium"
          >事業名<span class="ml-[0.2em] text-red-600">*</span></label
        >
        <input
          :value="formData.product_name"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.product_name }"
          required
          aria-describedby="product_name-error"
          @input="updateFormData('product_name', $event)"
        />
        <div
          v-if="errors?.product_name"
          id="product_name-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors.product_name }}
        </div>
      </div>
      <div v-if="isFieldRequired('support_email')" class="max-w-sm">
        <label class="mb-1 block text-sm font-medium"
          >お問い合わせメールアドレス<span class="ml-[0.2em] text-red-600"
            >*</span
          ></label
        >
        <input
          :value="formData.support_email"
          type="email"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.support_email }"
          aria-describedby="support_email-error"
          @input="updateFormData('support_email', $event)"
        />
        <div
          v-if="errors?.support_email"
          id="support_email-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors.support_email }}
        </div>
      </div>
    </div>

    <div v-if="isCompanySectionRequired()" class="space-y-6">
      <StripeAccountAtomsFormTtl>
        事業者情報（公開されます）
      </StripeAccountAtomsFormTtl>
      <div v-if="isFieldRequired('company_name')" class="max-w-sm">
        <label class="mb-1 block text-sm font-medium"
          >法人名または屋号（登記名・商号）<span class="ml-[0.2em] text-red-600"
            >*</span
          ></label
        >
        <input
          :value="formData.company_name"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.company_name }"
          required
          aria-describedby="company_name-error"
          @input="updateFormData('company_name', $event)"
        />
        <p class="mt-1 text-xs text-gray-500">
          法人の方は登記簿上の正式名称を入力してください。個人事業主の方で屋号がない場合は、代表者名(姓＋名)を入力してください。
        </p>
        <div
          v-if="errors?.company_name"
          id="company_name-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors.company_name }}
        </div>
      </div>

      <div
        v-if="isCompanyAddressRequired()"
        class="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3"
      >
        <div
          v-if="isFieldRequired('company_address.postal_code')"
          class="max-w-60 sm:max-w-full"
        >
          <label class="mb-1 block text-sm font-medium"
            >郵便番号<span class="ml-[0.2em] text-red-600">*</span></label
          >
          <input
            :value="formData.company_address.postal_code"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{
              'border-red-500': errors?.['company_address.postal_code'],
            }"
            placeholder="例) 1234567"
            aria-describedby="company_address.postal_code-error"
            @input="handlePostalCodeInput($event)"
          />
          <p class="mt-1 text-xs text-gray-500">半角数字で入力してください</p>
          <div
            v-if="errors?.['company_address.postal_code']"
            id="company_address.postal_code-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors["company_address.postal_code"] }}
          </div>
        </div>
        <div
          v-if="isFieldRequired('company_address.state')"
          class="max-w-sm sm:max-w-full"
        >
          <label class="mb-1 block text-sm font-medium"
            >都道府県<span class="ml-[0.2em] text-red-600">*</span></label
          >
          <input
            :value="formData.company_address.state"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors?.['company_address.state'] }"
            aria-describedby="company_address.state-error"
            @input="updateCompanyAddressFormData('state', $event)"
          />
          <div
            v-if="errors?.['company_address.state']"
            id="company_address.state-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors["company_address.state"] }}
          </div>
        </div>
      </div>
      <div v-if="isFieldRequired('company_address.line1')" class="max-w-xl">
        <label class="mb-1 block text-sm font-medium"
          >市区町村・町名番地<span class="ml-[0.2em] text-red-600"
            >*</span
          ></label
        >
        <input
          :value="formData.company_address.line1"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.['company_address.line1'] }"
          aria-describedby="company_address.line1-error"
          @input="updateCompanyAddressFormData('line1', $event)"
        />
        <div
          v-if="errors?.['company_address.line1']"
          id="company_address.line1-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors["company_address.line1"] }}
        </div>
      </div>
      <div v-if="isFieldRequired('company_address.line2')" class="max-w-xl">
        <label class="mb-1 block text-sm font-medium">建物名・部屋番号</label>
        <input
          :value="formData.company_address.line2"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="updateCompanyAddressFormData('line2', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Step1FormData } from "~/types/stripe-account-register";
import { usePostalCodeSearch } from "~/composables/usePostalCodeSearch";

type Props = {
  formData: Step1FormData;
  errors?: Record<string, string>;
  requiredFields?: string[];
};

const props = defineProps<Props>();

// フィールドが必須かどうかを判定
const isFieldRequired = (fieldName: string): boolean => {
  if (!props.requiredFields || props.requiredFields.length === 0) {
    return true;
  }
  return props.requiredFields.includes(fieldName);
};

// ビジネス情報セクションが必要かどうかを判定
const isBusinessSectionRequired = (): boolean => {
  if (!props.requiredFields || props.requiredFields.length === 0) {
    return true;
  }
  return (
    props.requiredFields.includes("product_name") ||
    props.requiredFields.includes("support_email")
  );
};

// 事業者情報セクションが必要かどうかを判定
const isCompanySectionRequired = (): boolean => {
  if (!props.requiredFields || props.requiredFields.length === 0) {
    return true;
  }
  const companyFields = [
    "company_name",
    "company_address.country",
    "company_address.postal_code",
    "company_address.state",
    "company_address.line1",
    "company_address.line2",
  ];
  return companyFields.some((field) => props.requiredFields?.includes(field));
};

// 会社住所が必要かどうかを判定
const isCompanyAddressRequired = (): boolean => {
  if (!props.requiredFields || props.requiredFields.length === 0) {
    return true;
  }
  const addressFields = [
    "company_address.country",
    "company_address.postal_code",
    "company_address.state",
    "company_address.line1",
    "company_address.line2",
  ];
  return addressFields.some((field) => props.requiredFields?.includes(field));
};

type Emits = {
  "update:form-data": [formData: Step1FormData];
};

const emit = defineEmits<Emits>();

const { searchAddress, handlePostalCode } = usePostalCodeSearch();

const updateFormData = (key: keyof Step1FormData, event: Event) => {
  const target = event.target as HTMLInputElement;
  const updatedData = { ...props.formData, [key]: target.value };
  emit("update:form-data", updatedData);
};

const updateAcceptTos = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const updatedData = { ...props.formData, accept_tos: target.checked };
  emit("update:form-data", updatedData);
};

const updateCompanyAddress = (address: Step1FormData["company_address"]) => {
  // 国コードは常に"JP"に固定（日本人向けサービス）
  emit("update:form-data", {
    ...props.formData,
    company_address: { ...address, country: "JP" },
  });
};

const updateCompanyAddressFormData = (
  field: keyof Step1FormData["company_address"],
  event: Event,
) => {
  const target = event.target as HTMLInputElement;
  updateCompanyAddress({
    ...props.formData.company_address,
    [field]: target.value,
  });
};

// 郵便番号入力ハンドラー
const handlePostalCodeInput = (event: Event) => {
  handlePostalCode(event, {
    onPostalCodeUpdate: (postalCode: string) => {
      updateCompanyAddress({
        ...props.formData.company_address,
        postal_code: postalCode,
      });
    },
    onSearch: async (postalCode: string) => {
      await searchAddressByPostalCode(postalCode);
    },
  });
};

// 郵便番号から住所を検索
const searchAddressByPostalCode = async (postalCode: string) => {
  const result = await searchAddress(postalCode, false);
  if (result) {
    updateCompanyAddress({
      ...props.formData.company_address,
      postal_code: result.postal_code,
      state: result.state,
      line1: result.city + result.line1,
    });
  }
};
</script>
