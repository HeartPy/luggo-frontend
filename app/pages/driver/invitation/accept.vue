<template>
  <div class="min-h-screen w-full bg-gradient-to-br from-gray-600 to-black py-12">
    <div class="mx-auto w-[calc(100%-8vw)] max-w-[500px]">
      <div class="rounded-xl bg-white px-4 py-8 md:p-8">
        <h1 class="mb-8 text-center text-2xl font-bold text-gray-800">
          配達者登録の確認
        </h1>

        <div
          v-if="isLoading"
          class="py-8"
        >
          <CommonAtomsLoadingAnimation size="md" />
        </div>

        <div
          v-else-if="isAccepted"
          class="text-center"
        >
          <figure class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <img
              src="/img/check-green.svg"
              alt=""
              class="h-8 w-8 object-contain"
            >
          </figure>
          <p class="mb-6 text-gray-600">
            配達者登録が完了しました。<br>
            登録済みのメールアドレスとパスワードでログインできます。
          </p>
          <NuxtLink
            to="/driver/login"
            class="inline-block rounded-md bg-gray-800 px-8 py-3 font-semibold text-white hover:bg-gray-900"
          >
            ログイン画面へ
          </NuxtLink>
        </div>

        <div v-else-if="invitation">
          <p class="mb-6 text-sm leading-relaxed text-gray-700">
            {{ invitation.owner_company_name }}から、LugGoの配達者登録依頼が届いています。
            内容を確認し、登録を承認してください。
          </p>

          <dl class="mb-8 divide-y divide-gray-100 rounded-lg border border-gray-200 px-4">
            <div class="flex justify-between gap-4 py-3">
              <dt class="text-sm text-gray-500">
                氏名
              </dt>
              <dd class="text-right text-sm text-gray-800">
                {{ invitation.name }}
              </dd>
            </div>
            <div
              v-if="invitation.company_name"
              class="flex justify-between gap-4 py-3"
            >
              <dt class="text-sm text-gray-500">
                会社名
              </dt>
              <dd class="text-right text-sm text-gray-800">
                {{ invitation.company_name }}
              </dd>
            </div>
            <div class="flex justify-between gap-4 py-3">
              <dt class="text-sm text-gray-500">
                メールアドレス
              </dt>
              <dd class="break-all text-right text-sm text-gray-800">
                {{ invitation.email }}
              </dd>
            </div>
            <div
              v-if="invitation.departure_label"
              class="flex justify-between gap-4 py-3"
            >
              <dt class="shrink-0 text-sm text-gray-500">
                出発地点
              </dt>
              <dd class="text-right text-sm text-gray-800">
                {{ invitation.departure_label }}
              </dd>
            </div>
          </dl>

          <div class="mb-6 space-y-4">
            <div>
              <label
                for="driver-password"
                class="mb-1 block text-sm font-medium text-gray-700"
              >
                パスワード
              </label>
              <div class="relative">
                <input
                  id="driver-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                  :aria-label="showPassword ? 'パスワードを非表示' : 'パスワードを表示'"
                  @click="showPassword = !showPassword"
                >
                  <img
                    :src="showPassword ? '/img/pass-show.svg' : '/img/pass-hidden.svg'"
                    :alt="showPassword ? 'パスワードを非表示' : 'パスワードを表示'"
                    class="h-6 w-6"
                  >
                </button>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                8〜16文字の半角英数字・記号で、大文字・小文字・数字・記号のうち3種類以上を含めてください。
              </p>
              <p
                v-if="fieldErrs.password"
                class="mt-1 text-xs text-red-600"
              >
                {{ fieldErrs.password }}
              </p>
            </div>

            <div>
              <label
                for="driver-password-confirm"
                class="mb-1 block text-sm font-medium text-gray-700"
              >
                パスワードの再入力（確認用）
              </label>
              <div class="relative">
                <input
                  id="driver-password-confirm"
                  v-model="passwordConfirm"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  @keyup.enter="acceptInvitation"
                >
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                  :aria-label="showPassword ? 'パスワードを非表示' : 'パスワードを表示'"
                  @click="showPassword = !showPassword"
                >
                  <img
                    :src="showPassword ? '/img/pass-show.svg' : '/img/pass-hidden.svg'"
                    :alt="showPassword ? 'パスワードを非表示' : 'パスワードを表示'"
                    class="h-6 w-6"
                  >
                </button>
              </div>
              <p
                v-if="fieldErrs.password_confirm"
                class="mt-1 text-xs text-red-600"
              >
                {{ fieldErrs.password_confirm }}
              </p>
            </div>
          </div>

          <p
            v-if="pageErr"
            class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {{ pageErr }}
          </p>

          <button
            type="button"
            class="block w-full rounded-md bg-gray-800 px-6 py-3 font-semibold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300"
            :disabled="isAccepting"
            @click="acceptInvitation"
          >
            <CommonAtomsLoadingAnimation
              v-if="isAccepting"
              size="xs"
            />
            <span v-else>登録を承認する</span>
          </button>
          <p class="mt-4 text-center text-xs text-gray-500">
            心当たりがない場合は、このページを閉じてください。
          </p>
        </div>

        <div
          v-else
          class="rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          {{ pageErr || "この確認リンクは無効か、有効期限が切れています。" }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCsrf } from "~/composables/useCsrf";

type InvitationSummary = {
  email: string;
  name: string;
  company_name: string;
  departure_label: string;
  owner_company_name: string;
  expires_at: string;
};

const route = useRoute();
const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;
const { ensureCsrf, getCsrf } = useCsrf();

// メール内リンクの ?token=... を取得
const token = computed(() => String(route.query.token ?? ""));

const invitation = ref<InvitationSummary | null>(null);
const isLoading = ref(true);
const isAccepting = ref(false);
const isAccepted = ref(false);
const pageErr = ref<string | null>(null);
const password = ref("");
const passwordConfirm = ref("");
const showPassword = ref(false);
const fieldErrs = ref<Record<string, string>>({});

function errorData(err: unknown): {
  errMsg?: string;
  valid_errs?: Record<string, string[]>;
} | undefined {
  if (err && typeof err === "object" && "data" in err) {
    return (err as {
      data?: {
        errMsg?: string;
        valid_errs?: Record<string, string[]>;
      };
    }).data;
  }
  return undefined;
}

function errorMsg(err: unknown, fallback: string): string {
  return errorData(err)?.errMsg ?? fallback;
}

// ページ表示時: トークンの有効性を確認し招待概要を取得
async function verifyInvitation() {
  if (!token.value) {
    pageErr.value = "リンクが正しくありません。メールに記載のリンクから再度アクセスしてください。";
    isLoading.value = false;
    return;
  }
  try {
    const data = await $fetch<{ invitation: InvitationSummary }>(
      `${apiBase}/api/business/drivers/invitation/verify`,
      {
        method: "GET",
        credentials: "include",
        query: { token: token.value },
      },
    );
    invitation.value = data.invitation;
  }
  catch (err: unknown) {
    pageErr.value = errorMsg(
      err,
      "この確認リンクは無効か、有効期限が切れています。",
    );
  }
  finally {
    isLoading.value = false;
  }
}

// 承認ボタン: パスワード設定後に配達者アカウントを有効化
async function acceptInvitation() {
  if (!token.value || isAccepting.value) return;
  fieldErrs.value = {};
  // 送信前の簡易チェック（詳細な制約はサーバー側でも検証）
  if (!password.value) {
    fieldErrs.value.password = "パスワードを入力してください。";
  }
  if (password.value !== passwordConfirm.value) {
    fieldErrs.value.password_confirm = "パスワードが一致しません。";
  }
  if (Object.keys(fieldErrs.value).length > 0) return;

  isAccepting.value = true;
  pageErr.value = null;
  try {
    await ensureCsrf(apiBase);
    await $fetch(`${apiBase}/api/business/drivers/invitation/accept`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
      },
      body: {
        token: token.value,
        password: password.value,
        password_confirm: passwordConfirm.value,
      },
    });

    // フォームを隠し、完了画面へ切り替える
    isAccepted.value = true;
    invitation.value = null;
  }
  catch (err: unknown) {
    const data = errorData(err);
    if (data?.valid_errs) {
      // フィールド別エラーを入力下表示用に整形
      fieldErrs.value = Object.fromEntries(
        Object.entries(data.valid_errs).map(([key, messages]) => [
          key,
          messages.join(" "),
        ]),
      );
    }
    pageErr.value = data?.errMsg ?? "配達者登録の承認に失敗しました。";
  }
  finally {
    isAccepting.value = false;
  }
}

onMounted(verifyInvitation);

useAppSeo({
  title: "配達者登録の確認",
  description: "配達者登録の確認ページ。",
});
</script>
