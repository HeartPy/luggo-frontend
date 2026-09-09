<template>
  <div>
    <h1 class="py-4 text-xl font-bold tracking-wide text-gray-800">
      配達情報
    </h1>

    <!-- 対象日 -->
    <div class="mb-4">
      <div
        class="relative inline-block"
        @click="openNativeDatePicker(dateInput)"
      >
        <input
          ref="dateInput"
          v-model="selectedDate"
          type="date"
          aria-label="対象日"
          class="box-border min-h-10 w-44 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-12 text-sm leading-normal focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden"
        >
        <img
          class="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2"
          src="/img/calendar.svg"
          alt=""
          aria-hidden="true"
        >
      </div>
    </div>

    <!-- 予約一覧 / 最適化ルートの切り替え -->
    <div
      class="mb-4 grid grid-cols-2 gap-2"
      role="group"
      aria-label="表示の切り替え"
    >
      <button
        type="button"
        class="rounded-md border-2 px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="currentView === 'bookings'
          ? 'border-gray-800 bg-gray-800 text-white'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
        :aria-pressed="currentView === 'bookings'"
        aria-controls="driver-dashboard-bookings"
        @click="currentView = 'bookings'"
      >
        予約一覧
      </button>
      <button
        type="button"
        class="rounded-md border-2 px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="currentView === 'route'
          ? 'border-gray-800 bg-gray-800 text-white'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
        :aria-pressed="currentView === 'route'"
        aria-controls="driver-dashboard-route"
        @click="currentView = 'route'"
      >
        最適化ルート
      </button>
    </div>

    <!--
      一度表示したビューは v-show で保持し、タブを行き来しても
      API・地図の再読み込みが発生しないようにする（初回表示までは遅延マウント）
    -->
    <DriverDashboardBookingsList
      v-if="mountedViews.has('bookings')"
      v-show="currentView === 'bookings'"
      id="driver-dashboard-bookings"
      :date="selectedDate"
    />
    <DriverDashboardRouteView
      v-if="mountedViews.has('route')"
      v-show="currentView === 'route'"
      id="driver-dashboard-route"
      :date="selectedDate"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "driver",
  middleware: "driver",
});

// 初期値はローカルタイムゾーンの当日
function todayLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const selectedDate = ref(todayLocal());
const currentView = ref<"bookings" | "route">("bookings");
const dateInput = ref<HTMLInputElement>();

// 一度表示したビューを記録し、以降はコンポーネントを破棄しない
const mountedViews = ref(new Set<"bookings" | "route">(["bookings"]));
watch(currentView, (view) => {
  mountedViews.value.add(view);
});

// 日付入力フィールド全体をクリックしたときに、ブラウザ標準のピッカーを開く
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

useAppSeo({
  title: "配達者ダッシュボード",
  description: "配達者用ダッシュボードページ。",
});
</script>
