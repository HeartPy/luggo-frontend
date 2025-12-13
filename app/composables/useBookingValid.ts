import { object, string, number, type NumberSchema } from "yup";
import type {
  Step1FormData,
  Step2FormData,
  LuggageItemData,
} from "~/types/booking";

// 今日の日付を取得（YYYY-MM-DD形式）
export const getToday = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
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
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() + 1 === mo &&
    dt.getUTCDate() === d
  );
};

// Step1のバリデーションスキーマを生成
export const createStep1Schema = () => {
  const today = getToday();

  return object({
    pickup_location_name: string().trim().required("集荷場所の名称は必須です"),
    pickup_location_address: string()
      .trim()
      .required("集荷場所の住所は必須です"),
    pickup_date: string()
      .trim()
      .required("集荷日は必須です")
      .transform(normalizeToIsoDate)
      .matches(
        /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/u,
        "日付はYYYY/MM/DD形式で入力してください",
      )
      .test(
        "is-valid-date",
        "存在する日付を入力してください",
        (value) => !!value && isValidIsoDate(value),
      )
      .test(
        "is-today-or-future",
        "集荷日は今日以降の日付を選択してください",
        (value) => !!value && value >= today,
      ),
    delivery_location_name: string()
      .trim()
      .required("配送場所の名称は必須です"),
    delivery_location_address: string()
      .trim()
      .required("配送場所の住所は必須です"),
    delivery_date: string()
      .trim()
      .required("配送日は必須です")
      .transform(normalizeToIsoDate)
      .matches(
        /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/u,
        "日付はYYYY/MM/DD形式で入力してください",
      )
      .test(
        "is-valid-date",
        "存在する日付を入力してください",
        (value) => !!value && isValidIsoDate(value),
      )
      .test(
        "is-after-pickup",
        "配送日は集荷日以降の日付を選択してください",
        function (value) {
          const pickup = (this.parent as Step1FormData).pickup_date;
          return !!value && !!pickup && value >= pickup;
        },
      ),
    notes: string().optional(),
  });
};

// Step2のバリデーションスキーマを生成
export const createStep2Schema = (items: LuggageItemData[]) => {
  const schemaShape: Record<string, NumberSchema> = {};
  for (const item of items) {
    schemaShape[item.key] = number()
      .typeError("数量は数値で指定してください")
      .integer("整数を指定してください")
      .min(0, "数量は0以上を指定してください")
      .max(20, "各荷物の数量は20個までです")
      .required();
  }

  return object(schemaShape)
    .test("at-least-one", "最低1点以上の荷物を選択してください", (values) => {
      if (!values) return false;
      const v = values as Step2FormData;
      return Object.values(v).some(
        (count: unknown) => (Number(count) || 0) > 0,
      );
    })
    .test("max-total", "すべての荷物の合計は20個までです", (values) => {
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
export const createStep3Schema = () => {
  return object({
    customer_name: string().trim().required("お名前は必須です"),
    customer_email: string()
      .trim()
      .required("メールアドレスは必須です")
      .email("有効なメールアドレスを入力してください"),
    customer_phone_number: string()
      .trim()
      .required("お電話番号は必須です")
      .transform((value) =>
        typeof value === "string" ? value.replace(/[\s-]/g, "") : value,
      )
      .matches(/^\d{10,11}$/u, "有効な電話番号を入力してください"),
    customer_nationality: string().trim().required("国籍は必須です"),
    guest_name: string()
      .trim()
      .required("宿泊予約者名は必須です")
      .transform((value) =>
        typeof value === "string"
          ? value.normalize("NFKC").replace(/\s+/g, " ")
          : value,
      )
      .matches(
        /^[A-Za-z ]+$/u,
        "ローマ字（半角英字とスペース）のみで入力してください",
      ),
  });
};
