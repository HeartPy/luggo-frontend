import type {
  Step1FormData,
  Step2FormData,
  Step3FormData,
  Step4FormData,
  Step5FormData,
} from "~/types/account-register";

export const useRegisterForm = () => {
  const TTL_MS = 30 * 60 * 1000; // 30分に設定

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
    } catch {
      return fallback;
    }
  };

  const saveWithExpiry = <T>(key: string, value: T) => {
    if (!import.meta.client) return;
    try {
      localStorage.setItem(key, JSON.stringify({ value, savedAt: Date.now() }));
    } catch {
      // ストレージ保存失敗は無視
    }
  };

  const step1Data = useState<Step1FormData>("step1Data", () => ({
    ...loadWithExpiry<Step1FormData>("register.step1", {
      accept_tos: false,
      product_name: "",
      support_email: "",
      company_name: "",
      company_address: {
        country: "JP",
        postal_code: "",
        state: "",
        line1: "",
      },
    }),
  }));
  const step2Data = useState<Step2FormData>("step2Data", () => ({
    ...loadWithExpiry<Step2FormData>("register.step2", {
      first_name_kanji: "",
      last_name_kanji: "",
      first_name_kana: "",
      last_name_kana: "",
      rep_email: "",
      rep_phone: "",
      rep_dob: { year: 0, month: 0, day: 0 },
      address_kanji: {
        postal_code: "",
        state: "",
        city: "",
        line1: "",
      },
      address_kana: {
        postal_code: "",
        state: "",
        city: "",
        line1: "",
      },
    }),
  }));
  const step3Data = useState<Step3FormData>("step3Data", () => ({
    ...loadWithExpiry<Step3FormData>("register.step3", {
      bank_code: "",
      branch_code: "",
      account_type: "",
      account_number: "",
      account_holder_name: "",
    }),
  }));
  const step4Data = useState<Step4FormData>("step4Data", () => ({
    ...loadWithExpiry<Step4FormData>("register.step4", {
      product_url: "",
      product_description: "",
      product_mcc: "",
    }),
  }));
  const step5Data = useState<Step5FormData>("step5Data", () => ({
    ...loadWithExpiry<Step5FormData>("register.step5", {
      document_front: "",
      document_back: "",
      address_kana: "",
    }),
  }));

  const errorsStep1 = useState<Record<string, string>>(
    "errorsStep1",
    () => ({}),
  );
  const errorsStep2 = useState<Record<string, string>>(
    "errorsStep2",
    () => ({}),
  );
  const errorsStep3 = useState<Record<string, string>>(
    "errorsStep3",
    () => ({}),
  );
  const errorsStep4 = useState<Record<string, string>>(
    "errorsStep4",
    () => ({}),
  );
  const errorsStep5 = useState<Record<string, string>>(
    "errorsStep5",
    () => ({}),
  );

  const clearAllData = () => {
    if (!import.meta.client) return;
    try {
      localStorage.removeItem("register.step1");
      localStorage.removeItem("register.step2");
      localStorage.removeItem("register.step3");
      localStorage.removeItem("register.step4");
      localStorage.removeItem("register.step5");
      // 状態も初期値にリセット
      step1Data.value = {
        accept_tos: false,
        product_name: "",
        support_email: "",
        company_name: "",
        company_address: {
          country: "JP",
          postal_code: "",
          state: "",
          line1: "",
        },
      };
      step2Data.value = {
        first_name_kanji: "",
        last_name_kanji: "",
        first_name_kana: "",
        last_name_kana: "",
        rep_email: "",
        rep_phone: "",
        rep_dob: { year: 0, month: 0, day: 0 },
        rep_address: {
          country: "JP",
          postal_code: "",
          state: "",
          state_kana: "",
          city: "",
          city_kana: "",
          line1: "",
          line1_kana: "",
        },
      };
      step3Data.value = {
        bank_code: "",
        branch_code: "",
        account_type: "",
        account_number: "",
        account_holder_name: "",
      };
      step4Data.value = {
        product_url: "",
        product_description: "",
        product_mcc: "",
      };
      step5Data.value = {
        document_front: "",
        document_back: "",
        address_kana: "",
      };
    } catch {
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
      } catch {
        return true;
      }
    };

    // Step1のチェック
    if (
      checkExpired("register.step1") &&
      (step1Data.value.product_name || step1Data.value.company_name)
    ) {
      step1Data.value = {
        accept_tos: false,
        product_name: "",
        support_email: "",
        company_name: "",
        company_address: {
          country: "JP",
          postal_code: "",
          state: "",
          line1: "",
        },
      };
    }

    // Step2のチェック
    if (
      checkExpired("register.step2") &&
      (step2Data.value.first_name_kanji || step2Data.value.rep_email)
    ) {
      step2Data.value = {
        first_name_kanji: "",
        last_name_kanji: "",
        first_name_kana: "",
        last_name_kana: "",
        rep_email: "",
        rep_phone: "",
        rep_dob: { year: 0, month: 0, day: 0 },
        rep_address: {
          country: "JP",
          postal_code: "",
          state: "",
          state_kana: "",
          city: "",
          city_kana: "",
          line1: "",
          line1_kana: "",
        },
      };
    }

    // Step3のチェック
    if (
      checkExpired("register.step3") &&
      (step3Data.value.bank_code || step3Data.value.account_number)
    ) {
      step3Data.value = {
        bank_code: "",
        branch_code: "",
        account_type: "",
        account_number: "",
        account_holder_name: "",
      };
    }

    // Step4のチェック
    if (
      checkExpired("register.step4") &&
      (step4Data.value.product_url || step4Data.value.product_description)
    ) {
      step4Data.value = {
        product_url: "",
        product_description: "",
        product_mcc: "",
      };
    }

    // Step5のチェック（アップロード済みファイルIDも含む）
    if (
      checkExpired("register.step5") &&
      (step5Data.value.document_front ||
        step5Data.value.document_back ||
        step5Data.value.address_kana)
    ) {
      step5Data.value = {
        document_front: "",
        document_back: "",
        address_kana: "",
      };
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

    watch(
      step1Data,
      (v) => saveWithExpiry<Step1FormData>("register.step1", v),
      {
        deep: true,
      },
    );
    watch(
      step2Data,
      (v) => saveWithExpiry<Step2FormData>("register.step2", v),
      {
        deep: true,
      },
    );
    watch(
      step3Data,
      (v) => saveWithExpiry<Step3FormData>("register.step3", v),
      {
        deep: true,
      },
    );
    watch(
      step4Data,
      (v) => saveWithExpiry<Step4FormData>("register.step4", v),
      {
        deep: true,
      },
    );
    watch(
      step5Data,
      (v) => saveWithExpiry<Step5FormData>("register.step5", v),
      {
        deep: true,
      },
    );
  }

  return {
    step1Data,
    step2Data,
    step3Data,
    step4Data,
    step5Data,
    errorsStep1,
    errorsStep2,
    errorsStep3,
    errorsStep4,
    errorsStep5,
    clearAllData,
  };
};
