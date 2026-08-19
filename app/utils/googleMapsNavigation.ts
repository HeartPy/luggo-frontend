// Google Mapsアプリ（またはWeb）にナビを引き渡すURLの生成
// Google Maps URL（https://developers.google.com/maps/documentation/urls）を使うため課金は発生しない
import type { DriverRoute } from "~/types/driver-dashboard";

const DIRECTIONS_BASE = "https://www.google.com/maps/dir/?api=1";

// Google Maps URLで1本のルートに含められる経由地（waypoints）の上限
const MAX_WAYPOINTS = 9;

function toParam(lat: number, lng: number): string {
  return `${lat},${lng}`;
}

// 単一目的地へのナビURL
export function navigationUrl(lat: number, lng: number): string {
  const query = new URLSearchParams({
    destination: toParam(lat, lng),
    travelmode: "driving",
  });
  return `${DIRECTIONS_BASE}&${query.toString()}`;
}

export type FullRouteNavigation = {
  url: string;
  // 経由地上限により、末尾の訪問先を含められなかったか
  truncated: boolean;
};

// 最適化ルート全体（出発地→訪問順→出発地）のナビURL
// 訪問先が9件以下: 全訪問先を経由地にして出発地へ戻る往復ルート
// 10件: 先頭9件を経由地、10件目を目的地にする
// 11件以上: 同上（先頭10件のみ、truncated=true）
export function fullRouteNavigation(route: DriverRoute): FullRouteNavigation | null {
  if (route.stops.length === 0) return null;

  const origin = toParam(route.departure_latitude, route.departure_longitude);
  const stops = route.stops.map(stop => toParam(stop.latitude, stop.longitude));

  let destination: string;
  let waypoints: string[];
  if (stops.length <= MAX_WAYPOINTS) {
    waypoints = stops;
    destination = origin;
  }
  else {
    waypoints = stops.slice(0, MAX_WAYPOINTS);
    destination = stops[MAX_WAYPOINTS]!;
  }

  const query = new URLSearchParams({
    origin,
    destination,
    waypoints: waypoints.join("|"),
    travelmode: "driving",
  });
  return {
    url: `${DIRECTIONS_BASE}&${query.toString()}`,
    truncated: stops.length > MAX_WAYPOINTS + 1,
  };
}
