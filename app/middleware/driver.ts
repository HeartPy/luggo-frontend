export default defineNuxtRouteMiddleware(async (_to) => {
  if (!import.meta.client) return;

  try {
    const { getAuthInfo } = await import("~/composables/useAuth");

    const authInfo = await getAuthInfo();

    // 認証されていない場合
    if (!authInfo.authenticated) {
      return navigateTo("/driver/login");
    }

    // 配達者でない場合はログインページにリダイレクト
    if (authInfo.user_type !== "delivery_driver") {
      return navigateTo("/driver/login");
    }
  }
  catch (error) {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error("Driver middleware error:", error);
    }
    return navigateTo("/driver/login");
  }
});
