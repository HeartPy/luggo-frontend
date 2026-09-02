export type Step1FormData = {
  pickup_location_name: string;
  pickup_place_id: string;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  pickup_postal_code: string;
  pickup_location_address: string;
  pickup_date: string;
  delivery_location_name: string;
  delivery_place_id: string;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  delivery_postal_code: string;
  delivery_location_address: string;
  delivery_date: string;
  notes: string;
  pickup_location_name_ja: string;
  pickup_location_address_ja: string;
  delivery_location_name_ja: string;
  delivery_location_address_ja: string;
};

export type LuggageItemData = {
  id: number;
  name: string;
  price: number;
  key: string;
  image_src: string;
};

export type Step2FormData = Record<string, number>;

// 料金更新ダイアログで「どの荷物タイプの単価が変わったか」を表示するための内訳
export type PriceUpdateChangedItem = {
  name: string;
  count: number;
  oldPrice: number;
  newPrice: number;
};

export type Step3FormData = {
  customer_name: string;
  customer_email: string;
  customer_phone_number: string;
  customer_nationality: string;
  guest_name: string;
};

export type BookingFormData = Step1FormData
  & Step2FormData
  & Step3FormData & {
    total_amount: number;
    customer_language: string;
  };

export type ApiErrRes = {
  data: {
    valid_errs?: Record<string, string[]>;
    msg?: string;
    booking?: BookingData["booking"];
    payment_status?: string;
    retry_recommended?: boolean;
    payment_intent_id?: string;
    // フロントで多言語メッセージに変換するためのエラーコードと付随パラメータ
    err_code?: string;
    err_params?: Record<string, string | number>;
    errMsg?: string;
    details?: string;
    server_total_amount?: number;
    client_total_amount?: number;
  };
};

export type BookingData = {
  msg: string;
  booking: {
    booking_number: string;
    id: string;
    [key: string]: unknown;
  };
};

export type OwnerDeliveryStatus = "before_pickup" | "picked_up" | "delivered" | "cancelled";

export type OwnerDriver = {
  id: string;
  name: string;
};

export type OwnerBooking = {
  id: string;
  booking_number: string;
  delivery_status: OwnerDeliveryStatus;
  delivery_status_label: string;
  driver: string | null;
  driver_name: string | null;
  pickup_driver: string | null;
  pickup_driver_name: string | null;
  is_split_assignment: boolean;
  pickup_location_name: string;
  pickup_postal_code: string;
  pickup_location_address: string;
  pickup_latitude?: number | null;
  pickup_longitude?: number | null;
  pickup_date: string | null;
  delivery_location_name: string;
  delivery_postal_code: string;
  delivery_location_address: string;
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;
  delivery_date: string | null;
  luggage_items: Record<string, number> | null;
  total_luggage_count: number;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone_number: string;
  customer_nationality: string;
  customer_nationality_label: string;
  guest_name: string;
  notes: string;
  created_at: string | null;
  can_cancel: boolean;
  is_refundable_on_cancel: boolean;
  // 配達者が入力した配達実績（表示のみ）
  picked_up_at: string | null;
  delivered_at: string | null;
  facility_fee: number | null;
  transport_cost: number | null;
  delivery_signature: string;
};
