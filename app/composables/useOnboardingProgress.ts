/**
 * 事業者ダッシュボードのオンボーディング進捗を一元管理する composable
 *
 * 進捗の順序:
 *   1. 料金の設定（pricing）
 *   2. 事業の設定（business-settings）
 *   3. ユーザーへの公開情報表示の同意（consent）
 *   4. 決済情報の設定（stripe）
 *
 * 各ステップのクリア条件は requirement に従う:
 *   - pricing: 集荷地域 1 つ以上 + いずれかの配達地域に料金 1 つ以上記載
 *   - business-settings: 1 日の最大荷物個数が 1 以上
 *   - consent: 同意 API 経由で public_info_consent_at が記録済み
 *   - stripe: 別 composable（useOnboardingBar）が判定する
 */

import { useBusinessProfile } from "~/composables/useBusinessProfile";
import { useCsrf } from "~/composables/useCsrf";

export type OnboardingStep =
  | "pricing"
  | "business-settings"
  | "consent"
  | "stripe"
  | "done";

export const useOnboardingProgress = () => {
  const { businessProfile, fetchBusinessProfile } = useBusinessProfile();
  const { ensureCsrf, getCsrf } = useCsrf();

  // 料金設定: いずれかの県でいずれかの荷物タイプに料金が登録されている
  // pricing_rules はバックエンドで配達可 & 最低料金以上の県のみ保存されるため、
  // 「キーが1つでも存在する」= 「料金が記載された配達地域が存在する」と判定できる
  const pricingHasAnyPrice = computed(() => {
    const rules = businessProfile.value?.pricing_rules ?? {};
    return Object.values(rules).some(
      (prefRules) => Object.keys(prefRules ?? {}).length > 0,
    );
  });

  // 料金設定: 集荷地域を1つ以上選択している
  const pricingHasPickupArea = computed(
    () => (businessProfile.value?.service_areas?.length ?? 0) >= 1,
  );

  // 料金設定全体がクリア
  const pricingCleared = computed(
    () => pricingHasAnyPrice.value && pricingHasPickupArea.value,
  );

  // 事業設定: 1日の最大荷物個数が設定済みであること
  //   - -1 = 制限なし（クリア扱い）
  //   -  0 = 予約不可（未設定扱い／クリアしない）
  //   -  1+ = 上限値（クリア扱い）
  const businessSettingsCleared = computed(() => {
    const max = businessProfile.value?.daily_max_luggage;
    if (max === undefined || max === null) return false;
    return max === -1 || max >= 1;
  });

  // 公開情報（特商法/プライバシー）表示の同意済みかどうか
  const consentGiven = computed(
    () => !!businessProfile.value?.public_info_consent_at,
  );

  // 次にすべきステップ（stripe は別 composable が判定）
  const preStripeNextStep = computed<
    "pricing" | "business-settings" | "consent" | "done-pre-stripe"
  >(() => {
    if (!pricingCleared.value) return "pricing";
    if (!businessSettingsCleared.value) return "business-settings";
    if (!consentGiven.value) return "consent";
    return "done-pre-stripe";
  });

  // 同意ポップアップの開閉状態
  const isConsentPopupOpen = useState("isConsentPopupOpen", () => false);
  const openConsentPopup = () => {
    isConsentPopupOpen.value = true;
  };
  const closeConsentPopup = () => {
    isConsentPopupOpen.value = false;
  };

  // 自動オープンの抑止フラグ（料金設定と事業設定が完了後、初回の 1 回のみ開く）
  // 自動オープンの watch は PublicInfoConsentPopup にのみ置く（複数コンポーネントから呼ばれてもポップアップが重複表示されないため）
  const hasAutoOpenedConsent = useState(
    "hasAutoOpenedConsentPopup",
    () => false,
  );

  // 同意 API 呼び出し
  const submitConsent = async (): Promise<boolean> => {
    if (!import.meta.client) return false;
    try {
      const config = useRuntimeConfig();
      const apiBase = config.public.apiBaseUrl;
      await ensureCsrf(apiBase);

      const res = await fetch(
        `${apiBase}/api/business/profile/public-info-consent`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
          },
        },
      );

      if (!res.ok) return false;
      // 同意を反映するため最新のプロフィールを再取得
      await fetchBusinessProfile();
      return true;
    } catch {
      return false;
    }
  };

  return {
    pricingHasAnyPrice,
    pricingHasPickupArea,
    pricingCleared,
    businessSettingsCleared,
    consentGiven,
    preStripeNextStep,
    isConsentPopupOpen,
    hasAutoOpenedConsent,
    openConsentPopup,
    closeConsentPopup,
    submitConsent,
  };
};
