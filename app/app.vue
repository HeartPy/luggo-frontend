<template>
  <div id="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { isBusinessPage } = useSeoBrand();
const head = injectHead();

// 空の SVG。事業者ページで LugGo の favicon.ico にフォールバックしないため
const BLANK_FAVICON
  = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E";

// ページ遷移時にスクロールトップに戻る
watch(
  () => route.path,
  () => {
    if (import.meta.client) {
      window.scrollTo(0, 0);
    }
  },
);

useHead({
  htmlAttrs: {
    lang: "ja",
    prefix: "og: http://ogp.me/ns#",
  },
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { name: "format-detection", content: "telephone=no" },
  ],
  link: computed(() => {
    if (isBusinessPage.value) {
      return [{ rel: "icon", href: BLANK_FAVICON, key: "favicon" }];
    }
    return [
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico",
        key: "favicon",
      },
    ];
  }),
});

// nuxt-seo-utils が public/favicon.ico から注入する icon も事業者ページでは外す
head.hooks.hook("tags:afterResolve", (ctx) => {
  if (!isBusinessPage.value) return;

  // LugGo 由来の favicon / apple-touch-icon を外し、空 SVG の icon だけ残す
  ctx.tags = ctx.tags.filter((tag) => {
    if (tag.tag !== "link") return true;
    const rel = String(tag.props?.rel ?? "").toLowerCase();
    const href = String(tag.props?.href ?? "");
    const isIcon
      = rel === "icon" || rel === "shortcut icon" || rel === "apple-touch-icon";
    if (!isIcon) return true;
    return href === BLANK_FAVICON;
  });

  // 空 SVG の icon が無ければ追加
  const hasBlankIcon = ctx.tags.some(
    tag => tag.tag === "link" && tag.props?.href === BLANK_FAVICON,
  );
  if (!hasBlankIcon) {
    ctx.tags.push({
      tag: "link",
      props: { rel: "icon", href: BLANK_FAVICON },
    });
  }
});
</script>
