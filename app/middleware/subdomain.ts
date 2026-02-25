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

  // サブドメインが検出された場合、BusinessProfileを取得
  if (subdomain) {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBaseUrl;

    try {
      const data = await $fetch<{
        id: string;
        company_name: string;
        subdomain: string;
        is_active: boolean;
      }>(`${apiBase}/api/business/subdomain/profile`, {
        method: "GET",
        params: { subdomain },
        credentials: "include",
      });

      if (!data) {
        // サブドメインが見つからない場合は404ページにリダイレクト
        throw createError({
          statusCode: 404,
          statusMessage: "指定されたサブドメインの事業者が見つかりません。",
        });
      }

      // BusinessProfileをstateに保存
      const businessProfile = useState("businessProfile", () => data);
      businessProfile.value = data;
    }
    catch (err: unknown) {
      // 既に適切に処理されたエラーはそのまま再スロー
      if (err && typeof err === "object" && "statusCode" in err) {
        throw err;
      }
      // 404エラーの場合
      if (
        err
        && typeof err === "object"
        && "status" in err
        && err.status === 404
      ) {
        throw createError({
          statusCode: 404,
          statusMessage: "指定されたサブドメインの事業者が見つかりません。",
        });
      }
      throw createError({
        statusCode: 500,
        statusMessage: "サブドメインの取得に失敗しました。",
      });
    }
  }
});
