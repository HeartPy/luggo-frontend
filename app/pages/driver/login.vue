<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <CommonAtomsLoadingAnimation v-if="isCheckingAuth" />
    <div
      v-else
      class="w-[calc(100%-8vw)] max-w-lg rounded-xl bg-white px-4 py-8 md:p-8"
    >
      <p class="text-center text-sm text-gray-500">
        配達者専用
      </p>
      <h2 class="mb-8 text-center text-2xl font-bold text-gray-800">
        ログイン
      </h2>

      <form
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

      <div class="space-y-2 text-center">
        <NuxtLink
          to="/account/password/forgot"
          class="block text-sm text-gray-600 transition-colors duration-200 hover:text-gray-800"
        >
          パスワードを忘れた方はこちら
        </NuxtLink>
        <NuxtLink
          to="/account/login"
          class="block text-sm text-gray-600 transition-colors duration-200 hover:text-gray-800"
        >
          事業者の方はこちら
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
const errMsg = ref("");
const formTouched = ref(false);
const showPassword = ref(false);
const isCheckingAuth = ref(true);

const { ensureCsrf, getCsrf } = useCsrf();

onMounted(async () => {
  try {
    const authInfo = await getAuthInfo();
    if (authInfo.authenticated && authInfo.user_type === "delivery_driver") {
      await navigateTo("/driver/dashboard", { replace: true });
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

    let dashboardUrl = "/driver/dashboard";
    try {
      const data = await $fetch<{ dashboard_url?: string }>(
        `${apiBase}/api/drivers/auth/login`,
        {
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
        },
      );
      dashboardUrl = data?.dashboard_url || dashboardUrl;
    }
    catch (fetchErr: unknown) {
      const errData = (fetchErr as { data?: { error?: string } })?.data;
      errMsg.value
        = errData?.error || "メールアドレスまたはパスワードが正しくありません。";
      return;
    }

    await navigateTo(dashboardUrl);
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

useAppSeo({
  title: "配達者ログイン",
  description: "配達者用ログインページ。",
});
</script>
