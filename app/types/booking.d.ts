export type Step1FormData = {
  pickup_location_name: string;
  pickup_postal_code: string;
  pickup_location_address: string;
  pickup_date: string;
  delivery_location_name: string;
  delivery_postal_code: string;
  delivery_location_address: string;
  delivery_date: string;
  notes: string;
};

export type LuggageItemData = {
  id: number;
  name: string;
  price: number;
  key: string;
  image_src: string;
};

export type Step2FormData = Record<string, number>;

export type Step3FormData = {
  customer_name: string;
  customer_email: string;
  customer_phone_number: string;
  customer_nationality: string;
  guest_name: string;
};

export type BookingFormData = Step1FormData & Step2FormData & Step3FormData;

export type ApiErrRes = {
  data: {
    valid_errs?: Record<string, string[]>;
    message?: string;
    booking?: BookingData["booking"];
    payment_status?: string;
    retry_recommended?: boolean;
    payment_intent_id?: string;
    errMsg?: string;
    details?: string;
  };
};

export type BookingData = {
  message: string;
  booking: {
    booking_number: string;
    id: string;
    [key: string]: unknown;
  };
};
