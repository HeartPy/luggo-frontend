<template>
  <Teleport to="body">
    <div
      v-if="isConsentPopupOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity"
      @click.self="handleClose"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="public-info-consent-title"
        aria-describedby="public-info-consent-desc"
        class="relative z-10 max-h-[90vh] w-[min(92vw,560px)] overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        @keydown.esc="handleClose"
      >
        <!-- 閉じるボタン -->
        <button
          type="button"
          class="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="閉じる"
          @click="handleClose"
        >
          ×
        </button>

        <h2
          id="public-info-consent-title"
          class="mb-4 pr-6 text-lg font-semibold text-gray-900"
        >
          公開情報の表示に関する同意
        </h2>

        <p
          id="public-info-consent-desc"
          class="mb-4 text-sm leading-relaxed text-gray-700"
        >
          予約フォーム（ユーザー向けページ）には、現在の設定に基づいた下記の情報が
          <span class="font-semibold">ユーザー（旅行者）に表示</span>
          されます。内容をご確認のうえ、表示に同意してください。同意いただくと、決済情報の設定に進めるようになります。
        </p>

        <ul class="mb-4 space-y-2">
          <li>
            <a
              v-if="transactionLawUrl"
              :href="transactionLawUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-sm text-blue-600 underline hover:text-blue-800"
            >
              特定商取引法に基づく表記を確認する
              <span aria-hidden="true">↗</span>
            </a>
            <span v-else class="text-sm text-gray-400">
              特定商取引法に基づく表記（リンク準備中）
            </span>
          </li>
          <li>
            <a
              v-if="privacyUrl"
              :href="privacyUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-sm text-blue-600 underline hover:text-blue-800"
            >
              プライバシーポリシーを確認する
              <span aria-hidden="true">↗</span>
            </a>
            <span v-else class="text-sm text-gray-400">
              プライバシーポリシー（リンク準備中）
            </span>
          </li>
        </ul>

        <!-- 決済情報の登録によって自動反映される項目の説明 -->
        <div
          class="mb-4 rounded-md border border-blue-100 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900"
        >
          <p class="mb-1 font-semibold">
            次のステップ（決済情報の登録）で自動反映される項目
          </p>
          <p class="mb-2">
            現時点では空欄になっている下記の項目は、次のステップで決済情報（Stripe）の登録が完了次第、入力された内容が自動的に反映されます。
          </p>
          <ul class="list-disc space-y-0.5 pl-5">
            <li>
              特定商取引法に基づく表記ページの「事業責任者」「事業者の所在地」「お問い合わせ先」
            </li>
            <li>
              プライバシーポリシーページ「第15条（お問い合わせ窓口）」のメールアドレス
            </li>
          </ul>
        </div>

        <label
          class="mb-5 flex cursor-pointer items-start gap-2 rounded-md border border-gray-200 bg-gray-50 p-3"
        >
          <input
            v-model="agreed"
            type="checkbox"
            class="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="text-sm text-gray-800">
            上記の情報がユーザー（旅行者）に表示されることに同意します
          </span>
        </label>

        <div v-if="submitErr" class="mb-4 text-sm text-red-600">
          {{ submitErr }}
        </div>

        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
            @click="handleClose"
          >
            あとで
          </button>
          <button
            type="button"
            class="rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
            :disabled="!agreed || isSubmitting"
            @click="handleAgree"
          >
            <CommonAtomsLoadingAnimation v-if="isSubmitting" size="xs" />
            <span v-else>同意して決済設定へ進む</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useBusinessProfile } from "~/composables/useBusinessProfile";
import { useOnboardingProgress } from "~/composables/useOnboardingProgress";

const { businessProfile } = useBusinessProfile();
const {
  pricingCleared,
  businessSettingsCleared,
  consentGiven,
  isConsentPopupOpen,
  hasAutoOpenedConsent,
  openConsentPopup,
  closeConsentPopup,
  submitConsent,
} = useOnboardingProgress();

const agreed = ref(false);
const isSubmitting = ref(false);
const submitErr = ref<string | null>(null);

// 自動オープン: 料金・事業がクリア & 未同意なら、セッション中に一度だけ立ち上げる
watch(
  [pricingCleared, businessSettingsCleared, consentGiven],
  ([pricing, business, consent]) => {
    if (
      pricing &&
      business &&
      !consent &&
      !hasAutoOpenedConsent.value &&
      import.meta.client
    ) {
      openConsentPopup();
      hasAutoOpenedConsent.value = true;
    }
  },
  { immediate: true },
);

// サブドメイン + 任意パスから、事業者の公開サイトの完全 URL を組み立てる
const buildSubdomainUrl = (path: string): string | null => {
  if (!import.meta.client) return null;
  const subdomain = businessProfile.value?.subdomain;
  if (!subdomain) return null;

  const host = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;

  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    const portStr = port ? `:${port}` : "";
    return `${protocol}//${host}${portStr}${path}?subdomain=${subdomain}`;
  }

  const parts = host.split(".");
  const baseDomain = parts.length >= 3 ? parts.slice(1).join(".") : host;
  return `${protocol}//${subdomain}.${baseDomain}${path}`;
};

const transactionLawUrl = computed(() =>
  buildSubdomainUrl("/booking/transaction-law"),
);

const privacyUrl = computed(() => buildSubdomainUrl("/booking/privacy"));

const handleClose = () => {
  if (isSubmitting.value) return;
  submitErr.value = null;
  closeConsentPopup();
};

const handleAgree = async () => {
  if (!agreed.value || isSubmitting.value) return;
  isSubmitting.value = true;
  submitErr.value = null;

  try {
    const ok = await submitConsent();
    if (!ok) {
      submitErr.value =
        "同意の記録に失敗しました。時間をおいて再度お試しください。";
      return;
    }
    closeConsentPopup();
    await navigateTo("/stripe/account");
  } finally {
    isSubmitting.value = false;
  }
};

// ポップアップが閉じる際にチェック状態を初期化
watch(isConsentPopupOpen, (open) => {
  if (!open) {
    agreed.value = false;
    submitErr.value = null;
  }
  if (import.meta.client) {
    document.body.style.overflow = open ? "hidden" : "";
  }
});
</script>
