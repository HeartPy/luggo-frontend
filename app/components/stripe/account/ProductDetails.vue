<template>
  <div class="space-y-6">
    <StripeAccountAtomsFormTtl>事業詳細</StripeAccountAtomsFormTtl>
    <div v-if="isFieldRequired('product_mcc')" class="max-w-xl">
      <label class="mb-1 block text-sm font-medium"
        >業種<span class="ml-[0.2em] text-red-600">*</span></label
      >
      <select
        :value="formData.product_mcc"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors?.product_mcc }"
        required
        aria-describedby="product_mcc-error"
        @change="updateFormData('product_mcc', $event)"
      >
        <option value="">選択してください</option>
        <option value="4215">宅配便・配送サービス</option>
        <option value="7523">駐車場・駐車場管理</option>
        <option value="7519">自動車レンタル・リース</option>
        <option value="4784">道路・通行料金</option>
        <option value="5970">工芸品・美術品店</option>
        <option value="5734">コンピュータ・ソフトウェア店</option>
        <option value="5962">通信販売（カタログ・その他）</option>
        <option value="5942">書店</option>
        <option value="5411">スーパーマーケット・食料品店</option>
        <option value="5812">飲食店</option>
        <option value="5814">ファーストフード店</option>
        <option value="7011">ホテル・モーテル</option>
        <option value="7911">ダンスホール・スタジオ・スクール</option>
        <option value="7922">娯楽サービス</option>
        <option value="7929">音楽・楽器店</option>
        <option value="7941">商業スポーツ・プロスポーツ</option>
        <option value="5999">その他の小売店</option>
        <option value="7372">ソフトウェア開発・プログラミング</option>
        <option value="7379">コンピュータ関連サービス</option>
        <option value="8398">慈善団体・社会事業</option>
        <option value="5045">コンピュータ・周辺機器・ソフトウェア</option>
        <option value="7622">電気修理店</option>
        <option value="7623">エアコン・冷蔵庫修理店</option>
        <option value="7629">電気・電子機器修理店</option>
        <option value="7631">時計・宝飾品・銀器修理店</option>
        <option value="7692">溶接工房</option>
        <option value="7699">その他各種修理店</option>
      </select>
      <div
        v-if="errors?.product_mcc"
        id="product_mcc-error"
        class="mt-1 text-sm text-red-600"
        aria-live="polite"
      >
        {{ errors.product_mcc }}
      </div>
    </div>
    <div v-if="isFieldRequired('product_url')" class="max-w-xl">
      <label class="mb-1 block text-sm font-medium"
        >ウェブサイトURL<span class="ml-[0.2em] text-red-600">*</span></label
      >
      <input
        :value="formData.product_url"
        type="url"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors?.product_url }"
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
    <div v-if="isFieldRequired('product_description')">
      <label class="mb-1 block text-sm font-medium"
        >商品・サービス説明<span class="ml-[0.2em] text-red-600">*</span></label
      >
      <textarea
        :value="formData.product_description"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': errors?.product_description }"
        rows="3"
        placeholder="荷物配送サービスを提供しています"
        aria-describedby="product_description-error"
        @input="updateFormData('product_description', $event)"
      />
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

type Props = {
  formData: Step4FormData;
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

type Emits = {
  "update:form-data": [formData: Step4FormData];
};

const emit = defineEmits<Emits>();

const updateFormData = (key: keyof Step4FormData, event: Event) => {
  const target = event.target as
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement;
  const updatedData = { ...props.formData, [key]: target.value };
  emit("update:form-data", updatedData);
};
</script>
