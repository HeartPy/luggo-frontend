export const useRegisterEmailForm = () => {
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

  const email = useState<string>("registerEmail", () =>
    loadWithExpiry<string>("register.email", ""),
  );

  const emailErr = useState<string>("registerEmailErr", () => "");

  // メールアドレスが変更されたらlocalStorageに保存
  watch(email, (newValue) => {
    if (newValue) {
      saveWithExpiry("register.email", newValue);
    }
    else {
      localStorage.removeItem("register.email");
    }
  });

  const clearAllData = () => {
    if (!import.meta.client) return;
    try {
      localStorage.removeItem("register.email");
      // 状態も初期値にリセット
      email.value = "";
      emailErr.value = "";
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

    // メールアドレスのチェック
    if (checkExpired("register.email") && email.value) {
      email.value = "";
      emailErr.value = "";
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
  }

  return {
    email,
    emailErr,
    clearAllData,
  };
};
