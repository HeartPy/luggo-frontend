import { createI18n } from "vue-i18n";
import ja from "../locales/ja.json";
import en from "../locales/en.json";

export default defineNuxtPlugin((nuxtApp) => {
  const detectLanguage = () => {
    if (nuxtApp.ssrContext) {
      // サーバーサイドでの言語検出（正しくURLから取得）
      const url: string = nuxtApp.ssrContext.event?.node?.req?.url ?? "/";
      const parts = url.split("/");
      const lang: string = parts[1] ?? "";
      return ["en"].includes(lang) ? "en" : "ja";
    }
    else {
      // クライアントサイドでの言語検出
      const path: string = window?.location?.pathname ?? "/";
      const parts = path.split("/");
      const lang: string = parts[1] ?? "";
      return ["en"].includes(lang) ? "en" : "ja";
    }
  };

  const currentLocale = detectLanguage() || "ja";

  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: currentLocale,
    fallbackLocale: "ja",
    messages: {
      ja,
      en,
    },
  });

  nuxtApp.vueApp.use(i18n);
});
