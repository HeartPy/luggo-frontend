import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ValidationError } from "yup";
import type {
  LuggageItemData,
  Step1FormData,
  Step3FormData,
} from "~/types/booking";
import {
  normalizeToIsoDate,
  isValidIsoDate,
  prefCodeFromPostal,
  getMinPickupDate,
  getMaxBookingDate,
  createStep1Schema,
  createStep2Schema,
  createStep3Schema,
} from "~/composables/useBookingValid";

// JST 2026-08-26 22:59 = UTC 2026-08-26 13:59
const JST_AUG26_2259 = "2026-08-26T13:59:00.000Z";
// JST 2026-08-26 23:00 = UTC 2026-08-26 14:00
const JST_AUG26_2300 = "2026-08-26T14:00:00.000Z";
// JST 2026-08-26 12:00 = UTC 2026-08-26 03:00（昼に固定して日付判定を安定させる）
const JST_AUG26_1200 = "2026-08-26T03:00:00.000Z";

const TOKYO_OPTIONS = {
  departurePrefectures: ["13"],
  deliverablePrefectures: ["13"],
  operatingDays: "1111111",
};

const LUGGAGE_ITEMS: LuggageItemData[] = [
  {
    id: 1,
    name: "機内持ち込みサイズ（3辺計：〜120cm）",
    price: 2000,
    key: "cabin",
    image_src: "",
  },
  {
    id: 2,
    name: "受託手荷物サイズ（3辺計：〜160cm）",
    price: 3000,
    key: "checked",
    image_src: "",
  },
];

function makeValidStep1(
  overrides: Partial<Step1FormData> = {},
): Step1FormData {
  return {
    pickup_location_name: "東京駅",
    pickup_place_id: "place-pickup",
    pickup_latitude: 35.6812,
    pickup_longitude: 139.7671,
    pickup_postal_code: "1000001",
    pickup_location_address: "東京都千代田区丸の内1-1",
    pickup_date: "2026-08-28",
    delivery_location_name: "新宿駅",
    delivery_place_id: "place-delivery",
    delivery_latitude: 35.6896,
    delivery_longitude: 139.7006,
    delivery_postal_code: "1600001",
    delivery_location_address: "東京都新宿区西新宿1-1",
    delivery_date: "2026-08-28",
    notes: "",
    pickup_location_name_ja: "",
    pickup_location_address_ja: "",
    delivery_location_name_ja: "",
    delivery_location_address_ja: "",
    ...overrides,
  };
}

function makeValidStep3(
  overrides: Partial<Step3FormData> = {},
): Step3FormData {
  return {
    customer_name: "テスト太郎",
    customer_email: "test@example.com",
    customer_phone_number: "09012345678",
    customer_nationality: "JPN",
    guest_name: "Taro Test",
    ...overrides,
  };
}

async function expectValidationMsg(
  validate: () => Promise<unknown>,
  message: string,
) {
  try {
    await validate();
    expect.unreachable("バリデーションエラーになるはず");
  }
  catch (error) {
    const err = error as ValidationError;
    expect(err.errors).toContain(message);
  }
}

describe("normalizeToIsoDate", () => {
  it("スラッシュ区切りを YYYY-MM-DD に正規化する", () => {
    expect(normalizeToIsoDate("2026/8/26")).toBe("2026-08-26");
  });

  it("ドット区切りを YYYY-MM-DD に正規化する", () => {
    expect(normalizeToIsoDate("2026.8.26")).toBe("2026-08-26");
  });

  it("非文字列はそのまま返す", () => {
    expect(normalizeToIsoDate(123)).toBe(123);
    expect(normalizeToIsoDate(null)).toBe(null);
  });

  it("不正な形式はそのまま返す", () => {
    expect(normalizeToIsoDate("08/26/2026")).toBe("08/26/2026");
    expect(normalizeToIsoDate("not-a-date")).toBe("not-a-date");
  });
});

describe("isValidIsoDate", () => {
  it("実在する日付は true を返す", () => {
    expect(isValidIsoDate("2026-08-26")).toBe(true);
  });

  it("存在しない日付は false を返す", () => {
    expect(isValidIsoDate("2026-02-30")).toBe(false);
  });

  it("形式が不正なときは false を返す", () => {
    expect(isValidIsoDate("2026/08/26")).toBe(false);
    expect(isValidIsoDate("2026-8-26")).toBe(false);
  });
});

describe("prefCodeFromPostal", () => {
  it("東京の郵便番号から都道府県コード 13 を返す", () => {
    expect(prefCodeFromPostal("1000001")).toBe("13");
  });

  it("2桁未満のときは null を返す", () => {
    expect(prefCodeFromPostal("1")).toBeNull();
  });

  it("未知のプレフィックスのときは null を返す", () => {
    expect(prefCodeFromPostal("xx00001")).toBeNull();
  });
});

describe("getMinPickupDate / getMaxBookingDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("JST 22:59 のとき最短集荷日は翌日になる", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(JST_AUG26_2259));
    expect(getMinPickupDate()).toBe("2026-08-27");
  });

  it("JST 23:00 のとき最短集荷日は翌々日になる", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(JST_AUG26_2300));
    expect(getMinPickupDate()).toBe("2026-08-28");
  });

  it("最長日は JST 当日 + 180 日になる", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(JST_AUG26_1200));
    expect(getMaxBookingDate()).toBe("2027-02-22");
  });
});

describe("createStep1Schema", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(JST_AUG26_1200));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("有効データは通る", async () => {
    // Arrange
    const schema = createStep1Schema(TOKYO_OPTIONS);
    const data = makeValidStep1();

    // Act / Assert
    await expect(schema.validate(data)).resolves.toBeTruthy();
  });

  it("郵便番号が 7 桁数字でないとき postalFormat になる", async () => {
    // Arrange
    const schema = createStep1Schema(TOKYO_OPTIONS);
    const data = makeValidStep1({ pickup_postal_code: "100-0001" });

    // Act / Assert
    await expectValidationMsg(
      () => schema.validate(data),
      "validation.postalFormat",
    );
  });

  it("出発エリア外のとき notDepartureArea になる", async () => {
    // Arrange
    const schema = createStep1Schema(TOKYO_OPTIONS);
    const data = makeValidStep1({
      pickup_postal_code: "5300001", // 大阪 → 27
    });

    // Act / Assert
    await expectValidationMsg(
      () => schema.validate(data),
      "validation.notDepartureArea",
    );
  });

  it("集荷日が最短日より前のとき pickupTooSoon になる", async () => {
    // Arrange
    const schema = createStep1Schema(TOKYO_OPTIONS);
    const data = makeValidStep1({
      pickup_date: "2026-08-26",
      delivery_date: "2026-08-26",
    });

    // Act / Assert
    await expectValidationMsg(
      () => schema.validate(data),
      "validation.pickupTooSoon",
    );
  });

  it("配達日が集荷日より前のとき deliveryAfterPickup になる", async () => {
    // Arrange
    const schema = createStep1Schema(TOKYO_OPTIONS);
    const data = makeValidStep1({
      pickup_date: "2026-08-28",
      delivery_date: "2026-08-27",
    });

    // Act / Assert
    await expectValidationMsg(
      () => schema.validate(data),
      "validation.deliveryAfterPickup",
    );
  });

  it("定休日のとき regularHoliday になる", async () => {
    // Arrange: 2026-08-28 は金曜日 → operatingDays の index 4
    const schema = createStep1Schema({
      ...TOKYO_OPTIONS,
      operatingDays: "1111011",
    });
    const data = makeValidStep1({
      pickup_date: "2026-08-28",
      delivery_date: "2026-08-29",
    });

    // Act / Assert
    await expectValidationMsg(
      () => schema.validate(data),
      "validation.regularHoliday",
    );
  });

  it("座標なしでも郵便番号と住所があれば通る", async () => {
    // Arrange
    const schema = createStep1Schema(TOKYO_OPTIONS);
    const data = makeValidStep1({
      pickup_place_id: "",
      pickup_latitude: null,
      pickup_longitude: null,
      delivery_place_id: "",
      delivery_latitude: null,
      delivery_longitude: null,
    });

    // Act / Assert
    await expect(schema.validate(data)).resolves.toBeTruthy();
  });

  it("座標も手入力住所もないとき場所選択エラーになる", async () => {
    // Arrange: 住所が空だと手入力扱いにならず、場所選択エラーになる
    // （フィールド単体で検証し、住所 required より先に場所選択を見る）
    const schema = createStep1Schema(TOKYO_OPTIONS);
    const data = makeValidStep1({
      pickup_place_id: "",
      pickup_latitude: null,
      pickup_longitude: null,
      pickup_location_address: "",
    });

    // Act / Assert
    await expectValidationMsg(
      () => schema.validateAt("pickup_location_name", data),
      "validation.pickupPlaceSelectionRequired",
    );
  });
});

describe("createStep2Schema", () => {
  it("全 0 のとき atLeastOne になる", async () => {
    // Arrange
    const schema = createStep2Schema(LUGGAGE_ITEMS);
    const data = { cabin: 0, checked: 0 };

    // Act / Assert
    await expectValidationMsg(
      () => schema.validate(data),
      "validation.atLeastOne",
    );
  });

  it("合計が 21 を超えるとき maxTotal になる", async () => {
    // Arrange
    const schema = createStep2Schema(LUGGAGE_ITEMS);
    const data = { cabin: 11, checked: 10 };

    // Act / Assert
    await expectValidationMsg(
      () => schema.validate(data),
      "validation.maxTotal",
    );
  });

  it("1 件以上かつ合計 20 以下なら通る", async () => {
    // Arrange
    const schema = createStep2Schema(LUGGAGE_ITEMS);
    const data = { cabin: 1, checked: 2 };

    // Act / Assert
    await expect(schema.validate(data)).resolves.toBeTruthy();
  });
});

describe("createStep3Schema", () => {
  it("メール不正のとき emailInvalid になる", async () => {
    // Arrange
    const schema = createStep3Schema();
    const data = makeValidStep3({ customer_email: "not-an-email" });

    // Act / Assert
    await expectValidationMsg(
      () => schema.validate(data),
      "validation.emailInvalid",
    );
  });

  it("日本語ページでは国内電話番号が通る", async () => {
    // Arrange
    const schema = createStep3Schema();
    const data = makeValidStep3({ customer_phone_number: "09012345678" });

    // Act / Assert
    await expect(schema.validate(data)).resolves.toBeTruthy();
  });

  it("日本語ページではハイフン付き国内電話番号も通る", async () => {
    // Arrange
    const schema = createStep3Schema();
    const data = makeValidStep3({ customer_phone_number: "090-1234-5678" });

    // Act / Assert
    await expect(schema.validate(data)).resolves.toBeTruthy();
  });

  it("国際電話必須のとき + なしは失敗する", async () => {
    // Arrange
    const schema = createStep3Schema(key => key, true);
    const data = makeValidStep3({ customer_phone_number: "09012345678" });

    // Act / Assert
    await expectValidationMsg(
      () => schema.validate(data),
      "validation.phonePlusRequired",
    );
  });

  it("国際電話必須のとき + 付き番号は通る", async () => {
    // Arrange
    const schema = createStep3Schema(key => key, true);
    const data = makeValidStep3({
      customer_phone_number: "+819012345678",
    });

    // Act / Assert
    await expect(schema.validate(data)).resolves.toBeTruthy();
  });

  it("宿泊者名がローマ字以外のとき guestNameRoman になる", async () => {
    // Arrange
    const schema = createStep3Schema();
    const data = makeValidStep3({ guest_name: "山田太郎" });

    // Act / Assert
    await expectValidationMsg(
      () => schema.validate(data),
      "validation.guestNameRoman",
    );
  });
});
