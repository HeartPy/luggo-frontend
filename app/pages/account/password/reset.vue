<template>
  <div
    class="min-h-screen w-full bg-gradient-to-br from-gray-600 via-gray-700 via-gray-800 via-gray-900 to-black py-12"
  >
    <div class="mx-auto w-[calc(100%-8vw)] max-w-[500px]">
      <div class="rounded-xl bg-white px-4 py-8 md:p-8">
        <h1 class="mb-8 text-center text-2xl font-bold text-gray-800 md:mb-12">
          パスワード再設定
        </h1>

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
            to="/account/password/forgot"
          >
            再設定メールを再送信する
          </NuxtLink>
        </div>

        <!-- トークン検証中 -->
        <div
          v-else-if="!tokenValid && token && !tokenErr"
          class="text-center"
        >
          <CommonAtomsLoadingAnimation size="md" />
        </div>

        <!-- 再設定フォーム -->
        <div v-else-if="tokenValid">
          <form
            novalidate
            @submit.prevent="handleReset"
          >
            <div class="mb-10 space-y-6">
              <div>
                <label
                  for="password"
                  class="mb-2 block font-semibold text-gray-800"
                >
                  新しいパスワード
                </label>
                <div class="relative">
                  <input
                    id="password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    class="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': passwordErr }"
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
                  v-if="passwordErr"
                  id="password-error"
                  class="mt-1 text-sm text-red-600"
                  aria-live="polite"
                >
                  {{ passwordErr }}
                </p>
              </div>

              <div>
                <label
                  for="passwordConfirm"
                  class="mb-2 block font-semibold text-gray-800"
                >
                  新しいパスワード（確認）
                </label>
                <div class="relative">
                  <input
                    id="passwordConfirm"
                    v-model="passwordConfirm"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    class="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': passwordConfirmErr }"
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
                  v-if="passwordConfirmErr"
                  id="password-confirm-error"
                  class="mt-1 text-sm text-red-600"
                  aria-live="polite"
                >
                  {{ passwordConfirmErr }}
                </p>
              </div>

              <div
                v-if="errMsg"
                class="text-sm text-red-600"
              >
                {{ errMsg }}
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
              <span v-else>パスワードを再設定</span>
            </button>
          </form>
        </div>

        <!-- トークンがない場合 -->
        <div
          v-else
          class="space-y-4"
        >
          <div class="rounded-lg bg-red-50 p-4">
            <p class="text-sm font-semibold text-red-800">
              トークンが見つかりません。再設定メールからアクセスしてください。
            </p>
          </div>
          <NuxtLink
            class="block text-sm text-blue-600 underline hover:text-blue-800"
            to="/account/password/forgot"
          >
            再設定メールを再送信する
          </NuxtLink>
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

type ResetFormData = {
  password: string;
  password_confirm: string;
};

const resetSchema = object({
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

const { validate, setValues } = useForm<ResetFormData>({
  validationSchema: toTypedSchema(resetSchema),
});

const route = useRoute();
const token = computed(() => String(route.query.token || ""));

const password = ref("");
const passwordConfirm = ref("");
const passwordErr = ref("");
const passwordConfirmErr = ref("");
const errMsg = ref("");
const isSubmitting = ref(false);
const tokenValid = ref(false);
const tokenErr = ref("");
const showPassword = ref(false);

const { ensureCsrf, getCsrf } = useCsrf();

const verifyToken = async () => {
  tokenErr.value = "";
  tokenValid.value = false;

  if (!token.value) {
    tokenErr.value = "リンクが正しくありません。";
    return;
  }

  try {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;

    try {
      await $fetch(`${apiBase}/api/users/password/verify-token`, {
        method: "GET",
        params: { token: token.value },
        credentials: "include",
      });

      tokenValid.value = true;
    }
    catch (fetchErr: unknown) {
      const errorData = (fetchErr as { data?: { error?: string } })?.data;
      tokenErr.value
        = errorData?.error
          || "このリンクは有効期限が切れているか、既に使用済みです。";
    }
  }
  catch (error: unknown) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Token verify error:", error);
    }
    tokenErr.value
      = "予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。";
  }
};

watch(
  () => token.value,
  async (newToken) => {
    if (!newToken) {
      tokenErr.value = "リンクが正しくありません。";
      tokenValid.value = false;
      return;
    }
    await verifyToken();
  },
  { immediate: true },
);

const handleReset = async () => {
  passwordErr.value = "";
  passwordConfirmErr.value = "";
  errMsg.value = "";

  setValues({
    password: password.value,
    password_confirm: passwordConfirm.value,
  });
  const result = await validate();

  if (!result.valid) {
    if (result.errors.password) {
      passwordErr.value = result.errors.password;
    }
    if (result.errors.password_confirm) {
      passwordConfirmErr.value = result.errors.password_confirm;
    }
    return;
  }

  try {
    isSubmitting.value = true;
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;

    await ensureCsrf(apiBase);

    try {
      await $fetch(`${apiBase}/api/users/password/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
        },
        body: {
          token: token.value,
          password: password.value,
        },
        credentials: "include",
      });
    }
    catch (fetchErr: unknown) {
      const errorData = (fetchErr as { data?: { error?: string } })?.data;
      errMsg.value
        = errorData?.error
          || "パスワードの再設定に失敗しました。しばらく時間をおいて再度お試しください。";
      return;
    }

    await navigateTo(
      `/account/password/complete?token=${encodeURIComponent(token.value)}`,
      { replace: true },
    );
  }
  catch (error: unknown) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Password reset error:", error);
    }
    errMsg.value
      = "予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。";
  }
  finally {
    isSubmitting.value = false;
  }
};

// ページから離れる時にパスワードをクリア（セキュリティのため）
onBeforeUnmount(() => {
  password.value = "";
  passwordConfirm.value = "";
});

useHead({
  title: "パスワード再設定",
  meta: [
    {
      name: "description",
      content: "パスワード再設定ページ。",
    },
    { property: "og:title", content: "パスワード再設定 | LugGo(ラグゴー)" },
    {
      property: "og:description",
      content: "パスワード再設定ページ。",
    },
    {
      key: "twitter:title",
      name: "twitter:title",
      content: "パスワード再設定 | LugGo(ラグゴー)",
    },
    {
      key: "twitter:description",
      name: "twitter:description",
      content: "パスワード再設定ページ。",
    },
  ],
});
</script>
