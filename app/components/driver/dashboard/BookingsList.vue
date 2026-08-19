<template>
  <div aria-labelledby="driver-bookings-heading">
    <h2
      id="driver-bookings-heading"
      class="sr-only"
    >
      予約一覧
    </h2>

    <!-- ステータス絞り込みタブ -->
    <div
      class="mb-4 flex overflow-x-auto border-b border-gray-300"
      role="group"
      aria-label="配達状況で絞り込み"
    >
      <button
        v-for="tab in STATUS_TABS"
        :key="tab.key"
        type="button"
        class="whitespace-nowrap px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="statusFilter === tab.key
          ? 'bg-gray-800 text-white'
          : 'text-gray-700 hover:bg-gray-100'"
        :aria-pressed="statusFilter === tab.key"
        @click="changeStatus(tab.key)"
      >
        {{ tab.label }}
        <span
          v-if="statusCounts"
          class="ml-1 text-xs"
          :class="statusFilter === tab.key ? 'text-gray-300' : 'text-gray-400'"
        >
          {{ statusCounts[tab.key] ?? 0 }}
        </span>
      </button>
    </div>

    <!-- 一覧 -->
    <div>
      <div
        v-if="isLoading"
        class="flex justify-center py-16"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="配達情報を読み込み中"
      >
        <CommonAtomsLoadingAnimation size="md" />
      </div>

      <p
        v-else-if="errMsg"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        role="alert"
      >
        {{ errMsg }}
      </p>

      <p
        v-else-if="bookings.length === 0"
        class="py-16 text-center text-sm text-gray-500"
        role="status"
      >
        この日の配達情報はありません。
      </p>

      <div
        v-else
        class="space-y-4"
      >
        <DriverDashboardBookingCard
          v-for="booking in bookings"
          :key="booking.id"
          :booking="booking"
          @click="openDetail(booking.id)"
        />
      </div>

      <!-- ページネーション -->
      <CommonAtomsPaginationNav
        :page="page"
        :total-pages="totalPages"
        @change="goToPage"
      />
    </div>

    <!-- 配達情報詳細ダイアログ -->
    <DriverDashboardBookingDetailDialog
      v-model="isDetailOpen"
      :booking-id="selectedBookingId"
      @saved="handleDetailSaved"
    />
  </div>
</template>

<script setup lang="ts">
import type {
  DriverBooking,
  DriverBookingStatusFilter,
  DriverBookingsResponse,
} from "~/types/driver-dashboard";

const props = defineProps<{
  date: string;
}>();

const STATUS_TABS: Array<{ key: DriverBookingStatusFilter; label: string }> = [
  { key: "all", label: "すべて" },
  { key: "before_pickup", label: "集荷前" },
  { key: "picked_up", label: "集荷済" },
  { key: "delivered", label: "配達済" },
  { key: "cancelled", label: "キャンセル" },
];

const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;

const statusFilter = ref<DriverBookingStatusFilter>("all");
const page = ref(1);
const bookings = ref<DriverBooking[]>([]);
const totalPages = ref(1);
const statusCounts = ref<Record<DriverBookingStatusFilter, number> | null>(null);
const isLoading = ref(false);
const errMsg = ref<string | null>(null);

// 連続操作時に古いレスポンスで上書きしないためのトークン
let fetchToken = 0;

async function fetchBookings(targetPage: number) {
  const token = ++fetchToken;
  isLoading.value = true;
  errMsg.value = null;

  try {
    const query = new URLSearchParams({
      date: props.date,
      status: statusFilter.value,
      page: String(targetPage),
    });
    const data = await $fetch<DriverBookingsResponse>(
      `${apiBase}/api/drivers/me/bookings?${query.toString()}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    if (token !== fetchToken) return;

    bookings.value = data.results;
    totalPages.value = data.total_pages;
    page.value = data.page;
    statusCounts.value = data.status_counts;
  }
  catch (error: unknown) {
    if (token !== fetchToken) return;
    const errData = (error as { data?: { errMsg?: string } })?.data;
    errMsg.value = errData?.errMsg
      ?? "配達情報の取得に失敗しました。しばらく時間をおいて再度お試しください。";
    bookings.value = [];
    totalPages.value = 1;
  }
  finally {
    if (token === fetchToken) isLoading.value = false;
  }
}

function changeStatus(status: DriverBookingStatusFilter) {
  if (statusFilter.value === status) return;
  statusFilter.value = status;
  void fetchBookings(1);
}

function goToPage(targetPage: number) {
  if (targetPage < 1 || targetPage > totalPages.value) return;
  if (targetPage === page.value) return;
  void fetchBookings(targetPage);
}

// 配達情報詳細ダイアログ
const isDetailOpen = ref(false);
const selectedBookingId = ref<string | null>(null);

function openDetail(bookingId: string) {
  selectedBookingId.value = bookingId;
  isDetailOpen.value = true;
}

// ステータス変更・費用保存後は一覧と件数を最新化
function handleDetailSaved() {
  void fetchBookings(page.value);
}

watch(
  () => props.date,
  () => {
    void fetchBookings(1);
  },
);

onMounted(() => void fetchBookings(1));
</script>
