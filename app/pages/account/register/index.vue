<template>
  <div
    v-if="shouldShowForm"
    class="min-h-screen w-full bg-gradient-to-br from-gray-600 via-gray-700 via-gray-800 via-gray-900 to-black py-12"
  >
    <div class="mx-auto w-[calc(100%-8vw)] max-w-[500px]">
      <div class="rounded-xl bg-white px-4 py-8 md:p-8">
        <h2 class="mb-8 text-center text-2xl font-bold text-gray-800">
          アカウント登録
        </h2>

        <!-- トークンエラー表示 -->
        <div
          v-if="tokenErr"
          class="space-y-4"
        >
          <div class="rounded-lg bg-red-50 p-4">
            <p class="text-sm font-semibold text-red-800">
              {{ tokenErr }}
            </p>
          </div>
          <NuxtLink
            class="block text-sm text-blue-600 underline hover:text-blue-800"
            to="/account/register/email"
          >
            メールを再送信する
          </NuxtLink>
        </div>

        <!-- トークン検証中 -->
        <div
          v-else-if="!tokenValid && token && !tokenErr"
          class="text-center"
        >
          <CommonAtomsLoadingAnimation size="md" />
        </div>

        <!-- 登録フォーム -->
        <div v-else>
          <!-- 予約フォームのURL説明モーダル -->
          <Teleport to="body">
            <div
              v-if="showSubdomainInfoModal"
              class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity"
              @click.self="showSubdomainInfoModal = false"
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-describedby="subdomain-info-dialog-message"
                class="relative z-10 w-[min(90vw,500px)] rounded-lg bg-white p-4 shadow-xl"
                @keydown.esc="showSubdomainInfoModal = false"
              >
                <p
                  id="subdomain-info-dialog-message"
                  class="mb-6 text-sm leading-relaxed text-gray-700"
                  v-html="subdomainInfoText"
                />

                <div class="flex justify-end">
                  <button
                    type="button"
                    class="rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                    @click="showSubdomainInfoModal = false"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          </Teleport>

          <form
            class="mb-6"
            novalidate
            @submit.prevent="handleFormRegister"
          >
            <div class="mb-10 space-y-6">
              <div class="mx-auto max-w-sm">
                <label class="mb-2 block font-semibold text-gray-800">
                  事業形態<span class="ml-1 text-red-600">*</span>
                </label>
                <div class="space-y-2">
                  <label class="flex items-center gap-2">
                    <input
                      v-model="formData.business_type"
                      type="radio"
                      name="business_type"
                      value="individual"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      required
                    >
                    <span class="text-sm text-gray-700">個人事業主</span>
                  </label>
                  <label class="flex items-center gap-2">
                    <input
                      v-model="formData.business_type"
                      type="radio"
                      name="business_type"
                      value="company"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      required
                    >
                    <span class="text-sm text-gray-700">法人</span>
                  </label>
                </div>
                <p
                  v-if="errors.business_type"
                  id="business_type-error"
                  class="mt-1 text-sm text-red-600"
                  aria-live="polite"
                >
                  {{ errors.business_type }}
                </p>
              </div>

              <div class="mx-auto max-w-sm">
                <label
                  for="company_name"
                  class="mb-2 block font-semibold text-gray-800"
                >
                  法人名または屋号<span class="ml-1 text-red-600">*</span>
                </label>
                <input
                  id="company_name"
                  v-model="formData.company_name"
                  name="company_name"
                  type="text"
                  required
                  class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{
                    'border-red-500': errors.company_name,
                  }"
                  aria-required="true"
                  aria-describedby="company_name-error"
                >
                <p class="mt-1 text-xs text-gray-500">
                  法人の方は登記簿上の正式名称を入力してください。個人事業主の方で屋号がない場合は、代表者名(姓＋名)を入力してください。
                </p>
                <p
                  v-if="errors.company_name"
                  id="company_name-error"
                  class="mt-1 text-sm text-red-600"
                  aria-live="polite"
                >
                  {{ errors.company_name }}
                </p>
              </div>

              <div class="mx-auto max-w-sm">
                <label class="mb-2 block font-semibold text-gray-800">
                  代表者のお名前<span class="ml-1 text-red-600">*</span>
                </label>
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3">
                  <div class="max-w-sm sm:max-w-full">
                    <label
                      for="rep_last_name"
                      class="mb-1 block text-sm"
                    >
                      姓
                    </label>
                    <input
                      id="rep_last_name"
                      v-model="formData.rep_last_name"
                      name="rep_last_name"
                      type="text"
                      required
                      class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                      :class="{
                        'border-red-500': errors.rep_last_name,
                      }"
                      aria-required="true"
                      aria-describedby="rep_last_name-error"
                    >
                    <p
                      v-if="errors.rep_last_name"
                      id="rep_last_name-error"
                      class="mt-1 text-sm text-red-600"
                      aria-live="polite"
                    >
                      {{ errors.rep_last_name }}
                    </p>
                  </div>
                  <div class="max-w-sm sm:max-w-full">
                    <label
                      for="rep_first_name"
                      class="mb-1 block text-sm"
                    >
                      名
                    </label>
                    <input
                      id="rep_first_name"
                      v-model="formData.rep_first_name"
                      name="rep_first_name"
                      type="text"
                      required
                      class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                      :class="{
                        'border-red-500': errors.rep_first_name,
                      }"
                      aria-required="true"
                      aria-describedby="rep_first_name-error"
                    >
                    <p
                      v-if="errors.rep_first_name"
                      id="rep_first_name-error"
                      class="mt-1 text-sm text-red-600"
                      aria-live="polite"
                    >
                      {{ errors.rep_first_name }}
                    </p>
                  </div>
                  <div class="max-w-sm sm:max-w-full">
                    <label
                      for="rep_last_name_kana"
                      class="mb-1 block text-sm font-medium"
                    >
                      姓（カナ）<span class="ml-[0.2em] text-red-600">*</span>
                    </label>
                    <input
                      id="rep_last_name_kana"
                      v-model="formData.rep_last_name_kana"
                      name="rep_last_name_kana"
                      type="text"
                      required
                      class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                      :class="{
                        'border-red-500': errors.rep_last_name_kana,
                      }"
                      aria-required="true"
                      aria-describedby="rep_last_name_kana-error"
                    >
                    <p
                      v-if="errors.rep_last_name_kana"
                      id="rep_last_name_kana-error"
                      class="mt-1 text-sm text-red-600"
                      aria-live="polite"
                    >
                      {{ errors.rep_last_name_kana }}
                    </p>
                  </div>
                  <div class="max-w-sm sm:max-w-full">
                    <label
                      for="rep_first_name_kana"
                      class="mb-1 block text-sm font-medium"
                    >
                      名（カナ）<span class="ml-[0.2em] text-red-600">*</span>
                    </label>
                    <input
                      id="rep_first_name_kana"
                      v-model="formData.rep_first_name_kana"
                      name="rep_first_name_kana"
                      type="text"
                      required
                      class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                      :class="{
                        'border-red-500': errors.rep_first_name_kana,
                      }"
                      aria-required="true"
                      aria-describedby="rep_first_name_kana-error"
                    >
                    <p
                      v-if="errors.rep_first_name_kana"
                      id="rep_first_name_kana-error"
                      class="mt-1 text-sm text-red-600"
                      aria-live="polite"
                    >
                      {{ errors.rep_first_name_kana }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="mx-auto max-w-sm">
                <label
                  for="phone"
                  class="mb-2 block font-semibold text-gray-800"
                >
                  電話番号<span class="ml-1 text-red-600">*</span>
                </label>
                <input
                  id="phone"
                  v-model="formData.phone"
                  name="phone"
                  type="tel"
                  required
                  class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': errors.phone }"
                  autocomplete="tel"
                  aria-required="true"
                  aria-describedby="phone-error"
                  @blur="handlePhoneBlur"
                >
                <p class="mt-1 text-xs text-gray-500">
                  半角数字で入力してください（ハイフンなし）
                </p>
                <p
                  v-if="errors.phone"
                  id="phone-error"
                  class="mt-1 text-sm text-red-600"
                  aria-live="polite"
                >
                  {{ errors.phone }}
                </p>
              </div>

              <div class="mx-auto max-w-sm">
                <label
                  for="subdomain"
                  class="mb-2 flex items-center gap-2 font-semibold text-gray-800"
                >
                  <span>予約フォームのURL<span class="ml-1 text-red-600">*</span></span>
                  <!-- はてなマーク -->
                  <div class="group relative">
                    <button
                      type="button"
                      class="flex h-4 w-4 items-center justify-center rounded-full border border-gray-400 bg-gray-100 text-xs text-gray-600 transition-colors hover:border-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      aria-label="予約フォームのURLについて"
                      @click="showSubdomainInfoModal = true"
                    >
                      ?
                    </button>
                    <!-- デスクトップ用ツールチップ -->
                    <div
                      class="pointer-events-none invisible absolute bottom-full left-1/2 mb-2 hidden w-64 -translate-x-1/2 rounded-lg bg-white px-3 py-2 text-xs font-normal opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 md:block"
                      role="tooltip"
                    >
                      <p
                        class="leading-relaxed text-gray-700"
                        v-html="subdomainInfoText"
                      />
                      <div
                        class="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white"
                      />
                    </div>
                  </div>
                </label>
                <div class="flex items-center gap-2">
                  <input
                    id="subdomain"
                    v-model="formData.subdomain"
                    name="subdomain"
                    type="text"
                    required
                    class="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': errors.subdomain }"
                    aria-required="true"
                    aria-describedby="subdomain-error"
                    @input="handleSubdomainInput"
                  >
                  <span class="text-sm text-gray-600">.luggo.com</span>
                </div>
                <p
                  v-if="errors.subdomain"
                  id="subdomain-error"
                  class="mt-1 text-sm text-red-600"
                  aria-live="polite"
                >
                  {{ errors.subdomain }}
                </p>
                <p class="mt-1 text-xs text-gray-500">
                  3文字以上12文字以内、半角小文字の英字のみ使用できます<br>（例：reserve.luggo.com）
                </p>
              </div>

              <div class="mx-auto max-w-sm">
                <label
                  for="password"
                  class="mb-2 block font-semibold text-gray-800"
                >
                  パスワード<span class="ml-1 text-red-600">*</span>
                </label>
                <div class="relative">
                  <input
                    id="password"
                    v-model="formData.password"
                    name="password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    class="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': errors.password }"
                    autocomplete="new-password"
                    aria-required="true"
                    aria-describedby="password-error"
                  >
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                    :aria-label="
                      showPassword ? 'パスワードを非表示' : 'パスワードを表示'
                    "
                    @click="showPassword = !showPassword"
                  >
                    <img
                      v-if="showPassword"
                      class="h-6 w-6"
                      src="/img/pass-show.svg"
                      alt="パスワードを非表示"
                    >
                    <img
                      v-else
                      class="h-6 w-6"
                      src="/img/pass-hidden.svg"
                      alt="パスワードを表示"
                    >
                  </button>
                </div>
                <p
                  v-if="errors.password"
                  id="password-error"
                  class="mt-1 text-sm text-red-600"
                  aria-live="polite"
                >
                  {{ errors.password }}
                </p>
                <p class="mt-1 text-xs text-gray-500">
                  8文字以上16文字以内、大文字・小文字・数字・記号のうち3種類以上を含む必要があります
                </p>
              </div>

              <div class="mx-auto max-w-sm">
                <label
                  for="password_confirm"
                  class="mb-2 block font-semibold text-gray-800"
                >
                  パスワードの再入力（確認用）<span class="ml-1 text-red-600">*</span>
                </label>
                <div class="relative">
                  <input
                    id="password_confirm"
                    v-model="formData.password_confirm"
                    name="password_confirm"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    class="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :class="{
                      'border-red-500': errors.password_confirm,
                    }"
                    autocomplete="new-password"
                    aria-required="true"
                    aria-describedby="password-confirm-error"
                  >
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                    :aria-label="
                      showPassword ? 'パスワードを非表示' : 'パスワードを表示'
                    "
                    @click="showPassword = !showPassword"
                  >
                    <img
                      v-if="showPassword"
                      class="h-6 w-6"
                      src="/img/pass-show.svg"
                      alt="パスワードを非表示"
                    >
                    <img
                      v-else
                      class="h-6 w-6"
                      src="/img/pass-hidden.svg"
                      alt="パスワードを表示"
                    >
                  </button>
                </div>
                <p
                  v-if="errors.password_confirm"
                  id="password-confirm-error"
                  class="mt-1 text-sm text-red-600"
                  aria-live="polite"
                >
                  {{ errors.password_confirm }}
                </p>
              </div>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="mx-auto block w-full max-w-[500px] rounded-lg bg-gray-800 px-8 py-3 font-semibold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <CommonAtomsLoadingAnimation
                v-if="isSubmitting"
                size="sm"
              />
              <span v-else>アカウントを登録する</span>
            </button>
          </form>

          <div
            v-if="errMsg"
            class="text-sm text-red-600"
          >
            {{ errMsg }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { object, string, ref as yupRef } from "yup";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import { useCsrf } from "~/composables/useCsrf";
import { useNumericInput } from "~/composables/useNumericInput";
import { useRegistrationForm } from "~/composables/useRegistrationForm";
import type { RegisterFormData } from "~/types/account-register";

const registerSchema = object({
  business_type: string()
    .required("事業形態を選択してください")
    .oneOf(["company", "individual"], "有効な事業形態を選択してください"),
  company_name: string()
    .trim()
    .required("法人名または屋号を入力してください")
    .max(100, "法人名または屋号は100文字以内で入力してください"),
  rep_last_name: string()
    .trim()
    .required("姓を入力してください")
    .max(50, "姓は50文字以内で入力してください"),
  rep_first_name: string()
    .trim()
    .required("名を入力してください")
    .max(50, "名は50文字以内で入力してください"),
  rep_last_name_kana: string()
    .trim()
    .required("姓（カナ）を入力してください")
    .max(50, "姓（カナ）は50文字以内で入力してください")
    .matches(/^[ァ-ヶー\s]+$/u, "姓（カナ）はカタカナで入力してください"),
  rep_first_name_kana: string()
    .trim()
    .required("名（カナ）を入力してください")
    .max(50, "名（カナ）は50文字以内で入力してください")
    .matches(/^[ァ-ヶー\s]+$/u, "名（カナ）はカタカナで入力してください"),
  email: string()
    .trim()
    .required("メールアドレスを入力してください")
    .email("有効なメールアドレスを入力してください"),
  phone: string()
    .trim()
    .required("電話番号を入力してください")
    .matches(/^\d{10,11}$/u, "有効な電話番号を入力してください"),
  subdomain: string()
    .trim()
    .required("予約フォームのURLを入力してください")
    .min(3, "予約フォームのURLは3文字以上である必要があります")
    .max(12, "予約フォームのURLは12文字以内である必要があります")
    .matches(/^[a-z]+$/u, "予約フォームのURLは半角小文字の英字のみ使用できます")
    .test(
      "forbidden-words",
      "この予約フォームのURLは使用できません。別の文字列を選択してください。",
      (value) => {
        if (!value) return true;
        const forbiddenWords = [
          "test",
          "admin",
          "administrator",
          "root",
          "www",
          "mail",
          "email",
          "ftp",
          "localhost",
          "api",
          "app",
          "dev",
          "development",
          "staging",
          "prod",
          "production",
          "demo",
          "example",
          "blog",
          "news",
          "help",
          "support",
          "contact",
          "about",
          "terms",
          "privacy",
          "policy",
          "login",
          "logout",
          "signup",
          "signin",
          "register",
          "reserve",
          "account",
          "dashboard",
          "panel",
          "manage",
          "management",
          "system",
          "server",
          "service",
          "services",
          "site",
          "sites",
          "web",
          "website",
          "page",
          "pages",
          "home",
          "index",
          "main",
          "default",
          "public",
          "private",
          "secure",
          "ssl",
          "http",
          "https",
          "tcp",
          "udp",
          "ip",
          "dns",
          "domain",
          "subdomain",
          "sub",
          "host",
          "hosting",
          "cloud",
          "aws",
          "azure",
          "google",
          "microsoft",
          "apple",
          "facebook",
          "twitter",
          "instagram",
          "youtube",
          "sex",
          "porn",
          "xxx",
          "nsfw",
          "kill",
          "death",
          "violence",
          "attack",
          "war",
          "fight",
        ];
        return !forbiddenWords.includes(value.toLowerCase());
      },
    ),
  password: string()
    .trim()
    .required("パスワードを入力してください")
    .min(8, "パスワードは8文字以上で入力してください")
    .max(16, "パスワードは16文字以内で入力してください")
    .matches(
      /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|;:,.<>?]+$/,
      "パスワードは半角英数字と記号のみ使用できます",
    )
    .test(
      "password-complexity",
      "パスワードは大文字・小文字・数字・記号のうち3種類以上を含む必要があります",
      (value) => {
        if (!value) return false;
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecial = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(value);
        const typesCount = [
          hasUpperCase,
          hasLowerCase,
          hasNumber,
          hasSpecial,
        ].filter(Boolean).length;
        return typesCount >= 3;
      },
    ),
  password_confirm: string()
    .trim()
    .required("パスワード（確認用）を入力してください")
    .oneOf([yupRef("password")], "パスワードが一致しません"),
});

const { formData, errors, clearAllData } = useRegistrationForm();

const { validate, setValues } = useForm<RegisterFormData>({
  validationSchema: toTypedSchema(registerSchema),
});

const isSubmitting = ref(false);
const errMsg = ref("");
const showPassword = ref(false);
const showSubdomainInfoModal = ref(false);

const subdomainInfoText
  = "オーナー様の予約フォームにアクセスするためのアドレスです。<br />好きな文字の列を入力してください。<br /><br />例：reserve.luggo.com";

// モーダルのフォーカス管理
const focusFirstBtn = () => {
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

// モーダルが開いている間、背景のスクロールを無効化
watch(
  () => showSubdomainInfoModal.value,
  (isOpen) => {
    if (import.meta.client) {
      if (isOpen) {
        document.body.style.overflow = "hidden";
        focusFirstBtn();
      }
      else {
        document.body.style.overflow = "";
      }
    }
  },
);

const { ensureCsrf, getCsrf } = useCsrf();
const { normalizeNumericInput } = useNumericInput();

// 予約フォームのURLを小文字に変換
const handleSubdomainInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const lowerValue = target.value.toLowerCase();
  target.value = lowerValue;
};

const handlePhoneBlur = (event: Event) => {
  normalizeNumericInput(event, (value: string) => {
    formData.value.phone = value;
  });
};

const handleFormRegister = async () => {
  await setValues(formData.value);
  const rslt = await validate();
  if (!rslt.valid) {
    for (const [path, msg] of Object.entries(rslt.errors)) {
      if (path === "email") {
        // メールアドレスのエラーはerrMsgに表示（入力フィールドがないため）
        errMsg.value = msg as string;
      }
      else {
        errors.value[path] = msg as string;
      }
    }
    return;
  }
  errors.value = {};
  await handleRegister();
};

const route = useRoute();

// トークンをクエリパラメータから取得
const token = computed(() => route.query.token as string | undefined);

// トークン検証状態
const tokenValid = ref(false);
const tokenEmail = ref<string | null>(null);
const tokenErr = ref("");

// フォームを表示するかどうか（トークンがある場合のみ表示）
const shouldShowForm = computed(() => {
  return !!token.value;
});

const handleRegister = async () => {
  if (!token.value) {
    errMsg.value = "リンクが正しくありません。";
    return;
  }

  try {
    isSubmitting.value = true;
    errMsg.value = "";

    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;

    await ensureCsrf(apiBase);

    try {
      await $fetch(`${apiBase}/api/business/account/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
        },
        body: {
          token: token.value,
          business_type: formData.value.business_type,
          company_name: formData.value.company_name,
          rep_last_name: formData.value.rep_last_name,
          rep_first_name: formData.value.rep_first_name,
          rep_last_name_kana: formData.value.rep_last_name_kana,
          rep_first_name_kana: formData.value.rep_first_name_kana,
          email: formData.value.email,
          phone: formData.value.phone,
          subdomain: formData.value.subdomain.toLowerCase(),
          password: formData.value.password,
        },
        credentials: "include",
      });
    }
    catch (fetchErr: unknown) {
      const errorData
        = (
          fetchErr as {
            data?: {
              error?: string;
              subdomain?: string[];
              token?: string[];
              email?: string[];
            };
          }
        )?.data ?? {};

      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Registration error:", errorData);
      }

      // サブドメインのエラーをチェック
      const subdomainError = errorData.subdomain?.[0];
      if (subdomainError) {
        if (subdomainError.includes("既に使用されています")) {
          // 重複エラー
          errors.value.subdomain = subdomainError;
        }
        else if (subdomainError.includes("使用できません")) {
          // 禁止単語エラー
          errors.value.subdomain = subdomainError;
        }
        else {
          // その他のエラー（必須、文字数、文字種など）
          errors.value.subdomain = subdomainError;
        }
        isSubmitting.value = false;
        return;
      }

      // トークン関連のエラーをチェック
      const tokenError
        = errorData.error || errorData.token?.[0] || errorData.email?.[0];
      if (
        tokenError
        && (tokenError.includes("有効期限が切れています")
          || tokenError.includes("送信されたメールアドレスと一致しません"))
      ) {
        errMsg.value
          = "このリンクは有効期限が切れているか、既に使用済みです。お手数おかけしますが、もう一度いちからやり直してください。";
        tokenValid.value = false;
        isSubmitting.value = false;
        return;
      }

      errMsg.value
        = "登録に失敗しました。お手数おかけしますが、入力内容を確認して再度お試しいただくか、もう一度いちからやり直してください。";
      return;
    }

    clearAllData();
    await navigateTo(
      `/account/register/complete?token=${encodeURIComponent(token.value)}`,
      {
        replace: true,
      },
    );
  }
  catch (error: unknown) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Form submission error:", error);
    }
    errMsg.value
      = "予期しないエラーが発生しました。お手数おかけしますが、もう一度いちからやり直してください。";
  }
  finally {
    isSubmitting.value = false;
  }
};

// ページ読み込み時にトークンを検証
onMounted(async () => {
  // トークンがない場合はメール入力ページにリダイレクト
  if (!token.value) {
    await navigateTo("/account/register/email", { replace: true });
    return;
  }

  try {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;

    // トークンをURLエンコードしてクエリパラメータに追加
    const encodedToken = encodeURIComponent(token.value);
    const verifyUrl = `${apiBase}/api/business/account/register/verify?token=${encodedToken}`;

    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.log("Token verification request:", {
        token: token.value,
        encodedToken,
        url: verifyUrl,
      });
    }

    // タイムアウト設定
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("TIMEOUT"));
      }, 20000); // 20秒
    });

    const fetchPromise = $fetch<{
      valid: boolean;
      email?: string;
    }>(verifyUrl, {
      method: "GET",
      credentials: "include",
    });

    let response: { valid: boolean; email?: string };
    try {
      response = await Promise.race([fetchPromise, timeoutPromise]);
    }
    catch (err: unknown) {
      if (err instanceof Error && err.message === "TIMEOUT") {
        tokenErr.value
          = "接続がタイムアウトしました。ネットワーク接続を確認して、もう一度お試しください。";
        return;
      }
      // その他のエラー（APIエラーなど）
      const errorData = err as {
        data?: { error?: string };
        statusCode?: number;
      };

      if (import.meta.dev && errorData?.data?.error) {
        // eslint-disable-next-line no-console
        console.error("Token verification error:", errorData.data.error);
      }

      if (errorData?.data?.error) {
        // トークン関連のエラーの場合
        if (
          errorData.data.error.includes("有効期限が切れています")
          || errorData.data.error.includes("トークンが指定されていません")
        ) {
          tokenErr.value
            = "このリンクは有効期限が切れているか、既に使用済みです。お手数おかけしますが、もう一度いちからやり直してください。";
        }
        else {
          // その他のエラー
          tokenErr.value
            = "予期しないエラーが発生しました。お手数おかけしますが、もう一度いちからやり直してください。";
        }
      }
      else {
        // ネットワークエラーやサーバーエラーの場合
        tokenErr.value
          = "予期しないエラーが発生しました。お手数おかけしますが、もう一度いちからやり直してください。";
      }
      return;
    }

    tokenValid.value = true;
    tokenEmail.value = response.email || null;

    // メールアドレスをフォームに設定
    if (tokenEmail.value) {
      formData.value.email = tokenEmail.value;
    }
  }
  catch (error: unknown) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Token verification error:", error);
    }
    tokenErr.value
      = "予期しないエラーが発生しました。お手数おかけしますが、もう一度いちからやり直してください。";
  }
});

useAppSeo({
  title: "アカウント登録",
  description: "アカウント登録ページ。",
});
</script>
