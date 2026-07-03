<template>
  <div>
    <!-- 保存しない確認ダイアログ -->
    <CommonAtomsConfirmDialog
      v-model="showDiscardConfirm"
      title="確認"
      message="入力中の内容を破棄しますか？"
      confirm-label="破棄する"
      cancel-label="キャンセル"
      @confirm="doDiscard"
    />

    <!-- 保存 / 保存しないボタン -->
    <div
      class="mb-6 flex items-center justify-end gap-3 border-y border-gray-200 px-8 py-3"
    >
      <button
        type="button"
        class="w-44 rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        :disabled="!isDirty || isSaving || !!validationErr"
        @click="handleSave"
      >
        <CommonAtomsLoadingAnimation
          v-if="isSaving"
          size="xs"
        />
        <span v-else>保存</span>
      </button>
      <button
        type="button"
        class="rounded-md border-2 border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        :disabled="!isDirty || isSaving"
        @click="handleDiscardClick"
      >
        保存しない
      </button>
    </div>

    <div class="max-w-3xl px-8">
      <div
        v-if="isLoading"
        class="flex justify-center py-16"
      >
        <CommonAtomsLoadingAnimation />
      </div>

      <div v-else>
        <div class="rounded-lg border border-gray-200 bg-white p-6">
          <h2 class="mb-1 font-bold text-gray-900">
            適格請求書発行事業者登録番号
          </h2>
          <p class="mb-4 text-sm leading-relaxed text-gray-600">
            インボイス制度の適格請求書発行事業者登録番号を設定できます。
            設定すると、旅行者がダウンロードする領収書に登録番号が表示されます。
            登録番号は「T」＋13桁の数字（例: <span class="font-mono">T1234567890123</span>）です。
          </p>

          <label
            for="invoice-number"
            class="mb-1 block text-sm font-semibold text-gray-700"
          >
            登録番号
          </label>
          <input
            id="invoice-number"
            v-model="localValue"
            type="text"
            inputmode="text"
            maxlength="14"
            placeholder="T1234567890123"
            class="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            :class="{ 'border-red-500': validationErr }"
            @blur="normalizeInput"
          >

          <p
            v-if="validationErr"
            class="mt-2 text-sm text-red-600"
          >
            {{ validationErr }}
          </p>
          <p
            v-else
            class="mt-2 text-xs text-gray-500"
          >
            登録番号を削除して保存すると、領収書に登録番号は表示されなくなります。
          </p>

          <p
            v-if="successMsg"
            class="mt-4 text-sm font-semibold text-green-600"
          >
            {{ successMsg }}
          </p>
          <p
            v-if="errMsg"
            class="mt-4 text-sm font-semibold text-red-600"
          >
            {{ errMsg }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBusinessProfile } from "~/composables/useBusinessProfile";
import { useCsrf } from "~/composables/useCsrf";

const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;
const { ensureCsrf, getCsrf } = useCsrf();
const { fetchBusinessProfile } = useBusinessProfile();

const INVOICE_PATTERN = /^T\d{13}$/;

const localValue = ref("");
const initialValue = ref("");
const isLoading = ref(true);
const isSaving = ref(false);
const successMsg = ref("");
const errMsg = ref("");
const showDiscardConfirm = ref(false);

// 全角英数字を半角へ寄せ、前後空白を除去して大文字化
const normalize = (value: string): string =>
  value
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, char =>
      String.fromCharCode(char.charCodeAt(0) - 0xfee0),
    )
    .trim()
    .toUpperCase();

const normalizeInput = () => {
  localValue.value = normalize(localValue.value);
};

const isDirty = computed(() => normalize(localValue.value) !== initialValue.value);

const validationErr = computed(() => {
  const value = normalize(localValue.value);
  if (!value) return "";
  if (!INVOICE_PATTERN.test(value)) {
    return "登録番号は「T」＋13桁の数字で入力してください。";
  }
  return "";
});

async function fetchInvoiceNumber() {
  isLoading.value = true;
  errMsg.value = "";
  try {
    await ensureCsrf(apiBase);
    const data = await $fetch<{ invoice_registration_number: string }>(
      `${apiBase}/api/business/profile/invoice`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
        },
      },
    );
    initialValue.value = data.invoice_registration_number || "";
    localValue.value = initialValue.value;
  }
  catch {
    errMsg.value = "インボイス設定の取得に失敗しました。";
  }
  finally {
    isLoading.value = false;
  }
}

function handleDiscardClick() {
  if (!isDirty.value) return;
  showDiscardConfirm.value = true;
}

function doDiscard() {
  localValue.value = initialValue.value;
  successMsg.value = "";
  errMsg.value = "";
}

async function handleSave() {
  successMsg.value = "";
  errMsg.value = "";

  if (validationErr.value) {
    return;
  }

  const value = normalize(localValue.value);
  localValue.value = value;

  isSaving.value = true;
  try {
    await ensureCsrf(apiBase);
    const data = await $fetch<{ invoice_registration_number: string }>(
      `${apiBase}/api/business/profile/invoice`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
        },
        body: { invoice_registration_number: value },
      },
    );
    initialValue.value = data.invoice_registration_number || "";
    localValue.value = initialValue.value;
    successMsg.value = "インボイス設定を保存しました。";
    // ヘッダー等が参照する共有プロフィールを更新
    await fetchBusinessProfile();
  }
  catch (err: unknown) {
    const apiErr = err as { data?: { error?: string } };
    errMsg.value
      = apiErr?.data?.error
        ?? "インボイス設定の保存に失敗しました。しばらく時間をおいて再度お試しください。";
  }
  finally {
    isSaving.value = false;
  }
}

onMounted(fetchInvoiceNumber);
</script>
