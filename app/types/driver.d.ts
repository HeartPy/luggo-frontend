// 配達者一覧（事業者ダッシュボード）用の型定義

// 配達者詳細ポップアップで表示する予約の要約
export type DriverBookingSummary = {
  id: string;
  booking_number: string;
  delivery_status: string;
  delivery_status_label: string;
  pickup_location_name: string;
  pickup_date: string | null;
  delivery_location_name: string;
  delivery_date: string | null;
  total_amount: number;
  attributed_sales: number | null;
  assignment_role: "pickup" | "delivery" | "both" | null;
  pickup_driver_name: string | null;
  delivery_driver_name: string | null;
};

// 月別の集荷・配達件数・売上
export type DriverMonthlyStat = {
  month: string;
  count: number;
  sales: number;
};

// 配達者一覧の行
export type OwnerDriverRow = {
  id: string;
  name: string;
  company_name: string;
  email: string;
  departure_label: string;
  departure_address: string;
  departure_place_id: string;
  departure_latitude: number | null;
  departure_longitude: number | null;
  shift_start: string | null;
  max_daily_stops: number | null;
  max_daily_luggage_count: number | null;
  license_expiry: string | null;
  operating_days: string;
  is_available: boolean;
  profile_picture_url: string | null;
  next_delivery_date: string | null;
  month_delivery_count: number;
  month_sales: number;
};

// 配達者詳細（ポップアップ）
export type OwnerDriverDetail = {
  id: string;
  last_name: string;
  first_name: string;
  name: string;
  company_name: string;
  email: string;
  departure_label: string;
  departure_address: string;
  departure_place_id: string;
  departure_latitude: number | null;
  departure_longitude: number | null;
  shift_start: string | null;
  max_daily_stops: number | null;
  max_daily_luggage_count: number | null;
  license_expiry: string | null;
  operating_days: string;
  is_available: boolean;
  profile_picture_url: string | null;
  created_at: string | null;
  upcoming_deliveries: DriverBookingSummary[];
  past_deliveries: DriverBookingSummary[];
  monthly_stats: DriverMonthlyStat[];
  assignable_bookings: DriverBookingSummary[];
};
