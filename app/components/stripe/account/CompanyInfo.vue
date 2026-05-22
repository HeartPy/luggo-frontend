<template>
  <div class="space-y-10">
    <!-- 利用規約 -->
    <div v-if="shouldShowAcceptTos">
      <label class="inline-flex items-center gap-2">
        <input
          :checked="formData.accept_tos"
          type="checkbox"
          class="h-4 w-4"
          aria-describedby="accept_tos-error"
          @change="updateAcceptTos($event)"
        >
        <span class="text-sm text-gray-700"><a
          class="text-[#0f83fd]"
          href="https://stripe.com/jp/legal/ssa"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >Stripeの利用規約</a>、<a
          class="text-[#0f83fd]"
          href="https://stripe.com/jp/legal/connect-account"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >Stripe Connectアカウント契約</a>、<a
          class="text-[#0f83fd]"
          href="https://stripe.com/jp/legal/privacy-center"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >Stripeのプライバシーポリシー</a>に同意します</span>
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

    <!-- 事業者情報 -->
    <div
      v-if="isCompanySectionRequired"
      class="space-y-6"
    >
      <StripeAccountAtomsFormTtl>
        事業者情報（公開されます）
      </StripeAccountAtomsFormTtl>

      <!-- お問い合わせメールアドレス -->
      <div
        v-if="isFieldRequired('support_email')"
        class="max-w-sm"
      >
        <label class="mb-1 block text-sm font-medium">お問い合わせメールアドレス<span class="ml-[0.2em] text-red-600">*</span></label>
        <input
          :value="formData.support_email"
          type="email"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.support_email }"
          aria-describedby="support_email-error"
          @input="updateFormData('support_email', $event)"
        >
        <div
          v-if="errors?.support_email"
          id="support_email-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors.support_email }}
        </div>
      </div>

      <!-- 法人名または屋号（登記名・商号） -->
      <div
        v-if="isFieldRequired('company_name')"
        class="max-w-sm"
      >
        <label class="mb-1 block text-sm font-medium">法人名または屋号（登記名・商号）<span class="ml-[0.2em] text-red-600">*</span></label>
        <input
          :value="formData.company_name"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{
            'border-red-500': errors?.company_name,
            'cursor-not-allowed bg-gray-100 text-gray-500':
              isCompanyNameReadonly,
          }"
          :readonly="isCompanyNameReadonly"
          required
          aria-describedby="company_name-error"
          @input="updateFormData('company_name', $event)"
        >
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

      <!-- 法人名または屋号（カナ） -->
      <div
        v-if="isFieldRequired('company_name_kana')"
        class="max-w-sm"
      >
        <label class="mb-1 block text-sm font-medium">法人名または屋号（カナ）<span class="ml-[0.2em] text-red-600">*</span></label>
        <input
          :value="formData.company_name_kana"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.company_name_kana }"
          required
          aria-describedby="company_name_kana-error"
          @input="updateFormData('company_name_kana', $event)"
        >
        <div
          v-if="errors?.company_name_kana"
          id="company_name_kana-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors.company_name_kana }}
        </div>
      </div>

      <!-- 法人名または屋号（ローマ字/英字） -->
      <div
        v-if="isFieldRequired('company_name_romaji')"
        class="max-w-sm"
      >
        <label class="mb-1 block text-sm font-medium">法人名または屋号（ローマ字/英字）<span
          class="ml-[0.2em] text-red-600"
        >*</span></label>
        <input
          :value="formData.company_name_romaji"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.company_name_romaji }"
          required
          aria-describedby="company_name_romaji-error"
          placeholder="例) Sample Inc."
          @input="updateFormData('company_name_romaji', $event)"
        >
        <p class="mt-1 text-xs text-gray-500">
          半角英数字で入力してください。
        </p>
        <div
          v-if="errors?.company_name_romaji"
          id="company_name_romaji-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors.company_name_romaji }}
        </div>
      </div>

      <!-- 法人番号（法人のみ） -->
      <div
        v-if="isCompanyBusinessType && isFieldRequired('tax_id')"
        class="max-w-sm"
      >
        <label class="mb-1 block text-sm font-medium">法人番号<span class="ml-[0.2em] text-red-600">*</span></label>
        <input
          :value="formData.tax_id"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.tax_id }"
          required
          aria-describedby="tax_id-error"
          placeholder="例) 1234567891234"
          maxlength="13"
          @input="updateFormData('tax_id', $event)"
          @blur="handleTaxIdBlur($event)"
        >
        <p class="mt-1 text-xs text-gray-500">
          13桁の法人番号を半角数字で入力してください。個人事業主の方は空欄のままで構いません。
        </p>
        <div
          v-if="errors?.tax_id"
          id="tax_id-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors.tax_id }}
        </div>
      </div>

      <!-- 事業者住所（法人のみ） -->
      <div
        v-if="isCompanyAddressRequired"
        class="space-y-6"
      >
        <!-- 郵便番号 -->
        <div
          v-if="isCompanyPostalCodeRequired"
          class="max-w-60"
        >
          <label class="mb-1 block text-sm font-medium">郵便番号<span class="ml-[0.2em] text-red-600">*</span></label>
          <input
            :value="formData.company_address_kanji.postal_code"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{
              'border-red-500':
                errors?.['company_address_kanji.postal_code'] ||
                errors?.['company_address_kana.postal_code'],
            }"
            placeholder="例) 1234567"
            aria-describedby="company_address_postal_code-error"
            @input="handlePostalCodeInput($event)"
          >
          <p class="mt-1 text-xs text-gray-500">
            半角数字で入力してください（ハイフンなし）
          </p>
          <div
            v-if="
              errors?.['company_address_kanji.postal_code'] ||
                errors?.['company_address_kana.postal_code']
            "
            id="company_address_postal_code-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{
              errors?.["company_address_kanji.postal_code"] ||
                errors?.["company_address_kana.postal_code"]
            }}
          </div>
        </div>

        <div class="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3">
          <!-- 都道府県 -->
          <div
            v-if="isFieldRequired('company_address_kanji.state')"
            class="max-w-sm sm:max-w-full"
          >
            <label class="mb-1 block text-sm font-medium">都道府県<span class="ml-[0.2em] text-red-600">*</span></label>
            <input
              :value="formData.company_address_kanji.state"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{
                'border-red-500': errors?.['company_address_kanji.state'],
              }"
              aria-describedby="company_address_kanji.state-error"
              @input="updateCompanyAddressKanjiFormData('state', $event)"
            >
            <div
              v-if="errors?.['company_address_kanji.state']"
              id="company_address_kanji.state-error"
              class="mt-1 text-sm text-red-600"
              aria-live="polite"
            >
              {{ errors["company_address_kanji.state"] }}
            </div>
          </div>
          <!-- 都道府県（カナ） -->
          <div
            v-if="isFieldRequired('company_address_kana.state')"
            class="max-w-sm sm:max-w-full"
          >
            <label class="mb-1 block text-sm font-medium">都道府県（カナ）<span class="ml-[0.2em] text-red-600">*</span></label>
            <input
              :value="formData.company_address_kana.state"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{
                'border-red-500': errors?.['company_address_kana.state'],
              }"
              aria-describedby="company_address_kana.state-error"
              @input="updateCompanyAddressKanaFormData('state', $event)"
            >
            <div
              v-if="errors?.['company_address_kana.state']"
              id="company_address_kana.state-error"
              class="mt-1 text-sm text-red-600"
              aria-live="polite"
            >
              {{ errors["company_address_kana.state"] }}
            </div>
          </div>
        </div>

        <div class="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3">
          <!-- 市区町村 -->
          <div
            v-if="isFieldRequired('company_address_kanji.city')"
            class="max-w-sm sm:max-w-full"
          >
            <label class="mb-1 block text-sm font-medium">市区町村<span class="ml-[0.2em] text-red-600">*</span></label>
            <input
              :value="formData.company_address_kanji.city"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{
                'border-red-500': errors?.['company_address_kanji.city'],
              }"
              aria-describedby="company_address_kanji.city-error"
              @input="updateCompanyAddressKanjiFormData('city', $event)"
            >
            <div
              v-if="errors?.['company_address_kanji.city']"
              id="company_address_kanji.city-error"
              class="mt-1 text-sm text-red-600"
              aria-live="polite"
            >
              {{ errors["company_address_kanji.city"] }}
            </div>
          </div>
          <!-- 市区町村（カナ） -->
          <div
            v-if="isFieldRequired('company_address_kana.city')"
            class="max-w-sm sm:max-w-full"
          >
            <label class="mb-1 block text-sm font-medium">市区町村（カナ）<span class="ml-[0.2em] text-red-600">*</span></label>
            <input
              :value="formData.company_address_kana.city"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{
                'border-red-500': errors?.['company_address_kana.city'],
              }"
              aria-describedby="company_address_kana.city-error"
              @input="updateCompanyAddressKanaFormData('city', $event)"
            >
            <div
              v-if="errors?.['company_address_kana.city']"
              id="company_address_kana.city-error"
              class="mt-1 text-sm text-red-600"
              aria-live="polite"
            >
              {{ errors["company_address_kana.city"] }}
            </div>
          </div>
        </div>

        <!-- 町名・丁目 -->
        <div
          v-if="
            isFieldRequired('company_address_kanji.town') ||
              isFieldRequired('company_address_kanji.line1')
          "
          class="max-w-xl"
        >
          <label class="mb-1 block text-sm font-medium">町名・丁目</label>
          <input
            :value="formData.company_address_kanji.town"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{
              'border-red-500': errors?.['company_address_kanji.town'],
            }"
            aria-describedby="company_address_kanji.town-error"
            placeholder="例) 千代田１丁目"
            @input="updateCompanyAddressKanjiFormData('town', $event)"
          >
          <p class="mt-1 text-xs text-gray-500">
            町名・丁目がある場合は入力。番地のみの場合は空欄で可。
          </p>
          <div
            v-if="errors?.['company_address_kanji.town']"
            id="company_address_kanji.town-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors["company_address_kanji.town"] }}
          </div>
        </div>

        <!-- 番地 -->
        <div
          v-if="isFieldRequired('company_address_kanji.line1')"
          class="max-w-xl"
        >
          <label class="mb-1 block text-sm font-medium">番地<span class="ml-[0.2em] text-red-600">*</span></label>
          <input
            :value="formData.company_address_kanji.line1"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{
              'border-red-500': errors?.['company_address_kanji.line1'],
            }"
            aria-describedby="company_address_kanji.line1-error"
            placeholder="例) １－１"
            @input="updateCompanyAddressKanjiFormData('line1', $event)"
          >
          <div
            v-if="errors?.['company_address_kanji.line1']"
            id="company_address_kanji.line1-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors["company_address_kanji.line1"] }}
          </div>
        </div>

        <!-- 町名・丁目（カナ） -->
        <div
          v-if="
            isFieldRequired('company_address_kana.town') ||
              isFieldRequired('company_address_kana.line1')
          "
          class="max-w-xl"
        >
          <label class="mb-1 block text-sm font-medium">町名・丁目（カナ）</label>
          <input
            :value="formData.company_address_kana.town"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{
              'border-red-500': errors?.['company_address_kana.town'],
            }"
            aria-describedby="company_address_kana.town-error"
            placeholder="例) チヨダ１チョウメ"
            @input="updateCompanyAddressKanaFormData('town', $event)"
          >
          <div
            v-if="errors?.['company_address_kana.town']"
            id="company_address_kana.town-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors["company_address_kana.town"] }}
          </div>
        </div>

        <!-- 番地（カナ） -->
        <div
          v-if="isFieldRequired('company_address_kana.line1')"
          class="max-w-xl"
        >
          <label class="mb-1 block text-sm font-medium">番地（カナ）<span class="ml-[0.2em] text-red-600">*</span></label>
          <input
            :value="formData.company_address_kana.line1"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{
              'border-red-500': errors?.['company_address_kana.line1'],
            }"
            aria-describedby="company_address_kana.line1-error"
            placeholder="例) １－１"
            @input="updateCompanyAddressKanaFormData('line1', $event)"
          >
          <div
            v-if="errors?.['company_address_kana.line1']"
            id="company_address_kana.line1-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors["company_address_kana.line1"] }}
          </div>
        </div>

        <!-- 建物名・部屋番号 -->
        <div
          v-if="isFieldRequired('company_address_kanji.line2')"
          class="max-w-xl"
        >
          <label class="mb-1 block text-sm font-medium">建物名・部屋番号</label>
          <input
            :value="formData.company_address_kanji.line2"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="updateCompanyAddressKanjiFormData('line2', $event)"
          >
        </div>
      </div>
    </div>

    <!-- 明細書表記 -->
    <div
      v-if="isStatementDescriptorSectionRequired"
      class="space-y-6"
    >
      <StripeAccountAtomsFormTtl>明細書表記</StripeAccountAtomsFormTtl>
      <p class="text-xs text-gray-500">
        お客様のカード利用明細に表示される名称です。未入力の場合は法人名・屋号等が使われる場合があります。
      </p>
      <div class="space-y-6">
        <!-- 明細書表記 -->
        <div class="max-w-sm">
          <label class="mb-1 block text-sm font-medium">明細書表記</label>
          <input
            :value="formData.statement_descriptor"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{
              'border-red-500': errors?.statement_descriptor,
            }"
            aria-describedby="statement_descriptor-error"
            placeholder="例) 田中配送"
            maxlength="17"
            @input="updateFormData('statement_descriptor', $event)"
          >
          <p class="mt-1 text-xs text-gray-500">
            最大17文字。使用できる記号はハイフン・ドットのみです。
          </p>
          <div
            v-if="errors?.statement_descriptor"
            id="statement_descriptor-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors.statement_descriptor }}
          </div>
        </div>

        <!-- 明細書表記（カナ） -->
        <div class="max-w-sm">
          <label class="mb-1 block text-sm font-medium">明細書表記（カナ）</label>
          <input
            :value="formData.statement_descriptor_kana"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{
              'border-red-500': errors?.statement_descriptor_kana,
            }"
            aria-describedby="statement_descriptor_kana-error"
            placeholder="例) タナカハイソウ"
            maxlength="22"
            @input="updateFormData('statement_descriptor_kana', $event)"
          >
          <p class="mt-1 text-xs text-gray-500">
            最大22文字。使用できる記号はハイフン・ドットのみです。
          </p>
          <div
            v-if="errors?.statement_descriptor_kana"
            id="statement_descriptor_kana-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors.statement_descriptor_kana }}
          </div>
        </div>

        <!-- 明細書表記（ローマ字/英字） -->
        <div class="max-w-sm">
          <label class="mb-1 block text-sm font-medium">明細書表記（ローマ字/英字）</label>
          <input
            :value="formData.statement_descriptor_romaji"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors?.statement_descriptor_romaji }"
            aria-describedby="statement_descriptor_romaji-error"
            placeholder="例) TANAKA-DELIVERY"
            maxlength="22"
            @input="updateFormData('statement_descriptor_romaji', $event)"
            @blur="onStatementDescriptorRomajiBlur"
          >
          <p class="mt-1 text-xs text-gray-500">
            5〜22文字・大文字の半角英数字。使用できる記号はハイフン・ドットのみです。
          </p>
          <div
            v-if="errors?.statement_descriptor_romaji"
            id="statement_descriptor_romaji-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors.statement_descriptor_romaji }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Step1FormData } from "~/types/stripe-account-register";
import { usePostalCodeSearch } from "~/composables/usePostalCodeSearch";
import { useBusinessProfile } from "~/composables/useBusinessProfile";
import { useNumericInput } from "~/composables/useNumericInput";

type Props = {
  formData: Step1FormData;
  errors?: Record<string, string>;
  requiredFields?: string[];
  needsTos?: boolean;
};

const props = defineProps<Props>();
const { businessProfile } = useBusinessProfile();

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

const shouldShowAcceptTos = computed((): boolean => {
  return (
    !!props.needsTos
    || isFieldRequired("accept_tos")
    || isFieldRequired("tax_id")
  );
});

// 事業者情報セクションが必要かどうかを判定
const isCompanySectionRequired = computed((): boolean => {
  if (!props.requiredFields) {
    return true;
  }
  if (props.requiredFields.length === 0) {
    return false;
  }
  const companyFields = [
    "support_email",
    "company_name",
    "company_name_kana",
    "company_name_romaji",
    "tax_id",
    "company_address_kanji.country",
    "company_address_kanji.postal_code",
    "company_address_kanji.state",
    "company_address_kanji.city",
    "company_address_kanji.town",
    "company_address_kanji.line1",
    "company_address_kanji.line2",
    "company_address_kana.country",
    "company_address_kana.postal_code",
    "company_address_kana.state",
    "company_address_kana.city",
    "company_address_kana.town",
    "company_address_kana.line1",
  ];
  return companyFields.some(field => props.requiredFields?.includes(field));
});

// 明細書表記セクションが必要かどうかを判定
const isStatementDescriptorSectionRequired = computed((): boolean => {
  if (!props.requiredFields) {
    return true;
  }
  if (props.requiredFields.length === 0) {
    return false;
  }
  const statementDescriptorFields = [
    "statement_descriptor",
    "statement_descriptor_kana",
    "statement_descriptor_romaji",
  ];
  return statementDescriptorFields.some(field =>
    props.requiredFields?.includes(field),
  );
});

// 会社住所が必要かどうかを判定
// 法人はcompany.address_*が必要
const isCompanyAddressRequired = computed((): boolean => {
  if (businessProfile.value?.business_type !== "company") {
    return false;
  }
  if (!props.requiredFields) {
    return true;
  }
  if (props.requiredFields.length === 0) {
    return false;
  }
  const addressFields = [
    "company_address_kanji.country",
    "company_address_kanji.postal_code",
    "company_address_kanji.state",
    "company_address_kanji.city",
    "company_address_kanji.town",
    "company_address_kanji.line1",
    "company_address_kanji.line2",
    "company_address_kana.country",
    "company_address_kana.postal_code",
    "company_address_kana.state",
    "company_address_kana.city",
    "company_address_kana.town",
    "company_address_kana.line1",
  ];
  return addressFields.some(field => props.requiredFields?.includes(field));
});

const isCompanyPostalCodeRequired = computed((): boolean => {
  return (
    isFieldRequired("company_address_kanji.postal_code")
    || isFieldRequired("company_address_kana.postal_code")
  );
});

type Emits = {
  "update:form-data": [formData: Step1FormData];
};

const emit = defineEmits<Emits>();

const { searchAddress, handlePostalCode } = usePostalCodeSearch();
const { normalizeNumericInput } = useNumericInput();

// ビジネスプロフィールにcompany_nameが存在する場合は編集不可
const isCompanyNameReadonly = computed(() => {
  return !!businessProfile.value?.company_name;
});

const isCompanyBusinessType = computed(() => {
  return businessProfile.value?.business_type === "company";
});

onMounted(() => {
  const updatedData = { ...props.formData };
  let hasUpdates = false;

  // ビジネスプロフィールにcompany_nameが存在し、かつformData.company_nameが空の場合のみ自動入力
  if (businessProfile.value?.company_name && !props.formData.company_name) {
    updatedData.company_name = businessProfile.value.company_name;
    hasUpdates = true;
  }

  // ビジネスプロフィールにtax_idが存在し、かつformData.tax_idが空の場合のみ自動入力
  if (businessProfile.value?.tax_id && !props.formData.tax_id) {
    updatedData.tax_id = businessProfile.value.tax_id;
    hasUpdates = true;
  }

  if (hasUpdates) {
    emit("update:form-data", updatedData);
  }
});

const updateFormData = (key: keyof Step1FormData, event: Event) => {
  const target = event.target as HTMLInputElement;
  const updatedData = { ...props.formData, [key]: target.value };
  emit("update:form-data", updatedData);
};

// 明細書表記（ローマ字/英字）：小文字を大文字に、スペースを削除して整形
const onStatementDescriptorRomajiBlur = () => {
  const current = props.formData.statement_descriptor_romaji ?? "";
  const formatted = current.toUpperCase().replace(/\s/g, "");
  if (formatted !== current) {
    emit("update:form-data", {
      ...props.formData,
      statement_descriptor_romaji: formatted,
    });
  }
};

// 法人番号のフォーカスアウトハンドラー
const handleTaxIdBlur = (event: Event) => {
  normalizeNumericInput(event, (value: string) => {
    emit("update:form-data", {
      ...props.formData,
      tax_id: value,
    });
  });
};

const updateAcceptTos = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const updatedData = { ...props.formData, accept_tos: target.checked };
  emit("update:form-data", updatedData);
};

const updateCompanyAddressKanji = (
  address: Step1FormData["company_address_kanji"],
) => {
  // 国コードは常に"JP"に固定（日本人向けサービス）
  emit("update:form-data", {
    ...props.formData,
    company_address_kanji: { ...address, country: "JP" },
  });
};

const updateCompanyAddressKana = (
  address: Step1FormData["company_address_kana"],
) => {
  emit("update:form-data", {
    ...props.formData,
    company_address_kana: { ...address, country: "JP" },
  });
};

const updateCompanyAddressKanjiFormData = (
  field: keyof Step1FormData["company_address_kanji"],
  event: Event,
) => {
  const target = event.target as HTMLInputElement;
  updateCompanyAddressKanji({
    ...props.formData.company_address_kanji,
    [field]: target.value,
  });
  // 番地（漢字）と同一の値を番地（カナ）にも設定
  if (field === "line1") {
    updateCompanyAddressKana({
      ...props.formData.company_address_kana,
      line1: target.value,
    });
  }
};

const updateCompanyAddressKanaFormData = (
  field: keyof Step1FormData["company_address_kana"],
  event: Event,
) => {
  const target = event.target as HTMLInputElement;
  updateCompanyAddressKana({
    ...props.formData.company_address_kana,
    [field]: target.value,
  });
};

// 郵便番号入力ハンドラー
const handlePostalCodeInput = (event: Event) => {
  handlePostalCode(event, {
    onPostalCodeUpdate: (postalCode: string) => {
      updateCompanyAddressKanji({
        ...props.formData.company_address_kanji,
        postal_code: postalCode,
      });
      updateCompanyAddressKana({
        ...props.formData.company_address_kana,
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
  const result = await searchAddress(postalCode, true);
  if (result) {
    updateCompanyAddressKanji({
      ...props.formData.company_address_kanji,
      postal_code: result.postal_code,
      state: result.state,
      city: result.city,
      town: result.town,
    });
    updateCompanyAddressKana({
      ...props.formData.company_address_kana,
      postal_code: result.postal_code,
      state: result.state_kana || "",
      city: result.city_kana || "",
      town: result.town_kana || "",
    });
  }
};
</script>
