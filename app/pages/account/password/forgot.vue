<template>
  <div
    class="min-h-screen w-full bg-gradient-to-br from-gray-600 via-gray-700 via-gray-800 via-gray-900 to-black py-12"
  >
    <div class="mx-auto w-[calc(100%-8vw)] max-w-[500px]">
      <div class="rounded-xl bg-white px-4 py-8 md:p-8">
        <h1 class="mb-8 text-center text-2xl font-bold text-gray-800 md:mb-12">
          パスワード再設定
        </h1>

        <div v-if="!emailSent" class="mx-auto max-w-sm">
          <form
            class="w-full"
            novalidate
            @submit.prevent="handleFormSubmit"
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
                  type="email"
                  required
                  class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': emailErr }"
                  autocomplete="email"
                  aria-required="true"
                  aria-describedby="email-error"
                />
                <p
                  v-if="emailErr"
                  id="email-error"
                  class="mt-1 text-sm text-red-600"
                  aria-live="polite"
                >
                  {{ emailErr }}
                </p>
              </div>

              <div v-if="errMsg" class="text-sm text-red-600">
                {{ errMsg }}
              </div>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="mx-auto block w-full max-w-[500px] rounded-lg bg-gray-800 px-8 py-3 font-semibold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <CommonAtomsLoadingAnimation v-if="isSubmitting" size="sm" />
              <span v-else>再設定メールを送信</span>
            </button>
          </form>
        </div>

        <div v-else class="space-y-6">
          <div class="flex flex-col items-center justify-center gap-2">
            <figure class="mx-auto w-20">
              <img
                src="/img/mail.svg"
                alt=""
                class="h-full w-full object-contain"
              />
            </figure>
            <p class="block text-center text-lg font-semibold text-gray-800">
              メールを送信しました
            </p>
          </div>
          <p class="mx-auto w-fit">
            {{ email }}宛にパスワード再設定用メールを送信しました。<br />
            メール内のリンクからパスワードの再設定を行なってください。<br />
            リンクは30分間のみ有効です。
          </p>
        </div>

        <NuxtLink
          to="/account/login"
          class="mt-6 block text-center text-sm text-gray-600 transition-colors duration-200 hover:text-gray-800"
        >
          ログインページに戻る
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

const email = ref("");
const emailErr = ref("");
const isSubmitting = ref(false);
const errMsg = ref("");
const emailSent = ref(false);

const { ensureCsrf, getCsrf } = useCsrf();

const handleFormSubmit = async () => {
  emailErr.value = "";
  setValues({ email: email.value });
  const result = await validate();

  if (!result.valid) {
    if (result.errors.email) {
      emailErr.value = result.errors.email;
    }
    return;
  }

  try {
    isSubmitting.value = true;
    errMsg.value = "";

    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;

    await ensureCsrf(apiBase);

    const { error } = await useFetch(
      `${apiBase}/api/users/password/request-reset`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
        },
        body: {
          email: email.value.trim().toLowerCase(),
        },
        credentials: "include",
      },
    );

    if (error.value) {
      const errorData = error.value.data as { error?: string };
      errMsg.value =
        errorData?.error ||
        "メールの送信に失敗しました。しばらく時間をおいて再度お試しください。";
      return;
    }

    emailSent.value = true;
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
};

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
