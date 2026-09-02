// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: process.env.NODE_ENV === "development" },
  modules: [
    "@nuxt/eslint",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/seo",
    "@sentry/nuxt/module",
    "@saslavik/nuxt-gtm",
  ],
  typescript: {
    strict: true,
    typeCheck: true,
  },
  runtimeConfig: {
    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
      stripePublishableKey:
        process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      googleMapsApiKey:
        process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      // E2E テスト用: "1" のとき Stripe.js を読み込まず決済をモックする
      e2eMockStripe: process.env.NUXT_PUBLIC_E2E_MOCK_STRIPE || "",
      // Sentry（エラー監視）。未設定なら無効
      sentry: {
        dsn: process.env.NUXT_PUBLIC_SENTRY_DSN || "",
      },
      // Google Tag Manager
      gtm: {
        id: process.env.NUXT_PUBLIC_GTM_ID || "",
        enableRouterSync: true,
        enabled: !!process.env.NUXT_PUBLIC_GTM_ID,
        debug: process.env.NODE_ENV === "development",
      },
    },
  },
  vite: {
    optimizeDeps: {
      // 予約フロー途中のページで初めて読み込まれる依存を事前最適化する。
      // dev 初回アクセス時の「依存最適化 → ページ強制リロード」が
      // E2E のフロー途中に挟まって落ちるのを防ぐ。
      include: ["@stripe/stripe-js", "i18n-iso-countries"],
    },
  },
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || "https://luggo.delivery",
    name: "LugGo(ラグゴー)",
    description:
      "固定費完全無料。旅行客向けの手荷物配送予約フォームの作成、予約管理、配送管理、配達者管理、売上管理を一括で行えます。",
    defaultLocale: "ja",
  },
  schemaOrg: {
    identity: "Organization",
  },
  // 静的 OGP 画像を使うため、動的 OG 画像生成は使わない
  ogImage: {
    enabled: false,
  },
  // 空のサイトマップと optional catch-all により誤検知が多いため、今回は無効化
  linkChecker: {
    enabled: false,
  },
  // 現時点: 全ルート noindex, nofollow
  robots: {
    disallow: ["/"],
  },
  routeRules: {
    "/**": { robots: "noindex, nofollow" },
  },
  sitemap: {
    // 現状は noindex のため全 URL を除外する。
    // 公開時: exclude を外し、include に以下を入れる。
    // 該当 routeRules を index, follow に変更する。
    // ["/", "/privacy", "/transaction-law", "/account/register/email", "/account/login"]
    exclude: ["/**"],
  },
  app: {
    head: {
      link: [
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href:
            "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900"
            + "&family=Noto+Sans+SC:wght@100..900"
            + "&family=Noto+Sans+TC:wght@100..900"
            + "&display=swap",
        },
      ],
    },
  },
  tailwindcss: {
    cssPath: ["~/assets/css/tailwind.css", { injectPosition: "first" }],
    viewer: true,
  },
});
