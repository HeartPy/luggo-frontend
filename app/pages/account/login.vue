<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="w-[calc(100%-8vw)] max-w-md bg-white">
      <h2 class="mb-8 text-center text-2xl font-bold text-gray-800">
        ログイン
      </h2>

      <form class="mb-6" novalidate @submit.prevent="handleFormLogin">
        <div class="mb-10 space-y-6">
          <div>
            <label for="email" class="mb-2 block font-semibold text-gray-800">
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
            />
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
            <input
              id="password"
              v-model="password"
              v-bind="passwordProps"
              name="password"
              type="password"
              required
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.password && formTouched }"
              autocomplete="current-password"
              aria-required="true"
              aria-describedby="password-error"
            />
            <p
              v-if="errors.password && formTouched"
              id="password-error"
              class="mt-1 text-sm text-red-600"
              aria-live="polite"
            >
              {{ errors.password }}
            </p>
          </div>

          <div v-if="errMsg" class="text-center text-sm text-red-600">
            {{ errMsg }}
          </div>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="mx-auto w-full max-w-[500px] rounded-lg bg-gray-800 px-8 py-3 font-semibold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          ログイン
        </button>
      </form>

      <div class="space-y-2 text-center">
        <NuxtLink
          to="/account/register/email"
          class="block text-sm text-gray-600 transition-colors duration-200 hover:text-gray-800"
        >
          新規登録はこちら
        </NuxtLink>
        <NuxtLink
          to="#"
          class="block text-sm text-gray-600 transition-colors duration-200 hover:text-gray-800"
        >
          パスワードを忘れた方はこちら
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { object, string } from "yup";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";

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

const { defineField, handleSubmit, errors, resetForm } = useForm<LoginFormData>(
  {
    validationSchema: toTypedSchema(loginSchema),
  },
);

const [email, emailProps] = defineField("email");
const [password, passwordProps] = defineField("password");

const isSubmitting = ref(false);
const errMsg = ref("");
const formTouched = ref(false);

const handleFormLogin = () => {
  formTouched.value = true;
  handleLogin();
};

const handleLogin = handleSubmit(async (formValues: LoginFormData) => {
  try {
    isSubmitting.value = true;
    errMsg.value = "";

    // FormDataの作成
    const formData = new FormData();
    formData.append("email", formValues.email || "");
    formData.append("password", formValues.password || "");

    // フォーム送信
    const { data, error } = await useFetch("/api/accounts/login", {
      method: "POST",
      body: formData,
    });

    if (error.value) {
      errMsg.value = "メールアドレスまたはパスワードが正しくありません。";
    } else if (data.value) {
      formTouched.value = false;
      resetForm();
      email.value = "";
      password.value = "";
      await navigateTo("/admin/dashboard");
    }
  } catch (error: unknown) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Form submission error:", error);
    }
    errMsg.value =
      "予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。";
  } finally {
    isSubmitting.value = false;
  }
});

useHead({
  title: "管理者ログイン",
  meta: [
    {
      name: "description",
      content: "管理者用ログイン画面ページ。",
    },
    { property: "og:title", content: "管理者ログイン | LugGo(ラグゴー)" },
    {
      property: "og:description",
      content: "管理者用ログイン画面ページ。",
    },
    {
      key: "twitter:title",
      name: "twitter:title",
      content: "管理者ログイン | LugGo(ラグゴー)",
    },
    {
      key: "twitter:description",
      name: "twitter:description",
      content: "管理者用ログイン画面ページ。",
    },
  ],
});
</script>
