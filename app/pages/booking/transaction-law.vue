<template>
  <div class="min-h-screen">
    <div class="bg-white px-4 py-20">
      <div class="mx-auto max-w-4xl">
        <main
          aria-label="特定商取引法に基づく表記"
          :aria-busy="isLoading"
        >
          <div
            v-if="isLoading"
            role="status"
            aria-live="polite"
            aria-busy="true"
            class="py-8"
          >
            <CommonAtomsLoadingAnimation
              size="md"
              aria-hidden="true"
            />
            <p class="sr-only">
              特定商取引法に基づく表記を読み込んでいます
            </p>
          </div>

          <div
            v-else-if="fetchErr"
            role="alert"
            aria-live="assertive"
            class="py-8 text-center text-red-600"
          >
            {{ fetchErr }}
          </div>

          <article
            v-else
            aria-labelledby="transaction-law-title"
          >
            <h1
              id="transaction-law-title"
              class="relative mb-8 text-2xl font-bold tracking-wide after:absolute after:-bottom-2 after:left-0 after:h-[1px] after:w-full after:bg-gray-600 after:content-['']"
            >
              特定商取引法に基づく表記
            </h1>
            <ul
              class="grid gap-8"
              role="list"
              aria-label="表記項目一覧"
            >
              <li
                v-for="item in transactionLawItems"
                :key="item.id"
                role="listitem"
              >
                <section
                  :aria-labelledby="`transaction-law-item-${item.id}-title`"
                >
                  <h2
                    :id="`transaction-law-item-${item.id}-title`"
                    class="mb-2 text-sm font-bold"
                  >
                    {{ item.ttl }}
                  </h2>
                  <div
                    class="text-sm"
                    v-html="item.txt"
                  />
                </section>
              </li>
            </ul>
          </article>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "customer",
  middleware: "subdomain",
});

type TransactionLawItem = {
  id: number;
  ttl: string;
  txt: string;
};

type TransactionLawData = {
  company_name: string;
  representative_name: string;
  address: string;
  support_email: string;
  pricing_rules: Record<string, Record<string, number>>;
  operating_days: string;
  nth_weekday_holidays: string[];
  temporary_closures: string[];
};

const LUGGAGE_TYPE_LABELS: Record<string, string> = {
  cabin: "機内持ち込みサイズ",
  checked: "受託手荷物サイズ",
  oversize: "規格外サイズ",
};

const ALL_PREFECTURES: Record<string, string> = {
  "01": "北海道",
  "02": "青森県",
  "03": "岩手県",
  "04": "宮城県",
  "05": "秋田県",
  "06": "山形県",
  "07": "福島県",
  "08": "茨城県",
  "09": "栃木県",
  "10": "群馬県",
  "11": "埼玉県",
  "12": "千葉県",
  "13": "東京都",
  "14": "神奈川県",
  "15": "新潟県",
  "16": "富山県",
  "17": "石川県",
  "18": "福井県",
  "19": "山梨県",
  "20": "長野県",
  "21": "岐阜県",
  "22": "静岡県",
  "23": "愛知県",
  "24": "三重県",
  "25": "滋賀県",
  "26": "京都府",
  "27": "大阪府",
  "28": "兵庫県",
  "29": "奈良県",
  "30": "和歌山県",
  "31": "鳥取県",
  "32": "島根県",
  "33": "岡山県",
  "34": "広島県",
  "35": "山口県",
  "36": "徳島県",
  "37": "香川県",
  "38": "愛媛県",
  "39": "高知県",
  "40": "福岡県",
  "41": "佐賀県",
  "42": "長崎県",
  "43": "熊本県",
  "44": "大分県",
  "45": "宮崎県",
  "46": "鹿児島県",
  "47": "沖縄県",
};

type ProhibitedItem = {
  id: number;
  type: string;
  items?: string;
};

const prohibitedItems: ProhibitedItem[] = [
  {
    id: 1,
    type: "危険物",
    items:
      "ガスボンベ・スプレー缶、可燃性液体（ガソリン・灯油）、火薬・花火、バッテリー（大容量リチウム電池など）",
  },
  {
    id: 2,
    type: "高価品・貴重品",
    items: "現金、クレジットカード、宝石・貴金属、高級時計、美術品",
  },
  {
    id: 3,
    type: "個人情報・重要書類",
    items: "パスポート、契約書、チケット類",
  },
  {
    id: 4,
    type: "食品・生もの",
    items: "生鮮食品、冷蔵・冷凍が必要なもの、匂いが強いもの",
  },
  { id: 5, type: "壊れやすいもの", items: "ガラス製品、精密機器" },
  {
    id: 6,
    type: "法律的に問題があるもの",
    items: "違法薬物、武器（ナイフ・銃など）、偽ブランド品",
  },
  { id: 7, type: "漏れる可能性のある液体類" },
  { id: 8, type: "1個あたり、30kgを超えるお荷物" },
];

const isLoading = ref(true);
const fetchErr = ref("");
const lawData = ref<TransactionLawData | null>(null);

// 都道府県・荷物サイズ別の配送料金を HTML リストに変換
const buildPricingHtml = (
  rules: Record<string, Record<string, number>>,
): string => {
  if (!rules || Object.keys(rules).length === 0)
    return "お問い合わせください。";

  const items = Object.entries(rules)
    .map(([code, prices]) => {
      const prefName = ALL_PREFECTURES[code] ?? code;
      const priceLines = Object.entries(prices)
        .map(([key, val]) => {
          const label = LUGGAGE_TYPE_LABELS[key] ?? key;
          return `${label}：¥${val.toLocaleString()}`;
        })
        .join("、");
      return `<li><span class="font-semibold">${prefName}</span><br /><span class="text-gray-600">${priceLines}</span></li>`;
    })
    .join("");
  return `<ul class="ml-4 list-disc space-y-2" role="list">${items}</ul><p class="mt-2 text-xs text-gray-600">※上記の配送料金は税込表示です。</p>`;
};

const WEEKDAY_LABELS = [
  "月曜日",
  "火曜日",
  "水曜日",
  "木曜日",
  "金曜日",
  "土曜日",
  "日曜日",
];
const WEEKDAY_SHORT = ["月", "火", "水", "木", "金", "土", "日"];
const NTH_LABELS = ["第1", "第2", "第3", "第4"];

// ISO日付（YYYY-MM-DD）を「2026年5月25日（月）」形式に変換
const formatDateJa = (iso: string): string => {
  const [year, month, day] = iso.split("-");
  const dt = new Date(Number(year), Number(month) - 1, Number(day));
  const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][dt.getDay()];
  return `${year}年${Number(month)}月${Number(day)}日（${dayOfWeek}）`;
};

// 第N週曜日定休（例: "2-3"）を「第2木曜日」形式の文字列に変換
const formatNthWeekdayHolidays = (entries: string[]): string => {
  return entries
    .map((entry) => {
      const parts = entry.split("-");
      const nth = Number(parts[0]);
      const weekday = Number(parts[1]);
      return `${NTH_LABELS[nth - 1]}${WEEKDAY_SHORT[weekday]}曜日`;
    })
    .join("、");
};

// 営業日・定休日・臨時休業日から集荷・配送日の説明 HTML を組み立て
const buildScheduleHtml = (
  operatingDays: string,
  nthWeekdayHolidays: string[],
  temporaryClosures: string[],
): string => {
  const parts: string[] = [];
  parts.push("<p class=\"mb-2\">お客様が指定した日に集荷・配送を行います。</p>");

  const holidays = WEEKDAY_LABELS.filter(
    (_, i) => operatingDays.length === 7 && operatingDays[i] === "0",
  );

  const validNwh = (nthWeekdayHolidays ?? []).filter(entry =>
    /^[1-4]-[0-6]$/.test(entry),
  );

  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const futureClosures = temporaryClosures
    .filter(date => date >= todayIso)
    .sort();

  const listItems: string[] = [];
  const regularHolidayParts: string[] = [];
  if (holidays.length > 0) {
    regularHolidayParts.push(holidays.join("、"));
  }
  if (validNwh.length > 0) {
    regularHolidayParts.push(formatNthWeekdayHolidays(validNwh));
  }
  if (regularHolidayParts.length > 0) {
    listItems.push(
      `<li><span class="font-semibold">定休日</span><br /><span class="text-gray-600">${regularHolidayParts.join("、")}</span></li>`,
    );
  }
  if (futureClosures.length > 0) {
    const closureList = futureClosures
      .map(date => formatDateJa(date))
      .join("、");
    listItems.push(
      `<li><span class="font-semibold">臨時休業日</span><br /><span class="text-gray-600">${closureList}</span></li>`,
    );
  }

  if (listItems.length > 0) {
    parts.push(
      `<ul class="ml-4 list-disc space-y-2" role="list">${listItems.join("")}</ul>`,
    );
  }

  const hasAny
    = holidays.length > 0 || validNwh.length > 0 || futureClosures.length > 0;
  if (hasAny) {
    parts.push(
      "<p class=\"mt-2 text-xs text-gray-600\">※定休日および臨時休業日は、集荷日・配送日として選択できません。</p>",
    );
  }

  return parts.join("");
};

// お取り扱いできないお荷物の固定リストを HTML に変換
const buildProhibitedHtml = (): string => {
  const items = prohibitedItems
    .map((prohibited) => {
      const detail = prohibited.items
        ? `<br /><span class="text-gray-600">${prohibited.items}</span>`
        : "";
      return `<li><span class="font-semibold">${prohibited.type}</span>${detail}</li>`;
    })
    .join("");
  return `<ul class="ml-4 list-disc space-y-2" role="list">${items}</ul>`;
};

// API取得データと固定文言から、特商法表記の表示項目一覧を生成
const transactionLawItems = computed<TransactionLawItem[]>(() => {
  const data = lawData.value;
  if (!data) return [];

  return [
    {
      id: 1,
      ttl: "事業者",
      txt: data.company_name || "―",
    },
    {
      id: 2,
      ttl: "事業責任者",
      txt: data.representative_name || "―",
    },
    {
      id: 3,
      ttl: "事業者の所在地",
      txt: data.address || "―",
    },
    {
      id: 4,
      ttl: "お問い合わせ先",
      txt: data.support_email || "―",
    },
    {
      id: 5,
      ttl: "配送料金",
      txt: buildPricingHtml(data.pricing_rules),
    },
    {
      id: 6,
      ttl: "配送荷物のお手続きについて",
      txt: "配送当日の午前9時までに、ホテルや旅館のフロント、もしくは駅や空港のカウンターにお荷物をお預けください。",
    },
    {
      id: 7,
      ttl: "お届け時間について",
      txt: "配送当日の20時までに、お荷物をお届けいたします。",
    },
    {
      id: 8,
      ttl: "お取り扱いできないお荷物",
      txt: buildProhibitedHtml(),
    },
    {
      id: 9,
      ttl: "集荷日・配送日について",
      txt: buildScheduleHtml(
        data.operating_days ?? "1111111",
        data.nth_weekday_holidays ?? [],
        data.temporary_closures ?? [],
      ),
    },
    {
      id: 10,
      ttl: "利用可能な決済方法",
      txt: "Apple Pay、Google Pay、クレジットカードで決済することができます。",
    },
    {
      id: 11,
      ttl: "キャンセルについて",
      txt: "<ul class='ml-4 list-disc space-y-1' role='list'><li role='listitem'>集荷日前日の22時59分までにご連絡いただいた場合：0%</li><li role='listitem'>集荷日前日の23時以降にご連絡いただいた場合：100%</li><li role='listitem'>事前連絡がなかった場合：100%</li></ul>",
    },
  ];
});

// ホスト名またはクエリから事業者のサブドメインを取得
const resolveSubdomain = (): string | null => {
  if (import.meta.server) return null;
  const host = window.location.hostname;
  const parts = host.split(".");
  if (
    parts.length >= 3
    && !host.includes("localhost")
    && !host.includes("127.0.0.1")
  ) {
    return parts[0] || null;
  }
  const params = new URLSearchParams(window.location.search);
  return params.get("subdomain");
};

// サブドメインに紐づく特商法表記データを API から取得
onMounted(async () => {
  try {
    const subdomain = resolveSubdomain();
    if (!subdomain) {
      fetchErr.value = "事業者情報を取得できませんでした。";
      return;
    }

    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;
    const res = await fetch(
      `${apiBase}/api/business/subdomain/transaction-law?subdomain=${encodeURIComponent(subdomain)}`,
      { method: "GET", credentials: "include" },
    );

    if (!res.ok) {
      fetchErr.value = "特定商取引法に基づく表記の取得に失敗しました。";
      return;
    }

    lawData.value = await res.json();
  }
  catch {
    fetchErr.value = "特定商取引法に基づく表記の取得に失敗しました。";
  }
  finally {
    isLoading.value = false;
  }
});

useHead({
  title: "特定商取引法に基づく表記",
  meta: [
    {
      name: "description",
      content: "特定商取引法に基づく表記",
    },
  ],
});
</script>
