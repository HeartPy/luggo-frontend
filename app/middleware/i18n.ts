import { useI18n } from "vue-i18n";

export default defineNuxtRouteMiddleware((to) => {
  const i18n = useI18n();
  let locale = "ja";

  // 空のパスの場合は/にリダイレクト
  if (to.fullPath === "") {
    return navigateTo("/");
  }

  // パスから言語を判断
  if (to.path.startsWith("/en/")) {
    locale = "en";
  }
  else if (to.params.lang) {
    // 無効な言語コードの場合はルートにリダイレクト
    const invalidLocale = to.params.lang as string;
    if (invalidLocale !== "en") {
      const newPath = to.fullPath.replace(/^\/[^/]+\//, "/");
      return navigateTo(newPath);
    }
  }

  // 言語設定を更新
  i18n.locale.value = locale;
});
