import { createI18n } from "vue-i18n";
import ja from "../locales/ja.json";
import en from "../locales/en.json";
import zhHans from "../locales/zh-Hans.json";
import zhHant from "../locales/zh-Hant.json";

export const SUPPORTED_LOCALES = ["ja", "en", "zh-Hans", "zh-Hant"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_COOKIE_KEY = "luggo_locale";

const isSupportedLocale = (value: unknown): value is AppLocale =>
  typeof value === "string"
  && (SUPPORTED_LOCALES as readonly string[]).includes(value);

export default defineNuxtPlugin((nuxtApp) => {
  // Cookie に保存されたロケールを SSR/CSR の双方で参照する
  const localeCookie = useCookie<string | null>(LOCALE_COOKIE_KEY, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const currentLocale: AppLocale = isSupportedLocale(localeCookie.value)
    ? localeCookie.value
    : "ja";

  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: currentLocale,
    fallbackLocale: "ja",
    messages: {
      "ja": ja,
      "en": en,
      "zh-Hans": zhHans,
      "zh-Hant": zhHant,
    },
  });

  nuxtApp.vueApp.use(i18n);
});
