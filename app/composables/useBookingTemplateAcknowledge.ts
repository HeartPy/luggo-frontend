/**
 * 予約サイトのテンプレート（プラットフォーム側で管理する静的部分）の
 * 変更確認状態を扱う composable。
 *
 * 対象ページ:
 *   - /booking/transaction-law（特定商取引法に基づく表記）
 *   - /booking/privacy（プライバシーポリシー）
 *
 * 仕組み:
 *   バックエンドの policy_versions.py で現行バージョンを管理し、
 *   事業者ごとに最後に確認したバージョンを保存する。両者が一致しない場合、
 *   ログイン後に確認ポップアップを出す。
 *
 * 初回同意（public-info-consent）と異なりソフトブロック:
 *   未確認でも事業者ダッシュボード・予約サイトの表示・操作は止めない。
 */

import { useBusinessProfile } from "~/composables/useBusinessProfile";
import { useCsrf } from "~/composables/useCsrf";

export const useBookingTemplateAcknowledge = () => {
  const { businessProfile, fetchBusinessProfile } = useBusinessProfile();
  const { ensureCsrf, getCsrf } = useCsrf();

  const bookingTemplate = computed(
    () => businessProfile.value?.booking_template ?? null,
  );

  // 特商法テンプレートに未確認の更新があるか
  // プロフィール未取得中・初回同意前は false（誤検知を避ける）
  const transactionLawUpdateRequired = computed(() => {
    const bp = businessProfile.value;
    if (!bp) return false;
    if (!bp.public_info_consent_at) return false;
    const bookingTemp = bookingTemplate.value;
    if (!bookingTemp) return false;
    return (
      bookingTemp.transaction_law_acknowledged_version !==
      bookingTemp.transaction_law_current_version
    );
  });

  // プライバシーポリシーテンプレートに未確認の更新があるか
  const privacyUpdateRequired = computed(() => {
    const bp = businessProfile.value;
    if (!bp) return false;
    if (!bp.public_info_consent_at) return false;
    const bookingTemp = bookingTemplate.value;
    if (!bookingTemp) return false;
    return (
      bookingTemp.privacy_acknowledged_version !==
      bookingTemp.privacy_current_version
    );
  });

  // 少なくとも一方の再確認が必要
  const bookingTemplateUpdateRequired = computed(
    () => transactionLawUpdateRequired.value || privacyUpdateRequired.value,
  );

  const isBookingTemplateDialogOpen = useState(
    "isBookingTemplateDialogOpen",
    () => false,
  );
  const openBookingTemplateDialog = () => {
    isBookingTemplateDialogOpen.value = true;
  };
  const closeBookingTemplateDialog = () => {
    isBookingTemplateDialogOpen.value = false;
  };

  // 自動オープンの抑止フラグ
  //   - セッション中に 1 度だけ自動オープンさせる
  //   - 「あとで」で閉じた後はバナーから手動再オープンするまで開かない
  const hasAutoOpenedBookingTemplateDialog = useState(
    "hasAutoOpenedBookingTemplateDialog",
    () => false,
  );

  // 再確認 API 呼び出し
  const submitAcknowledge = async (): Promise<boolean> => {
    if (!import.meta.client) return false;
    const bookingTemp = bookingTemplate.value;
    if (!bookingTemp) return false;

    const body: Record<string, string> = {};
    if (transactionLawUpdateRequired.value) {
      body.transaction_law_version =
        bookingTemp.transaction_law_current_version;
    }
    if (privacyUpdateRequired.value) {
      body.privacy_version = bookingTemp.privacy_current_version;
    }
    if (Object.keys(body).length === 0) return true;

    try {
      const config = useRuntimeConfig();
      const apiBase = config.public.apiBaseUrl;
      await ensureCsrf(apiBase);

      const res = await fetch(
        `${apiBase}/api/business/profile/booking-template-acknowledge`,
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
    bookingTemplate,
    transactionLawUpdateRequired,
    privacyUpdateRequired,
    bookingTemplateUpdateRequired,
    submitAcknowledge,
    isBookingTemplateDialogOpen,
    openBookingTemplateDialog,
    closeBookingTemplateDialog,
    hasAutoOpenedBookingTemplateDialog,
  };
};
