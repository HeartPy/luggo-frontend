<template>
  <div>
    <div class="mb-8 flex justify-end px-8">
      <form
        class="flex items-center gap-3"
        @submit.prevent="search"
      >
        <div
          class="relative"
          @click="openNativeDatePicker(monthInputRef)"
        >
          <input
            ref="monthInputRef"
            v-model="monthInput"
            type="month"
            required
            class="w-full cursor-pointer appearance-none rounded-md border border-gray-300 px-3 py-2 pr-12 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden"
          >
          <img
            class="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2"
            src="/img/calendar.svg"
            alt=""
          >
        </div>
        <button
          type="submit"
          :disabled="loading || !monthInput"
          class="rounded-md bg-gray-800 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          検索
        </button>
      </form>
    </div>

    <div class="mx-auto w-full max-w-6xl px-6">
      <div
        v-if="errMsg"
        class="mx-4 mb-4 w-fit rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        role="alert"
      >
        {{ errMsg }}
      </div>

      <div class="mb-16 grid gap-4 md:grid-cols-2">
        <article class="relative overflow-hidden rounded-xl bg-gray-900 p-6 text-white shadow-lg shadow-gray-200/70 sm:p-7">
          <div class="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-white/5" />
          <div class="relative">
            <div class="mb-8 space-y-1">
              <h3 class="text-sm font-semibold text-gray-200">
                売上高
              </h3>
              <p class="text-xs text-gray-400">
                当月配達完了分（手数料を含む）
              </p>
            </div>
            <div
              v-if="loading && !summary"
              class="h-10 w-52 animate-pulse rounded-lg bg-white/10"
            />
            <p
              v-else
              class="text-right text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {{ formatYen(summary?.gross_sales ?? 0) }}
            </p>
          </div>
        </article>

        <article class="relative overflow-hidden rounded-xl bg-slate-700 p-6 text-white shadow-lg shadow-slate-200/70 sm:p-7">
          <div class="absolute -bottom-14 -right-6 h-40 w-40 rounded-full bg-white/10" />
          <div class="relative">
            <div class="mb-8 flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-slate-50">
                  振込対象額
                </p>
                <p class="mt-1 text-xs text-slate-300">
                  当月配達完了分（手数料を除く）
                </p>
              </div>
            </div>
            <div
              v-if="loading && !summary"
              class="h-10 w-52 animate-pulse rounded-lg bg-white/15"
            />
            <p
              v-else
              class="text-right text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {{ formatYen(summary?.net_sales ?? 0) }}
            </p>
          </div>
        </article>
      </div>

      <section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <header class="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div class="space-y-1">
            <h2 class="text-base font-bold text-gray-900">
              入金履歴
            </h2>
            <p class="text-xs text-gray-500">
              Stripeから登録口座への入金済み履歴（{{ historyMonths === 3 ? "過去3か月" : "過去1年" }}）
            </p>
          </div>
          <span
            v-if="summary && !summary.payouts_error"
            class="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
          >
            {{ summary.payouts.length }}件
          </span>
        </header>

        <div
          v-if="loading"
          class="space-y-3 p-6"
        >
          <div
            v-for="idx in 4"
            :key="idx"
            class="h-12 animate-pulse rounded-lg bg-gray-100"
          />
        </div>

        <div
          v-else-if="summary?.payouts_error"
          class="space-y-1 px-6 py-12 text-center"
        >
          <p class="text-sm font-semibold text-gray-700">
            入金履歴を取得できませんでした
          </p>
          <p class="text-xs text-gray-500">
            時間をおいて再度お試しください。
          </p>
        </div>

        <div
          v-else-if="summary && !summary.has_stripe_account"
          class="space-y-1 px-6 py-12 text-center"
        >
          <p class="text-sm font-semibold text-gray-700">
            Stripeの決済設定が完了していません
          </p>
          <p class="text-xs text-gray-500">
            決済の設定から振込口座を登録すると、ここに履歴が表示されます。
          </p>
        </div>

        <div
          v-else-if="summary && summary.payouts.length === 0"
          class="space-y-3 px-6 py-12 text-center"
        >
          <span class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <img
              class="h-5 w-5 object-contain"
              src="/img/wallet.svg"
              alt=""
            >
          </span>
          <p class="text-sm font-semibold text-gray-700">
            この期間の入金履歴はありません
          </p>
        </div>

        <div
          v-else-if="summary"
          class="overflow-x-auto"
        >
          <table class="w-full min-w-[600px]">
            <thead>
              <tr class="bg-gray-50 text-xs font-semibold text-gray-500">
                <th class="px-6 py-3.5">
                  金額
                </th>
                <th class="px-6 py-3.5">
                  入金先
                </th>
                <th class="px-6 py-3.5 text-right">
                  入金日
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="payout in summary.payouts"
                :key="payout.id"
                class="text-sm"
              >
                <td class="whitespace-nowrap px-6 py-4 font-bold text-gray-900">
                  {{ formatYen(payout.amount) }}
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-gray-600">
                  {{ payout.destination }}
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-right text-gray-600">
                  {{ formatDate(payout.paid_at) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="border-t border-gray-100 px-6 py-4 text-center"
        >
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            @click="showOneYear"
          >
            <span>もっと見る</span>
            <img
              class="mt-1 h-2 w-2 object-contain"
              src="/img/right-arrow.svg"
              alt=""
            >
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
type Payout = {
  id: string;
  amount: number;
  destination: string;
  paid_at: string;
};

type RevenueSummary = {
  selected_month: string;
  gross_sales: number;
  net_sales: number;
  payouts: Payout[];
  has_more_payouts: boolean;
  payouts_error: boolean;
  has_stripe_account: boolean;
};

const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;
const monthInput = ref("");
const monthInputRef = ref<HTMLInputElement>();
const historyMonths = ref<3 | 12>(3);
const summary = ref<RevenueSummary | null>(null);
const loading = ref(true);
const errMsg = ref("");

function openNativeDatePicker(el: HTMLInputElement | undefined) {
  if (!el || el.disabled) return;
  el.focus();
  if (typeof el.showPicker === "function") {
    try {
      el.showPicker();
    }
    catch {
      // フォーカスのみにフォールバック
    }
  }
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatYen(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[1]}/${match[2]}/${match[3]}` : value;
}

// 401（ログイン切れ）かどうかを判定
function isUnauthorized(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const candidate = err as { status?: number; statusCode?: number };
  return candidate.status === 401 || candidate.statusCode === 401;
}

// 売上概要と入金履歴を取得
async function loadRevenue(months: 3 | 12) {
  if (!monthInput.value) return;
  loading.value = true;
  errMsg.value = "";
  try {
    const query = new URLSearchParams({
      month: monthInput.value,
      history_months: String(months),
    });
    summary.value = await $fetch<RevenueSummary>(
      `${apiBase}/api/business/revenue?${query.toString()}`,
      { method: "GET", credentials: "include" },
    );
    monthInput.value = summary.value.selected_month;
    historyMonths.value = months;
  }
  catch (err: unknown) {
    if (isUnauthorized(err)) {
      await navigateTo("/account/login");
      return;
    }
    errMsg.value = "売上情報の取得に失敗しました。時間をおいて再度お試しください。";
  }
  finally {
    loading.value = false;
  }
}

function search() {
  historyMonths.value = 3;
  loadRevenue(3);
}

function showOneYear() {
  loadRevenue(12);
}

onMounted(() => {
  monthInput.value = currentMonth();
  loadRevenue(3);
});
</script>
