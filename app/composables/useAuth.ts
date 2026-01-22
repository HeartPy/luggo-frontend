import { useCsrf } from "~/composables/useCsrf";

type AuthInfo = {
  authenticated: boolean;
  user_id?: string;
  email?: string;
  user_type?: string;
};

// 認証情報を取得する関数（ユーザー情報を含む）
export const getAuthInfo = async (): Promise<AuthInfo> => {
  if (!import.meta.client) {
    return { authenticated: false };
  }

  const { ensureCsrf, getCsrf } = useCsrf();

  try {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;
    await ensureCsrf(apiBase);

    const res = await fetch(`${apiBase}/api/users/auth/check`, {
      method: "GET",
      credentials: "include",
      headers: {
        ...(getCsrf() ? { "X-CSRFToken": getCsrf() } : {}),
      },
    });

    if (!res.ok) {
      return { authenticated: false };
    }

    const data = await res.json();
    return {
      authenticated: true,
      user_id: data.user_id,
      email: data.email,
      user_type: data.user_type,
    };
  } catch {
    return { authenticated: false };
  }
};
