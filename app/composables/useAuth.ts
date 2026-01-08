import { useCsrf } from "~/composables/useCsrf";

// ユーザーがログインしているかをチェックする関数
export const checkAuthentication = async (): Promise<boolean> => {
  if (!import.meta.client) return false;

  const { ensureCsrf, getCsrf } = useCsrf();

  try {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;
    await ensureCsrf(apiBase);

    const res = await fetch(`${apiBase}/api/common/auth/check`, {
      method: "GET",
      credentials: "include",
      headers: {
        ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
      },
    });

    return res.ok;
  } catch {
    return false;
  }
};
