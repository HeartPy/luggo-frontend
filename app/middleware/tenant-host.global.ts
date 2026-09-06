import {
  extractSubdomainFromHostname,
  getRequestHostname,
  isTenantHostPathAllowed,
} from "~/composables/useSubdomain";

/**
 * 事業者サブドメインでは予約関連のパス以外（トップ・ログイン等）を出さない。
 * 未登録かどうかは subdomain ミドルウェアが判定する。
 */
export default defineNuxtRouteMiddleware((to) => {
  const subdomain = extractSubdomainFromHostname(getRequestHostname());
  if (!subdomain) {
    return;
  }

  if (!isTenantHostPathAllowed(to.path)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
    });
  }
});
