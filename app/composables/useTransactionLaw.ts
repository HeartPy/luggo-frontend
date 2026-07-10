import { useI18n } from "vue-i18n";
import { useAppLocale } from "~/composables/useLocale";

export type TransactionLawItem = {
  id: number;
  key: string;
  ttl: string;
  txt: string;
};

type TransactionLawData = {
  company_name: string;
  representative_name: string;
  address: string;
  support_email: string;
  support_phone: string;
  pricing_rules: Record<string, Record<string, number>>;
  operating_days: string;
  nth_weekday_holidays: string[];
  temporary_closures: string[];
};

const LUGGAGE_TYPE_KEYS: Record<string, string> = {
  cabin: "luggageTypes.cabinShort",
  checked: "luggageTypes.checkedShort",
  oversize: "luggageTypes.oversizeShort",
};

// ホスト名またはクエリから事業者のサブドメインを取得
const resolveSubdomain = (): string | null => {
  if (import.meta.server) return null;
  const host = window.location.hostname;
  const parts = host.split(".");
  if (parts.length >= 3 && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return parts[0] || null;
  }
  const params = new URLSearchParams(window.location.search);
  return params.get("subdomain");
};

// 事業者の特定商取引法に基づく表記データを取得し、表示項目一覧に整形
// 特商法ページと予約内容確認ページの双方で利用
export const useTransactionLaw = () => {
  const { t, locale } = useI18n();
  const { bcp47Locale } = useAppLocale();

  const isLoading = ref(true);
  const fetchErr = ref("");
  const lawData = ref<TransactionLawData | null>(null);

  const sep = () => t("common.listSeparator");

  // 都道府県・荷物サイズ別の配送料金を HTML リストに変換
  const buildPricingHtml = (rules: Record<string, Record<string, number>>): string => {
    if (!rules || Object.keys(rules).length === 0) return t("law.pricingEmpty");

    const items = Object.entries(rules)
      .map(([code, prices]) => {
        const prefName = t(`prefectures.${code}`) !== `prefectures.${code}`
          ? t(`prefectures.${code}`)
          : code;
        const priceLines = Object.entries(prices)
          .map(([key, val]) => {
            const labelKey = LUGGAGE_TYPE_KEYS[key];
            const label = labelKey ? t(labelKey) : key;
            return `${label}：¥${val.toLocaleString()}`;
          })
          .join(sep());
        return `<li><span class="font-semibold">${prefName}</span><br /><span class="text-gray-600">${priceLines}</span></li>`;
      })
      .join("");
    return `<ul class="ml-4 list-disc space-y-2" role="list">${items}</ul><p class="mt-2 text-xs text-gray-600">${t("law.pricingTaxNote")}</p>`;
  };

  // 現在のロケールでの曜日名（月曜=0 ... 日曜=6）
  const weekdayName = (weekdayIndex: number): string => {
    // 2024-01-01 は月曜日
    const base = new Date(Date.UTC(2024, 0, 1 + weekdayIndex));
    return new Intl.DateTimeFormat(bcp47Locale.value, {
      weekday: "long",
      timeZone: "UTC",
    }).format(base);
  };

  // ISO日付（YYYY-MM-DD）を現在のロケールの「日付（曜日）」表記に変換
  const formatClosureDate = (iso: string): string => {
    const [year, month, day] = iso.split("-").map(Number);
    if (!year || !month || !day) return iso;
    const dt = new Date(Date.UTC(year, month - 1, day));
    return new Intl.DateTimeFormat(bcp47Locale.value, {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
      timeZone: "UTC",
    }).format(dt);
  };

  // 第N週曜日定休（例: "2-3"）を「第2木曜日」等のロケール別表記に変換
  const formatNthWeekdayHolidays = (entries: string[]): string => {
    return entries
      .map((entry) => {
        const parts = entry.split("-");
        const nth = Number(parts[0]);
        const weekday = Number(parts[1]);
        return t("law.nthWeekday", {
          nth: t(`law.ordinals.${nth}`),
          weekday: weekdayName(weekday),
        });
      })
      .join(sep());
  };

  // 営業日・定休日・臨時休業日から集荷・配送日の説明 HTML を組み立て
  const buildScheduleHtml = (
    operatingDays: string,
    nthWeekdayHolidays: string[],
    temporaryClosures: string[],
  ): string => {
    const parts: string[] = [];
    parts.push(`<p class="mb-2">${t("law.scheduleIntro")}</p>`);

    const holidays: string[] = [];
    if (operatingDays.length === 7) {
      for (let i = 0; i < 7; i++) {
        if (operatingDays[i] === "0") holidays.push(weekdayName(i));
      }
    }

    const validNwh = (nthWeekdayHolidays ?? []).filter(entry => /^[1-4]-[0-6]$/.test(entry));

    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const futureClosures = temporaryClosures.filter(date => date >= todayIso).sort();

    const listItems: string[] = [];
    const regularHolidayParts: string[] = [];
    if (holidays.length > 0) {
      regularHolidayParts.push(holidays.join(sep()));
    }
    if (validNwh.length > 0) {
      regularHolidayParts.push(formatNthWeekdayHolidays(validNwh));
    }
    if (regularHolidayParts.length > 0) {
      listItems.push(
        `<li><span class="font-semibold">${t("law.regularHoliday")}</span><br /><span class="text-gray-600">${regularHolidayParts.join(sep())}</span></li>`,
      );
    }
    if (futureClosures.length > 0) {
      const closureList = futureClosures.map(date => formatClosureDate(date)).join(sep());
      listItems.push(
        `<li><span class="font-semibold">${t("law.tempClosure")}</span><br /><span class="text-gray-600">${closureList}</span></li>`,
      );
    }

    if (listItems.length > 0) {
      parts.push(`<ul class="ml-4 list-disc space-y-2" role="list">${listItems.join("")}</ul>`);
    }

    const hasAny = holidays.length > 0 || validNwh.length > 0 || futureClosures.length > 0;
    if (hasAny) {
      parts.push(
        `<p class="mt-2 text-xs text-gray-600">${t("law.scheduleNote")}</p>`,
      );
    }

    return parts.join("");
  };

  // お問い合わせ先（メールアドレス・電話番号）を HTML に変換
  const buildContactHtml = (email: string, phone: string): string => {
    const lines: string[] = [];
    if (email) {
      lines.push(
        `${t("law.contactEmail")}<a class="text-[#0f83fd]" href="mailto:${email}">${email}</a>`,
      );
    }
    if (phone) {
      lines.push(`${t("law.contactPhone")}${phone}`);
    }
    if (lines.length === 0) return t("common.dash");
    return lines.join("<br />");
  };

  // お取り扱いできないお荷物の固定リストを HTML に変換
  const buildProhibitedHtml = (): string => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8]
      .map((id) => {
        const type = t(`prohibited.i${id}.type`);
        const detail = t(`prohibited.i${id}.items`);
        const detailHtml = detail
          ? `<br /><span class="text-gray-600">${detail}</span>`
          : "";
        return `<li><span class="font-semibold">${type}</span>${detailHtml}</li>`;
      })
      .join("");
    return `<ul class="ml-4 list-disc space-y-2" role="list">${items}</ul>`;
  };

  const buildCancellationHtml = (): string => {
    const items = [1, 2, 3]
      .map(id => `<li role='listitem'>${t(`law.cancellationItems.i${id}`)}</li>`)
      .join("");
    return `<ul class='ml-4 list-disc space-y-1' role='list'>${items}</ul>`;
  };

  // API取得データと固定文言から、特商法表記の表示項目一覧を生成
  const transactionLawItems = computed<TransactionLawItem[]>(() => {
    void locale.value;
    const data = lawData.value;
    if (!data) return [];

    const dash = t("common.dash");

    return [
      {
        id: 1,
        key: "business",
        ttl: t("law.items.business"),
        txt: data.company_name || dash,
      },
      {
        id: 2,
        key: "representative",
        ttl: t("law.items.representative"),
        txt: data.representative_name || dash,
      },
      {
        id: 3,
        key: "address",
        ttl: t("law.items.address"),
        txt: data.address || dash,
      },
      {
        id: 4,
        key: "contact",
        ttl: t("law.items.contact"),
        txt: buildContactHtml(data.support_email, data.support_phone),
      },
      {
        id: 5,
        key: "pricing",
        ttl: t("law.items.pricing"),
        txt: buildPricingHtml(data.pricing_rules),
      },
      {
        id: 6,
        key: "handling",
        ttl: t("law.items.handling"),
        txt: t("law.handlingText"),
      },
      {
        id: 7,
        key: "deliveryTime",
        ttl: t("law.items.deliveryTime"),
        txt: t("law.deliveryTimeText"),
      },
      {
        id: 8,
        key: "prohibited",
        ttl: t("law.items.prohibited"),
        txt: buildProhibitedHtml(),
      },
      {
        id: 9,
        key: "schedule",
        ttl: t("law.items.schedule"),
        txt: buildScheduleHtml(
          data.operating_days ?? "1111111",
          data.nth_weekday_holidays ?? [],
          data.temporary_closures ?? [],
        ),
      },
      {
        id: 10,
        key: "payment",
        ttl: t("law.items.payment"),
        txt: t("law.paymentText"),
      },
      {
        id: 11,
        key: "cancellation",
        ttl: t("law.items.cancellation"),
        txt: buildCancellationHtml(),
      },
    ];
  });

  // サブドメインに紐づく特商法表記データを API から取得
  onMounted(async () => {
    try {
      const subdomain = resolveSubdomain();
      if (!subdomain) {
        fetchErr.value = t("law.businessFetchFailed");
        return;
      }

      const config = useRuntimeConfig();
      const apiBase = config.public.apiBaseUrl;
      const res = await fetch(
        `${apiBase}/api/business/subdomain/transaction-law?subdomain=${encodeURIComponent(subdomain)}`,
        { method: "GET", credentials: "include" },
      );

      if (!res.ok) {
        fetchErr.value = t("law.loadFailed");
        return;
      }

      lawData.value = await res.json();
    }
    catch {
      fetchErr.value = t("law.loadFailed");
    }
    finally {
      isLoading.value = false;
    }
  });

  return {
    isLoading,
    fetchErr,
    transactionLawItems,
  };
};
