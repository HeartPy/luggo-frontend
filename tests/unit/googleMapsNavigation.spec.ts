import { describe, it, expect } from "vitest";
import type { DriverRoute } from "~/types/driver-dashboard";
import type { RouteStop } from "~/types/routing";
import {
  navigationUrl,
  fullRouteNavigation,
} from "~/utils/googleMapsNavigation";

function makeStop(index: number): RouteStop {
  return {
    id: `stop-${index}`,
    sequence: index,
    booking_id: `booking-${index}`,
    booking_number: `LG${index}`,
    task_type: "pickup",
    location_name: `Stop ${index}`,
    location_address: `Address ${index}`,
    latitude: 35 + index * 0.01,
    longitude: 139 + index * 0.01,
    planned_arrival_at: null,
    travel_seconds_from_previous: 0,
    distance_meters_from_previous: 0,
  };
}

function makeRoute(stopCount: number): DriverRoute {
  return {
    id: "route-1",
    driver_id: "driver-1",
    driver_name: "Test Driver",
    departure_latitude: 35.6812,
    departure_longitude: 139.7671,
    total_duration_seconds: 0,
    total_distance_meters: 0,
    stop_count: stopCount,
    stops: Array.from({ length: stopCount }, (_, i) => makeStop(i + 1)),
    excluded: [],
    generated_at: null,
  };
}

describe("navigationUrl", () => {
  it("destination と travelmode=driving を含む URL を返す", () => {
    const url = navigationUrl(35.6812, 139.7671);
    const parsed = new URL(url);

    expect(parsed.origin + parsed.pathname).toBe(
      "https://www.google.com/maps/dir/",
    );
    expect(parsed.searchParams.get("api")).toBe("1");
    expect(parsed.searchParams.get("destination")).toBe("35.6812,139.7671");
    expect(parsed.searchParams.get("travelmode")).toBe("driving");
  });
});

describe("fullRouteNavigation", () => {
  it("stops が 0 件のとき null を返す", () => {
    expect(fullRouteNavigation(makeRoute(0))).toBeNull();
  });

  it("stops が 9 件以下のとき全件を waypoints にし destination を出発地に戻す", () => {
    const route = makeRoute(2);
    const result = fullRouteNavigation(route);

    expect(result).not.toBeNull();
    expect(result!.truncated).toBe(false);

    const params = new URL(result!.url).searchParams;
    expect(params.get("origin")).toBe("35.6812,139.7671");
    expect(params.get("destination")).toBe("35.6812,139.7671");
    expect(params.get("waypoints")).toBe(
      "35.01,139.01|35.02,139.02",
    );
    expect(params.get("travelmode")).toBe("driving");
  });

  it("stops がちょうど 10 件のとき先頭 9 件を waypoints、10 件目を destination にする", () => {
    const route = makeRoute(10);
    const result = fullRouteNavigation(route);

    expect(result).not.toBeNull();
    expect(result!.truncated).toBe(false);

    const params = new URL(result!.url).searchParams;
    const waypoints = params.get("waypoints")!.split("|");
    expect(waypoints).toHaveLength(9);
    expect(params.get("destination")).toBe("35.1,139.1");
  });

  it("stops が 11 件以上のとき truncated を true にする", () => {
    const route = makeRoute(11);
    const result = fullRouteNavigation(route);

    expect(result).not.toBeNull();
    expect(result!.truncated).toBe(true);

    const params = new URL(result!.url).searchParams;
    expect(params.get("waypoints")!.split("|")).toHaveLength(9);
    expect(params.get("destination")).toBe("35.1,139.1");
  });

  it("waypoints を | 区切りで URL エンコードする", () => {
    const route = makeRoute(2);
    const result = fullRouteNavigation(route)!;
    // URLSearchParams は "|" を "%7C" にエンコードする
    expect(result.url).toContain("waypoints=35.01%2C139.01%7C35.02%2C139.02");
  });
});
