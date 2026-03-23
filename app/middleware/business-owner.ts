export default defineNuxtRouteMiddleware(async (_to) => {
  if (!import.meta.client) return;

  try {
    const { getAuthInfo } = await import("~/composables/useAuth");

    const authInfo = await getAuthInfo();

    // 認証されていない場合
    if (!authInfo.authenticated) {
      return navigateTo("/account/login");
    }

    // 事業者でない場合はログインページにリダイレクト
    if (authInfo.user_type !== "business_owner") {
      return navigateTo("/account/login");
    }
  }
  catch (error) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Business owner middleware error:", error);
    }
    return navigateTo("/account/login");
  }
});
