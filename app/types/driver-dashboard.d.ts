// 配達者用ダッシュボードの型定義
import type { DriverDailyRoute } from "~/types/routing";

// 予約の配達状況
export type DriverBookingStatus
  = | "before_pickup"
    | "picked_up"
    | "delivered"
    | "cancelled";

// 一覧のステータス絞り込み（すべて + 各配達状況）
export type DriverBookingStatusFilter = "all" | DriverBookingStatus;

// 予約カードに表示する集荷・配達場所
export type DriverBookingLocation = {
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  date: string;
};

// 配達者が担当する予約1件
export type DriverBooking = {
  id: string;
  booking_number: string;
  delivery_status: DriverBookingStatus;
  pickup: DriverBookingLocation;
  delivery: DriverBookingLocation;
  luggage_count: number;
  luggage_items: Record<string, number>;
  customer_name: string;
  guest_name: string;
  customer_phone_number: string;
  notes: string;
  is_pickup_assignee: boolean;
  is_delivery_assignee: boolean;
};

// 予約詳細（詳細ダイアログ用: 一覧の項目 + 配達実績）
export type DriverBookingDetail = DriverBooking & {
  picked_up_at: string | null;
  delivered_at: string | null;
  facility_fee: number | null;
  transport_cost: number | null;
  delivery_signature: string;
};

// 予約詳細 API のレスポンス
export type DriverBookingDetailResponse = {
  booking: DriverBookingDetail;
};

// 予約一覧 API のレスポンス
export type DriverBookingsResponse = {
  results: DriverBooking[];
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  status_counts: Record<DriverBookingStatusFilter, number>;
};

// ルート生成時に除外された集荷・配達
export type DriverRouteExcludedTask = {
  task_id: string;
  booking_id: string;
  booking_number: string;
  task_type: "pickup" | "delivery";
  reason: string;
};

// 最適化ルート API のレスポンス（既存の DriverDailyRoute + 除外一覧 + 生成日時）
export type DriverRoute = DriverDailyRoute & {
  excluded: DriverRouteExcludedTask[];
  generated_at: string | null;
};

export type DriverRouteResponse = {
  route: DriverRoute;
};
