import { useCsrf } from "~/composables/useCsrf";

/**
 * 現在ログイン中の事業者のプロフィール情報を管理するcomposable
 */
export const useBusinessProfile = () => {
  const businessProfile = useState<{
    id: string;
    business_type: "company" | "individual";
    company_name: string;
    company_email: string;
    phone_number: string;
    subdomain: string;
    tax_id: string;
    rep_last_name_kanji: string;
    rep_first_name_kanji: string;
    rep_last_name_kana: string;
    rep_first_name_kana: string;
    service_areas: string[];
    daily_max_luggage: number;
    operating_hours_start: string | null;
    operating_hours_end: string | null;
    operating_days: string;
    pricing_rules: Record<string, Record<string, number>>;
    total_orders_completed: number;
    total_revenue: string;
    is_approved: boolean;
    approval_date: string | null;
    is_active: boolean;
    deactivated_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    has_stripe_account: boolean;
    public_info_consent_at: string | null;
    policy: {
      terms_current_version: string;
      privacy_current_version: string;
      terms_agreed_version: string | null;
      privacy_agreed_version: string | null;
      terms_agreed_at: string | null;
      privacy_agreed_at: string | null;
    };
    booking_template: {
      transaction_law_current_version: string;
      privacy_current_version: string;
      transaction_law_acknowledged_version: string | null;
      privacy_acknowledged_version: string | null;
      transaction_law_acknowledged_at: string | null;
      privacy_acknowledged_at: string | null;
    };
  } | null>("currentBusinessProfile", () => null);

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 現在ログイン中の事業者のプロフィール情報を取得
  const fetchBusinessProfile = async (): Promise<void> => {
    if (!import.meta.client) return;

    try {
      isLoading.value = true;
      error.value = null;

      const config = useRuntimeConfig();
      const apiBase = config.public.apiBaseUrl;

      const { ensureCsrf, getCsrf } = useCsrf();
      await ensureCsrf(apiBase);

      const data = await $fetch<typeof businessProfile.value>(
        `${apiBase}/api/business/profile`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
          },
        },
      );

      businessProfile.value = data;
    }
    catch (err: unknown) {
      error.value = "データの取得に失敗しました。";

      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch business profile:", err);
      }
    }
    finally {
      isLoading.value = false;
    }
  };

  // プロフィール情報をクリア
  const clearBusinessProfile = (): void => {
    businessProfile.value = null;
    error.value = null;
  };

  return {
    businessProfile: readonly(businessProfile),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchBusinessProfile,
    clearBusinessProfile,
  };
};
