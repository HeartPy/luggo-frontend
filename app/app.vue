<template>
  <div id="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: "ja",
    prefix: "og: http://ogp.me/ns#",
  },
  titleTemplate: (title?: string) => {
    return title
      ? `${title} | LugGo(ラグゴー)`
      : "LugGo(ラグゴー) | 旅行荷物の配送業者向け一括サービス";
  },
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    {
      key: "description",
      name: "description",
      content:
        "固定費完全無料。旅行客向けの手荷物配送予約フォームの作成、予約管理、配送管理、ドライバー管理、売上管理を一括で行えます。",
    },
    // {
    //   name: "thumnail",
    //   content: "https://sample.com/thumnail.jpg",
    // },
    { name: "format-detection", content: "telephone=no" },
    {
      key: "og:site_name",
      property: "og:site_name",
      content: "LugGo(ラグゴー) | 旅行荷物の配送業者向け一括サービス",
    },
    { key: "og:type", property: "og:type", content: "website" },
    // {
    //   key: "og:url",
    //   property: "og:url",
    //   content: "https://sample.com/",
    // },
    {
      key: "og:title",
      property: "og:title",
      content: "LugGo(ラグゴー) | 旅行荷物の配送業者向け一括サービス",
    },
    {
      key: "og:description",
      property: "og:description",
      content:
        "固定費完全無料。旅行客向けの手荷物配送予約フォームの作成、予約管理、配送管理、ドライバー管理、売上管理を一括で行えます。",
    },
    // {
    //   hid: "og:image",
    //   property: "og:image",
    //   content: "https://sample.com/ogp.jpg",
    // },
    { name: "twitter:card", content: "summary_large_image" },
    {
      key: "twitter:title",
      name: "twitter:title",
      content: "LugGo(ラグゴー) | 旅行荷物の配送業者向け一括サービス",
    },
    {
      key: "twitter:description",
      name: "twitter:description",
      content:
        "固定費完全無料。旅行客向けの手荷物配送予約フォームの作成、予約管理、配送管理、ドライバー管理、売上管理を一括で行えます。",
    },
    // {
    //   name: "twitter:image",
    //   content: "https://naturalized-politician.com/ogp.jpg",
    // },
  ],
  link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
});
</script>
