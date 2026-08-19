<template>
  <div
    class="pt-4"
    aria-labelledby="driver-route-heading"
  >
    <h2
      id="driver-route-heading"
      class="sr-only"
    >
      最適化ルート
    </h2>

    <div
      v-if="isLoading"
      class="flex flex-col items-center gap-3 py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="最適化ルートを生成しています"
    >
      <CommonAtomsLoadingAnimation size="md" />
      <p class="text-sm text-gray-500">
        最適化ルートを生成しています…
      </p>
    </div>

    <p
      v-else-if="errMsg"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ errMsg }}
    </p>

    <p
      v-else-if="!route || route.stop_count === 0"
      class="py-16 text-center text-sm text-gray-500"
      role="status"
    >
      この日に割り当てられた集荷・配達はありません。
    </p>

    <div
      v-else
      class="space-y-4"
    >
      <!-- 最終生成時刻と再生成ボタン -->
      <div class="flex items-center justify-between gap-2">
        <p class="text-xs text-gray-500">
          <template v-if="generatedAtLabel">
            最終生成: {{ generatedAtLabel }}
          </template>
        </p>
        <button
          type="button"
          class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isLoading"
          :aria-busy="isLoading"
          @click="() => void fetchRoute(true)"
        >
          ルート再生成
        </button>
      </div>

      <!-- 合計サマリー -->
      <div
        class="grid grid-cols-3 gap-2"
        role="group"
        aria-label="ルートの概要"
      >
        <div class="rounded-xl bg-gray-50 p-3 text-center">
          <p class="text-xs text-gray-500">
            訪問先
          </p>
          <p class="text-lg font-bold text-gray-800">
            {{ route.stop_count }}件
          </p>
        </div>
        <div class="rounded-xl bg-gray-50 p-3 text-center">
          <p class="text-xs text-gray-500">
            合計所要時間
          </p>
          <p class="text-lg font-bold text-gray-800">
            {{ formatDuration(route.total_duration_seconds) }}
          </p>
        </div>
        <div class="rounded-xl bg-gray-50 p-3 text-center">
          <p class="text-xs text-gray-500">
            合計距離
          </p>
          <p class="text-lg font-bold text-gray-800">
            {{ formatDistance(route.total_distance_meters) }}
          </p>
        </div>
      </div>

      <!-- Google Mapアプリでルート全体のナビを開く -->
      <div v-if="fullRouteNav">
        <a
          :href="fullRouteNav.url"
          target="_blank"
          rel="noopener noreferrer"
          class="block w-full rounded-md border-2 border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :aria-describedby="fullRouteNav.truncated ? 'full-route-nav-truncated' : undefined"
        >
          Google Mapでルートを開く
        </a>
        <p
          v-if="fullRouteNav.truncated"
          id="full-route-nav-truncated"
          class="mt-1 text-xs text-gray-500"
        >
          訪問先が多いため先頭10件までを開きます。
        </p>
      </div>

      <!-- ルート地図（出発地点から訪問順に回り、出発地点へ戻る） -->
      <DriverDashboardAtomsRouteMap :route="route" />

      <!-- 除外された集荷・配達 -->
      <div
        v-if="route.excluded.length > 0"
        class="rounded-lg border border-yellow-200 bg-yellow-100 px-4 py-3 text-sm text-yellow-800"
        role="status"
      >
        <p class="font-semibold">
          位置情報が未登録のためルートに含められなかった予約があります。
        </p>
        <ul class="mt-1 list-inside list-disc">
          <li
            v-for="task in route.excluded"
            :key="task.task_id"
          >
            {{ task.booking_number }}（{{ task.task_type === "pickup" ? "集荷" : "配達" }}）
          </li>
        </ul>
      </div>

      <!-- 訪問順リスト -->
      <ol
        class="space-y-3"
        aria-label="訪問順"
      >
        <li
          v-for="stop in route.stops"
          :key="stop.id"
          class="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          role="button"
          tabindex="0"
          :aria-label="`${stop.booking_number} の配達情報詳細を開く`"
          @click="openDetail(stop.booking_id)"
          @keydown.enter="openDetail(stop.booking_id)"
          @keydown.space.prevent="openDetail(stop.booking_id)"
        >
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-white"
          >
            {{ stop.sequence }}
          </span>
          <div class="min-w-0 flex-1">
            <div class="mb-1 flex flex-wrap items-center gap-2">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="stop.task_type === 'pickup'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'"
              >
                {{ stop.task_type === "pickup" ? "集荷" : "配達" }}
              </span>
              <span class="text-xs text-gray-500">{{ stop.booking_number }}</span>
            </div>
            <p class="text-sm font-semibold text-gray-800">
              {{ stop.location_name }}
            </p>
            <p class="mb-1 text-xs text-gray-500">
              {{ stop.location_address }}
            </p>
            <p class="text-xs text-gray-600">
              <template v-if="stop.planned_arrival_at">
                到着予定 {{ formatArrival(stop.planned_arrival_at) }}
              </template>
              <template v-if="stop.travel_seconds_from_previous > 0">
                ・前地点から{{ formatDuration(stop.travel_seconds_from_previous) }}
              </template>
            </p>
          </div>
          <a
            :href="navigationUrl(stop.latitude, stop.longitude)"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex min-h-11 shrink-0 items-center justify-center self-center rounded-md border-2 border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :aria-label="`${stop.location_name}へのナビをGoogle Mapで開く`"
            @click.stop
          >
            ナビ
          </a>
        </li>
      </ol>
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
import type { DriverRoute, DriverRouteResponse } from "~/types/driver-dashboard";
import { fullRouteNavigation, navigationUrl } from "~/utils/googleMapsNavigation";

const props = defineProps<{
  date: string;
}>();

const config = useRuntimeConfig();
const apiBase = config.public.apiBaseUrl;

const route = ref<DriverRoute | null>(null);
const isLoading = ref(false);
const errMsg = ref<string | null>(null);

// 連続で日付を切り替えたときに古い結果で上書きしないためのトークン
let fetchToken = 0;

async function fetchRoute(refresh = false) {
  const token = ++fetchToken;
  isLoading.value = true;
  errMsg.value = null;

  try {
    const query = new URLSearchParams({ date: props.date });
    if (refresh) query.set("refresh", "1");
    const data = await $fetch<DriverRouteResponse>(
      `${apiBase}/api/drivers/me/route?${query.toString()}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    if (token !== fetchToken) return;
    route.value = data.route;
  }
  catch (err: unknown) {
    if (token !== fetchToken) return;
    const errData = (err as { data?: { errMsg?: string } })?.data;
    errMsg.value = errData?.errMsg
      ?? "ルートの生成に失敗しました。しばらく時間をおいて再度お試しください。";
    route.value = null;
  }
  finally {
    if (token === fetchToken) isLoading.value = false;
  }
}

// 秒を「分」または「時間○分」に変換
function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}分`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}時間${rest}分` : `${hours}時間`;
}

// メートルを「m」または小数1桁の「km」に変換
function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

// ISO日時 → "HH:MM"
function formatArrival(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ルート全体をGoogle Mapアプリで開くナビURL（経由地上限あり）
const fullRouteNav = computed(() =>
  route.value ? fullRouteNavigation(route.value) : null,
);

// 最終生成時刻（当日ならHH:MM、それ以外は日付付き）
const generatedAtLabel = computed(() => {
  const value = route.value?.generated_at;
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const isToday = parsed.toDateString() === new Date().toDateString();
  const time = parsed.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (isToday) return time;
  return `${parsed.toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
  })} ${time}`;
});

watch(
  () => props.date,
  () => void fetchRoute(),
);

onMounted(() => void fetchRoute());

// 配達情報詳細ダイアログ
const isDetailOpen = ref(false);
const selectedBookingId = ref<string | null>(null);

function openDetail(bookingId: string) {
  selectedBookingId.value = bookingId;
  isDetailOpen.value = true;
}

// 詳細保存後は完了分を既存ルートから除外するため、再取得する（再生成はしない）
function handleDetailSaved() {
  void fetchRoute();
}
</script>
