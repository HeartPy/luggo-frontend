<template>
  <article
    data-testid="driver-booking-card"
    class="cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    role="button"
    tabindex="0"
    :aria-label="`${booking.booking_number} の配達情報詳細を開く`"
    @click="emit('click')"
    @keydown.enter="emit('click')"
  >
    <div class="space-y-4 p-4">
      <div class="flex flex-wrap items-center gap-2">
        <span
          data-testid="driver-booking-status"
          class="inline-block whitespace-nowrap rounded-full px-3 py-1 text-center text-xs font-semibold"
          :class="statusPillClass"
        >
          {{ statusLabel }}
        </span>
        <span class="text-xs text-gray-500">{{ booking.booking_number }}</span>
        <span
          v-if="booking.luggage_count > 0"
          class="text-xs text-gray-500"
        >
          荷物 {{ booking.luggage_count }}個
        </span>
        <span
          v-if="booking.notes"
          class="rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-800"
        >
          備考あり
        </span>
      </div>

      <p
        v-if="displayName"
        class="text-sm font-semibold text-gray-800"
      >
        {{ displayName }}
      </p>

      <div class="space-y-3 text-sm text-gray-800">
        <div class="flex items-center gap-x-3">
          <div class="flex flex-col gap-y-1">
            <div class="flex flex-wrap items-baseline gap-x-2">
              <span class="shrink-0 font-semibold">集荷場所：</span>
              <span class="min-w-0">{{ booking.pickup.name }}</span>
              <span class="text-xs text-gray-500">{{ formatDate(booking.pickup.date) }}</span>
              <span
                v-if="!booking.is_pickup_assignee"
                class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500"
              >
                担当外
              </span>
            </div>
            <p class="min-w-0 text-xs text-gray-500">
              {{ booking.pickup.address }}
            </p>
          </div>
          <a
            v-if="pickupNavUrl"
            :href="pickupNavUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border-2 border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            @click.stop
          >
            ナビ
          </a>
        </div>
        <div class="flex items-center gap-x-3">
          <div class="flex flex-col gap-y-1.5">
            <div class="flex flex-wrap items-baseline gap-x-2">
              <span class="shrink-0 font-semibold">配達場所：</span>
              <span class="min-w-0">{{ booking.delivery.name }}</span>
              <span class="text-xs text-gray-500">{{ formatDate(booking.delivery.date) }}</span>
              <span
                v-if="!booking.is_delivery_assignee"
                class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500"
              >
                担当外
              </span>
            </div>
            <p class="min-w-0 text-xs text-gray-500">
              {{ booking.delivery.address }}
            </p>
          </div>
          <a
            v-if="deliveryNavUrl"
            :href="deliveryNavUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border-2 border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            @click.stop
          >
            ナビ
          </a>
        </div>
      </div>
    </div>

    <!-- 集荷・配達場所のミニマップ（画面に入ってから初期化） -->
    <div
      class="relative aspect-video w-full cursor-default border-t border-gray-200 bg-gray-100"
      @click.stop
      @keydown.enter.stop
    >
      <div
        ref="mapElement"
        class="absolute inset-0 h-full w-full"
      />
      <div
        v-if="mapErr"
        class="absolute inset-0 flex items-center justify-center bg-gray-100 p-4 text-center text-xs text-gray-600"
      >
        {{ mapErr }}
      </div>
      <div
        class="pointer-events-none absolute bottom-2 left-2 flex gap-3 rounded-md bg-white/90 px-2 py-1 text-[11px] text-gray-700"
      >
        <span class="flex items-center gap-1">
          <span class="h-2.5 w-2.5 rounded-full bg-blue-600" />集荷
        </span>
        <span class="flex items-center gap-1">
          <span class="h-2.5 w-2.5 rounded-full bg-green-600" />配達
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { DriverBooking, DriverBookingStatus } from "~/types/driver-dashboard";
import { navigationUrl } from "~/utils/googleMapsNavigation";
import {
  loadGoogleMaps,
  type GoogleMap,
  type LatLng,
  type MapItem,
} from "~/composables/useGoogleMaps";

const PICKUP_MARKER_COLOR = "#2563eb";
const DELIVERY_MARKER_COLOR = "#16a34a";

const props = defineProps<{
  booking: DriverBooking;
}>();

const emit = defineEmits<{
  click: [];
}>();

const STATUS_LABELS: Record<DriverBookingStatus, string> = {
  before_pickup: "集荷前",
  picked_up: "集荷済",
  delivered: "配達済",
  cancelled: "キャンセル",
};

const STATUS_PILL_CLASSES: Record<DriverBookingStatus, string> = {
  before_pickup: "bg-gray-300 text-gray-700",
  picked_up: "bg-blue-600 text-white",
  delivered: "bg-green-600 text-white",
  cancelled: "bg-red-600 text-white",
};

const statusLabel = computed(() => {
  const status: string = props.booking.delivery_status;
  return Object.hasOwn(STATUS_LABELS, status)
    ? STATUS_LABELS[status as DriverBookingStatus]
    : "不明";
});
const statusPillClass = computed(() => {
  const status: string = props.booking.delivery_status;
  return Object.hasOwn(STATUS_PILL_CLASSES, status)
    ? STATUS_PILL_CLASSES[status as DriverBookingStatus]
    : "bg-gray-300 text-gray-700";
});

// Google Mapアプリで目的地ナビを開くURL（座標がある場所のみ）
const pickupNavUrl = computed(() => {
  const { lat, lng } = props.booking.pickup;
  return lat !== null && lng !== null ? navigationUrl(lat, lng) : null;
});
const deliveryNavUrl = computed(() => {
  const { lat, lng } = props.booking.delivery;
  return lat !== null && lng !== null ? navigationUrl(lat, lng) : null;
});

const displayName = computed(() => {
  const guest = props.booking.guest_name.trim();
  const customer = props.booking.customer_name.trim();
  if (guest && customer && guest !== customer) return `${guest}（${customer}）`;
  return guest || customer;
});

// "YYYY-MM-DD" → "8/18"
function formatDate(value: string): string {
  if (!value) return "";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
  });
}

const config = useRuntimeConfig();
const mapElement = ref<HTMLElement | null>(null);
const mapErr = ref<string | null>(null);

let map: GoogleMap | null = null;
let mapItems: MapItem[] = [];
let observer: IntersectionObserver | null = null;
let isMapRequested = false;

function clearMapItems() {
  for (const mapItem of mapItems) mapItem.setMap(null);
  mapItems = [];
}

// 集荷・配達の2地点にマーカーを置いた小型マップを描画
async function renderMap() {
  if (!mapElement.value) return;

  const apiKey = config.public.googleMapsApiKey;
  if (!apiKey) {
    mapErr.value = "地図を表示するには Google Maps APIキーの設定が必要です。";
    return;
  }

  // 座標がある集荷・配達だけピン候補にする
  const points: Array<{ position: LatLng; color: string; label: string; title: string }> = [];
  const pickup = props.booking.pickup;
  const delivery = props.booking.delivery;
  if (pickup.lat !== null && pickup.lng !== null) {
    points.push({
      position: { lat: pickup.lat, lng: pickup.lng },
      color: PICKUP_MARKER_COLOR,
      label: "集",
      title: pickup.name,
    });
  }
  if (delivery.lat !== null && delivery.lng !== null) {
    points.push({
      position: { lat: delivery.lat, lng: delivery.lng },
      color: DELIVERY_MARKER_COLOR,
      label: "配",
      title: delivery.name,
    });
  }
  if (points.length === 0) {
    mapErr.value = "位置情報が未登録のため地図を表示できません。";
    return;
  }

  try {
    const maps = await loadGoogleMaps(apiKey);
    // 読み込み中にカードが外れていたら描画しない
    if (!mapElement.value) return;
    mapErr.value = null;

    // 初回のみ地図を作成
    map ??= new maps.Map(mapElement.value, {
      center: points[0]!.position,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    clearMapItems();

    const bounds = new maps.LatLngBounds();
    for (const point of points) {
      bounds.extend(point.position);
      mapItems.push(new maps.Marker({
        map,
        position: point.position,
        title: point.title, // ホバー時の場所名
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: point.color,
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        label: {
          text: point.label, // ピン上の「集」「配」
          color: "#ffffff",
          fontSize: "11px",
          fontWeight: "700",
        },
      }));
    }

    // 2地点なら両方収まるようズーム（1地点だけの場合は center / zoom のまま）
    if (points.length > 1) map.fitBounds(bounds, 40);
  }
  catch {
    mapErr.value = "Google Mapsを読み込めませんでした。";
  }
}

onMounted(() => {
  if (!mapElement.value) return;

  // 画面に入ったカードだけ地図を初期化して読み込みを抑える
  observer = new IntersectionObserver((entries) => {
    if (!entries.some(entry => entry.isIntersecting) || isMapRequested) return;
    isMapRequested = true;
    observer?.disconnect();
    observer = null;
    void renderMap();
  }, { rootMargin: "120px" });
  observer.observe(mapElement.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  clearMapItems();
});
</script>
