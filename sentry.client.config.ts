// Sentry クライアント設定（エラー監視）
// DSN（NUXT_PUBLIC_SENTRY_DSN）が未設定の場合は初期化せず、完全に無効になる。
import { useRuntimeConfig } from "#imports";
import * as Sentry from "@sentry/nuxt";

const dsn = useRuntimeConfig().public.sentry?.dsn;

if (dsn) {
  Sentry.init({
    dsn,
    environment: "production",
    // エラー監視のみ（パフォーマンス計測・リプレイは使わない）
    tracesSampleRate: 0,
    // 顧客情報を Sentry に送らない
    sendDefaultPii: false,
  });
}
