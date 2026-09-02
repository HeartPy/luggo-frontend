/**
 * Cloudflare Turnstile（ボット対策）ウィジェットの状態管理
 *
 * トークンは1回の検証で失効するため、API 送信後は成否に関わらず
 * resetTurnstile() を呼んで新しいトークンを取得する。
 */
export const useTurnstile = () => {
  const turnstileToken = ref("");
  // <NuxtTurnstile ref="turnstileRef"> に紐付けて reset() を呼ぶための参照
  const turnstileRef = ref();

  const resetTurnstile = () => {
    turnstileToken.value = "";
    turnstileRef.value?.reset?.();
  };

  return { turnstileToken, turnstileRef, resetTurnstile };
};
