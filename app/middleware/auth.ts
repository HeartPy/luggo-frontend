export default defineNuxtRouteMiddleware(async (_to) => {
  if (!import.meta.client) return;

  const { checkAuthentication } = await import("~/composables/useAuth");

  const isAuthenticated = await checkAuthentication();

  if (!isAuthenticated) {
    // ログインページにリダイレクト
    return navigateTo("/account/login");
  }
});
