import { useCsrf } from "~/composables/useCsrf";

/**
 * 現在ログイン中のビジネスオーナーのプロフィール情報を管理するcomposable
 */
export const useBusinessProfile = () => {
  const businessProfile = useState<{
    id: string;
    company_name: string;
    company_email: string;
    subdomain: string;
    tax_id: string;
    service_areas: string[];
    max_luggage_capacity: number;
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
  } | null>("currentBusinessProfile", () => null);

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 現在ログイン中のビジネスオーナーのプロフィール情報を取得
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
    } catch (err: unknown) {
      error.value = "データの取得に失敗しました。";

      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch business profile:", err);
      }
    } finally {
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
