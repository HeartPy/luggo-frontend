<template>
  <div class="flex min-h-screen items-center justify-center">
    <CommonAtomsLoadingAnimation v-if="isCheckingAuth" />
    <div
      v-else
      class="w-[calc(100%-8vw)] max-w-lg rounded-xl bg-white px-4 py-8 md:p-8"
    >
      <p class="text-center text-sm text-gray-500">
        事業者専用
      </p>
      <h2 class="mb-8 text-center text-2xl font-bold text-gray-800">
        ログイン
      </h2>

      <!-- ステップ1: メールアドレスとパスワード入力 -->
      <form
        v-if="!codeSent"
        class="mb-6"
        novalidate
        @submit.prevent="handleFormLogin"
      >
        <div class="mb-10 space-y-6">
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
              v-bind="emailProps"
              name="email"
              type="email"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.email && formTouched }"
              autocomplete="email"
              aria-required="true"
              aria-describedby="email-error"
            >
            <p
              v-if="errors.email && formTouched"
              id="email-error"
              class="mt-1 text-sm text-red-600"
              aria-live="polite"
            >
              {{ errors.email }}
            </p>
          </div>

          <div>
            <label
              for="password"
              class="mb-2 block font-semibold text-gray-800"
            >
              パスワード
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                v-bind="passwordProps"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': errors.password && formTouched }"
                autocomplete="current-password"
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
              v-if="errors.password && formTouched"
              id="password-error"
              class="mt-1 text-sm text-red-600"
              aria-live="polite"
            >
              {{ errors.password }}
            </p>
          </div>

          <div
            v-if="errMsg"
            class="text-center text-sm text-red-600"
          >
            {{ errMsg }}
          </div>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="mx-auto w-full max-w-[500px] rounded-lg bg-gray-800 px-8 py-3 font-semibold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <CommonAtomsLoadingAnimation
            v-if="isSubmitting"
            size="sm"
          />
          <span v-else>ログイン</span>
        </button>
      </form>

      <!-- ステップ2: 認証コード入力 -->
      <form
        v-else
        class="mb-6"
        novalidate
        @submit.prevent="handleVerifyCode"
      >
        <div class="mb-10 space-y-6">
          <div>
            <p class="mb-4 text-center text-sm text-gray-600">
              {{ email }}宛に認証コードを送信しました。<br>
              メールに記載されている6桁の認証コードを入力してください。
            </p>
            <label
              for="code"
              class="mb-2 block font-semibold text-gray-800"
            >
              認証コード
            </label>
            <input
              id="code"
              v-model="verificationCode"
              name="code"
              type="text"
              maxlength="6"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-center text-2xl tracking-widest focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': codeErr }"
              autocomplete="one-time-code"
              aria-required="true"
              aria-describedby="code-error"
              placeholder="000000"
              pattern="[0-9]{6}"
              inputmode="numeric"
              @input="handleCodeInput"
            >
            <p
              v-if="codeErr"
              id="code-error"
              class="mt-1 text-sm text-red-600"
              aria-live="polite"
            >
              {{ codeErr }}
            </p>
            <p class="mt-2 text-xs text-gray-500">
              認証コードの有効期限は3分です。
            </p>
            <div class="mt-4 text-center">
              <button
                type="button"
                :disabled="isSubmitting || isResending"
                class="text-sm text-gray-600 underline transition-colors duration-200 hover:text-gray-800 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
                @click="handleResendCode"
              >
                認証コードを再送信する
              </button>
            </div>
          </div>

          <div
            v-if="errMsg"
            class="text-center text-sm text-red-600"
          >
            {{ errMsg }}
          </div>
        </div>

        <div class="space-y-3">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="mx-auto w-full max-w-[500px] rounded-lg bg-gray-800 px-8 py-3 font-semibold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <CommonAtomsLoadingAnimation
              v-if="isSubmitting"
              size="sm"
            />
            <span v-else>ログイン</span>
          </button>
          <button
            type="button"
            :disabled="isSubmitting"
            class="mx-auto w-full max-w-[500px] rounded-lg border border-gray-300 px-8 py-3 font-semibold text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            @click="handleBack"
          >
            戻る
          </button>
        </div>
      </form>

      <div
        v-if="!codeSent"
        class="space-y-2 text-center"
      >
        <NuxtLink
          to="/account/register/email"
          class="block text-sm text-gray-600 transition-colors duration-200 hover:text-gray-800"
        >
          新規登録はこちら
        </NuxtLink>
        <NuxtLink
          to="/account/password/forgot"
          class="block text-sm text-gray-600 transition-colors duration-200 hover:text-gray-800"
        >
          パスワードを忘れた方はこちら
        </NuxtLink>
        <NuxtLink
          to="/driver/login"
          class="block text-sm text-gray-600 transition-colors duration-200 hover:text-gray-800"
        >
          配達者の方はこちら
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { object, string } from "yup";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import { useCsrf } from "~/composables/useCsrf";
import { getAuthInfo } from "~/composables/useAuth";

type LoginFormData = {
  email: string;
  password: string;
};

const loginSchema = object({
  email: string()
    .trim()
    .required("メールアドレスを入力してください")
    .email("有効なメールアドレスを入力してください"),
  password: string().trim().required("パスワードを入力してください"),
});

const { defineField, handleSubmit, errors } = useForm<LoginFormData>({
  validationSchema: toTypedSchema(loginSchema),
});

const [email, emailProps] = defineField("email");
const [password, passwordProps] = defineField("password");

const isSubmitting = ref(false);
const isResending = ref(false);
const errMsg = ref("");
const formTouched = ref(false);
const codeSent = ref(false);
const verificationCode = ref("");
const codeErr = ref("");
const savedPassword = ref("");
const showPassword = ref(false);
const isCheckingAuth = ref(true);

const { ensureCsrf, getCsrf } = useCsrf();

onMounted(async () => {
  try {
    const authInfo = await getAuthInfo();
    if (authInfo.authenticated && authInfo.user_type === "business_owner") {
      await navigateTo("/business-owner/dashboard", { replace: true });
      return;
    }
  }
  catch {
    // 認証チェック失敗時はログインフォームを表示
  }
  finally {
    isCheckingAuth.value = false;
  }
});

const handleFormLogin = () => {
  formTouched.value = true;
  handleLogin();
};

const handleLogin = handleSubmit(async (formValues: LoginFormData) => {
  try {
    isSubmitting.value = true;
    errMsg.value = "";

    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;

    await ensureCsrf(apiBase);

    // 認証コード送信APIを呼び出し
    try {
      await $fetch(`${apiBase}/api/users/auth/send-login-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
        },
        body: {
          email: formValues.email?.trim().toLowerCase() || "",
          password: formValues.password || "",
        },
        credentials: "include",
      });
    }
    catch (fetchErr: unknown) {
      const errData = (fetchErr as { data?: { error?: string } })?.data;
      errMsg.value
        = errData?.error || "メールアドレスまたはパスワードが正しくありません。";
      return;
    }

    codeSent.value = true;
    errMsg.value = "";
    // パスワードを保存（再送信時に使用）
    savedPassword.value = formValues.password || "";
    // フォームのパスワードをクリア（セキュリティのため）
    password.value = "";
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
  }
});

const handleVerifyCode = async () => {
  if (!verificationCode.value || verificationCode.value.length !== 6) {
    codeErr.value = "6桁の認証コードを入力してください。";
    return;
  }

  try {
    isSubmitting.value = true;
    errMsg.value = "";
    codeErr.value = "";

    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;

    await ensureCsrf(apiBase);

    // 認証コード検証APIを呼び出し
    let dashboardUrl = "/business-owner/dashboard";
    try {
      const data = await $fetch<{ dashboard_url?: string }>(
        `${apiBase}/api/users/auth/verify-login-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
          },
          body: {
            email: email.value?.trim().toLowerCase() || "",
            code: verificationCode.value.trim(),
          },
          credentials: "include",
        },
      );
      dashboardUrl = data?.dashboard_url || dashboardUrl;
    }
    catch (fetchErr: unknown) {
      const errData = (fetchErr as { data?: { error?: string } })?.data;
      codeErr.value
        = errData?.error || "認証コードが正しくないか、有効期限が切れています。";
      return;
    }

    await navigateTo(dashboardUrl);
  }
  catch (error: unknown) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Code verification error:", error);
    }
    errMsg.value
      = "予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。";
  }
  finally {
    isSubmitting.value = false;
  }
};

const handleResendCode = async () => {
  if (!email.value || !savedPassword.value) {
    errMsg.value
      = "入力情報が失われました。ページを再読み込みして、メールアドレスとパスワードから再度入力してください。";
    return;
  }

  try {
    isResending.value = true;
    errMsg.value = "";
    codeErr.value = "";
    verificationCode.value = ""; // 入力済みの認証コードをクリア

    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;

    await ensureCsrf(apiBase);

    // 認証コード再送信APIを呼び出し
    try {
      await $fetch(`${apiBase}/api/users/auth/send-login-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
        },
        body: {
          email: email.value.trim().toLowerCase(),
          password: savedPassword.value,
        },
        credentials: "include",
      });
    }
    catch (fetchErr: unknown) {
      const e = fetchErr as {
        data?: { error?: string };
        status?: number;
        statusCode?: number;
      };
      const statusCode = e?.statusCode ?? e?.status;

      // 401: パスワード不一致またはセッション期限切れ → ログイン画面に戻す
      if (statusCode === 401) {
        resetToLoginForm(
          "セッションの有効期限が切れました。メールアドレスとパスワードを再度入力してください。",
        );
        return;
      }

      const errData = e?.data;
      errMsg.value
        = errData?.error
          || "認証コードの再送信に失敗しました。しばらく時間をおいて再度お試しください。";
      return;
    }

    errMsg.value = "";
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.log("認証コードを再送信しました。");
    }
  }
  catch (error: unknown) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Resend code error:", error);
    }
    errMsg.value
      = "予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。";
  }
  finally {
    isResending.value = false;
  }
};

const resetToLoginForm = (message: string) => {
  codeSent.value = false;
  verificationCode.value = "";
  codeErr.value = "";
  savedPassword.value = "";
  // パスワードをクリア（セキュリティのため）
  password.value = "";
  errMsg.value = message;
};

const handleBack = () => {
  resetToLoginForm("");
};

const handleCodeInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  // 数字以外の文字を削除
  verificationCode.value = target.value.replace(/[^0-9]/g, "");
};

useAppSeo({
  title: "管理者ログイン",
  description: "管理者用ログインページ。",
});
</script>
