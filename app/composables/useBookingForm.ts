import { useAppLocale } from "~/composables/useLocale";
import type {
  Step1FormData,
  Step2FormData,
  Step3FormData,
  BookingFormData,
  LuggageItemData,
} from "~/types/booking";

// 荷物リスト（単価）と個数マップから合計金額を算出する純関数
export const computeTotalAmount = (
  items: LuggageItemData[],
  counts: Step2FormData,
): number =>
  items.reduce((acc, item) => acc + item.price * (counts[item.key] ?? 0), 0);

export const useBookingForm = () => {
  const TTL_MS = 30 * 60 * 1000; // 30分に設定

  const { currentLocale } = useAppLocale();

  const loadWithExpiry = <T>(key: string, fallback: T): T => {
    if (!import.meta.client) return fallback;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw) as { value: T; savedAt: number };
      if (!parsed || typeof parsed.savedAt !== "number") return fallback;
      const isExpired = Date.now() - parsed.savedAt > TTL_MS;
      if (isExpired) {
        localStorage.removeItem(key);
        return fallback;
      }
      return parsed.value;
    }
    catch {
      return fallback;
    }
  };

  const saveWithExpiry = <T>(key: string, value: T) => {
    if (!import.meta.client) return;
    try {
      localStorage.setItem(key, JSON.stringify({ value, savedAt: Date.now() }));
    }
    catch {
      // ストレージ保存失敗は無視
    }
  };

  const emptyStep1Data = (): Step1FormData => ({
    pickup_location_name: "",
    pickup_place_id: "",
    pickup_latitude: null,
    pickup_longitude: null,
    pickup_postal_code: "",
    pickup_location_address: "",
    pickup_date: "",
    delivery_location_name: "",
    delivery_place_id: "",
    delivery_latitude: null,
    delivery_longitude: null,
    delivery_postal_code: "",
    delivery_location_address: "",
    delivery_date: "",
    notes: "",
    pickup_location_name_ja: "",
    pickup_location_address_ja: "",
    delivery_location_name_ja: "",
    delivery_location_address_ja: "",
  });

  const step1Data = useState<Step1FormData>("step1Data", () =>
    loadWithExpiry<Step1FormData>("booking.step1", emptyStep1Data()),
  );

  // Step2FormDataは動的に初期化されるため、初期値は空のオブジェクト
  const step2Data = useState<Step2FormData>("step2Data", () => {
    const saved = loadWithExpiry<Step2FormData>("booking.step2", {});
    return saved;
  });

  const step3Data = useState<Step3FormData>("step3Data", () => ({
    ...loadWithExpiry<Step3FormData>("booking.step3", {
      customer_name: "",
      customer_phone_number: "",
      customer_email: "",
      customer_nationality: "",
      guest_name: "",
    }),
  }));

  const luggageItemsData = useState<LuggageItemData[]>("luggageItemsData", () =>
    loadWithExpiry<LuggageItemData[]>("booking.luggageItems", []),
  );

  // Step2 を通過した時点で確定（ロック）した合計金額
  const confirmedTotalAmount = useState<number | null>(
    "confirmedTotalAmount",
    () => loadWithExpiry<number | null>("booking.confirmedTotal", null),
  );

  const errsStep1 = useState<Partial<Record<keyof Step1FormData, string>>>(
    "errsStep1",
    () => ({}),
  );
  const errsStep2 = useState<Partial<Record<string, string>>>(
    "errsStep2",
    () => ({}),
  );
  const errsStep3 = useState<Partial<Record<keyof Step3FormData, string>>>(
    "errsStep3",
    () => ({}),
  );

  // 荷物個数 × 単価の合計金額（リアルタイム）
  const totalAmount = computed<number>(() =>
    computeTotalAmount(luggageItemsData.value, step2Data.value),
  );

  // 現在の totalAmount を Step2 通過時点の確定金額として保存
  // 再度 Step2 を通過すれば最新の値で上書きされる。
  const confirmTotalAmount = () => {
    confirmedTotalAmount.value = computeTotalAmount(
      luggageItemsData.value,
      step2Data.value,
    );
  };

  const completeFormData = computed<BookingFormData>(
    () =>
      ({
        ...step1Data.value,
        ...step2Data.value,
        ...step3Data.value,
        total_amount: confirmedTotalAmount.value ?? totalAmount.value,
        customer_language: currentLocale.value,
      }) as BookingFormData,
  );

  const clearAllData = () => {
    if (!import.meta.client) return;
    try {
      localStorage.removeItem("booking.step1");
      localStorage.removeItem("booking.step2");
      localStorage.removeItem("booking.step3");
      localStorage.removeItem("booking.luggageItems");
      localStorage.removeItem("booking.confirmedTotal");
      // 状態も初期値にリセット
      step1Data.value = emptyStep1Data();
      step2Data.value = {};
      luggageItemsData.value = [];
      step3Data.value = {
        customer_name: "",
        customer_phone_number: "",
        customer_email: "",
        customer_nationality: "",
        guest_name: "",
      };
      confirmedTotalAmount.value = null;
      // エラーオブジェクトもクリア
      errsStep1.value = {};
      errsStep2.value = {};
      errsStep3.value = {};
    }
    catch {
      // ストレージ削除失敗は無視
    }
  };

  // 有効期限切れをチェックして状態をリセットする関数
  const checkAndResetExpiredData = () => {
    if (!import.meta.client) return;

    // localStorageから直接チェックして、有効期限切れかどうかを判定
    const checkExpired = (key: string): boolean => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return true; // データが存在しない場合は期限切れとみなす
        const parsed = JSON.parse(raw) as { value: unknown; savedAt: number };
        if (!parsed || typeof parsed.savedAt !== "number") return true;
        return Date.now() - parsed.savedAt > TTL_MS;
      }
      catch {
        return true;
      }
    };

    // Step1のチェック
    if (
      checkExpired("booking.step1")
      && (step1Data.value.pickup_location_name
        || step1Data.value.delivery_location_name)
    ) {
      step1Data.value = emptyStep1Data();
    }

    // Step2のチェック
    if (
      checkExpired("booking.step2")
      && Object.values(step2Data.value).some(count => count > 0)
    ) {
      step2Data.value = {};
    }

    // 荷物アイテムのチェック
    if (
      checkExpired("booking.luggageItems")
      && luggageItemsData.value.length > 0
    ) {
      luggageItemsData.value = [];
    }

    // Step3のチェック
    if (
      checkExpired("booking.step3")
      && (step3Data.value.customer_name || step3Data.value.customer_email)
    ) {
      step3Data.value = {
        customer_name: "",
        customer_phone_number: "",
        customer_email: "",
        customer_nationality: "",
        guest_name: "",
      };
    }

    // 確定金額のチェック
    if (
      checkExpired("booking.confirmedTotal")
      && confirmedTotalAmount.value !== null
    ) {
      confirmedTotalAmount.value = null;
    }
  };

  if (import.meta.client) {
    let expiryCheckInterval: ReturnType<typeof setInterval> | null = null;
    onMounted(() => {
      // 初回チェック
      checkAndResetExpiredData();

      // 定期的に有効期限をチェック
      expiryCheckInterval = setInterval(() => {
        checkAndResetExpiredData();
      }, 60 * 1000); // 1分ごと
    });

    onUnmounted(() => {
      if (expiryCheckInterval) {
        clearInterval(expiryCheckInterval);
      }
    });

    watch(step1Data, v => saveWithExpiry<Step1FormData>("booking.step1", v), {
      deep: true,
    });
    watch(step2Data, v => saveWithExpiry<Step2FormData>("booking.step2", v), {
      deep: true,
    });
    watch(step3Data, v => saveWithExpiry<Step3FormData>("booking.step3", v), {
      deep: true,
    });
    watch(
      luggageItemsData,
      v => saveWithExpiry<LuggageItemData[]>("booking.luggageItems", v),
      {
        deep: true,
      },
    );
    watch(confirmedTotalAmount, (v) => {
      if (v === null) {
        try {
          localStorage.removeItem("booking.confirmedTotal");
        }
        catch {
          // ストレージ削除失敗は無視
        }
        return;
      }
      saveWithExpiry<number>("booking.confirmedTotal", v);
    });
  }

  return {
    step1Data,
    step2Data,
    step3Data,
    luggageItemsData,
    errsStep1,
    errsStep2,
    errsStep3,
    totalAmount,
    confirmedTotalAmount,
    confirmTotalAmount,
    completeFormData,
    clearAllData,
  };
};
