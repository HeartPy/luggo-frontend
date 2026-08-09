import { object, string, number, type NumberSchema } from "yup";
import type {
  Step1FormData,
  Step2FormData,
  LuggageItemData,
} from "~/types/booking";

// バリデーションメッセージの翻訳関数（vue-i18n の t を想定）
export type ValidationTranslator = (key: string) => string;

// JST基準の年・月・日・時を数値で取得
const _jstFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  hour12: false,
});

const _jstParts = () => {
  const parts = _jstFormatter.formatToParts(new Date());
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find(part => part.type === type)!.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
  };
};

// UTC の Date を「JSTの年月日」から組み立てる
// 時刻は00:00にリセット
const _jstDateUTC = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month - 1, day));

// Date → YYYY-MM-DD
// UTC基準で取り出し
const _formatUTC = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

// 予約受付の最短日（前日23時締切）
// 23:00 JST 未満 → 翌日から、23:00 以降 → 翌々日から
export const getMinPickupDate = () => {
  const { year, month, day, hour } = _jstParts();
  const daysAhead = hour < 23 ? 1 : 2;
  const date = _jstDateUTC(year, month, day);
  date.setUTCDate(date.getUTCDate() + daysAhead);
  return _formatUTC(date);
};

// 予約受付の最長日（180日先）
export const getMaxBookingDate = () => {
  const { year, month, day } = _jstParts();
  const date = _jstDateUTC(year, month, day);
  date.setUTCDate(date.getUTCDate() + 180);
  return _formatUTC(date);
};

// 入力された日付を YYYY-MM-DD へ正規化
export const normalizeToIsoDate = (input: unknown) => {
  if (typeof input !== "string") return input;
  const s = input.trim().replace(/[-.]/g, "/");
  const m = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!m) return input;
  const y = m[1];
  const mm = String(Number(m[2])).padStart(2, "0");
  const dd = String(Number(m[3])).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
};

// 実在する日付かどうか
export const isValidIsoDate = (v: string) => {
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return (
    dt.getUTCFullYear() === y
    && dt.getUTCMonth() + 1 === mo
    && dt.getUTCDate() === d
  );
};

// 郵便番号の先頭2桁から都道府県コードへのマッピング
const POSTAL_PREFIX_TO_PREF: Record<string, string> = {
  "00": "01",
  "04": "01",
  "05": "01",
  "06": "01",
  "07": "01",
  "08": "01",
  "09": "01",
  "03": "02",
  "02": "03",
  "98": "04",
  "01": "05",
  "99": "06",
  "96": "07",
  "97": "07",
  "30": "08",
  "31": "08",
  "32": "09",
  "37": "10",
  "33": "11",
  "34": "11",
  "35": "11",
  "36": "11",
  "26": "12",
  "27": "12",
  "28": "12",
  "29": "12",
  "10": "13",
  "11": "13",
  "12": "13",
  "13": "13",
  "14": "13",
  "15": "13",
  "16": "13",
  "17": "13",
  "18": "13",
  "19": "13",
  "20": "13",
  "21": "14",
  "22": "14",
  "23": "14",
  "24": "14",
  "25": "14",
  "94": "15",
  "95": "15",
  "93": "16",
  "92": "17",
  "91": "18",
  "40": "19",
  "38": "20",
  "39": "20",
  "50": "21",
  "41": "22",
  "42": "22",
  "43": "22",
  "44": "23",
  "45": "23",
  "46": "23",
  "47": "23",
  "48": "23",
  "49": "23",
  "51": "24",
  "52": "25",
  "60": "26",
  "61": "26",
  "53": "27",
  "54": "27",
  "55": "27",
  "56": "27",
  "57": "27",
  "58": "27",
  "59": "27",
  "65": "28",
  "66": "28",
  "67": "28",
  "63": "29",
  "64": "30",
  "68": "31",
  "69": "32",
  "70": "33",
  "71": "33",
  "72": "34",
  "73": "34",
  "74": "35",
  "75": "35",
  "77": "36",
  "76": "37",
  "79": "38",
  "78": "39",
  "80": "40",
  "81": "40",
  "82": "40",
  "83": "40",
  "84": "41",
  "85": "42",
  "86": "43",
  "87": "44",
  "88": "45",
  "89": "46",
  "90": "47",
  "62": "28",
};

export function prefCodeFromPostal(postalCode: string): string | null {
  if (postalCode.length < 2) return null;
  const prefix = postalCode.substring(0, 2);
  return POSTAL_PREFIX_TO_PREF[prefix] ?? null;
}

function isoDateToWeekday(iso: string): number {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return -1;
  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
  const jsDay = date.getUTCDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function isoDateToNthWeekdayKey(iso: string): string | null {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const day = Number(match[3]);
  const nth = Math.floor((day - 1) / 7) + 1;
  const wd = isoDateToWeekday(iso);
  if (wd < 0) return null;
  return `${nth}-${wd}`;
}

// Step1のバリデーションスキーマを生成
export const createStep1Schema = (
  options?: {
    departurePrefectures?: string[];
    deliverablePrefectures?: string[];
    operatingDays?: string;
    nthWeekdayHolidays?: string[];
    temporaryClosures?: string[];
  },
  t: ValidationTranslator = key => key,
) => {
  const minPickup = getMinPickupDate();
  const maxDate = getMaxBookingDate();
  const departurePrefectures = options?.departurePrefectures ?? [];
  const deliverablePrefectures = options?.deliverablePrefectures ?? [];
  const operatingDays = options?.operatingDays ?? "1111111";
  const nthWeekdayHolidays = new Set(options?.nthWeekdayHolidays ?? []);
  const temporaryClosures = new Set(options?.temporaryClosures ?? []);

  return object({
    pickup_postal_code: string()
      .trim()
      .required(t("validation.pickupPostalRequired"))
      .matches(/^[0-9]{7}$/u, t("validation.postalFormat"))
      .test(
        "is-departure-area",
        t("validation.notDepartureArea"),
        function (value) {
          if (!value) return true;
          if (departurePrefectures.length === 0) {
            return this.createError({
              message: t("validation.departureAreaUnset"),
            });
          }
          const code = prefCodeFromPostal(value);
          return code !== null && departurePrefectures.includes(code);
        },
      ),
    pickup_location_name: string()
      .trim()
      .required(t("validation.pickupNameRequired"))
      .test(
        "has-pickup-coordinates",
        t("validation.pickupPlaceSelectionRequired"),
        function () {
          const form = this.parent as Step1FormData;
          // 次のいずれかならOK:
          // 1) 検索候補を選択済み（座標あり）
          // 2) 郵便番号7桁+住所の手入力（座標はサーバー側で概算補完する）
          const hasSelectedPlace
            = !!form.pickup_place_id
              && form.pickup_latitude !== null
              && form.pickup_longitude !== null;
          const hasManualAddress
            = /^[0-9]{7}$/u.test(form.pickup_postal_code ?? "")
              && !!form.pickup_location_address?.trim();
          return hasSelectedPlace || hasManualAddress;
        },
      ),
    pickup_location_address: string()
      .trim()
      .required(t("validation.pickupAddressRequired")),
    pickup_date: string()
      .trim()
      .required(t("validation.pickupDateRequired"))
      .transform(normalizeToIsoDate)
      .matches(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/u, t("validation.dateFormat"))
      .test(
        "is-valid-date",
        t("validation.dateInvalid"),
        value => !!value && isValidIsoDate(value),
      )
      .test(
        "is-min-pickup",
        t("validation.pickupTooSoon"),
        value => !!value && value >= minPickup,
      )
      .test(
        "is-within-max",
        t("validation.maxHalfYear"),
        value => !!value && value <= maxDate,
      )
      .test(
        "is-not-regular-holiday-pickup",
        t("validation.regularHoliday"),
        (value) => {
          if (!value) return true;
          const wd = isoDateToWeekday(value);
          return wd < 0 || operatingDays[wd] === "1";
        },
      )
      .test(
        "is-not-nth-weekday-holiday-pickup",
        t("validation.regularHoliday"),
        (value) => {
          if (!value || nthWeekdayHolidays.size === 0) return true;
          const key = isoDateToNthWeekdayKey(value);
          return !key || !nthWeekdayHolidays.has(key);
        },
      )
      .test(
        "is-not-temp-closure-pickup",
        t("validation.tempClosure"),
        value => !value || !temporaryClosures.has(value),
      ),
    delivery_postal_code: string()
      .trim()
      .required(t("validation.deliveryPostalRequired"))
      .matches(/^[0-9]{7}$/u, t("validation.postalFormat"))
      .test(
        "is-deliverable-area",
        t("validation.notDeliveryArea"),
        function (value) {
          if (!value) return true;
          if (deliverablePrefectures.length === 0) {
            return this.createError({
              message: t("validation.deliveryAreaUnset"),
            });
          }
          const code = prefCodeFromPostal(value);
          return code !== null && deliverablePrefectures.includes(code);
        },
      ),
    delivery_location_name: string()
      .trim()
      .required(t("validation.deliveryNameRequired"))
      .test(
        "has-delivery-coordinates",
        t("validation.deliveryPlaceSelectionRequired"),
        function () {
          const form = this.parent as Step1FormData;
          // 次のいずれかならOK:
          // 1) 検索候補を選択済み（座標あり）
          // 2) 郵便番号7桁+住所の手入力（座標はサーバー側で概算補完する）
          const hasSelectedPlace
            = !!form.delivery_place_id
              && form.delivery_latitude !== null
              && form.delivery_longitude !== null;
          const hasManualAddress
            = /^[0-9]{7}$/u.test(form.delivery_postal_code ?? "")
              && !!form.delivery_location_address?.trim();
          return hasSelectedPlace || hasManualAddress;
        },
      ),
    delivery_location_address: string()
      .trim()
      .required(t("validation.deliveryAddressRequired")),
    delivery_date: string()
      .trim()
      .required(t("validation.deliveryDateRequired"))
      .transform(normalizeToIsoDate)
      .matches(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/u, t("validation.dateFormat"))
      .test(
        "is-valid-date",
        t("validation.dateInvalid"),
        value => !!value && isValidIsoDate(value),
      )
      .test(
        "is-after-pickup",
        t("validation.deliveryAfterPickup"),
        function (value) {
          const pickup = (this.parent as Step1FormData).pickup_date;
          return !!value && !!pickup && value >= pickup;
        },
      )
      .test(
        "is-within-max",
        t("validation.maxHalfYear"),
        value => !!value && value <= maxDate,
      )
      .test(
        "is-not-regular-holiday-delivery",
        t("validation.regularHoliday"),
        (value) => {
          if (!value) return true;
          const wd = isoDateToWeekday(value);
          return wd < 0 || operatingDays[wd] === "1";
        },
      )
      .test(
        "is-not-nth-weekday-holiday-delivery",
        t("validation.regularHoliday"),
        (value) => {
          if (!value || nthWeekdayHolidays.size === 0) return true;
          const key = isoDateToNthWeekdayKey(value);
          return !key || !nthWeekdayHolidays.has(key);
        },
      )
      .test(
        "is-not-temp-closure-delivery",
        t("validation.tempClosure"),
        value => !value || !temporaryClosures.has(value),
      ),
    notes: string().optional(),
  });
};

// Step2のバリデーションスキーマを生成
export const createStep2Schema = (
  items: LuggageItemData[],
  t: ValidationTranslator = key => key,
) => {
  const schemaShape: Record<string, NumberSchema> = {};
  for (const item of items) {
    schemaShape[item.key] = number()
      .typeError(t("validation.qtyNumber"))
      .integer(t("validation.qtyInteger"))
      .min(0, t("validation.qtyMin"))
      .max(20, t("validation.qtyMax"))
      .required();
  }

  return object(schemaShape)
    .test("at-least-one", t("validation.atLeastOne"), (values) => {
      if (!values) return false;
      const v = values as Step2FormData;
      return Object.values(v).some(
        (count: unknown) => (Number(count) || 0) > 0,
      );
    })
    .test("max-total", t("validation.maxTotal"), (values) => {
      if (!values) return false;
      const v = values as Step2FormData;
      const total = Object.values(v).reduce(
        (sum: number, count: unknown) => sum + (Number(count) || 0),
        0,
      );
      return total <= 20;
    });
};

// Step3のバリデーションスキーマを生成
// 日本語以外のページでは電話番号を国番号（+）付きの国際形式のみ許可
export const createStep3Schema = (
  t: ValidationTranslator = key => key,
  requireInternationalPhone = false,
) => {
  return object({
    customer_name: string().trim().required(t("validation.nameRequired")),
    customer_email: string()
      .trim()
      .required(t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
    customer_phone_number: string()
      .trim()
      .required(t("validation.phoneRequired"))
      .transform(value =>
        typeof value === "string" ? value.replace(/[\s-]/g, "") : value,
      )
      .matches(
        requireInternationalPhone ? /^\+\d{7,15}$/u : /^(\+\d{7,15}|\d{10,11})$/u,
        requireInternationalPhone
          ? t("validation.phonePlusRequired")
          : t("validation.phoneInvalid"),
      ),
    customer_nationality: string()
      .trim()
      .required(t("validation.nationalityRequired")),
    guest_name: string()
      .trim()
      .required(t("validation.guestNameRequired"))
      .transform(value =>
        typeof value === "string"
          ? value.normalize("NFKC").replace(/\s+/g, " ")
          : value,
      )
      .matches(/^[A-Za-z ]+$/u, t("validation.guestNameRoman")),
  });
};
