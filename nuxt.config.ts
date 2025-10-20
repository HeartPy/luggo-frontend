// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: process.env.NODE_ENV === "development" },
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
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
          href: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap",
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
  image: {
    quality: 80,
    format: ["webp", "avif", "jpeg"],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },
});
