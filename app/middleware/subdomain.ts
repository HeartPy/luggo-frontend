export default defineNuxtRouteMiddleware(async (_to) => {
  // クライアントサイドとサーバーサイドの両方でサブドメインを取得
  let subdomain: string | null = null;

  if (import.meta.server) {
    // サーバーサイド: eventから取得
    const event = useRequestEvent();
    if (event) {
      const host = event.node.req.headers.host || "";
      const parts = host.split(".");
      // 開発環境では localhost:3000 のような形式なので、サブドメインを検出しない
      if (
        parts.length >= 3
        && !host.includes("localhost")
        && !host.includes("127.0.0.1")
      ) {
        subdomain = parts[0] || null;
      }
      // 開発環境でのテスト用: クエリパラメータからサブドメインを取得
      if (!subdomain && event.node.req.url) {
        const url = new URL(event.node.req.url, `http://${host}`);
        const testSubdomain = url.searchParams.get("subdomain");
        if (testSubdomain) {
          subdomain = testSubdomain.toLowerCase();
        }
      }
    }
  }
  else {
    // クライアントサイド: window.locationから取得
    const host = window.location.hostname;
    const parts = host.split(".");
    // 開発環境では localhost:3000 のような形式なので、サブドメインを検出しない
    if (
      parts.length >= 3
      && !host.includes("localhost")
      && !host.includes("127.0.0.1")
    ) {
      subdomain = parts[0] || null;
    }
    // 開発環境でのテスト用: クエリパラメータからサブドメインを取得
    if (!subdomain) {
      const urlParams = new URLSearchParams(window.location.search);
      const testSubdomain = urlParams.get("subdomain");
      if (testSubdomain) {
        subdomain = testSubdomain.toLowerCase();
      }
    }
  }

  if (!subdomain) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
    });
  }

  // BusinessProfileを取得
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBaseUrl;

  try {
    const data = await $fetch<{
      id: string;
      company_name: string;
      subdomain: string;
      is_active: boolean;
      service_areas: string[];
      pricing_rules: Record<string, Record<string, number>>;
      operating_days: string;
      nth_weekday_holidays: string[];
      daily_max_luggage: number;
      temporary_closures: string[];
      support_email: string;
    }>(`${apiBase}/api/business/subdomain/profile`, {
      method: "GET",
      params: { subdomain },
      credentials: "include",
    });

    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
      });
    }

    const businessProfile = useState("businessProfile", () => data);
    businessProfile.value = data;
  }
  catch (err: unknown) {
    if (err && typeof err === "object" && "statusCode" in err) {
      throw err;
    }
    if (
      err
      && typeof err === "object"
      && "status" in err
      && err.status === 404
    ) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
