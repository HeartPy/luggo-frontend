<template>
  <div>
    <CommonAtomsLoadingAnimation v-if="isLoading" size="md" />

    <div v-else-if="error" class="p-8 text-center text-red-600">
      {{ error }}
    </div>

    <div
      v-else-if="businessProfile"
      class="mx-auto max-w-3xl space-y-10 px-6 py-8"
    >
      <!-- 基本情報 -->
      <section>
        <h2
          class="mb-4 border-b border-gray-300 pb-2 text-lg font-bold text-gray-800"
        >
          基本情報
        </h2>
        <dl class="space-y-4">
          <div class="flex items-start gap-4">
            <dt class="w-40 shrink-0 text-sm font-semibold text-gray-600">
              事業形態
            </dt>
            <dd class="text-gray-900">
              {{ businessTypeLabel }}
            </dd>
          </div>
          <div class="flex items-start gap-4">
            <dt class="w-40 shrink-0 text-sm font-semibold text-gray-600">
              {{
                businessProfile.business_type === "company" ? "会社名" : "屋号"
              }}
            </dt>
            <dd class="text-gray-900">
              {{ businessProfile.company_name || "未設定" }}
            </dd>
          </div>
          <div class="flex items-start gap-4">
            <dt class="w-40 shrink-0 text-sm font-semibold text-gray-600">
              電話番号
            </dt>
            <dd class="text-gray-900">
              {{ businessProfile.phone_number || "未設定" }}
            </dd>
          </div>
          <div class="flex items-start gap-4">
            <dt class="w-40 shrink-0 text-sm font-semibold text-gray-600">
              メールアドレス
            </dt>
            <dd class="text-gray-900">
              {{ businessProfile.company_email || "未設定" }}
            </dd>
          </div>
          <div class="flex items-start gap-4">
            <dt class="w-40 shrink-0 text-sm font-semibold text-gray-600">
              予約フォームURL
            </dt>
            <dd v-if="bookingUrl" class="flex items-center gap-2">
              <a
                v-if="isStripeVerified"
                :href="bookingUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 underline hover:text-blue-800"
              >
                {{ bookingUrl }}
              </a>
              <span v-else class="text-gray-900">
                {{ bookingUrl }}
              </span>
              <button
                type="button"
                class="shrink-0 rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
                @click="copyUrl"
              >
                {{ isCopied ? "コピー済み" : "コピー" }}
              </button>
            </dd>
            <dd v-else class="text-gray-900">未設定</dd>
          </div>
        </dl>
      </section>

      <!-- 代表者情報 -->
      <section>
        <h2
          class="mb-4 border-b border-gray-300 pb-2 text-lg font-bold text-gray-800"
        >
          代表者情報
        </h2>
        <dl class="space-y-4">
          <div class="flex items-start gap-4">
            <dt class="w-40 shrink-0 text-sm font-semibold text-gray-600">
              氏名（漢字）
            </dt>
            <dd class="text-gray-900">
              {{ repNameKanji || "未設定" }}
            </dd>
          </div>
          <div class="flex items-start gap-4">
            <dt class="w-40 shrink-0 text-sm font-semibold text-gray-600">
              氏名（カナ）
            </dt>
            <dd class="text-gray-900">
              {{ repNameKana || "未設定" }}
            </dd>
          </div>
        </dl>
      </section>

      <!-- 営業情報 -->
      <section>
        <h2
          class="mb-4 border-b border-gray-300 pb-2 text-lg font-bold text-gray-800"
        >
          営業情報
        </h2>
        <dl class="space-y-4">
          <div class="flex items-start gap-4">
            <dt class="w-40 shrink-0 text-sm font-semibold text-gray-600">
              営業日
            </dt>
            <dd class="text-gray-900">
              {{ operatingDaysLabel }}
            </dd>
          </div>
          <div class="flex items-start gap-4">
            <dt class="w-40 shrink-0 text-sm font-semibold text-gray-600">
              1日の最大荷物個数
            </dt>
            <dd class="text-gray-900">
              {{ dailyMaxLuggageLabel }}
            </dd>
          </div>
        </dl>
      </section>

      <!-- アカウント状態 -->
      <section>
        <h2
          class="mb-4 border-b border-gray-300 pb-2 text-lg font-bold text-gray-800"
        >
          アカウント状態
        </h2>
        <dl class="space-y-4">
          <div class="flex items-start gap-4">
            <dt class="w-40 shrink-0 text-sm font-semibold text-gray-600">
              決済情報の設定
            </dt>
            <dd>
              <span
                class="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                :class="
                  businessProfile.has_stripe_account
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                "
              >
                {{ businessProfile.has_stripe_account ? "設定済み" : "未設定" }}
              </span>
            </dd>
          </div>
          <div class="flex items-start gap-4">
            <dt class="w-40 shrink-0 text-sm font-semibold text-gray-600">
              アカウント状態
            </dt>
            <dd>
              <span
                class="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                :class="
                  businessProfile.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                "
              >
                {{ businessProfile.is_active ? "有効" : "無効" }}
              </span>
            </dd>
          </div>
          <div class="flex items-start gap-4">
            <dt class="w-40 shrink-0 text-sm font-semibold text-gray-600">
              登録日
            </dt>
            <dd class="text-gray-900">
              {{ formatDateTime(businessProfile.created_at) }}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBusinessProfile } from "~/composables/useBusinessProfile";
import { useCsrf } from "~/composables/useCsrf";

const { businessProfile, isLoading, error, fetchBusinessProfile } =
  useBusinessProfile();
const { ensureCsrf, getCsrf } = useCsrf();

const isStripeVerified = ref(false);
const isCopied = ref(false);

const bookingUrl = computed(() => {
  const subdomain = businessProfile.value?.subdomain;
  if (!subdomain || !import.meta.client) return null;

  const host = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;

  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    const portStr = port ? `:${port}` : "";
    return `${protocol}//${host}${portStr}/booking?subdomain=${subdomain}`;
  }

  const parts = host.split(".");
  const baseDomain = parts.length >= 3 ? parts.slice(1).join(".") : host;
  return `${protocol}//${subdomain}.${baseDomain}/booking`;
});

const checkStripeVerification = async () => {
  if (!businessProfile.value?.has_stripe_account) {
    isStripeVerified.value = false;
    return;
  }

  try {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;
    await ensureCsrf(apiBase);

    const res = await fetch(`${apiBase}/api/business/stripe/custom/account`, {
      method: "GET",
      credentials: "include",
      headers: {
        ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
      },
    });

    if (!res.ok) {
      isStripeVerified.value = false;
      return;
    }

    const data = await res.json();
    isStripeVerified.value = data.account?.charges_enabled === true;
  } catch {
    isStripeVerified.value = false;
  }
};

const copyUrl = async () => {
  if (!bookingUrl.value) return;
  try {
    await navigator.clipboard.writeText(bookingUrl.value);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch {
    // コピーに失敗した場合は握りつぶす
  }
};

onMounted(async () => {
  await fetchBusinessProfile();
  await checkStripeVerification();
});

const businessTypeLabel = computed(() =>
  businessProfile.value?.business_type === "company" ? "法人" : "個人事業主",
);

const repNameKanji = computed(() => {
  const prof = businessProfile.value;
  if (!prof) return "";
  const last = prof.rep_last_name_kanji;
  const first = prof.rep_first_name_kanji;
  return last || first ? `${last} ${first}`.trim() : "";
});

const repNameKana = computed(() => {
  const prof = businessProfile.value;
  if (!prof) return "";
  const last = prof.rep_last_name_kana;
  const first = prof.rep_first_name_kana;
  return last || first ? `${last} ${first}`.trim() : "";
});

const DAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];

const operatingDaysLabel = computed(() => {
  const days = businessProfile.value?.operating_days ?? "";
  if (!days) return "未設定";
  const active = DAY_LABELS.filter((_, i) => days[i] === "1");
  return active.length === 7 ? "毎日" : active.join("・");
});

// 1日の最大荷物個数: -1=制限なし, 0=予約不可, 1以上=N個
const dailyMaxLuggageLabel = computed(() => {
  const max = businessProfile.value?.daily_max_luggage;
  if (max === undefined || max === null) return "未設定";
  if (max === -1) return "制限なし";
  if (max === 0) return "予約不可";
  return `${max}個`;
});

const formatDateTime = (value: string | null) => {
  if (!value) return "−";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "−";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tokyo",
  }).format(date);
};
</script>
