// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: process.env.NODE_ENV === "development" },
  modules: [
    "@nuxt/eslint",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/seo",
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
    },
  },
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || "https://luggo.com",
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
