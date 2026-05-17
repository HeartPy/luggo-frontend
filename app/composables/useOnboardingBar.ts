import { useBusinessProfile } from "~/composables/useBusinessProfile";
import { useCsrf } from "~/composables/useCsrf";
import { useOnboardingProgress } from "~/composables/useOnboardingProgress";

type Requirements = {
  currently_due: string[];
  eventually_due: string[];
  past_due: string[];
};

export type OnboardingBarStep =
  | "pricing" // 料金の設定が未完了
  | "business-settings" // 事業の設定が未完了
  | "consent" // 公開情報の同意が未完了
  | "stripe-create" // Stripe アカウント未作成
  | "stripe-review" // Stripe 審査中
  | "stripe-past-due"; // Stripe 審査不合格 / 再入力要

let loadPromise: Promise<void> | null = null;

export function useOnboardingBar() {
  const { businessProfile, fetchBusinessProfile } = useBusinessProfile();
  const { ensureCsrf, getCsrf } = useCsrf();

  const {
    pricingCleared,
    businessSettingsCleared,
    consentGiven,
    openConsentPopup,
  } = useOnboardingProgress();

  const isResolving = useState("onboardingBarResolving", () => true);
  const isUnderReview = useState("onboardingBarUnderReview", () => false);
  const hasPastDue = useState("onboardingBarPastDue", () => false);

  // Stripeアカウントの審査状態を取得
  const fetchAccountRequirements = async (): Promise<Requirements | null> => {
    try {
      const config = useRuntimeConfig();
      const apiBase = config.public.apiBaseUrl;
      await ensureCsrf(apiBase);

      const res = await fetch(
        `${apiBase}/api/business/stripe/custom/requirements`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
          },
        },
      );

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return {
        currently_due: data.currently_due || [],
        eventually_due: data.eventually_due || [],
        past_due: data.past_due || [],
      };
    } catch {
      return null;
    }
  };

  const ensureLoaded = (): Promise<void> => {
    if (!import.meta.client) {
      return Promise.resolve();
    }

    if (loadPromise) {
      return loadPromise;
    }

    loadPromise = (async () => {
      // プロフィール情報と審査状態を取得
      await fetchBusinessProfile();

      // Stripeアカウントが存在する場合のみ審査状態を確認
      if (businessProfile.value?.has_stripe_account) {
        try {
          const requirements = await fetchAccountRequirements();
          if (requirements) {
            // past_dueが空でない場合は審査不合格
            hasPastDue.value = requirements.past_due.length > 0;
            // currently_dueが空でない場合は審査中（past_dueがない場合のみ）
            isUnderReview.value =
              requirements.currently_due.length > 0 && !hasPastDue.value;
          }
        } catch {
          // エラー時は審査中とみなす
          isUnderReview.value = true;
          hasPastDue.value = false;
        }
      }

      isResolving.value = false;
    })();

    return loadPromise;
  };

  onMounted(() => {
    void ensureLoaded();
  });

  // Stripe 自体（アカウント作成 + 審査）が完了しているか
  const stripeCleared = computed(() => {
    if (!businessProfile.value?.has_stripe_account) return false;
    return !isUnderReview.value && !hasPastDue.value;
  });

  // 現在表示すべきステップ
  // 未完了がなければ null
  const currentStep = computed<OnboardingBarStep | null>(() => {
    if (isResolving.value) return null;

    if (!pricingCleared.value) return "pricing";
    if (!businessSettingsCleared.value) return "business-settings";
    if (!consentGiven.value) return "consent";
    if (!businessProfile.value?.has_stripe_account) return "stripe-create";
    if (hasPastDue.value) return "stripe-past-due";
    if (isUnderReview.value) return "stripe-review";

    return null;
  });

  const shouldShowBar = computed(() => currentStep.value !== null);

  const messageText = computed(() => {
    switch (currentStep.value) {
      case "pricing":
        return "まずは料金の設定を行なってください。";
      case "business-settings":
        return "次に事業の設定を行なってください。";
      case "consent":
        return "ユーザーへの公開情報の表示について同意してください。";
      case "stripe-create":
        return "決済についての設定を行なってください。";
      case "stripe-review":
        return "ただいま決済情報の審査中です。審査完了までお待ちください。";
      case "stripe-past-due":
        return "再度入力情報をお確かめのうえ、決済の設定を行なってください。";
      default:
        return "";
    }
  });

  // バーの背景色とテキスト色
  // 審査中だけ黄色、それ以外は赤
  const barClass = computed(() => {
    if (currentStep.value === "stripe-review") {
      return "bg-yellow-100 text-yellow-800";
    }
    return "bg-red-100 text-red-800";
  });

  // バーがクリック不可になるかどうか
  // - 審査中はクリック不可
  // - consent はクリックでポップアップを開く処理を行うため linkable === false
  const isLinkable = computed(() => {
    return (
      currentStep.value !== "stripe-review" && currentStep.value !== "consent"
    );
  });

  // バーのリンク先
  const linkTo = computed<string | undefined>(() => {
    switch (currentStep.value) {
      case "pricing":
        return "/business-owner/dashboard/pricing-settings";
      case "business-settings":
        return "/business-owner/dashboard/business-settings";
      case "stripe-create":
      case "stripe-past-due":
        return "/stripe/account";
      default:
        return undefined;
    }
  });

  // クリックハンドラー
  const handleBarClick = () => {
    if (currentStep.value === "consent") {
      openConsentPopup();
    }
  };

  return {
    shouldShowBar,
    messageText,
    barClass,
    isUnderReview: readonly(isUnderReview),
    hasPastDue: readonly(hasPastDue),
    currentStep,
    isLinkable,
    linkTo,
    handleBarClick,
    stripeCleared,
  };
}
