<template>
  <div class="min-h-screen">
    <TopVisual />
    <TopService />
    <TopFee />
    <TopRegister />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "LugGo(ラグゴー) | 旅行荷物の配送業者向け一括サービス",
  titleTemplate: "",
  meta: [
    {
      key: "description",
      name: "description",
      content:
        "固定費完全無料。旅行客向けの手荷物配送予約フォームの作成、予約管理、配送管理、ドライバー管理、売上管理を一括で行えます。",
    },
    {
      key: "og:url",
      property: "og:url",
      content: "#",
    },
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
  ],
});
</script>
