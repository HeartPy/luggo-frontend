/**
 * /stripe/account/* に到達する前のオンボーディングガード。
 *
 * Stripe アカウントの有無に関係なく、以下すべてを満たすことを要求する:
 *   1. 料金の設定がクリアしている
 *   2. 事業の設定（1日の最大荷物個数 >= 1）がクリアしている
 *   3. ユーザーへの公開情報表示について同意済み
 *
 */
export default defineNuxtRouteMiddleware(async () => {
  if (!import.meta.client) return;

  try {
    const { useBusinessProfile } =
      await import("~/composables/useBusinessProfile");
    const { useOnboardingProgress } =
      await import("~/composables/useOnboardingProgress");

    const { businessProfile, fetchBusinessProfile } = useBusinessProfile();
    if (!businessProfile.value) {
      await fetchBusinessProfile();
    }

    const { pricingCleared, businessSettingsCleared, consentGiven } =
      useOnboardingProgress();

    if (
      !pricingCleared.value ||
      !businessSettingsCleared.value ||
      !consentGiven.value
    ) {
      return navigateTo("/business-owner/dashboard", { replace: true });
    }
  } catch (error) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("stripe-prerequisite middleware error:", error);
    }
    return navigateTo("/business-owner/dashboard", { replace: true });
  }
});
