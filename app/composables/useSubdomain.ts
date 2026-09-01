export const TENANT_BASE_DOMAIN = "luggo.delivery";

// ホスト名からポートを除き、小文字・前後空白除去して比較用に正規化
function normalizeHostname(raw: string): string {
  return raw.split(":")[0]?.trim().toLowerCase() ?? "";
}

// リクエストヘッダーを取得（配列は先頭のみ）
function getHeaderValue(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | null {
  const value = headers[name];
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? value[0] ?? null : value;
}

// 現在のリクエストのホスト名を取得
export function getRequestHostname(): string {
  if (import.meta.server) {
    const event = useRequestEvent();
    if (!event) {
      return "";
    }
    const headers = event.node.req.headers;
    // SSR では X-Forwarded-Host（Worker 経由）を優先してホスト名を取得
    const forwarded = getHeaderValue(headers, "x-forwarded-host");
    const host = forwarded ?? getHeaderValue(headers, "host") ?? "";
    return normalizeHostname(host);
  }

  return window.location.hostname.toLowerCase();
}

// ホスト名から事業者サブドメインを取り出す
export function extractSubdomainFromHostname(hostname: string): string | null {
  const host = normalizeHostname(hostname);
  if (!host || host.includes("localhost") || host.includes("127.0.0.1")) {
    return null;
  }

  const parts = host.split(".");
  if (parts.length >= 3) {
    return parts[0] || null;
  }

  return null;
}

// ホスト名またはクエリパラメータから事業者サブドメインを解決
export function resolveSubdomain(): string | null {
  const fromHost = extractSubdomainFromHostname(getRequestHostname());
  if (fromHost) {
    return fromHost.toLowerCase();
  }

  if (import.meta.server) {
    const event = useRequestEvent();
    if (event?.node.req.url) {
      const host = getRequestHostname() || "localhost";
      const url = new URL(event.node.req.url, `http://${host}`);
      const testSubdomain = url.searchParams.get("subdomain");
      if (testSubdomain) {
        return testSubdomain.toLowerCase();
      }
    }
    return null;
  }

  const testSubdomain = new URLSearchParams(window.location.search).get("subdomain");
  return testSubdomain ? testSubdomain.toLowerCase() : null;
}

// 事業者サブドメイン付きの公開 URL を組み立てる（管理画面からのリンク用）
export function buildTenantPublicUrl(subdomain: string, path: string): string | null {
  if (!import.meta.client) {
    return null;
  }

  const host = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;

  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    const portStr = port ? `:${port}` : "";
    return `${protocol}//${host}${portStr}${path}?subdomain=${subdomain}`;
  }

  const parts = host.split(".");
  const baseDomain = parts.length >= 3 ? parts.slice(1).join(".") : host;
  return `${protocol}//${subdomain}.${baseDomain || TENANT_BASE_DOMAIN}${path}`;
}
