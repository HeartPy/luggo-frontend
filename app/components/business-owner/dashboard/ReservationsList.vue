<template>
  <div>
    <!-- 保存しない確認ダイアログ -->
    <CommonAtomsConfirmDialog
      v-model="showDiscardConfirm"
      title="確認"
      message="編集中の変更を破棄しますか？"
      confirm-label="破棄する"
      cancel-label="キャンセル"
      @confirm="doDiscard"
    />

    <!-- 予約キャンセル確認ダイアログ -->
    <CommonAtomsConfirmDialog
      v-model="showCancelConfirm"
      title="予約のキャンセル"
      :message="cancelDialogMessage"
      confirm-label="予約をキャンセル"
      cancel-label="戻る"
      @confirm="doCancel"
    >
      <!-- 集荷日前日23時以降の予約が含まれる場合のみ、返金有無を選択できる -->
      <fieldset
        v-if="hasPostDeadlinePendingCancel"
        class="rounded-md border border-gray-200 bg-gray-50 p-3"
      >
        <legend class="mb-1 px-1 text-xs font-semibold text-gray-700">
          集荷日前日23時以降のキャンセルの返金
        </legend>
        <div class="flex flex-col gap-2">
          <label class="flex items-center gap-2 text-sm text-gray-800">
            <input
              v-model="refundPostDeadline"
              type="radio"
              name="refund-post-deadline"
              :value="true"
              class="h-4 w-4"
            >
            返金する
          </label>
          <label class="flex items-center gap-2 text-sm text-gray-800">
            <input
              v-model="refundPostDeadline"
              type="radio"
              name="refund-post-deadline"
              :value="false"
              class="h-4 w-4"
            >
            返金しない
          </label>
        </div>
      </fieldset>
    </CommonAtomsConfirmDialog>

    <!-- ページ離脱確認ダイアログ -->
    <CommonAtomsConfirmDialog
      v-model="showLeaveConfirm"
      title="確認"
      message="保存されていない変更があります。ページを離れますか？"
      confirm-label="離れる"
      cancel-label="キャンセル"
      @confirm="confirmLeave"
    />

    <!-- 予約詳細ポップアップ -->
    <BusinessOwnerDashboardBookingDetailDialog
      v-model="showDetail"
      :booking="detailBooking"
      :drivers="drivers"
      @saved="onDetailSaved"
      @request-cancel="onDetailRequestCancel"
    />

    <!-- 検索 -->
    <div class="flex flex-wrap items-end gap-3 px-8 pb-4">
      <!-- 年月範囲での絞り込み（期間クイックとは排他） -->
      <div class="flex items-center gap-2">
        <!-- 開始月 -->
        <div
          class="relative"
          @click="openNativeDatePicker(monthFromRef)"
        >
          <input
            ref="monthFromRef"
            v-model="monthFromInput"
            type="month"
            :disabled="!!periodInput"
            class="w-full cursor-pointer appearance-none rounded-md border border-gray-300 px-3 py-2 pr-12 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden"
          >
          <img
            class="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2"
            src="/img/calendar.svg"
          >
        </div>
        <span class="text-sm text-gray-500">〜</span>
        <!-- 終了月 -->
        <div
          class="relative"
          @click="openNativeDatePicker(monthToRef)"
        >
          <input
            ref="monthToRef"
            v-model="monthToInput"
            type="month"
            :disabled="!!periodInput"
            class="w-full cursor-pointer appearance-none rounded-md border border-gray-300 px-3 py-2 pr-12 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden"
          >
          <img
            class="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2"
            src="/img/calendar.svg"
          >
        </div>
      </div>

      <!-- 期間クイック絞り込み（年月範囲とは排他） -->
      <div class="flex items-center gap-1">
        <button
          v-for="periodOption in periodOptions"
          :key="periodOption.value"
          type="button"
          class="rounded-md border px-3 py-2 text-sm font-medium transition-colors"
          :class="
            periodInput === periodOption.value
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          "
          @click="onPeriodClick(periodOption.value)"
        >
          {{ periodOption.label }}
        </button>
      </div>

      <!-- 顧客名・場所での検索 -->
      <div class="w-44">
        <input
          v-model="nameInput"
          type="text"
          placeholder="顧客名・場所で検索"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @keydown.enter="handleSearch"
        >
      </div>

      <!-- 配達状況での絞り込み -->
      <div class="relative">
        <select
          v-model="statusInput"
          class="cursor-pointer appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">
            すべての配達状況
          </option>
          <option
            v-for="statusFilterOption in statusFilterOptions"
            :key="statusFilterOption.value"
            :value="statusFilterOption.value"
          >
            {{ statusFilterOption.label }}
          </option>
        </select>
        <img
          class="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2"
          src="/img/down-arrow.svg"
          alt=""
        >
      </div>

      <button
        type="button"
        :disabled="isLoading"
        class="rounded-md bg-gray-800 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
        @click="handleSearch"
      >
        検索
      </button>

      <button
        type="button"
        class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        @click="clearSearch"
      >
        初期状態に戻す
      </button>
    </div>

    <!-- 操作ボタン -->
    <div class="flex flex-wrap items-center justify-end gap-3 border-y border-gray-200 px-8 py-3">
      <div
        v-if="selectedIds.size > 0"
        class="mr-auto flex items-center gap-3"
      >
        <span class="text-sm text-gray-600">{{ selectedIds.size }}件選択中</span>
        <!-- 一括配達状況変更 -->
        <div class="relative">
          <select
            v-model="bulkStatusValue"
            class="cursor-pointer appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option
              value=""
              disabled
            >
              配達状況を一括変更
            </option>
            <option
              v-for="statusOption in statusOptions"
              :key="statusOption.value"
              :value="statusOption.value"
            >
              {{ statusOption.label }}
            </option>
          </select>
          <img
            class="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2"
            src="/img/down-arrow.svg"
            alt=""
          >
        </div>
        <!-- 一括配達者割り当て -->
        <div class="relative">
          <select
            v-model="bulkDriverValue"
            class="cursor-pointer appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option
              value=""
              disabled
            >
              配達者を一括割り当て
            </option>
            <option value="__none__">
              未割り当て
            </option>
            <option
              v-for="driver in drivers"
              :key="driver.id"
              :value="driver.id"
            >
              {{ driver.name }}
            </option>
          </select>
          <img
            class="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2"
            src="/img/down-arrow.svg"
            alt=""
          >
        </div>
      </div>

      <button
        type="button"
        class="flex items-center gap-2 rounded-md border-2 border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        :disabled="selectedIds.size === 0 || isExporting"
        @click="exportCsv"
      >
        <CommonAtomsLoadingAnimation
          v-if="isExporting"
          size="xs"
        />
        <template v-else>
          <span>CSV出力</span>
          <img
            src="/img/download.svg"
            alt=""
            class="h-4 w-4 object-contain"
          >
        </template>
      </button>
      <button
        type="button"
        class="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        :disabled="!isDirty || isSaving"
        @click="handleSave"
      >
        <CommonAtomsLoadingAnimation
          v-if="isSaving"
          size="xs"
        />
        <span v-else>保存</span>
      </button>
      <button
        type="button"
        class="rounded-md border-2 border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        :disabled="!isDirty"
        @click="showDiscardConfirm = true"
      >
        保存しない
      </button>
      <button
        type="button"
        class="rounded-md bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
        :disabled="cancellableSelectedIds.length === 0 || isCancelling"
        @click="requestCancelSelected"
      >
        <CommonAtomsLoadingAnimation
          v-if="isCancelling"
          size="xs"
        />
        <span v-else>予約をキャンセル</span>
      </button>
    </div>

    <div class="pt-4">
      <!-- エラー -->
      <div
        v-if="listErr"
        class="mx-4 mb-4 w-fit rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ listErr }}
      </div>

      <!-- 読み込み中 -->
      <div
        v-if="isLoading"
        class="py-12"
      >
        <CommonAtomsLoadingAnimation size="md" />
      </div>

      <template v-else>
        <!-- 予約なし -->
        <p
          v-if="bookings.length === 0"
          class="py-12 text-center text-sm text-gray-400"
        >
          表示できる予約がありません。
        </p>

        <!-- 予約テーブル -->
        <div
          v-else
          class="overflow-x-auto"
        >
          <table class="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr class="border-b border-gray-200 text-left text-xs text-gray-500">
                <th class="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 accent-blue-600"
                    :checked="isAllCurrentPageSelected"
                    :indeterminate.prop="isSomeCurrentPageSelected"
                    @change="toggleSelectAll"
                  >
                </th>
                <th class="px-3 py-3 font-medium">
                  配達状況
                </th>
                <th class="px-3 py-3 font-medium">
                  配達者
                </th>
                <th class="px-3 py-3 font-medium">
                  集荷場所
                </th>
                <th class="whitespace-nowrap px-3 py-3 font-medium">
                  集荷日
                </th>
                <th class="px-3 py-3 font-medium">
                  配達場所
                </th>
                <th class="whitespace-nowrap px-3 py-3 font-medium">
                  配達日
                </th>
                <th class="whitespace-nowrap px-3 py-3 text-center font-medium">
                  個数
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="booking in bookings"
                :key="booking.id"
                class="cursor-pointer border-b border-gray-100 transition hover:brightness-95"
                :class="rowClass(booking)"
                @click="openDetail(booking)"
              >
                <td
                  class="px-3 py-3 align-middle"
                  @click.stop
                >
                  <input
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 accent-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                    :checked="selectedIds.has(booking.id)"
                    :disabled="booking.delivery_status === 'cancelled'"
                    @change="toggleSelect(booking.id)"
                  >
                </td>
                <td class="whitespace-nowrap px-3 py-3 align-middle">
                  <span
                    class="inline-block whitespace-nowrap rounded-full px-3 py-1 text-center text-xs font-semibold"
                    :class="statusPillClass(booking.delivery_status)"
                  >
                    {{ statusLabel(booking.delivery_status) }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-3 py-3 align-middle">
                  <div
                    v-if="isSplitDriverDisplay(booking)"
                    class="space-y-0.5 text-xs"
                  >
                    <div>
                      <span class="text-gray-500">集荷:</span>
                      <span
                        :class="{ 'text-red-600': !pickupDriverName(booking) }"
                      >
                        {{ pickupDriverName(booking) || "未割り当て" }}
                      </span>
                    </div>
                    <div>
                      <span class="text-gray-500">配達:</span>
                      <span
                        :class="{ 'text-red-600': !deliveryDriverName(booking) }"
                      >
                        {{ deliveryDriverName(booking) || "未割り当て" }}
                      </span>
                    </div>
                  </div>
                  <template v-else>
                    <span v-if="deliveryDriverName(booking)">
                      {{ deliveryDriverName(booking) }}
                    </span>
                    <span
                      v-else-if="showDriverUnassigned(booking)"
                      class="text-red-600"
                    >
                      未割り当て
                    </span>
                    <span
                      v-else
                      class="text-gray-400"
                    >—</span>
                  </template>
                </td>
                <td class="px-3 py-3 align-middle">
                  {{ booking.pickup_location_name || "—" }}
                </td>
                <td class="whitespace-nowrap px-3 py-3 align-middle">
                  {{ formatDate(booking.pickup_date) }}
                </td>
                <td class="px-3 py-3 align-middle">
                  {{ booking.delivery_location_name || "—" }}
                </td>
                <td class="whitespace-nowrap px-3 py-3 align-middle">
                  {{ formatDate(booking.delivery_date) }}
                </td>
                <td class="whitespace-nowrap px-3 py-3 text-center align-middle">
                  {{ booking.total_luggage_count }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ページネーション -->
        <div
          v-if="totalPages > 1"
          class="flex items-center justify-center gap-2 py-6"
        >
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="page <= 1"
            aria-label="前のページ"
            @click="goToPage(page - 1)"
          >
            ‹
          </button>
          <template
            v-for="(displayedPage, idx) in displayedPages"
            :key="`${displayedPage}-${idx}`"
          >
            <span
              v-if="displayedPage === '...'"
              class="px-1 text-gray-400"
            > … </span>
            <button
              v-else
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors"
              :class="
                displayedPage === page
                  ? 'border-gray-800 bg-gray-800 text-white'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              "
              @click="goToPage(displayedPage as number)"
            >
              {{ displayedPage }}
            </button>
          </template>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="page >= totalPages"
            aria-label="次のページ"
            @click="goToPage(page + 1)"
          >
            ›
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCsrf } from "~/composables/useCsrf";
import { useBeforeUnload } from "~/composables/useBeforeUnload";
import type {
  OwnerBooking as Booking,
  OwnerDeliveryStatus as DeliveryStatus,
  OwnerDriver,
} from "~/types/booking";

type PeriodValue = "today" | "tomorrow" | "day_after_tomorrow" | "week";

type ListResponse = {
  results: Booking[];
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  applied_month_from: string;
  applied_month_to: string;
  applied_period: string;
};

const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;
const { ensureCsrf, getCsrf } = useCsrf();

const statusOptions: { value: DeliveryStatus; label: string }[] = [
  { value: "before_pickup", label: "集荷前" },
  { value: "picked_up", label: "集荷済" },
  { value: "delivered", label: "配達済" },
];

// 絞り込み用（キャンセルを含む全ステータス）
const statusFilterOptions: { value: DeliveryStatus; label: string }[] = [
  ...statusOptions,
  { value: "cancelled", label: "キャンセル" },
];

const periodOptions: { value: PeriodValue; label: string }[] = [
  { value: "today", label: "今日" },
  { value: "tomorrow", label: "明日" },
  { value: "day_after_tomorrow", label: "明後日" },
  { value: "week", label: "一週間" },
];

const monthFromInput = ref("");
const monthToInput = ref("");
const monthFromRef = ref<HTMLInputElement>();
const monthToRef = ref<HTMLInputElement>();
const nameInput = ref("");
const statusInput = ref<"" | DeliveryStatus>("");
const periodInput = ref<"" | PeriodValue>("");

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

// 実際に適用されている検索条件
const appliedMonthFrom = ref("");
const appliedMonthTo = ref("");
const appliedName = ref("");
const appliedStatus = ref<"" | DeliveryStatus>("");
const appliedPeriod = ref<"" | PeriodValue>("");

const bookings = ref<Booking[]>([]);
const page = ref(1);
const totalPages = ref(1);
const totalCount = ref(0);

const isLoading = ref(true);
const isSaving = ref(false);
const isCancelling = ref(false);
const isExporting = ref(false);
const listErr = ref<string | null>(null);

// 未保存の配達状況の編集。ページを跨いで保持。
// 表示には反映せず、「保存」成功後の再取得で初めて表示へ反映。
const statusEdits = ref<Record<string, DeliveryStatus>>({});

// サーバーに保存済みの配達状況
const originalStatusById = ref<Record<string, DeliveryStatus>>({});

// 予約ごとの通常返金可否（集荷日前日23時より前なら true）。ページを跨いで保持。
// false の予約をキャンセルするときは、事業者が返金有無を選択する。
const refundableById = ref<Record<string, boolean>>({});

// 未保存の配達者の編集。ページを跨いで保持。
// 表示には反映せず、「保存」成功後の再取得で初めて表示へ反映。
const driverEdits = ref<Record<string, string>>({});

// サーバーに保存済みの配達者ID
const originalDriverById = ref<Record<string, string>>({});

// チェックボックスで選択中の予約。ページを跨いで保持。
const selectedIds = ref<Set<string>>(new Set());

// ツールバーの一括変更で選んだ値
const bulkStatusValue = ref<"" | DeliveryStatus>("");

// 一括配達者割り当て
const bulkDriverValue = ref<string>("");

const showDiscardConfirm = ref(false);
const showCancelConfirm = ref(false);

// キャンセル対象の予約ID
const pendingCancelIds = ref<string[]>([]);

// 選択のうちキャンセルできなかった（集荷前以外の）予約の件数。完了後の通知に使う。
const cancelSkippedCount = ref(0);

// 集荷日前日23時以降の予約をキャンセルする際の返金有無（事業者の選択）
const refundPostDeadline = ref(true);

const showLeaveConfirm = ref(false);

// 未保存のまま別ページへ移動しようとしたときの遷移先パス。「離れる」確定後に navigateTo する。
const pendingLeavePath = ref<string | null>(null);

// 離脱確認済みの遷移中フラグ
const isNavigatingAfterLeaveConfirm = ref(false);

// 予約詳細ポップアップ
const showDetail = ref(false);
const detailBooking = ref<Booking | null>(null);

const drivers = ref<OwnerDriver[]>([]);

function openDetail(booking: Booking) {
  detailBooking.value = booking;
  showDetail.value = true;
}

// 詳細ポップアップで保存された後:、一覧を再取得
async function onDetailSaved() {
  await fetchBookings(page.value);
}

// 詳細ポップアップの「予約をキャンセル」: 確認ダイアログ経由でキャンセル＋返金
function onDetailRequestCancel(id: string) {
  showDetail.value = false;
  pendingCancelIds.value = [id];
  refundPostDeadline.value = true;
  showCancelConfirm.value = true;
}

// 事業者に所属する配達者の一覧を取得（割り当て選択用）
async function fetchDrivers() {
  try {
    const data = await $fetch<{ results: OwnerDriver[] }>(`${apiBase}/api/business/drivers`, {
      method: "GET",
      credentials: "include",
    });
    drivers.value = data.results;
  }
  catch {
    // 配達者一覧の取得失敗は致命的ではないため、握りつぶす（割り当ては空になる）
    drivers.value = [];
  }
}

// 編集状態の比較用キー
function editsKey(obj: Record<string, string>): string {
  return Object.keys(obj)
    .sort()
    .map(key => `${key}:${obj[key]}`)
    .join(",");
}

// 未保存の変更があるかどうか
const isDirty = computed(
  () =>
    (selectedIds.value.size > 0
      && (bulkStatusValue.value !== "" || bulkDriverValue.value !== ""))
    || editsKey(statusEdits.value) !== ""
    || editsKey(driverEdits.value) !== "",
);

// 配達者ID -> 表示名のマップ
const driverNameById = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {};
  for (const driver of drivers.value) {
    map[driver.id] = driver.name;
  }
  return map;
});

function deliveryDriverName(booking: Booking): string {
  const id = booking.driver ?? "";
  if (!id) return "";
  return driverNameById.value[id] ?? booking.driver_name ?? "";
}

function pickupDriverName(booking: Booking): string {
  const id = booking.pickup_driver ?? booking.driver ?? "";
  if (!id) return "";
  return driverNameById.value[id]
    ?? booking.pickup_driver_name
    ?? booking.driver_name
    ?? "";
}

function isSplitDriverDisplay(booking: Booking): boolean {
  return !!booking.pickup_driver
    && booking.pickup_driver !== booking.driver;
}

// 配達状況のピル（背景色）
function statusPillClass(statusValue: DeliveryStatus): string {
  switch (statusValue) {
    case "picked_up":
      return "bg-blue-600 text-white";
    case "delivered":
      return "bg-green-600 text-white";
    case "cancelled":
      return "bg-red-600 text-white";
    case "before_pickup":
    default:
      return "bg-gray-300 text-gray-700";
  }
}

function statusLabel(statusValue: DeliveryStatus): string {
  return statusFilterOptions.find(opt => opt.value === statusValue)?.label ?? statusValue;
}

// 今日の日付（YYYY-MM-DD）
function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
const todayIso = computed(() => toIsoDate(new Date()));

// 配達日が過ぎているか
function isDeliveryPast(booking: Booking): boolean {
  return !!booking.delivery_date && booking.delivery_date < todayIso.value;
}

// 行の背景色
// - 配達日が今日より前: グレー
// - 今日が集荷日 or 配達日 かつ 未完了(配達済・キャンセル以外): 黄色
function rowClass(booking: Booking): string {
  const statusValue = booking.delivery_status;
  if (isDeliveryPast(booking)) {
    return "bg-gray-100";
  }
  const isToday
    = booking.pickup_date === todayIso.value || booking.delivery_date === todayIso.value;
  if (isToday && statusValue !== "delivered" && statusValue !== "cancelled") {
    return "bg-yellow-100";
  }
  return "";
}

// 配達者に「未割り当て」（赤字）として表示すべきか
// 配達済・キャンセル・配達日超過の場合は対象外（従来通り横傍線）
function showDriverUnassigned(booking: Booking): boolean {
  if (booking.driver) return false;
  const statusValue = booking.delivery_status;
  if (statusValue === "delivered" || statusValue === "cancelled") return false;
  if (isDeliveryPast(booking)) return false;
  return true;
}

// "YYYY-MM-DD" → "YYYY/MM/DD"
function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return iso.replace(/-/g, "/");
}

// 選択中の予約へ配達状況を一括反映（キャンセル済みは対象外）。「保存」時に呼ばれる。
function applyBulkStatus(value: DeliveryStatus) {
  const next = { ...statusEdits.value };
  // 元の状況に戻る予約は編集を打ち消す（除外するIDを集める）
  const idsToRemove = new Set<string>();
  for (const id of selectedIds.value) {
    const original = originalStatusById.value[id];
    // キャンセル済みは状況を変更できないためスキップ
    if (original === "cancelled") continue;
    if (value === original) {
      idsToRemove.add(id);
    }
    else {
      next[id] = value;
    }
  }
  statusEdits.value = Object.fromEntries(
    Object.entries(next).filter(([key]) => !idsToRemove.has(key)),
  ) as Record<string, DeliveryStatus>;
}

// 選択中の予約へ配達者を一括反映（キャンセル済みは対象外）。「保存」時に呼ばれる。
function applyBulkDriver(value: string) {
  // "__none__" は未割り当て（""）として扱う
  const driverId = value === "__none__" ? "" : value;
  const next = { ...driverEdits.value };
  // 元の割り当てに戻る予約は編集を打ち消す（除外するIDを集める）
  const idsToRemove = new Set<string>();
  for (const id of selectedIds.value) {
    const booking = bookings.value.find(b => b.id === id);
    // キャンセル済みは配達者を変更できないためスキップ
    if (booking && booking.delivery_status === "cancelled") continue;
    const original = originalDriverById.value[id] ?? "";
    if (driverId === original) {
      idsToRemove.add(id);
    }
    else {
      next[id] = driverId;
    }
  }
  driverEdits.value = Object.fromEntries(
    Object.entries(next).filter(([key]) => !idsToRemove.has(key)),
  ) as Record<string, string>;
}

// チェック可能か（キャンセル済みは不可）
function isSelectable(booking: Booking): boolean {
  return booking.delivery_status !== "cancelled";
}

// チェックボックス操作
function toggleSelect(id: string) {
  const booking = bookings.value.find(b => b.id === id);
  // キャンセル済みは選択不可
  if (booking && !isSelectable(booking)) return;
  const next = new Set(selectedIds.value);
  if (next.has(id)) {
    next.delete(id);
  }
  else {
    next.add(id);
  }
  selectedIds.value = next;
}

// キャンセル可能か（「集荷前」のみ）
function isCancellableId(id: string): boolean {
  return originalStatusById.value[id] === "before_pickup";
}

// 選択中のうちキャンセルできる（集荷前の）予約ID。ページを跨いだ選択にも対応。
const cancellableSelectedIds = computed(() =>
  [...selectedIds.value].filter(id => isCancellableId(id)),
);

// キャンセル対象に、集荷日前日23時以降（通常返金対象外）の予約が含まれるか。
// 含まれる場合のみ、確認ダイアログで返金有無を選択させる。
const hasPostDeadlinePendingCancel = computed(() =>
  pendingCancelIds.value.some(id => refundableById.value[id] === false),
);

// キャンセル確認ダイアログのメッセージ
const cancelDialogMessage = computed(() => {
  const count = pendingCancelIds.value.length;
  if (hasPostDeadlinePendingCancel.value) {
    return `${count}件の予約をキャンセルします。集荷日前日23時を過ぎた予約が含まれるため、その予約の返金有無を選択してください。（集荷前の予約のみキャンセルできます）`;
  }
  return `${count}件の予約をキャンセルし、決済を全額返金します。よろしいですか？（集荷前の予約のみキャンセルできます）`;
});

// 全選択の判定はキャンセル済みを除いた予約のみを対象とする
const selectableBookings = computed(() => bookings.value.filter(b => isSelectable(b)));

const isAllCurrentPageSelected = computed(
  () =>
    selectableBookings.value.length > 0
    && selectableBookings.value.every(b => selectedIds.value.has(b.id)),
);
const isSomeCurrentPageSelected = computed(
  () =>
    !isAllCurrentPageSelected.value
    && selectableBookings.value.some(b => selectedIds.value.has(b.id)),
);

function toggleSelectAll() {
  const next = new Set(selectedIds.value);
  if (isAllCurrentPageSelected.value) {
    selectableBookings.value.forEach(b => next.delete(b.id));
  }
  else {
    selectableBookings.value.forEach(b => next.add(b.id));
  }
  selectedIds.value = next;
}

// ページネーション表示
const displayedPages = computed<(number | "...")[]>(() => {
  const total = totalPages.value;
  const current = page.value;
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
});

// 401（ログイン切れ）ハンドリング
function is401(err: unknown): boolean {
  return (
    !!err
    && typeof err === "object"
    && "status" in err
    && (err as { status: number }).status === 401
  );
}
function redirectToLogin() {
  listErr.value = "ログインの有効期限が切れました。再ログインしてください。";
  isNavigatingAfterLeaveConfirm.value = true;
  navigateTo("/account/login");
}

// 予約一覧を取得
async function fetchBookings(targetPage: number) {
  isLoading.value = true;
  listErr.value = null;
  try {
    const query = new URLSearchParams();
    query.set("page", String(targetPage));
    // 期間クイックが選択されていれば優先（年月範囲とは排他）
    if (appliedPeriod.value) {
      query.set("period", appliedPeriod.value);
    }
    else {
      if (appliedMonthFrom.value) query.set("month_from", appliedMonthFrom.value);
      if (appliedMonthTo.value) query.set("month_to", appliedMonthTo.value);
    }
    if (appliedName.value) query.set("keyword", appliedName.value);
    if (appliedStatus.value) query.set("status", appliedStatus.value);

    const data = await $fetch<ListResponse>(
      `${apiBase}/api/business/bookings?${query.toString()}`,
      { method: "GET", credentials: "include" },
    );

    bookings.value = data.results;
    page.value = data.page;
    totalPages.value = data.total_pages;
    totalCount.value = data.total_count;

    // サーバーが実際に適用した条件を入力欄・適用条件に反映
    // （初期表示や「デフォルトに戻す」時のデフォルト範囲もここで反映される）
    appliedPeriod.value = (data.applied_period || "") as "" | PeriodValue;
    appliedMonthFrom.value = data.applied_month_from;
    appliedMonthTo.value = data.applied_month_to;
    // 期間クイック絞り込み中は年月入力欄を同期しない（排他のため空のまま）
    if (!appliedPeriod.value) {
      monthFromInput.value = data.applied_month_from;
      monthToInput.value = data.applied_month_to;
    }

    // 実際の配達状況・配達者を記録（打ち消し判定用）
    const nextOriginal = { ...originalStatusById.value };
    const nextOriginalDriver = { ...originalDriverById.value };
    const nextRefundable = { ...refundableById.value };
    for (const booking of data.results) {
      nextOriginal[booking.id] = booking.delivery_status;
      nextOriginalDriver[booking.id] = booking.driver ?? "";
      nextRefundable[booking.id] = booking.is_refundable_on_cancel;
    }
    originalStatusById.value = nextOriginal;
    originalDriverById.value = nextOriginalDriver;
    refundableById.value = nextRefundable;
  }
  catch (err: unknown) {
    if (is401(err)) {
      redirectToLogin();
      return;
    }
    listErr.value = "予約一覧の取得に失敗しました。";
  }
  finally {
    isLoading.value = false;
  }
}

function handleSearch() {
  // 「検索」では年月範囲を採用するため、期間クイックは解除する（排他）
  periodInput.value = "";
  appliedPeriod.value = "";
  appliedMonthFrom.value = monthFromInput.value;
  appliedMonthTo.value = monthToInput.value;
  appliedName.value = nameInput.value.trim();
  appliedStatus.value = statusInput.value;
  fetchBookings(1);
}

// 期間クイック絞り込みのクリック（年月範囲とは排他）。同じ値を再度押すと解除。
function onPeriodClick(value: PeriodValue) {
  periodInput.value = periodInput.value === value ? "" : value;
  // 年月範囲は解除する
  monthFromInput.value = "";
  monthToInput.value = "";
  appliedMonthFrom.value = "";
  appliedMonthTo.value = "";
  appliedPeriod.value = periodInput.value;
  // キーワード・配達状況は併用可能なので維持しつつ適用
  appliedName.value = nameInput.value.trim();
  appliedStatus.value = statusInput.value;
  fetchBookings(1);
}

// 「デフォルトに戻す」: 全ての検索条件をクリアし、サーバー算出のデフォルト範囲に戻す
function clearSearch() {
  monthFromInput.value = "";
  monthToInput.value = "";
  nameInput.value = "";
  statusInput.value = "";
  periodInput.value = "";
  appliedMonthFrom.value = "";
  appliedMonthTo.value = "";
  appliedName.value = "";
  appliedStatus.value = "";
  appliedPeriod.value = "";
  fetchBookings(1);
}

function goToPage(targetPage: number) {
  if (targetPage < 1 || targetPage > totalPages.value) return;
  if (targetPage === page.value) return;
  fetchBookings(targetPage);
}

// 「保存」: 選択中の予約へ一括選択（配達状況・配達者）を反映し、サーバーへ保存
async function handleSave() {
  // 選んだ一括値を、選択中の予約へ反映してから保存
  if (bulkStatusValue.value) applyBulkStatus(bulkStatusValue.value);
  if (bulkDriverValue.value) applyBulkDriver(bulkDriverValue.value);

  // 現状と同じ値を選んだ等で実変更が無ければ、選択値とチェックを解除して終了
  if (Object.keys(statusEdits.value).length === 0 && Object.keys(driverEdits.value).length === 0) {
    bulkStatusValue.value = "";
    bulkDriverValue.value = "";
    selectedIds.value = new Set();
    return;
  }

  isSaving.value = true;
  listErr.value = null;
  try {
    await ensureCsrf(apiBase);
    const headers = {
      "Content-Type": "application/json",
      ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
    };
    // 配達状況の編集があれば保存
    if (Object.keys(statusEdits.value).length > 0) {
      await $fetch(`${apiBase}/api/business/bookings/statuses`, {
        method: "PUT",
        credentials: "include",
        headers,
        body: { updates: statusEdits.value },
      });
    }
    // 配達者の編集があれば保存
    if (Object.keys(driverEdits.value).length > 0) {
      await $fetch(`${apiBase}/api/business/bookings/drivers`, {
        method: "PUT",
        credentials: "include",
        headers,
        body: { updates: driverEdits.value },
      });
    }
    statusEdits.value = {};
    driverEdits.value = {};
    // 保存後は一括選択値とチェック（選択）をすべて解除する
    bulkStatusValue.value = "";
    bulkDriverValue.value = "";
    selectedIds.value = new Set();
    await fetchBookings(page.value);
  }
  catch (err: unknown) {
    if (is401(err)) {
      redirectToLogin();
      return;
    }
    listErr.value = "変更の保存に失敗しました。";
  }
  finally {
    isSaving.value = false;
  }
}

// 「保存しない」: 未保存の一括選択・編集を取り消して、反映済みの状態に戻す
function doDiscard() {
  statusEdits.value = {};
  driverEdits.value = {};
  bulkStatusValue.value = "";
  bulkDriverValue.value = "";
}

// ツールバーの「予約をキャンセル」: 選択中の予約を対象に確認ダイアログを開く
function requestCancelSelected() {
  const cancellable = cancellableSelectedIds.value;
  if (cancellable.length === 0) return;
  pendingCancelIds.value = cancellable;
  // 集荷前以外でキャンセルできない予約の件数を控え、完了後に通知する
  cancelSkippedCount.value = selectedIds.value.size - cancellable.length;
  refundPostDeadline.value = true;
  showCancelConfirm.value = true;
}

// 「予約をキャンセル」: 対象の予約を一括キャンセル
// （集荷日前日23時より前は全額返金。それ以降は事業者が選んだ返金有無に従う）
async function doCancel() {
  const ids = [...pendingCancelIds.value];
  if (ids.length === 0) return;
  // 集荷日前日23時以降の予約に対する返金有無の選択（対象がなければ無視される）
  const refund = refundPostDeadline.value;
  isCancelling.value = true;
  listErr.value = null;
  try {
    await ensureCsrf(apiBase);
    const res = await $fetch<{
      refund_failed_count?: number;
      skipped_count?: number;
      message?: string;
    }>(`${apiBase}/api/business/bookings/cancel`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
      },
      body: { ids, refund },
    });
    // キャンセルした予約の編集・選択を解除
    const cancelledIdSet = new Set(ids);
    statusEdits.value = Object.fromEntries(
      Object.entries(statusEdits.value).filter(([key]) => !cancelledIdSet.has(key)),
    ) as Record<string, DeliveryStatus>;
    driverEdits.value = Object.fromEntries(
      Object.entries(driverEdits.value).filter(([key]) => !cancelledIdSet.has(key)),
    ) as Record<string, string>;
    selectedIds.value = new Set();
    await fetchBookings(page.value);
    // キャンセルできなかった予約（集荷前以外・返金失敗）があれば、その分だけ通知する
    const msgs: string[] = [];
    // フロントで除外した分 + サーバーがスキップした分（競合時の保険）
    const statusSkipped = cancelSkippedCount.value + (res?.skipped_count ?? 0);
    if (statusSkipped > 0) {
      msgs.push(`${statusSkipped}件は集荷前ではないため、キャンセルできませんでした。`);
    }
    if (res?.refund_failed_count && res.refund_failed_count > 0) {
      msgs.push(
        res.message
        ?? "一部の予約は返金に失敗したため、キャンセルされていません。時間をおいて再度お試しください。",
      );
    }
    if (msgs.length > 0) {
      listErr.value = msgs.join(" ");
    }
  }
  catch (err: unknown) {
    if (is401(err)) {
      redirectToLogin();
      return;
    }
    listErr.value = "予約のキャンセルに失敗しました。";
  }
  finally {
    isCancelling.value = false;
    pendingCancelIds.value = [];
    cancelSkippedCount.value = 0;
    refundPostDeadline.value = true;
  }
}

// 「CSV出力」: 選択した予約を CSV でダウンロード
async function exportCsv() {
  if (!import.meta.client || selectedIds.value.size === 0) return;
  isExporting.value = true;
  listErr.value = null;
  try {
    await ensureCsrf(apiBase);
    const res = await fetch(`${apiBase}/api/business/bookings/export`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(getCsrf() ? { "X-CSRFToken": getCsrf()! } : {}),
      },
      body: JSON.stringify({ ids: [...selectedIds.value] }),
    });
    if (!res.ok) {
      listErr.value = "CSVの出力に失敗しました。";
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    const disposition = res.headers.get("Content-Disposition") || "";
    const match = disposition.match(/filename="?([^"]+)"?/);
    anchor.download = match?.[1] ?? "bookings.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }
  catch {
    listErr.value = "CSVの出力に失敗しました。";
  }
  finally {
    isExporting.value = false;
  }
}

// 「ページから離れる」確認で OK されたとき
function confirmLeave() {
  const path = pendingLeavePath.value;
  pendingLeavePath.value = null;
  showLeaveConfirm.value = false;
  if (path) {
    isNavigatingAfterLeaveConfirm.value = true;
    navigateTo(path);
  }
}

// アプリ内で別ページへ移動するとき: 未保存なら確認
onBeforeRouteLeave((to, _from, next) => {
  if (isNavigatingAfterLeaveConfirm.value) {
    isNavigatingAfterLeaveConfirm.value = false;
    next();
    return;
  }
  if (isDirty.value) {
    next(false);
    pendingLeavePath.value = to.fullPath;
    showLeaveConfirm.value = true;
  }
  else {
    next();
  }
});

// タブを閉じる・更新するときの警告
useBeforeUnload(isSaving, ref(false), isDirty);

onMounted(async () => {
  await Promise.all([fetchBookings(1), fetchDrivers()]);
});
</script>
