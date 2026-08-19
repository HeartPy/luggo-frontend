// Google Maps JavaScript API の読み込みを共通化するコンポーザブル
// （@types/google.maps に依存せず、使用する分だけ型を定義する）

export type LatLng = { lat: number; lng: number };
export type MapObject = object;

// 地図の表示範囲
export type BoundsObject = {
  extend: (point: LatLng) => void;
};

// 地図のマーカー・線
export type MapItem = {
  setMap: (map: MapObject | null) => void;
};

// ルート検索結果（描画用の座標）
export type DirectionsResult = {
  routes: Array<{ overview_path: LatLng[] }>;
};

// 地図インスタンス（表示範囲の自動調整付き）
export type GoogleMap = MapObject & {
  fitBounds: (bounds: BoundsObject, padding?: number) => void;
};

// google.maps（このプロジェクトで使う分だけ）
export type GoogleMapsNamespace = {
  // 地図
  Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap;
  // 地点マーカー
  Marker: new (options: Record<string, unknown>) => MapItem;
  // ルートの線
  Polyline: new (options: Record<string, unknown>) => MapItem;
  // 表示範囲
  LatLngBounds: new () => BoundsObject;
  // マーカー用の組み込み図形（円など）
  SymbolPath: { CIRCLE: number };
  // ルート検索
  DirectionsService: new () => {
    route: (
      request: Record<string, unknown>,
      callback: (result: DirectionsResult | null, status: string) => void,
    ) => void;
  };
  // 検索成功ステータス
  DirectionsStatus: { OK: string };
  // 車での経路
  TravelMode: { DRIVING: string };
};

// Google Maps スクリプトの重複読み込みを防ぐ（アプリ全体で共有）
let mapsPromise: Promise<GoogleMapsNamespace> | null = null;

// Maps JavaScript API を一度だけ読み込む
export function loadGoogleMaps(apiKey: string): Promise<GoogleMapsNamespace> {
  if (!import.meta.client) return Promise.reject(new Error("client only"));

  // 既に読み込み済みなら再利用
  const current = (window as unknown as {
    google?: { maps?: GoogleMapsNamespace };
  }).google?.maps;
  if (current) return Promise.resolve(current);
  // 読み込み中なら同じ Promise を返す
  if (mapsPromise) return mapsPromise;

  // Maps スクリプトを読み込み、完了したら google.maps を返す
  mapsPromise = new Promise((resolve, reject) => {
    const callbackName = `luggoInitMap${Date.now()}`;
    const callbackWindow = window as unknown as Record<string, unknown>;

    // 読み込み完了時に Maps API から呼ばれる
    // google.maps が使えるか確認
    callbackWindow[callbackName] = () => {
      const loaded = (window as unknown as {
        google?: { maps?: GoogleMapsNamespace };
      }).google?.maps;
      callbackWindow[callbackName] = undefined;

      if (loaded) resolve(loaded);
      else reject(new Error("Google Mapsの初期化に失敗しました。"));
    };

    const script = document.createElement("script");
    script.src
      = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => reject(new Error("Google Mapsの読み込みに失敗しました。"));
    document.head.appendChild(script);
  });

  return mapsPromise;
}
