<template>
  <Teleport to="body">
    <div
      v-if="isPolicyDialogOpen && policyUpdateRequired"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 transition-opacity"
      @click.self="handleLater"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-update-title"
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
            id="policy-update-title"
            class="text-lg font-semibold text-gray-900"
          >
            規約改訂のお知らせ
          </h2>
          <p class="text-sm text-gray-600">
            以下の規約が更新されました。内容をご確認ください。
          </p>
        </div>

        <!-- 本文 -->
        <div class="overflow-y-auto px-6 py-5">
          <p class="mb-4 text-sm leading-relaxed text-gray-700">
            内容をご確認のうえ、「確認しました」を押してください。
            「あとで」を選んだ場合も引き続きご利用いただけますが、次回ログイン時に再度ご案内いたします。
          </p>

          <ul class="mb-4 space-y-3">
            <li v-if="termsUpdateRequired">
              <p class="text-sm text-gray-800">
                <button
                  type="button"
                  class="text-blue-600 underline hover:text-blue-800"
                  @click.prevent.stop="showTermsDialog = true"
                >
                  利用規約
                </button>
                （最新版: {{ policy?.terms_current_version }}）
              </p>
              <p
                v-if="policy?.terms_agreed_version"
                class="ml-1 mt-1 text-xs text-gray-500"
              >
                確認済みバージョン: {{ policy.terms_agreed_version }}
              </p>
            </li>

            <li v-if="privacyUpdateRequired">
              <p class="text-sm text-gray-800">
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 underline hover:text-blue-800"
                >
                  プライバシーポリシー
                </a>
                （最新版: {{ policy?.privacy_current_version }}）
              </p>
              <p
                v-if="policy?.privacy_agreed_version"
                class="ml-1 mt-1 text-xs text-gray-500"
              >
                確認済みバージョン: {{ policy.privacy_agreed_version }}
              </p>
            </li>
          </ul>

          <p class="mb-3 text-xs text-gray-500">
            ※
            本サービスを継続してご利用いただくことで、変更後の規約が適用されます。
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

    <!-- 利用規約本文をポップアップで表示するためのダイアログ -->
    <AccountRegisterAtomsTermsOfServiceDialog v-model="showTermsDialog" />
  </Teleport>
</template>

<script setup lang="ts">
import { usePolicyAgreement } from "~/composables/usePolicyAgreement";

const {
  policy,
  termsUpdateRequired,
  privacyUpdateRequired,
  policyUpdateRequired,
  submitAgreement,
  isPolicyDialogOpen,
  openPolicyDialog,
  closePolicyDialog,
  hasAutoOpenedPolicyDialog,
} = usePolicyAgreement();

const showTermsDialog = ref(false);
const isSubmitting = ref(false);
const submitErr = ref<string | null>(null);

// セッション中に 1 度だけ自動オープン
watch(
  policyUpdateRequired,
  (required) => {
    if (!required) return;
    if (hasAutoOpenedPolicyDialog.value) return;
    if (!import.meta.client) return;
    openPolicyDialog();
    hasAutoOpenedPolicyDialog.value = true;
  },
  { immediate: true },
);

const handleAcknowledge = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  submitErr.value = null;
  try {
    const ok = await submitAgreement();
    if (!ok) {
      submitErr.value
        = "確認の記録に失敗しました。時間をおいて再度お試しください。";
      return;
    }
    closePolicyDialog();
  }
  finally {
    isSubmitting.value = false;
  }
};

const handleLater = () => {
  if (isSubmitting.value) return;
  submitErr.value = null;
  closePolicyDialog();
};

// ダイアログの開閉に追従してバックグラウンドのスクロールを制御
watch(isPolicyDialogOpen, (open) => {
  if (!import.meta.client) return;
  document.body.style.overflow = open ? "hidden" : "";
});

// 確認完了でダイアログが消えるタイミングで一時状態をリセット
watch(policyUpdateRequired, (required) => {
  if (!required) {
    submitErr.value = null;
  }
});
</script>
