export const useSession = () => {
  const sessionCheckInterval = ref<NodeJS.Timeout | null>(null);

  const startSession = async (): Promise<void> => {
    if (!import.meta.client) return;

    try {
      const config = useRuntimeConfig();
      const apiBase = config.public.apiBaseUrl;

      const { data, error } = await useFetch<{
        sessionStarted: boolean;
        expiresAt?: string;
      }>(`${apiBase}/api/common/session/start`, {
        method: "POST",
        credentials: "include",
      });

      if (error.value) {
        if (import.meta.dev) {
          // eslint-disable-next-line no-console
          console.error("Failed to start session:", error.value);
        }
        return;
      }

      if (data.value?.sessionStarted && data.value?.expiresAt) {
        // セッション有効性チェックを開始
        startSessionCheck();
      }
    } catch (error) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Error starting session:", error);
      }
    }
  };

  const checkSessionValidity = async (): Promise<boolean> => {
    if (!import.meta.client) return false;

    try {
      const config = useRuntimeConfig();
      const apiBase = config.public.apiBaseUrl;

      const { data, error } = await useFetch<{
        valid: boolean;
        message?: string;
        expired?: boolean;
        expiresAt?: string;
      }>(`${apiBase}/api/common/session/check`, {
        method: "GET",
        credentials: "include",
      });

      if (error.value) {
        if (import.meta.dev) {
          // eslint-disable-next-line no-console
          console.error("Failed to check session:", error.value);
        }
        return false;
      }

      if (data.value?.valid && data.value?.expiresAt) {
        return data.value.valid;
      }

      return false;
    } catch (error) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.error("Error checking session:", error);
      }
      return false;
    }
  };

  const startSessionCheck = () => {
    if (!import.meta.client) return;

    // 既存のインターバルをクリア
    if (sessionCheckInterval.value) {
      clearInterval(sessionCheckInterval.value);
    }

    // 30秒ごとにセッション有効性をチェック
    sessionCheckInterval.value = setInterval(async () => {
      const isValid = await checkSessionValidity();
      if (!isValid) {
        stopSessionCheck();
      }
    }, 30 * 1000);

    // 初回チェック
    checkSessionValidity();
  };

  const stopSessionCheck = () => {
    if (sessionCheckInterval.value) {
      clearInterval(sessionCheckInterval.value);
      sessionCheckInterval.value = null;
    }
  };

  // コンポーネントがアンマウントされたときにクリーンアップ
  if (import.meta.client) {
    try {
      onUnmounted(() => {
        stopSessionCheck();
      });
    } catch {
      // onUnmountedが利用できない場合は無視（composableがsetup外で呼ばれた場合）
    }
  }

  return {
    startSession,
    checkSessionValidity,
  };
};
