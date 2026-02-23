<template>
  <div v-if="isProductSectionRequired" class="space-y-6">
    <StripeAccountAtomsFormTtl>事業詳細</StripeAccountAtomsFormTtl>
    <!-- 業種 -->
    <div v-if="isFieldRequired('product_mcc')" class="max-w-xl">
      <label class="mb-1 block text-sm font-medium"
        >業種<span class="ml-[0.2em] text-red-600">*</span></label
      >
      <input
        value="宅配便・配送サービス"
        type="text"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{
          'border-red-500': errors?.product_mcc,
          'cursor-not-allowed bg-gray-100 text-gray-500': true,
        }"
        readonly
        required
        aria-describedby="product_mcc-error"
      />
      <div
        v-if="errors?.product_mcc"
        id="product_mcc-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.product_mcc }}
      </div>
    </div>

    <!-- ウェブサイトURL -->
    <div v-if="isFieldRequired('product_url')" class="max-w-xl">
      <label class="mb-1 block text-sm font-medium"
        >ウェブサイトURL<span class="ml-[0.2em] text-red-600">*</span></label
      >
      <input
        :value="formData.product_url"
        type="url"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{
          'border-red-500': errors?.product_url,
          'cursor-not-allowed bg-gray-100 text-gray-500': isProductUrlReadonly,
        }"
        :readonly="isProductUrlReadonly"
        placeholder="例) https://example.com"
        aria-describedby="product_url-error"
        @input="updateFormData('product_url', $event)"
      />
      <div
        v-if="errors?.product_url"
        id="product_url-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.product_url }}
      </div>
    </div>

    <!-- 商品・サービス説明 -->
    <div v-if="isFieldRequired('product_description')">
      <label class="mb-1 block text-sm font-medium"
        >商品・サービス説明<span class="ml-[0.2em] text-red-600">*</span></label
      >
      <textarea
        :value="formData.product_description"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors?.product_description }"
        rows="5"
        aria-describedby="product_description-error"
        @input="updateFormData('product_description', $event)"
      />
      <div class="mt-1 space-y-1 text-xs text-gray-500">
        <p>
          事業内容について2～3文で説明してください。販売する製品/サービス、顧客があなたのビジネスについてどのように知ったか、顧客に請求する方法を含めてください。
        </p>
        <p class="font-bold">
          初めからサービス説明が入力されていますので、基本的にはそのままで構いません。
        </p>
      </div>
      <div
        v-if="errors?.product_description"
        id="product_description-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.product_description }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Step4FormData } from "~/types/stripe-account-register";
import { useBusinessProfile } from "~/composables/useBusinessProfile";

type Props = {
  formData: Step4FormData;
  errors?: Record<string, string>;
  requiredFields?: string[];
};

const props = defineProps<Props>();

// フィールドが必須かどうかを判定
const isFieldRequired = (fieldName: string): boolean => {
  if (!props.requiredFields) {
    return true;
  }
  if (props.requiredFields.length === 0) {
    return false;
  }
  return props.requiredFields.includes(fieldName);
};

const isProductSectionRequired = computed(() => {
  if (!props.requiredFields) {
    return true;
  }
  if (props.requiredFields.length === 0) {
    return false;
  }
  return props.requiredFields.some((field) =>
    ["product_mcc", "product_url", "product_description"].includes(field),
  );
});

type Emits = {
  "update:form-data": [formData: Step4FormData];
};

const emit = defineEmits<Emits>();

const { businessProfile } = useBusinessProfile();

// ビジネスプロフィールにsubdomainが存在する場合は編集不可
const isProductUrlReadonly = computed(() => {
  return !!businessProfile.value?.subdomain;
});

const generateBookingFormUrl = (subdomain: string): string => {
  return `https://${subdomain}.luggo.com`;
};

// デフォルトの商品・サービス説明テキスト
const defaultProductDescription =
  "旅行者の手荷物を、指定場所（宿泊施設・空港・駅など）から目的地（宿泊施設・空港・駅など）まで配送するサービスを提供しています。お客様は予約フォーム（Webサイト）を通じてサービス内容を確認し、オンラインで予約します。料金は予約時にクレジットカード等で決済いただきます。";

onMounted(() => {
  const updates: Partial<Step4FormData> = {};

  // 業種を「宅配便・配送サービス」（4215）に固定
  if (!props.formData.product_mcc || props.formData.product_mcc !== "4215") {
    updates.product_mcc = "4215";
  }

  // 商品・サービス説明にデフォルトテキストを設定（空の場合のみ）
  if (!props.formData.product_description) {
    updates.product_description = defaultProductDescription;
  }

  // ビジネスプロフィールにsubdomainが存在し、かつformData.product_urlが空の場合のみ自動入力
  if (businessProfile.value?.subdomain && !props.formData.product_url) {
    updates.product_url = generateBookingFormUrl(
      businessProfile.value.subdomain,
    );
  }

  // 更新がある場合のみemit
  if (Object.keys(updates).length > 0) {
    const updatedData = {
      ...props.formData,
      ...updates,
    };
    emit("update:form-data", updatedData);
  }
});

const updateFormData = (key: keyof Step4FormData, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  const updatedData = { ...props.formData, [key]: target.value };
  emit("update:form-data", updatedData);
};
</script>
