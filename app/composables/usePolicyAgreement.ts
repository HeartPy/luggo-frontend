/**
 * プラットフォーム利用規約・プライバシーポリシーの確認状態を扱う composable。
 *
 * バックエンドの `policy_versions.py` に定義された現行バージョンと、
 * 事業者が最後に確認（同意）したバージョンを比較し、最新版の再確認が
 * 必要かどうかを判定する。
 *
 * UI 上は「確認しました」ボタンの軽い確認フローだが、データモデル上は
 * 当初の「同意」（agreement）の用語を流用している。
 * 法的根拠: 民法 548 条の 4（定型約款の変更）。適切な周知 + 継続利用
 * によって変更後の規約が適用される枠組みのため、明示的な再同意 UI は
 * 必須ではないが、ユーザーの認知を確保する目的で確認ポップアップを出す。
 */

import { useBusinessProfile } from "~/composables/useBusinessProfile";
import { useCsrf } from "~/composables/useCsrf";

export const usePolicyAgreement = () => {
  const { businessProfile, fetchBusinessProfile } = useBusinessProfile();
  const { ensureCsrf, getCsrf } = useCsrf();

  const policy = computed(() => businessProfile.value?.policy ?? null);

  // 利用規約に未確認の更新があるか
  const termsUpdateRequired = computed(() => {
    const p = policy.value;
    if (!p) return false;
    return p.terms_agreed_version !== p.terms_current_version;
  });

  // プライバシーポリシーに未確認の更新があるか
  const privacyUpdateRequired = computed(() => {
    const p = policy.value;
    if (!p) return false;
    return p.privacy_agreed_version !== p.privacy_current_version;
  });

  // 少なくとも一方の再確認が必要
  const policyUpdateRequired = computed(
    () => termsUpdateRequired.value || privacyUpdateRequired.value,
  );

  const isPolicyDialogOpen = useState("isPolicyDialogOpen", () => false);
  const openPolicyDialog = () => {
    isPolicyDialogOpen.value = true;
  };
  const closePolicyDialog = () => {
    isPolicyDialogOpen.value = false;
  };

  // 自動オープンの抑止フラグ
  //   - セッション中に 1 度だけ自動オープンさせる
  //   - 「あとで」で閉じた後はバナーから手動再オープンするまで開かない
  const hasAutoOpenedPolicyDialog = useState(
    "hasAutoOpenedPolicyDialog",
    () => false,
  );

  // 再確認 API 呼び出し
  const submitAgreement = async (): Promise<boolean> => {
    if (!import.meta.client) return false;
    const p = policy.value;
    if (!p) return false;

    const body: Record<string, string> = {};
    if (termsUpdateRequired.value) {
      body.terms_version = p.terms_current_version;
    }
    if (privacyUpdateRequired.value) {
      body.privacy_version = p.privacy_current_version;
    }
    if (Object.keys(body).length === 0) return true;

    try {
      const config = useRuntimeConfig();
      const apiBase = config.public.apiBaseUrl;
      await ensureCsrf(apiBase);

      const res = await fetch(
        `${apiBase}/api/business/profile/policy-agreement`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
          },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) return false;
      await fetchBusinessProfile();
      return true;
    } catch {
      return false;
    }
  };

  return {
    policy,
    termsUpdateRequired,
    privacyUpdateRequired,
    policyUpdateRequired,
    submitAgreement,
    isPolicyDialogOpen,
    openPolicyDialog,
    closePolicyDialog,
    hasAutoOpenedPolicyDialog,
  };
};
