<template>
  <div
    class="relative h-[520px] overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
    role="region"
    aria-label="最適化ルートの地図"
  >
    <div
      ref="mapElement"
      class="h-full w-full"
      aria-hidden="true"
    />
    <div
      v-if="mapErr"
      class="absolute inset-0 flex items-center justify-center bg-gray-100 p-6 text-center text-sm text-gray-600"
      role="alert"
    >
      {{ mapErr }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DriverDailyRoute } from "~/types/routing";
import {
  loadGoogleMaps,
  type GoogleMap,
  type GoogleMapsNamespace,
  type LatLng,
  type MapItem,
  type DirectionsResult,
} from "~/composables/useGoogleMaps";

const ROUTE_STROKE_COLOR = "#2563eb";

const props = defineProps<{
  route: DriverDailyRoute | null;
}>();

const config = useRuntimeConfig();
const mapElement = ref<HTMLElement | null>(null);
const mapErr = ref<string | null>(null);

let map: GoogleMap | null = null;
let mapItems: MapItem[] = [];

// 非同期描画の古い結果を捨てるためのトークン
let renderToken = 0;

// 地図上のマーカー・線をすべて消す
function clearMapItems() {
  for (const mapItem of mapItems) mapItem.setMap(null);
  mapItems = [];
}

// Directions API で道なりの経路を取得（訪問順は維持）
async function roadPath(
  maps: GoogleMapsNamespace,
  points: LatLng[],
): Promise<LatLng[]> {
  if (points.length < 2) return points;

  const service = new maps.DirectionsService();
  const path: LatLng[] = [];

  // Directions API の経由地上限（起点・終点を含めて25点）に合わせて分割する
  for (let start = 0; start < points.length - 1; start += 24) {
    const segment = points.slice(start, start + 25);
    const result = await new Promise<DirectionsResult>((resolve, reject) => {
      service.route(
        {
          origin: segment[0], // 起点
          destination: segment.at(-1), // 終点
          // 途中の経由地
          waypoints: segment.slice(1, -1).map(location => ({
            location,
            stopover: true, // 通過点ではなく立ち寄り（止まる地点）
          })),
          // 訪問順はサーバー側で決まっているので最適化しない
          optimizeWaypoints: false,
          travelMode: maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === maps.DirectionsStatus.OK && response) resolve(response);
          else reject(new Error(status));
        },
      );
    });

    path.push(...(result.routes[0]?.overview_path ?? []));
  }

  return path;
}

// 地図にマーカーとルート線を描画
async function renderMap() {
  // この描画の番号を控える（後から来た古い結果で上書きしないため）
  const token = ++renderToken;
  if (!mapElement.value) return;

  const apiKey = config.public.googleMapsApiKey;
  if (!apiKey) {
    mapErr.value
      = "地図を表示するには Google Maps JavaScript API キーの設定が必要です。";
    return;
  }

  try {
    const maps = await loadGoogleMaps(apiKey);
    mapErr.value = null;
    // 初回のみ地図を作成
    map ??= new maps.Map(mapElement.value, {
      center: { lat: 34.7024, lng: 135.4959 }, // 仮の中心（大阪駅付近）
      zoom: 11, // 初期ズーム
      mapTypeControl: false, // 地図/航空写真の切替を非表示
      streetViewControl: false, // ストリートビューを非表示
    });
    clearMapItems();

    const route = props.route;
    if (!route) return;

    // 表示範囲（地点を集めて、全体が画面に収まるようズームする）
    const bounds = new maps.LatLngBounds();

    let pointCount = 0;
    const stopsPath: LatLng[] = [];

    // 訪問順ラベル付きのマーカーを置く
    for (const stop of route.stops) {
      if (!Number.isFinite(stop.latitude) || !Number.isFinite(stop.longitude)) {
        continue;
      }

      const position = { lat: stop.latitude, lng: stop.longitude };
      stopsPath.push(position);
      bounds.extend(position);
      pointCount += 1;

      // 訪問順番号付きのマーカーを追加
      mapItems.push(new maps.Marker({
        map,
        position,
        label: {
          text: String(stop.sequence),
          color: "#ffffff",
          fontWeight: "700",
        },
        title: stop.location_name,
      }));
    }

    const departure = {
      lat: route.departure_latitude,
      lng: route.departure_longitude,
    };
    const hasDeparture = Number.isFinite(departure.lat)
      && Number.isFinite(departure.lng);

    if (hasDeparture) {
      bounds.extend(departure);
      pointCount += 1;
    }

    // 出発 → 各停留所 → 出発に戻る経路
    const requestedPath = hasDeparture
      ? [departure, ...stopsPath, departure]
      : stopsPath;
    let displayedPath = requestedPath;

    try {
      // 道なりの経路に変換
      displayedPath = await roadPath(maps, requestedPath);
    }
    catch {
      // Directions API が使えない場合は直線プレビューにフォールバック
    }

    // 描画中に route が変わった場合は古い結果を捨てる
    if (token !== renderToken) return;

    // ルート線を描画
    if (displayedPath.length > 1) {
      mapItems.push(new maps.Polyline({
        map, // この地図に表示
        path: displayedPath, // 線の座標列
        strokeColor: ROUTE_STROKE_COLOR, // 線の色
        strokeOpacity: 0.85, // 線の不透明度
        strokeWeight: 5, // 線の太さ
      }));
    }

    // 全体が収まるようにズーム
    if (pointCount > 0) map.fitBounds(bounds, 48);
  }
  catch {
    mapErr.value = "Google Mapsを読み込めませんでした。";
  }
}

watch(
  () => props.route,
  () => void renderMap(),
  { deep: true },
);

onMounted(() => void renderMap());
// 地図上のマーカー・線を外してから破棄
onBeforeUnmount(clearMapItems);
</script>
