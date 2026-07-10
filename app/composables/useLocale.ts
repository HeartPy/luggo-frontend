import { useI18n } from "vue-i18n";
import {
  LOCALE_COOKIE_KEY,
  SUPPORTED_LOCALES,
  type AppLocale,
} from "~/plugins/i18n";

// アプリ内ロケールと各種外部サービス向けロケールコードの対応
const BCP47_MAP: Record<AppLocale, string> = {
  "ja": "ja-JP",
  "en": "en-US",
  "zh-Hans": "zh-CN",
  "zh-Hant": "zh-TW",
};

// Google Places API の languageCode
const GOOGLE_LANG_MAP: Record<AppLocale, string> = {
  "ja": "ja",
  "en": "en",
  "zh-Hans": "zh-CN",
  "zh-Hant": "zh-TW",
};

// Stripe Elements の locale
const STRIPE_LOCALE_MAP: Record<AppLocale, string> = {
  "ja": "ja",
  "en": "en",
  "zh-Hans": "zh",
  "zh-Hant": "zh-TW",
};

// 表示言語ごとのフォント（Google Fonts）
const FONT_FAMILY_MAP: Record<AppLocale, string> = {
  "ja": "Noto Sans JP",
  "en": "Noto Sans JP",
  "zh-Hans": "Noto Sans SC",
  "zh-Hant": "Noto Sans TC",
};

const isSupportedLocale = (value: unknown): value is AppLocale =>
  typeof value === "string"
  && (SUPPORTED_LOCALES as readonly string[]).includes(value);

export const useAppLocale = () => {
  const { locale } = useI18n();

  const currentLocale = computed<AppLocale>(() =>
    isSupportedLocale(locale.value) ? locale.value : "ja",
  );

  const setLocale = (value: string): void => {
    const next: AppLocale = isSupportedLocale(value) ? value : "ja";
    locale.value = next;
    const localeCookie = useCookie<string | null>(LOCALE_COOKIE_KEY, {
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    localeCookie.value = next;
  };

  // <html lang> や Intl API に渡す BCP47 ロケール
  const bcp47Locale = computed(() => BCP47_MAP[currentLocale.value]);

  // Google Places API の languageCode
  const googleLangCode = computed(() => GOOGLE_LANG_MAP[currentLocale.value]);

  // Stripe Elements の locale
  const stripeLocale = computed(() => STRIPE_LOCALE_MAP[currentLocale.value]);

  // フォント（Google Fonts）
  const bodyFontFamily = computed(() => FONT_FAMILY_MAP[currentLocale.value]);

  // YYYY-MM-DD を現在のロケールで長い日付表記に変換
  const formatLocalizedDate = (dateString: string): string => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-").map(Number);
    if (!year || !month || !day) return dateString;
    const date = new Date(Date.UTC(year, month - 1, day));
    return new Intl.DateTimeFormat(bcp47Locale.value, {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);
  };

  // 国コード（ISO alpha-2）を現在のロケールの国名に変換
  const countryName = (code: string): string => {
    if (!code) return "";
    try {
      const displayNames = new Intl.DisplayNames([bcp47Locale.value], {
        type: "region",
      });
      return displayNames.of(code.toUpperCase()) || code;
    }
    catch {
      return code;
    }
  };

  return {
    currentLocale,
    setLocale,
    bcp47Locale,
    googleLangCode,
    stripeLocale,
    bodyFontFamily,
    formatLocalizedDate,
    countryName,
  };
};
