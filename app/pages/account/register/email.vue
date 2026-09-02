<template>
  <div
    class="min-h-screen w-full bg-gradient-to-br from-gray-600 via-gray-700 via-gray-800 via-gray-900 to-black py-12"
  >
    <div class="mx-auto w-[calc(100%-8vw)] max-w-[500px]">
      <div class="rounded-xl bg-white px-4 py-8 md:p-8">
        <h1 class="mb-8 text-center text-2xl font-bold text-gray-800 md:mb-12">
          アカウント登録
        </h1>

        <div
          v-if="emailSent"
          class="space-y-6"
        >
          <div class="flex flex-col items-center justify-center gap-2">
            <figure class="mx-auto w-20">
              <img
                src="/img/mail.svg"
                alt=""
                class="h-full w-full object-contain"
              >
            </figure>
            <p class="block text-center text-lg font-semibold text-gray-800">
              メールを送信しました
            </p>
          </div>
          <p class="mx-auto w-fit">
            {{ email }} 宛に登録用メールを送信しました。<br>
            メール内のリンクから登録を行なってください。<br>
            リンクは30分間のみ有効です。
          </p>
        </div>

        <div
          v-else
          class="mx-auto max-w-sm"
        >
          <form
            class="mb-4 w-full"
            novalidate
            @submit.prevent="handleFormSubmit"
          >
            <div class="mb-8 space-y-6">
              <div>
                <label
                  for="email"
                  class="mb-2 block font-semibold text-gray-800"
                >
                  メールアドレス
                </label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  required
                  class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': emailErr }"
                  autocomplete="email"
                  aria-required="true"
                  aria-describedby="email-error"
                >
                <p
                  v-if="emailErr"
                  id="email-error"
                  class="mt-1 text-sm text-red-600"
                  aria-live="polite"
                >
                  {{ emailErr }}
                </p>
              </div>

              <div
                v-if="errMsg"
                class="text-sm text-red-600"
              >
                {{ errMsg }}
              </div>
            </div>

            <!-- 利用規約・プライバシーポリシーへの同意 -->
            <div
              class="mb-6 space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3"
            >
              <div class="flex items-start gap-2">
                <input
                  id="agree-terms"
                  v-model="agreedToTerms"
                  type="checkbox"
                  class="mt-0.5 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <label
                  for="agree-terms"
                  class="cursor-pointer text-sm text-gray-800"
                >
                  <button
                    type="button"
                    class="text-blue-600 underline hover:text-blue-800"
                    @click.prevent.stop="showTermsDialog = true"
                  >
                    利用規約
                  </button>
                  に同意します
                </label>
              </div>
              <div class="flex items-start gap-2">
                <input
                  id="agree-privacy"
                  v-model="agreedToPrivacy"
                  type="checkbox"
                  class="mt-0.5 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <label
                  for="agree-privacy"
                  class="cursor-pointer text-sm text-gray-800"
                >
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 underline hover:text-blue-800"
                    @click.stop
                  >
                    プライバシーポリシー
                  </a>
                  に同意します
                </label>
              </div>
            </div>

            <!-- ボット対策（Cloudflare Turnstile） -->
            <div class="mb-6 flex justify-center">
              <NuxtTurnstile
                ref="turnstileRef"
                v-model="turnstileToken"
              />
            </div>

            <button
              type="submit"
              :disabled="!canSubmit"
              class="mx-auto block w-full max-w-[500px] rounded-lg bg-gray-800 px-8 py-3 font-semibold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <CommonAtomsLoadingAnimation
                v-if="isSubmitting"
                size="sm"
              />
              <span v-else>登録用メールを送信</span>
            </button>
          </form>

          <!-- 利用規約ダイアログ -->
          <AccountRegisterAtomsTermsOfServiceDialog v-model="showTermsDialog" />

          <NuxtLink
            to="/account/login"
            class="block text-center text-sm text-gray-600 transition-colors duration-200 hover:text-gray-800"
          >
            既にアカウントをお持ちの方はこちら
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { object, string } from "yup";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import { useCsrf } from "~/composables/useCsrf";
import { useRegisterEmailForm } from "~/composables/useRegisterEmailForm";

type EmailFormData = {
  email: string;
};

const emailSchema = object({
  email: string()
    .trim()
    .required("メールアドレスを入力してください")
    .email("有効なメールアドレスを入力してください"),
});

const { validate, setValues } = useForm<EmailFormData>({
  validationSchema: toTypedSchema(emailSchema),
});

const { email, emailErr } = useRegisterEmailForm();

const isSubmitting = ref(false);
const errMsg = ref("");
const emailSent = ref(false);

// 利用規約・プライバシーポリシーへの同意状態
const agreedToTerms = ref(false);
const agreedToPrivacy = ref(false);
const showTermsDialog = ref(false);

const { turnstileToken, turnstileRef, resetTurnstile } = useTurnstile();

const canSubmit = computed(
  () =>
    agreedToTerms.value
    && agreedToPrivacy.value
    && !isSubmitting.value
    && !!turnstileToken.value,
);

const { ensureCsrf, getCsrf } = useCsrf();

const handleFormSubmit = async () => {
  if (!canSubmit.value) return;
  await handleSendEmail();
};

// メールアドレスの重複をチェック
const checkEmailAvailability = async (): Promise<boolean> => {
  try {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;

    // エラーチェックに失敗した場合は送信を続行（バックエンドで再チェックされる）
    const checkData = await $fetch<{
      available: boolean;
      message?: string;
    }>(`${apiBase}/api/business/account/register/check-email`, {
      method: "GET",
      params: { email: email.value.trim().toLowerCase() },
      credentials: "include",
    });

    if (!checkData.available) {
      if (import.meta.dev && checkData.message) {
        // eslint-disable-next-line no-console
        console.log("Email check message:", checkData.message);
      }
      emailErr.value = "このメールアドレスは既に登録されています。";
      return false;
    }

    return true;
  }
  catch (error: unknown) {
    // エラーチェックに失敗した場合は送信を続行（バックエンドで再チェックされる）
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Email check error:", error);
    }
    return true;
  }
};

const handleSendEmail = async () => {
  emailErr.value = "";

  setValues({ email: email.value });
  const result = await validate();

  if (!result.valid) {
    if (result.errors.email) {
      emailErr.value = result.errors.email;
    }
    return;
  }

  const isEmailAvailable = await checkEmailAvailability();
  if (!isEmailAvailable) {
    return;
  }

  try {
    isSubmitting.value = true;
    errMsg.value = "";

    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;

    await ensureCsrf(apiBase);

    try {
      await $fetch(`${apiBase}/api/business/account/register/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
        },
        body: {
          email: email.value.trim().toLowerCase(),
          turnstile_token: turnstileToken.value,
        },
        credentials: "include",
      });
      emailSent.value = true;
    }
    catch (fetchErr: unknown) {
      const err = fetchErr as {
        data?: { error?: string };
        status?: number;
        statusCode?: number;
      };
      const errorData = err?.data;
      const statusCode = err?.statusCode ?? err?.status;

      if (import.meta.dev && errorData?.error) {
        // eslint-disable-next-line no-console
        console.log(
          "Email send error:",
          errorData.error,
          "statusCode:",
          statusCode,
        );
      }

      // 429エラー（レート制限）の場合
      if (statusCode === 429 && errorData?.error) {
        errMsg.value = errorData.error;
      }
      else if (errorData?.error) {
        // その他のエラーの場合
        errMsg.value = errorData.error;
      }
      else {
        // エラーメッセージがない場合のフォールバック
        errMsg.value
          = "メールの送信に失敗しました。しばらく時間をおいて再度お試しください。";
      }
    }
  }
  catch (error: unknown) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Form submission error:", error);
    }
    errMsg.value
      = "予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。";
  }
  finally {
    isSubmitting.value = false;
    // Turnstile トークンは1回で失効するため、送信の成否に関わらずリセットする
    resetTurnstile();
  }
};

useAppSeo({
  title: "アカウント登録",
  description: "アカウント登録ページ。",
});
</script>
