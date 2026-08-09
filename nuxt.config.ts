// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: process.env.NODE_ENV === "development" },
  modules: [
    "@nuxt/eslint",
    "@nuxtjs/tailwindcss",
    "nuxt-jsonld",
  ],
  typescript: {
    strict: true,
    typeCheck: true,
  },
  // ランタイム設定
  runtimeConfig: {
    // publicで始まるキーは、クライアントサイドでも利用可能
    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
      stripePublishableKey:
        process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      googleMapsApiKey:
        process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    },
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
      meta: [
        {
          name: "robots",
          content: "noindex, nofollow",
        },
      ],
    },
  },
  tailwindcss: {
    cssPath: ["~/assets/css/tailwind.css", { injectPosition: "first" }],
    viewer: true,
  },
});
