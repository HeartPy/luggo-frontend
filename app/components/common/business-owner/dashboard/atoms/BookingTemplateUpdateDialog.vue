<template>
  <Teleport to="body">
    <div
      v-if="isBookingTemplateDialogOpen && bookingTemplateUpdateRequired"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 transition-opacity"
      @click.self="handleLater"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-template-update-title"
        class="relative z-10 flex max-h-[90vh] w-[min(92vw,560px)] flex-col rounded-lg bg-white shadow-xl"
        @keydown.esc="handleLater"
      >
        <!-- 閉じるボタン（あとで） -->
        <button
          type="button"
          class="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="閉じる（あとで確認）"
          :disabled="isSubmitting"
          @click="handleLater"
        >
          ×
        </button>

        <!-- ヘッダー -->
        <div class="space-y-4 border-b border-gray-200 px-6 py-4 pr-12">
          <h2
            id="booking-template-update-title"
            class="text-lg font-semibold text-gray-900"
          >
            予約サイトの表示内容に関する変更のお知らせ
          </h2>
          <p class="text-sm text-gray-600">
            事業者では編集できない部分が、プラットフォーム側で更新されました。
            内容をご確認ください。
          </p>
        </div>

        <!-- 本文 -->
        <div class="overflow-y-auto px-6 py-5">
          <p class="mb-4 text-sm leading-relaxed text-gray-700">
            内容をご確認のうえ、「確認しました」を押してください。
            「あとで」を選んだ場合も、予約サイトの表示・予約の受付は引き続き
            可能ですが、次回ログイン時に再度ご案内いたします。
          </p>

          <ul class="mb-4 space-y-3">
            <li v-if="transactionLawUpdateRequired">
              <p class="text-sm text-gray-800">
                <a
                  v-if="transactionLawUrl"
                  :href="transactionLawUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 underline hover:text-blue-800"
                >
                  特定商取引法に基づく表記
                  <span aria-hidden="true">↗</span>
                </a>
                <span v-else>特定商取引法に基づく表記</span>
                （最新版:
                {{ bookingTemplate?.transaction_law_current_version }}）
              </p>
              <p
                v-if="bookingTemplate?.transaction_law_acknowledged_version"
                class="ml-1 mt-1 text-xs text-gray-500"
              >
                確認済みバージョン:
                {{ bookingTemplate.transaction_law_acknowledged_version }}
              </p>
            </li>

            <li v-if="privacyUpdateRequired">
              <p class="text-sm text-gray-800">
                <a
                  v-if="privacyUrl"
                  :href="privacyUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 underline hover:text-blue-800"
                >
                  プライバシーポリシー
                  <span aria-hidden="true">↗</span>
                </a>
                <span v-else>プライバシーポリシー</span>
                （最新版: {{ bookingTemplate?.privacy_current_version }}）
              </p>
              <p
                v-if="bookingTemplate?.privacy_acknowledged_version"
                class="ml-1 mt-1 text-xs text-gray-500"
              >
                確認済みバージョン:
                {{ bookingTemplate.privacy_acknowledged_version }}
              </p>
            </li>
          </ul>

          <p class="mb-3 text-xs text-gray-500">
            ※
            本通知は、事業者が直接編集できない静的部分の変更を対象としています。
          </p>

          <div
            v-if="submitErr"
            class="mb-3 text-sm text-red-600"
          >
            {{ submitErr }}
          </div>
        </div>

        <!-- フッター -->
        <div
          class="flex flex-col-reverse gap-2 border-t border-gray-200 px-6 py-4 sm:flex-row sm:justify-end"
        >
          <button
            type="button"
            class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSubmitting"
            @click="handleLater"
          >
            あとで
          </button>
          <button
            type="button"
            class="rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
            :disabled="isSubmitting"
            @click="handleAcknowledge"
          >
            <CommonAtomsLoadingAnimation
              v-if="isSubmitting"
              size="xs"
            />
            <span v-else>確認しました</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useBookingTemplateAcknowledge } from "~/composables/useBookingTemplateAcknowledge";
import { useBusinessProfile } from "~/composables/useBusinessProfile";

const { businessProfile } = useBusinessProfile();
const {
  bookingTemplate,
  transactionLawUpdateRequired,
  privacyUpdateRequired,
  bookingTemplateUpdateRequired,
  submitAcknowledge,
  isBookingTemplateDialogOpen,
  openBookingTemplateDialog,
  closeBookingTemplateDialog,
  hasAutoOpenedBookingTemplateDialog,
} = useBookingTemplateAcknowledge();

const isSubmitting = ref(false);
const submitErr = ref<string | null>(null);

// セッション中に 1 度だけ自動オープン
watch(
  bookingTemplateUpdateRequired,
  (required) => {
    if (!required) return;
    if (hasAutoOpenedBookingTemplateDialog.value) return;
    if (!import.meta.client) return;
    openBookingTemplateDialog();
    hasAutoOpenedBookingTemplateDialog.value = true;
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

const handleAcknowledge = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  submitErr.value = null;
  try {
    const ok = await submitAcknowledge();
    if (!ok) {
      submitErr.value
        = "確認の記録に失敗しました。時間をおいて再度お試しください。";
      return;
    }
    closeBookingTemplateDialog();
  }
  finally {
    isSubmitting.value = false;
  }
};

const handleLater = () => {
  if (isSubmitting.value) return;
  submitErr.value = null;
  closeBookingTemplateDialog();
};

// ダイアログの開閉に追従してバックグラウンドのスクロールを制御
watch(isBookingTemplateDialogOpen, (open) => {
  if (!import.meta.client) return;
  document.body.style.overflow = open ? "hidden" : "";
});

// 確認完了でダイアログが消えるタイミングで一時状態をリセット
watch(bookingTemplateUpdateRequired, (required) => {
  if (!required) {
    submitErr.value = null;
  }
});
</script>
